/**
 * CycleSideChick — Root React Application
 */

import React, { useEffect } from "react";
import { useStore, applyThemeToDOM } from "./store.js";
import { actions } from "./actions.js";
import { AppShell } from "./AppShell.jsx";
import { PinLockScreen } from "../features/lock/PinLockScreen.jsx";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow.jsx";

export function App() {
  const { S, ui } = useStore();

  useEffect(() => {
    applyThemeToDOM();

    // Keyboard Accessibility: Escape key dismisses top modal
    const handleKeyDown = e => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (ui.deleteJournalConfirm) actions.cancelDeleteJournal();
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ui]);

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
