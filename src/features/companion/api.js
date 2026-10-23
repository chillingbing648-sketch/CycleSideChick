/**
 * CycleSideChick — Unified Companion API Client
 * Provides seamless integration with Supabase when credentials exist,
 * with automatic fallback to high-fidelity, local-first mockBackend.
 */

import { createClient } from "@supabase/supabase-js";
import { mockBackend } from "./mockBackend.js";
import { generateSecureToken, sha256Hash } from "./crypto.js";
import { DEFAULT_PERMISSIONS, DEFAULT_ALLOWED_RESPONSES } from "./types.js";

const SUPABASE_URL = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : "";
const SUPABASE_ANON_KEY = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : "";

export const isLiveBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isLiveBackendConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Local identity store for local-first/mock mode
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

export function getCompanionUser() {
  if (isLiveBackendConfigured && supabase) {
    return supabase.auth.getUser();
  }
  return Promise.resolve({ data: { user: { id: getLocalSession().userId } }, error: null });
}

/**
 * Creates a cryptographically secure sharing invitation
 */
export async function createCompanionInvitation({
  permissions = DEFAULT_PERMISSIONS,
  humorousNotifications = true,
  allowedResponses = DEFAULT_ALLOWED_RESPONSES,
  expiresInHours = 48
} = {}) {
  const session = getLocalSession();
  const ownerId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const rawToken = generateSecureToken(32);
    const tokenHash = await sha256Hash(rawToken);
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from("sharing_invitations")
      .insert({
        owner_id: ownerId,
        token_hash: tokenHash,
        permissions,
        humorous_notifications: humorousNotifications,
        allowed_responses: allowedResponses,
        expires_at: expiresAt,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

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
    ownerId,
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

  if (isLiveBackendConfigured && supabase) {
    const tokenHash = await sha256Hash(rawToken);
    const { data, error } = await supabase
      .from("sharing_invitations")
      .select("id, owner_id, permissions, humorous_notifications, allowed_responses, status, expires_at")
      .eq("token_hash", tokenHash)
      .single();

    if (error || !data) {
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
  }

  return mockBackend.getInvitationPreview(rawToken);
}

/**
 * Atomically claims an invitation for a recipient
 */
export async function claimInvitation(rawToken, recipientId, recipientName = "Companion") {
  if (!recipientId) {
    const s = getLocalSession();
    recipientId = s.userId;
  }

  if (isLiveBackendConfigured && supabase) {
    const tokenHash = await sha256Hash(rawToken);
    const { data, error } = await supabase.rpc("claim_companion_invitation", {
      p_token_hash: tokenHash
    });

    if (error) throw error;
    saveLocalSession({ activeRelationshipId: data.relationship_id, role: "recipient" });
    return data;
  }

  const result = await mockBackend.claimInvitation({
    rawTokenOrHash: rawToken,
    recipientId,
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
  const ownerId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase
      .from("shared_cycle_snapshots")
      .insert({
        relationship_id: relationshipId,
        owner_id: ownerId,
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

    if (error) throw error;
    return { success: true, snapshot: data };
  }

  return mockBackend.syncCycleSnapshot({
    ownerId,
    relationshipId,
    snapshot
  });
}

/**
 * Retrieves the current shared snapshot for companion or owner
 */
export async function getSharedSnapshot(relationshipId) {
  const session = getLocalSession();
  const userId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const { data: rel, error: relErr } = await supabase
      .from("sharing_relationships")
      .select("*")
      .eq("id", relationshipId)
      .single();

    if (relErr || !rel) throw new Error("Relationship not found or access denied.");

    if (rel.status !== "active") {
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

    return {
      status: "active",
      relationship: rel,
      snapshot: (snaps && snaps[0]) || null
    };
  }

  return mockBackend.getSharedSnapshot({ userId, relationshipId });
}

/**
 * Submits an owner-permitted predefined support response
 */
export async function sendSupportResponse(relationshipId, responseKey) {
  const session = getLocalSession();
  const recipientId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase
      .from("predefined_responses")
      .insert({
        relationship_id: relationshipId,
        sender_id: recipientId,
        response_key: responseKey
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, response: data };
  }

  return mockBackend.sendSupportResponse({
    recipientId,
    relationshipId,
    responseKey
  });
}

/**
 * Fetches incoming predefined responses for the cycle owner
 */
export async function getOwnerResponses(relationshipId) {
  const session = getLocalSession();
  const userId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase
      .from("predefined_responses")
      .select("*")
      .eq("relationship_id", relationshipId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  return mockBackend.getResponses({ userId, relationshipId });
}

/**
 * Immediately revokes companion access
 */
export async function revokeSharing(relationshipId) {
  const session = getLocalSession();
  const callerId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase.rpc("revoke_companion_relationship", {
      p_relationship_id: relationshipId
    });
    if (error) throw error;
    saveLocalSession({ activeRelationshipId: null });
    return data;
  }

  const result = await mockBackend.revokeRelationship({ callerId, relationshipId });
  saveLocalSession({ activeRelationshipId: null });
  return result;
}

/**
 * Temporarily pauses sharing without revoking relationship
 */
export async function pauseSharing(relationshipId, paused = true) {
  const session = getLocalSession();
  const ownerId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const { data, error } = await supabase
      .from("sharing_relationships")
      .update({ status: paused ? "paused" : "active", updated_at: new Date().toISOString() })
      .eq("id", relationshipId)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, status: data.status };
  }

  return mockBackend.pauseRelationship({ ownerId, relationshipId, paused });
}

/**
 * Updates sharing permissions dynamically
 */
export async function updatePermissions(relationshipId, permissions, humorousNotifications, allowedResponses) {
  const session = getLocalSession();
  const ownerId = session.userId;

  if (isLiveBackendConfigured && supabase) {
    const updates = { updated_at: new Date().toISOString() };
    if (permissions) updates.permissions = permissions;
    if (humorousNotifications !== undefined) updates.humorous_notifications = humorousNotifications;
    if (allowedResponses) updates.allowed_responses = allowedResponses;

    const { data, error } = await supabase
      .from("sharing_relationships")
      .update(updates)
      .eq("id", relationshipId)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, relationship: data };
  }

  return mockBackend.updatePermissions({
    ownerId,
    relationshipId,
    permissions,
    humorousNotifications,
    allowedResponses
  });
}
