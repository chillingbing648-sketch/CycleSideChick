/**
 * CycleSideChick — Secure Local / Mock In-Memory Backend Provider
 * Implements the exact relational schema, RLS checks, atomic claims,
 * token hashing, and notification scheduling for offline use & automated tests.
 */

import { generateSecureToken, sha256Hash } from "./crypto.js";
import { selectCuratedMessage, hashString } from "./messages.js";
import { PREDEFINED_RESPONSES, DEFAULT_PERMISSIONS, DEFAULT_ALLOWED_RESPONSES } from "./types.js";

class MockBackendStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.profiles = new Map();
    this.invitations = new Map();
    this.relationships = new Map();
    this.snapshots = new Map(); // relationshipId -> array of snapshots
    this.responses = new Map(); // relationshipId -> array of responses
    this.notificationPreferences = new Map();
    this.pushSubscriptions = new Map();
    this.notificationJobs = [];
    this.auditLogs = [];
  }

  // --- Profiles ---
  setProfile(userId, displayName, avatarIcon = "heart") {
    this.profiles.set(userId, {
      id: userId,
      display_name: displayName,
      avatar_icon: avatarIcon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  getProfile(userId) {
    return this.profiles.get(userId) || null;
  }

  // --- Invitations ---
  async createInvitation({
    ownerId,
    ownerName = "Cycle Owner",
    permissions = DEFAULT_PERMISSIONS,
    humorousNotifications = true,
    allowedResponses = DEFAULT_ALLOWED_RESPONSES,
    expiresInHours = 48
  }) {
    if (!ownerId) throw new Error("ownerId is required to create an invitation");

    this.setProfile(ownerId, ownerName);

    const rawToken = generateSecureToken(32);
    const tokenHash = await sha256Hash(rawToken);

    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
    const invitationId = "inv_" + generateSecureToken(8);

    const record = {
      id: invitationId,
      owner_id: ownerId,
      owner_name: ownerName,
      token_hash: tokenHash,
      permissions: { ...permissions },
      humorous_notifications: Boolean(humorousNotifications),
      allowed_responses: [...allowedResponses],
      status: "pending",
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      claimed_at: null,
      claimed_by: null
    };

    this.invitations.set(tokenHash, record);

    return {
      invitationId,
      rawToken,
      tokenHash,
      expiresAt,
      permissions: record.permissions,
      humorousNotifications: record.humorous_notifications,
      allowedResponses: record.allowed_responses
    };
  }

  async getInvitationPreview(rawTokenOrHash) {
    if (!rawTokenOrHash) return { valid: false, error: "Missing invitation token" };

    let inv = this.invitations.get(rawTokenOrHash);
    if (!inv) {
      const computedHash = await sha256Hash(rawTokenOrHash);
      inv = this.invitations.get(computedHash);
    }

    if (!inv) {
      return { valid: false, error: "Invitation not found or invalid." };
    }

    if (inv.status === "claimed") {
      return { valid: false, error: "This invitation has already been claimed by another companion." };
    }

    if (inv.status === "revoked") {
      return { valid: false, error: "This invitation was revoked by the owner." };
    }

    if (new Date(inv.expires_at) < new Date()) {
      inv.status = "expired";
      return { valid: false, error: "This invitation link has expired." };
    }

    return {
      valid: true,
      ownerName: inv.owner_name || "Cycle Owner",
      ownerId: inv.owner_id,
      permissions: inv.permissions,
      humorousNotifications: inv.humorous_notifications,
      allowedResponses: inv.allowed_responses,
      expiresAt: inv.expires_at
    };
  }

  async claimInvitation({ rawTokenOrHash, recipientId, recipientName = "Companion" }) {
    if (!recipientId) throw new Error("recipientId is required");

    let inv = this.invitations.get(rawTokenOrHash);
    if (!inv) {
      const computedHash = await sha256Hash(rawTokenOrHash);
      inv = this.invitations.get(computedHash);
    }

    if (!inv) throw new Error("Invitation not found or invalid.");
    if (inv.status === "claimed") throw new Error("This invitation has already been claimed.");
    if (inv.status === "revoked") throw new Error("This invitation has been revoked.");
    if (new Date(inv.expires_at) < new Date()) {
      inv.status = "expired";
      throw new Error("This invitation has expired.");
    }
    if (inv.owner_id === recipientId) {
      throw new Error("You cannot accept your own invitation.");
    }

    // Atomic claim
    inv.status = "claimed";
    inv.claimed_at = new Date().toISOString();
    inv.claimed_by = recipientId;

    this.setProfile(recipientId, recipientName);

    const relationshipId = "rel_" + generateSecureToken(8);
    const relationship = {
      id: relationshipId,
      owner_id: inv.owner_id,
      recipient_id: recipientId,
      invitation_id: inv.id,
      status: "active",
      permissions: { ...inv.permissions },
      humorous_notifications: inv.humorous_notifications,
      allowed_responses: [...inv.allowed_responses],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      revoked_at: null
    };

    this.relationships.set(relationshipId, relationship);

    return {
      success: true,
      relationshipId,
      relationship
    };
  }

  // --- Snapshots ---
  async syncCycleSnapshot({ ownerId, relationshipId, snapshot }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    if (rel.owner_id !== ownerId) throw new Error("Access denied: Not the cycle owner.");
    if (rel.status !== "active") throw new Error("Relationship is not active.");

    // Filter snapshot fields strictly according to permissions
    const perms = rel.permissions;
    const filtered = {
      id: "snap_" + generateSecureToken(8),
      relationship_id: relationshipId,
      owner_id: ownerId,
      cycle_phase: perms.sharePhase ? snapshot.cyclePhase : null,
      cycle_day: (perms.sharePhase || perms.shareDay) ? snapshot.cycleDay : null,
      period_status: perms.sharePeriodStatus ? snapshot.periodStatus : null,
      is_period_logged: perms.sharePeriodStatus ? Boolean(snapshot.isPeriodLogged) : false,
      next_period_est: perms.shareEstimatedDates ? snapshot.nextPeriodEst : null,
      fertile_window_est: perms.shareEstimatedDates ? snapshot.fertileWindowEst : null,
      feelings: perms.shareFeelings ? snapshot.feelings : [],
      symptoms: perms.shareSymptoms ? snapshot.symptoms : [],
      energy_level: perms.shareEnergy ? snapshot.energyLevel : null,
      mood: perms.shareMood ? snapshot.mood : null,
      owner_notes: perms.shareNotes ? snapshot.ownerNotes : null,
      support_preference: perms.shareSupportPreferences ? snapshot.supportPreference : null,
      support_suggestion: perms.shareSupportPreferences ? snapshot.supportSuggestion : null,
      synced_at: new Date().toISOString()
    };

    if (!this.snapshots.has(relationshipId)) {
      this.snapshots.set(relationshipId, []);
    }
    this.snapshots.get(relationshipId).push(filtered);

    // Evaluate notification job for recipient
    await this.evaluateNotificationJob({
      relationship: rel,
      snapshot: filtered,
      rawEvent: snapshot.eventType || "status_synced"
    });

    return { success: true, snapshot: filtered };
  }

  async getSharedSnapshot({ userId, relationshipId }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    
    // RLS: caller must be owner OR recipient
    if (rel.owner_id !== userId && rel.recipient_id !== userId) {
      throw new Error("Access denied: Unauthorized.");
    }

    if (rel.status !== "active") {
      return {
        status: rel.status,
        revoked: rel.status === "revoked",
        paused: rel.status === "paused",
        snapshot: null
      };
    }

    const list = this.snapshots.get(relationshipId) || [];
    const latest = list.length > 0 ? list[list.length - 1] : null;

    return {
      status: "active",
      relationship: {
        id: rel.id,
        ownerId: rel.owner_id,
        recipientId: rel.recipient_id,
        permissions: rel.permissions,
        humorousNotifications: rel.humorous_notifications,
        allowedResponses: rel.allowed_responses
      },
      snapshot: latest
    };
  }

  // --- Predefined Responses ---
  async sendSupportResponse({ recipientId, relationshipId, responseKey }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    if (rel.recipient_id !== recipientId) throw new Error("Access denied: Sender is not the paired companion.");
    if (rel.status !== "active") throw new Error("Cannot send response: Sharing connection is inactive or revoked.");

    // Validate that responseKey is permitted by owner
    if (!rel.allowed_responses.includes(responseKey)) {
      throw new Error(`Response key "${responseKey}" is not authorized by the cycle owner.`);
    }

    // Validate response exists in standard catalogue
    const known = PREDEFINED_RESPONSES.some(r => r.key === responseKey);
    if (!known) {
      throw new Error(`Invalid response key "${responseKey}".`);
    }

    const responseRecord = {
      id: "resp_" + generateSecureToken(8),
      relationship_id: relationshipId,
      sender_id: recipientId,
      owner_id: rel.owner_id,
      response_key: responseKey,
      created_at: new Date().toISOString(),
      read_at: null
    };

    if (!this.responses.has(relationshipId)) {
      this.responses.set(relationshipId, []);
    }
    this.responses.get(relationshipId).push(responseRecord);

    return { success: true, response: responseRecord };
  }

  async getResponses({ userId, relationshipId }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    if (rel.owner_id !== userId && rel.recipient_id !== userId) throw new Error("Access denied.");

    const list = this.responses.get(relationshipId) || [];
    return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // --- Relationship Management ---
  async revokeRelationship({ callerId, relationshipId }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    if (rel.owner_id !== callerId && rel.recipient_id !== callerId) throw new Error("Access denied.");

    rel.status = "revoked";
    rel.revoked_at = new Date().toISOString();
    rel.updated_at = new Date().toISOString();

    // Invalidate pending notification jobs
    for (const job of this.notificationJobs) {
      if (job.relationship_id === relationshipId && job.status === "pending") {
        job.status = "revoked";
      }
    }

    return { success: true, status: "revoked" };
  }

  async pauseRelationship({ ownerId, relationshipId, paused = true }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    if (rel.owner_id !== ownerId) throw new Error("Access denied: Only owner can pause sharing.");

    rel.status = paused ? "paused" : "active";
    rel.updated_at = new Date().toISOString();

    return { success: true, status: rel.status };
  }

  async updatePermissions({ ownerId, relationshipId, permissions, humorousNotifications, allowedResponses }) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found.");
    if (rel.owner_id !== ownerId) throw new Error("Access denied.");

    if (permissions) rel.permissions = { ...rel.permissions, ...permissions };
    if (humorousNotifications !== undefined) rel.humorous_notifications = Boolean(humorousNotifications);
    if (allowedResponses) rel.allowed_responses = [...allowedResponses];
    rel.updated_at = new Date().toISOString();

    return { success: true, relationship: rel };
  }

  // --- Notification Engine ---
  async evaluateNotificationJob({ relationship, snapshot, rawEvent }) {
    if (relationship.status !== "active") return;

    const dateKey = new Date().toISOString().slice(0, 10);
    const idempotencyKey = `${relationship.id}:${rawEvent}:${dateKey}`;

    // Duplicate check: has this idempotency key already been queued today?
    const existing = this.notificationJobs.find(j => j.idempotency_key === idempotencyKey);
    if (existing) {
      return { queued: false, reason: "Duplicate event suppressed via idempotency key" };
    }

    // Curated message selection
    const message = selectCuratedMessage({
      relationshipId: relationship.id,
      eventType: rawEvent,
      dateKey,
      allowHumor: relationship.humorous_notifications
    });

    const job = {
      id: "job_" + generateSecureToken(8),
      relationship_id: relationship.id,
      recipient_id: relationship.recipient_id,
      event_type: rawEvent,
      idempotency_key: idempotencyKey,
      title: message.title,
      body: message.body,
      category: message.category,
      status: "pending",
      attempts: 0,
      max_attempts: 3,
      scheduled_for: new Date().toISOString(),
      created_at: new Date().toISOString(),
      delivered_at: null,
      failed_at: null
    };

    this.notificationJobs.push(job);

    // Process immediately in local mock
    await this.processNotificationJob(job);
    return { queued: true, job };
  }

  async processNotificationJob(job) {
    // Check if relationship is still active
    const rel = this.relationships.get(job.relationship_id);
    if (!rel || rel.status !== "active") {
      job.status = "revoked";
      return;
    }

    // Check quiet hours (default 22:00 to 08:00)
    const currentHour = new Date().getHours();
    const prefs = this.notificationPreferences.get(job.recipient_id) || { quiet_hours_start: 22, quiet_hours_end: 8 };
    const inQuietHours = prefs.quiet_hours_start > prefs.quiet_hours_end
      ? (currentHour >= prefs.quiet_hours_start || currentHour < prefs.quiet_hours_end)
      : (currentHour >= prefs.quiet_hours_start && currentHour < prefs.quiet_hours_end);

    if (inQuietHours) {
      // In production, job scheduled_for would be moved to the morning
      job.status = "suppressed";
      job.failure_reason = "Quiet hours active";
      return;
    }

    job.attempts += 1;
    job.status = "delivered";
    job.delivered_at = new Date().toISOString();
  }
}

export const mockBackend = new MockBackendStore();
