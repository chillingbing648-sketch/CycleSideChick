/**
 * CycleSideChick — useCompanion React Hook
 * Orchestrates owner and companion state, automated snapshot compilation,
 * permission updates, and incoming responses.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useStore, toast } from "../../app/store.js";
import { calculateStats, TD, I, fmt } from "../../core/engine.js";
import { getCareSuggestions } from "../../core/content.js";
import {
  createCompanionInvitation,
  getInvitationPreview,
  claimInvitation,
  syncCycleSnapshot,
  getSharedSnapshot,
  sendSupportResponse,
  getOwnerResponses,
  revokeSharing,
  pauseSharing,
  updatePermissions,
  saveLocalSession,
  isLiveBackendConfigured
} from "./api.js";
import { DEFAULT_PERMISSIONS, DEFAULT_ALLOWED_RESPONSES } from "./types.js";

export function useCompanion() {
  const { S } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeRelationship, setActiveRelationship] = useState(null);
  const [activeInvitation, setActiveInvitation] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [responses, setResponses] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sync ref to avoid duplicate concurrent syncs
  const isSyncingRef = useRef(false);

  // Compile approved snapshot from current cycle engine state
  const compileApprovedSnapshot = useCallback((permissions = DEFAULT_PERMISSIONS) => {
    const todayDn = TD();
    const todayStr = I(todayDn);
    const stats = calculateStats(S);
    const cur = stats.cur;
    const todayLog = (S.logs && S.logs[todayStr]) || {};

    // 1. Cycle phase calculation
    const cycleDay = cur ? cur.cd : 1;
    let phaseDisplay = "Luteal Phase";
    if (cur?.isPeriod || cycleDay <= (S.pl || 5)) {
      phaseDisplay = "Menstrual Phase";
    } else if (stats.ovulationDate && Math.abs(todayDn - stats.ovulationDate) <= 1) {
      phaseDisplay = "Ovulation";
    } else if (stats.fertileStart && todayDn >= stats.fertileStart && todayDn <= stats.fertileEnd) {
      phaseDisplay = "Fertile Window";
    } else if (cycleDay <= 13) {
      phaseDisplay = "Follicular Phase";
    } else {
      phaseDisplay = "Luteal Phase";
    }

    // 2. Suggestions
    const suggestions = getCareSuggestions(S);
    const topSuggestion = suggestions && suggestions.length > 0 ? suggestions[0].text : "Offer comfort, hydration, and restful space today.";

    // 3. Symptoms and emotions
    const symptomsList = todayLog.sy ? Object.keys(todayLog.sy) : [];
    const emotionsList = Array.isArray(todayLog.emotions) ? todayLog.emotions : [];

    const isPeriodLoggedToday = Boolean(cur?.isPeriod || (todayLog.f && todayLog.f >= 2));

    return {
      cyclePhase: permissions.sharePhase ? phaseDisplay : null,
      cycleDay: permissions.shareDay ? cycleDay : null,
      periodStatus: permissions.sharePeriodStatus ? (isPeriodLoggedToday ? "Period Active (Day " + cycleDay + ")" : "No Period Active") : null,
      isPeriodLogged: isPeriodLoggedToday,
      nextPeriodEst: permissions.shareEstimatedDates && stats.nextPred ? fmt(stats.nextPred) : null,
      fertileWindowEst: permissions.shareEstimatedDates && stats.fertileStart && stats.fertileEnd ? `${fmt(stats.fertileStart)} – ${fmt(stats.fertileEnd)}` : null,
      feelings: permissions.shareFeelings ? emotionsList : [],
      symptoms: permissions.shareSymptoms ? symptomsList : [],
      energyLevel: permissions.shareEnergy ? (todayLog.en || "Normal") : null,
      mood: permissions.shareMood ? (todayLog.m !== undefined ? ["Very Low", "Low", "Neutral", "Good", "Great"][todayLog.m] || "Neutral" : "Neutral") : null,
      ownerNotes: permissions.shareNotes ? (todayLog.note || todayLog.n || null) : null,
      supportPreference: permissions.shareSupportPreferences ? (phaseDisplay === "Menstrual Phase" ? "Comfort, warmth, and low demands" : "Gentle listening and teamwork") : null,
      supportSuggestion: permissions.shareSupportPreferences ? topSuggestion : null,
      eventType: isPeriodLoggedToday ? "period_logged" : "status_synced"
    };
  }, [S]);

  // Sync snapshot to backend
  const syncNow = useCallback(async (relId = null) => {
    const targetRelId = relId || activeRelationship?.id;
    if (!targetRelId || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      setLoading(true);
      const perms = activeRelationship?.permissions || DEFAULT_PERMISSIONS;
      const snapData = compileApprovedSnapshot(perms);
      const res = await syncCycleSnapshot(targetRelId, snapData);
      setSnapshot(res.snapshot);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn("Snapshot sync error:", err);
      setError(err.message);
    } finally {
      isSyncingRef.current = false;
      setLoading(false);
    }
  }, [activeRelationship, compileApprovedSnapshot]);

  // Create new invitation
  const createInvite = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createCompanionInvitation(options);
      setActiveInvitation(result);
      toast("Private invitation generated!");
      return result;
    } catch (err) {
      setError(err.message);
      toast("Failed to create invitation: " + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke sharing
  const revoke = useCallback(async () => {
    if (!activeRelationship?.id) return;
    try {
      setLoading(true);
      await revokeSharing(activeRelationship.id);
      setActiveRelationship(null);
      setActiveInvitation(null);
      setSnapshot(null);
      toast("Companion access revoked immediately.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeRelationship]);

  // Pause or resume sharing
  const togglePause = useCallback(async () => {
    if (!activeRelationship?.id) return;
    try {
      setLoading(true);
      const isPaused = activeRelationship.status === "paused";
      const res = await pauseSharing(activeRelationship.id, !isPaused);
      setActiveRelationship(prev => ({ ...prev, status: res.status }));
      toast(isPaused ? "Sharing resumed." : "Sharing paused.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeRelationship]);

  // Update permissions
  const updatePerms = useCallback(async (newPerms, humorousNotifications, allowedResponses) => {
    if (!activeRelationship?.id) return;
    try {
      setLoading(true);
      const res = await updatePermissions(
        activeRelationship.id,
        newPerms,
        humorousNotifications,
        allowedResponses
      );
      setActiveRelationship(res.relationship);
      toast("Sharing permissions updated.");
      // Trigger snapshot refresh with new permissions
      await syncNow(activeRelationship.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeRelationship, syncNow]);

  // Refresh incoming responses for owner
  const refreshResponses = useCallback(async () => {
    if (!activeRelationship?.id) return;
    try {
      const list = await getOwnerResponses(activeRelationship.id);
      setResponses(list);
    } catch (err) {
      console.warn("Could not fetch responses:", err);
    }
  }, [activeRelationship]);

  // Auto-sync when cycle records change
  useEffect(() => {
    if (activeRelationship?.id && activeRelationship.status === "active") {
      syncNow();
    }
  }, [S.logs, S.periods, activeRelationship?.id, activeRelationship?.status]);

  // Periodic poll for responses (every 20s)
  useEffect(() => {
    if (!activeRelationship?.id) return;
    refreshResponses();
    const timer = setInterval(refreshResponses, 20000);
    return () => clearInterval(timer);
  }, [activeRelationship?.id, refreshResponses]);

  return {
    loading,
    error,
    activeRelationship,
    setActiveRelationship,
    activeInvitation,
    setActiveInvitation,
    snapshot,
    responses,
    lastSyncTime,
    createInvite,
    syncNow,
    revoke,
    togglePause,
    updatePerms,
    refreshResponses,
    compileApprovedSnapshot,
    isLiveBackend: isLiveBackendConfigured
  };
}
