/**
 * CycleSideChick — Unified Companion API Client
 * Provides integration with Supabase (Auth, RLS, Realtime & PostgREST)
 * with robust local-first fallback when cloud sync is not active.
 */

import { createClient } from "@supabase/supabase-js";
import { mockBackend } from "./mockBackend.js";
import { generateSecureToken, sha256Hash } from "./crypto.js";
import { DEFAULT_PERMISSIONS, DEFAULT_ALLOWED_RESPONSES } from "./types.js";

/**
 * Normalizes Supabase Project URL.
 * Automatically strips trailing /rest/v1/ or slashes if the user pasted the REST endpoint URL.
 */
export function normalizeSupabaseUrl(url) {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim().replace(/\/+$/, "");
  trimmed = trimmed.replace(/\/rest\/v1\/?$/, "");
  return trimmed;
}

const RAW_SUPABASE_URL = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : "";
const RAW_SUPABASE_ANON_KEY = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : "";

export const SUPABASE_URL = normalizeSupabaseUrl(RAW_SUPABASE_URL);
export const SUPABASE_ANON_KEY = (RAW_SUPABASE_ANON_KEY || "").trim();

export const isLiveBackendConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  (SUPABASE_ANON_KEY.startsWith("ey") || SUPABASE_ANON_KEY.startsWith("sb_publishable_"))
);

export const supabase = isLiveBackendConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Local identity store for local-first mode
const LOCAL_STORAGE_KEY = "csc_companion_session";

function getLocalSession() {
  if (typeof localStorage === "undefined") return { userId: "user_owner_local", role: "owner" };
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaultSession = {
    userId: "usr_" + generateSecureToken(8),
    displayName: "Cycle Owner",
    activeRelationshipId: null,
    activeInvitationId: null,
    role: "owner"
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSession));
  } catch (e) {}
  return defaultSession;
}

export function saveLocalSession(updates) {
  const current = getLocalSession();
  const merged = { ...current, ...updates };
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}
  }
  return merged;
}

// ==========================================
// AUTHENTICATION & DIAGNOSTICS
// ==========================================

export async function getCurrentAuthUser() {
  if (isLiveBackendConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function signInWithEmailOtp(email) {
  if (!isLiveBackendConfigured || !supabase) {
    throw new Error("Supabase is not configured. Running in Local Safe Mode.");
  }
  const redirectTo = typeof window !== "undefined" ? window.location.origin + window.location.pathname : undefined;
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) throw error;
  return data;
}

export async function verifyEmailOtp(email, token) {
  if (!isLiveBackendConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword(email, password) {
  if (!isLiveBackendConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword(email, password) {
  if (!isLiveBackendConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  const redirectTo = typeof window !== "undefined" ? window.location.origin + window.location.pathname : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) throw error;
  return data;
}

export async function signOutCompanion() {
  if (isLiveBackendConfigured && supabase) {
    await supabase.auth.signOut();
  }
  saveLocalSession({ activeRelationshipId: null, activeInvitationId: null });
}

export function onAuthStateChange(callback) {
  if (isLiveBackendConfigured && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
  return { unsubscribe: () => {} };
}

/**
 * Diagnostic health check verifying Supabase connection, credentials, and schema readiness.
 */
export async function checkBackendStatus() {
  if (!isLiveBackendConfigured || !supabase) {
    return {
      status: "local",
      configured: false,
      schemaReady: false,
      message: "Privacy-first local companion mode active."
    };
  }

  try {
    const { status, error } = await supabase
      .from("sharing_invitations")
      .select("id")
      .limit(1);

    if (status === 401) {
      return {
        status: "invalid_key",
        configured: true,
        schemaReady: false,
        message: "Invalid Supabase API key. Please check your publishable key in .env.local."
      };
    }

    if (status === 404 || error?.code === "PGRST205" || error?.message?.includes("schema cache")) {
      return {
        status: "schema_pending",
        configured: true,
        schemaReady: false,
        message: "Supabase connected! Database tables are pending migration in your Supabase SQL editor."
      };
    }

    if (status === 200 || !error) {
      return {
        status: "ready",
        configured: true,
        schemaReady: true,
        message: "Connected to Supabase with Row Level Security."
      };
    }

    return {
      status: "warning",
      configured: true,
      schemaReady: false,
      message: error?.message || "Supabase connection active."
    };
  } catch (err) {
    return {
      status: "error",
      configured: true,
      schemaReady: false,
      message: "Could not reach Supabase endpoint: " + err.message
    };
  }
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

export function subscribeToCompanionRealtime(relationshipId, { onResponse, onSnapshot, onRelationshipChange } = {}) {
  if (!isLiveBackendConfigured || !supabase || !relationshipId || relationshipId === "preview" || relationshipId === "demo") {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`companion-${relationshipId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "predefined_responses",
        filter: `relationship_id=eq.${relationshipId}`
      },
      payload => {
        if (onResponse && payload.new) onResponse(payload.new);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shared_cycle_snapshots",
        filter: `relationship_id=eq.${relationshipId}`
      },
      payload => {
        if (onSnapshot && payload.new) onSnapshot(payload.new);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sharing_relationships",
        filter: `id=eq.${relationshipId}`
      },
      payload => {
        if (onRelationshipChange && payload.new) onRelationshipChange(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

// ==========================================
// INVITATIONS & RELATIONSHIP OPERATIONS
// ==========================================

/**
 * Creates a cryptographically secure sharing invitation
 */
export async function createCompanionInvitation({
  permissions = DEFAULT_PERMISSIONS,
  humorousNotifications = true,
  allowedResponses = DEFAULT_ALLOWED_RESPONSES,
  expiresInHours = 48,
  preferLocal = false
} = {}) {
  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase && !preferLocal) {
    const user = await getCurrentAuthUser();
    if (!user) {
      throw new Error("AUTHENTICATION_REQUIRED: Please sign in with your email to create a cloud sharing invitation.");
    }

    const rawToken = generateSecureToken(32);
    const tokenHash = await sha256Hash(rawToken);
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from("sharing_invitations")
      .insert({
        owner_id: user.id, // Authenticated Supabase Auth UUID
        token_hash: tokenHash,
        permissions,
        humorous_notifications: humorousNotifications,
        allowed_responses: allowedResponses,
        expires_at: expiresAt,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        throw new Error("SCHEMA_PENDING: Database tables are pending migration in your Supabase SQL editor.");
      }
      throw error;
    }

    saveLocalSession({ activeInvitationId: data.id });

    return {
      invitationId: data.id,
      rawToken,
      tokenHash,
      expiresAt: data.expires_at,
      permissions: data.permissions,
      humorousNotifications: data.humorous_notifications,
      allowedResponses: data.allowed_responses
    };
  }

  // Local-safe provider fallback
  const result = await mockBackend.createInvitation({
    ownerId: session.userId,
    ownerName: session.displayName || "Cycle Owner",
    permissions,
    humorousNotifications,
    allowedResponses,
    expiresInHours
  });

  saveLocalSession({ activeInvitationId: result.invitationId });
  return result;
}

/**
 * Retrieves preview metadata for an invitation (safe fields only)
 */
export async function getInvitationPreview(rawToken) {
  if (!rawToken) return { valid: false, error: "Missing invitation token" };

  if (rawToken === "preview" || rawToken === "demo") {
    return {
      valid: true,
      ownerName: "Sarah (Preview Mode)",
      ownerId: "usr_preview_owner",
      permissions: DEFAULT_PERMISSIONS,
      humorousNotifications: true,
      allowedResponses: DEFAULT_ALLOWED_RESPONSES,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    };
  }

  if (isLiveBackendConfigured && supabase) {
    try {
      const tokenHash = await sha256Hash(rawToken);
      const { data, error } = await supabase
        .from("sharing_invitations")
        .select("id, owner_id, permissions, humorous_notifications, allowed_responses, status, expires_at")
        .eq("token_hash", tokenHash)
        .single();

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
          return mockBackend.getInvitationPreview(rawToken);
        }
        return { valid: false, error: "Invitation not found or invalid." };
      }

      if (!data) {
        return { valid: false, error: "Invitation not found or invalid." };
      }

      if (data.status === "claimed") {
        return { valid: false, error: "This invitation has already been claimed." };
      }
      if (data.status === "revoked") {
        return { valid: false, error: "This invitation has been revoked by the owner." };
      }
      if (new Date(data.expires_at) < new Date()) {
        return { valid: false, error: "This invitation has expired." };
      }

      return {
        valid: true,
        ownerId: data.owner_id,
        permissions: data.permissions,
        humorousNotifications: data.humorous_notifications,
        allowedResponses: data.allowed_responses,
        expiresAt: data.expires_at
      };
    } catch (e) {
      console.warn("[CycleCareCompanion] Fallback to local preview:", e.message);
    }
  }

  return mockBackend.getInvitationPreview(rawToken);
}

/**
 * Atomically claims an invitation for a recipient
 */
export async function claimInvitation(rawToken, recipientId = null, recipientName = "Companion") {
  if (rawToken === "preview" || rawToken === "demo") {
    saveLocalSession({ activeRelationshipId: "preview", role: "recipient" });
    return {
      success: true,
      relationshipId: "preview",
      relationship: { id: "preview", status: "active" }
    };
  }

  if (isLiveBackendConfigured && supabase) {
    const user = await getCurrentAuthUser();
    if (!user) {
      throw new Error("AUTHENTICATION_REQUIRED: Please sign in to accept this companion invitation.");
    }

    const tokenHash = await sha256Hash(rawToken);
    const { data, error } = await supabase.rpc("claim_companion_invitation", {
      p_token_hash: tokenHash
    });

    if (error) {
      if (error.code === "PGRST202" || error.code === "PGRST205" || error.message?.includes("schema cache")) {
        console.warn("[CycleCareCompanion] Supabase function not found; using local claim:", error.message);
        return await mockBackend.claimInvitation({
          rawTokenOrHash: rawToken,
          recipientId: user.id,
          recipientName
        });
      }
      throw error;
    }

    saveLocalSession({ activeRelationshipId: data.relationship_id, role: "recipient" });
    return data;
  }

  const session = getLocalSession();
  const result = await mockBackend.claimInvitation({
    rawTokenOrHash: rawToken,
    recipientId: recipientId || session.userId,
    recipientName
  });

  saveLocalSession({ activeRelationshipId: result.relationshipId, role: "recipient" });
  return result;
}

/**
 * Synchronizes the owner-approved cycle status snapshot
 */
export async function syncCycleSnapshot(relationshipId, snapshot) {
  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase) {
    const user = await getCurrentAuthUser();
    if (!user) throw new Error("Authenticated session required to sync snapshot.");

    const { data, error } = await supabase
      .from("shared_cycle_snapshots")
      .insert({
        relationship_id: relationshipId,
        owner_id: user.id, // Authenticated Supabase Auth UUID
        cycle_phase: snapshot.cyclePhase,
        cycle_day: snapshot.cycleDay,
        period_status: snapshot.periodStatus,
        is_period_logged: snapshot.isPeriodLogged,
        next_period_est: snapshot.nextPeriodEst,
        fertile_window_est: snapshot.fertileWindowEst,
        feelings: snapshot.feelings,
        symptoms: snapshot.symptoms,
        energy_level: snapshot.energyLevel,
        mood: snapshot.mood,
        owner_notes: snapshot.ownerNotes,
        support_preference: snapshot.supportPreference,
        support_suggestion: snapshot.supportSuggestion,
        synced_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        return await mockBackend.syncCycleSnapshot({ ownerId: session.userId, relationshipId, snapshot });
      }
      throw error;
    }
    return { success: true, snapshot: data };
  }

  return mockBackend.syncCycleSnapshot({
    ownerId: session.userId,
    relationshipId,
    snapshot
  });
}

/**
 * Retrieves the current shared snapshot for companion or owner
 */
export async function getSharedSnapshot(relationshipId) {
  const session = getLocalSession();

  if (relationshipId === "preview" || relationshipId === "demo") {
    return {
      status: "active",
      relationship: {
        id: "preview",
        owner_id: "usr_preview_owner",
        owner_name: "Sarah",
        permissions: DEFAULT_PERMISSIONS,
        humorous_notifications: true,
        allowed_responses: DEFAULT_ALLOWED_RESPONSES
      },
      snapshot: {
        cycle_phase: "Luteal Phase",
        cycle_day: 22,
        period_status: "Expected in 6 days",
        is_period_logged: false,
        next_period_est: "in 6 days",
        fertile_window_est: "Completed",
        feelings: ["Needs rest", "Gentle hugs welcome"],
        symptoms: ["Mild cramping", "Craving dark chocolate"],
        energy_level: "Low to moderate",
        mood: "Soft & introspective",
        support_preference: "Comfort snacks & hot tea",
        support_suggestion: "Keep her favorite warm beverage ready and handle dinner chores without asking.",
        synced_at: new Date().toISOString()
      }
    };
  }

  if (isLiveBackendConfigured && supabase) {
    const { data: rel, error: relErr } = await supabase
      .from("sharing_relationships")
      .select("*")
      .eq("id", relationshipId)
      .single();

    if (relErr) {
      if (relErr.code === "PGRST205" || relErr.message?.includes("schema cache")) {
        return mockBackend.getSharedSnapshot({ userId: session.userId, relationshipId });
      }
      throw new Error("Relationship not found or access denied.");
    }

    if (rel && rel.status !== "active") {
      return {
        status: rel.status,
        revoked: rel.status === "revoked",
        paused: rel.status === "paused",
        snapshot: null
      };
    }

    const { data: snaps, error: snapErr } = await supabase
      .from("shared_cycle_snapshots")
      .select("*")
      .eq("relationship_id", relationshipId)
      .order("synced_at", { ascending: false })
      .limit(1);

    if (snapErr) {
      if (snapErr.code === "PGRST205") return mockBackend.getSharedSnapshot({ userId: session.userId, relationshipId });
      throw snapErr;
    }

    return {
      status: "active",
      relationship: rel,
      snapshot: (snaps && snaps[0]) || null
    };
  }

  return mockBackend.getSharedSnapshot({ userId: session.userId, relationshipId });
}

/**
 * Submits an owner-permitted predefined support response
 */
export async function sendSupportResponse(relationshipId, responseKey) {
  if (relationshipId === "preview" || relationshipId === "demo") {
    return {
      success: true,
      id: "resp_preview",
      response_key: responseKey,
      created_at: new Date().toISOString()
    };
  }

  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase) {
    const user = await getCurrentAuthUser();
    if (!user) throw new Error("Sign in required to send support responses.");

    // Fetch relationship to get owner_id and verify allowed responses
    const { data: rel, error: relErr } = await supabase
      .from("sharing_relationships")
      .select("owner_id, allowed_responses, status")
      .eq("id", relationshipId)
      .single();

    if (relErr) {
      if (relErr.code === "PGRST205") {
        return await mockBackend.sendSupportResponse({ recipientId: session.userId, relationshipId, responseKey });
      }
      throw new Error("Relationship not found or access denied.");
    }

    if (rel.status !== "active") throw new Error("Sharing connection is not active.");
    if (!rel.allowed_responses.includes(responseKey)) {
      throw new Error(`Response key "${responseKey}" is not authorized by the cycle owner.`);
    }

    const { data, error } = await supabase
      .from("predefined_responses")
      .insert({
        relationship_id: relationshipId,
        sender_id: user.id, // Real Supabase Auth UUID
        owner_id: rel.owner_id,
        response_key: responseKey
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return await mockBackend.sendSupportResponse({ recipientId: session.userId, relationshipId, responseKey });
      }
      throw error;
    }
    return { success: true, response: data };
  }

  return mockBackend.sendSupportResponse({
    recipientId: session.userId,
    relationshipId,
    responseKey
  });
}

/**
 * Fetches incoming predefined responses for the cycle owner
 */
export async function getOwnerResponses(relationshipId) {
  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase
      .from("predefined_responses")
      .select("*")
      .eq("relationship_id", relationshipId)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        return mockBackend.getResponses({ userId: session.userId, relationshipId });
      }
      throw error;
    }
    return data || [];
  }

  return mockBackend.getResponses({ userId: session.userId, relationshipId });
}

/**
 * Immediately revokes companion access
 */
export async function revokeSharing(relationshipId) {
  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase.rpc("revoke_companion_relationship", {
      p_relationship_id: relationshipId
    });
    if (error && (error.code === "PGRST202" || error.code === "PGRST205")) {
      return await mockBackend.revokeRelationship({ callerId: session.userId, relationshipId });
    }
    if (error) throw error;
    saveLocalSession({ activeRelationshipId: null });
    return data;
  }

  const result = await mockBackend.revokeRelationship({ callerId: session.userId, relationshipId });
  saveLocalSession({ activeRelationshipId: null });
  return result;
}

/**
 * Temporarily pauses sharing without revoking relationship
 */
export async function pauseSharing(relationshipId, paused = true) {
  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase) {
    const user = await getCurrentAuthUser();
    if (!user) throw new Error("Authenticated session required.");

    const { data, error } = await supabase
      .from("sharing_relationships")
      .update({ status: paused ? "paused" : "active", updated_at: new Date().toISOString() })
      .eq("id", relationshipId)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error && (error.code === "PGRST205" || error.message?.includes("schema cache"))) {
      return await mockBackend.pauseRelationship({ ownerId: session.userId, relationshipId, paused });
    }
    if (error) throw error;
    return { success: true, status: data.status };
  }

  return mockBackend.pauseRelationship({ ownerId: session.userId, relationshipId, paused });
}

/**
 * Updates sharing permissions dynamically
 */
export async function updatePermissions(relationshipId, permissions, humorousNotifications, allowedResponses) {
  const session = getLocalSession();

  if (isLiveBackendConfigured && supabase) {
    const user = await getCurrentAuthUser();
    if (!user) throw new Error("Authenticated session required.");

    const updates = { updated_at: new Date().toISOString() };
    if (permissions) updates.permissions = permissions;
    if (humorousNotifications !== undefined) updates.humorous_notifications = humorousNotifications;
    if (allowedResponses) updates.allowed_responses = allowedResponses;

    const { data, error } = await supabase
      .from("sharing_relationships")
      .update(updates)
      .eq("id", relationshipId)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error && (error.code === "PGRST205" || error.message?.includes("schema cache"))) {
      return await mockBackend.updatePermissions({
        ownerId: session.userId,
        relationshipId,
        permissions,
        humorousNotifications,
        allowedResponses
      });
    }
    if (error) throw error;
    return { success: true, relationship: data };
  }

  return mockBackend.updatePermissions({
    ownerId: session.userId,
    relationshipId,
    permissions,
    humorousNotifications,
    allowedResponses
  });
}
