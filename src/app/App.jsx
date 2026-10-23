/**
 * CycleSideChick — Root React Application
 * Integrated with Cycle Care Companion routing & invitation handling.
 */

import React, { useState, useEffect } from "react";
import { useStore, applyThemeToDOM } from "./store.js";
import { actions } from "./actions.js";
import { AppShell } from "./AppShell.jsx";
import { PinLockScreen } from "../features/lock/PinLockScreen.jsx";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow.jsx";
import { InviteAcceptModal } from "../features/companion/InviteAcceptModal.jsx";
import { CompanionDashboard } from "../features/companion/CompanionDashboard.jsx";

function getUrlParams() {
  if (typeof window === "undefined") return { invite: null, companion: null };
  const searchParams = new URLSearchParams(window.location.search);
  let invite = searchParams.get("invite");
  let companion = searchParams.get("companion");

  const hash = window.location.hash || "";
  if (!invite && hash.startsWith("#/invite/")) {
    invite = hash.slice("#/invite/".length);
  }
  if (!companion && hash.startsWith("#/companion")) {
    const parts = hash.split("/");
    if (parts.length > 2 && parts[2]) companion = parts[2];
    else companion = "preview";
  } else if (searchParams.has("companion") && !companion) {
    companion = "preview";
  }
  return { invite, companion };
}

export function App() {
  const { S, ui } = useStore();
  const [inviteToken, setInviteToken] = useState(null);
  const [companionRelId, setCompanionRelId] = useState(null);

  useEffect(() => {
    applyThemeToDOM();

    // Check URL parameters for invitation or companion route
    const syncRoutesFromUrl = () => {
      const { invite, companion } = getUrlParams();
      setInviteToken(invite || null);
      setCompanionRelId(companion || null);
    };

    syncRoutesFromUrl();

    window.addEventListener("hashchange", syncRoutesFromUrl);
    window.addEventListener("popstate", syncRoutesFromUrl);

    // Keyboard Accessibility: Escape key dismisses top modal
    const handleKeyDown = e => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (inviteToken) setInviteToken(null);
        else if (companionRelId) setCompanionRelId(null);
        else if (ui.deleteJournalConfirm) actions.cancelDeleteJournal();
        else if (ui.careCustomModal) actions.closeCustomCareModal();
        else if (ui.conflict) actions.conflictClose();
        else if (ui.tourModal) actions.closeTour();
        else if (ui.infoTopic) actions.closeInfo();
        else if (ui.clinicianModal) actions.closeClinician();
        else if (ui.partnerModal) actions.closePartner();
        else if (ui.activeArticle) actions.closeArticle();
        else if (ui.prof) actions.closeProfile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("hashchange", syncRoutesFromUrl);
      window.removeEventListener("popstate", syncRoutesFromUrl);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ui, inviteToken, companionRelId]);

  // Recipient invitation acceptance screen
  if (inviteToken) {
    return (
      <div id="app" className="v-mobile-shell">
        <InviteAcceptModal
          token={inviteToken}
          onAccepted={(relId) => {
            setCompanionRelId(relId);
            setInviteToken(null);
          }}
          onDismiss={() => {
            setInviteToken(null);
            if (typeof window !== "undefined") {
              window.history.replaceState({}, "", window.location.pathname);
            }
          }}
        />
      </div>
    );
  }

  // Dedicated Companion Dashboard route
  if (companionRelId) {
    return (
      <div id="app" className="v-mobile-shell">
        <CompanionDashboard
          relationshipId={companionRelId}
          onExit={() => {
            setCompanionRelId(null);
            if (typeof window !== "undefined") {
              window.history.replaceState({}, "", window.location.pathname);
            }
          }}
        />
      </div>
    );
  }

  if (ui.pinLocked) {
    return <PinLockScreen />;
  }

  if (!S.ob) {
    return (
      <div id="app" className="v-mobile-shell v-mobile-shell--onboarding">
        <OnboardingFlow />
      </div>
    );
  }

  return <AppShell />;
}
