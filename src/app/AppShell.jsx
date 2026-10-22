/**
 * CycleSideChick — Main Application Shell
 * Designed strictly mobile-first with an authentic phone device frame on desktop/tablet.
 * Features:
 * - Sleek mobile status bar (time 9:41, pill cutout, signal/wifi/battery)
 * - Ergonomic subview navigation header with back button
 * - Clean view transitions
 * - Flo/Clue reference floating pill bottom navigation
 * - Native iOS home indicator bar
 */

import React, { useEffect } from "react";
import { useStore } from "./store.js";
import { actions } from "./actions.js";
import { BunnyMascot } from "../components/ui/BunnyMascot.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { SlidingPillNav } from "../components/ui/SlidingPillNav.jsx";

// Views
import { HomeView } from "../features/home/HomeView.jsx";
import { CalendarView } from "../features/calendar/CalendarView.jsx";
import { LogView } from "../features/log/LogView.jsx";
import { InsightsView } from "../features/insights/InsightsView.jsx";
import { CareView } from "../features/care/CareView.jsx";
import { StyleguideView } from "../features/styleguide/StyleguideView.jsx";

// Modals
import { ProfileSettingsSheet } from "../features/profile/ProfileSettingsSheet.jsx";
import { ArticleModal } from "../features/library/ArticleModal.jsx";
import { PartnerModal } from "../features/home/PartnerModal.jsx";
import { ClinicianModal } from "../features/insights/ClinicianModal.jsx";
import { ConflictModal } from "../features/calendar/ConflictModal.jsx";
import { InfoAssistantModal } from "../features/assistant/InfoAssistantModal.jsx";
import { PhaseTourModal } from "../features/home/PhaseTourModal.jsx";
import { CareCustomModal } from "../features/care/CareCustomModal.jsx";
import { DeleteJournalModal } from "../features/care/DeleteJournalModal.jsx";

export function AppShell() {
  const { ui, S } = useStore();

  const NAV_ITEMS = [
    { key: "home", label: "Today", icon: "home" },
    { key: "calendar", label: "Calendar", icon: "calendar" },
    { key: "log", label: "Log", icon: "plus" },
    { key: "insights", label: "Insights", icon: "insights" },
    { key: "care", label: "Care", icon: "care" }
  ];

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#styleguide") {
        actions.setTab("styleguide");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div id="app" className="v-mobile-shell">
      {/* Sleek Mobile Device Status Bar */}
      <div className="v-mobile-status-bar" aria-hidden="true">
        <span className="v-status-time">9:41</span>
        <div className="v-status-island" />
        <div className="v-status-icons">
          <Icon name="signal" size={13} />
          <Icon name="wifi" size={13} />
          <Icon name="battery" size={16} />
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="v-main-content">
        {/* Secondary Views Header */}
        {ui.tab !== "home" && (
          <header className="v-subview-header">
            <button
              type="button"
              className="v-subview-back-btn"
              onClick={() => actions.setTab("home")}
              aria-label="Back to Home"
            >
              <Icon name="arrowLeft" size={18} />
            </button>
            <h2 className="v-subview-title">
              {ui.tab === "styleguide" ? "Design System" : ui.tab.charAt(0).toUpperCase() + ui.tab.slice(1)}
            </h2>
            <button
              type="button"
              className="v-subview-profile-btn"
              onClick={() => actions.openProfile()}
              aria-label="Profile and settings"
            >
              <BunnyMascot size={28} />
            </button>
          </header>
        )}

        {/* Main View Router */}
        <main className="view-enter" key={ui.tab}>
          {ui.tab === "home" && <HomeView />}
          {ui.tab === "calendar" && <CalendarView />}
          {ui.tab === "log" && <LogView />}
          {ui.tab === "insights" && <InsightsView />}
          {ui.tab === "care" && <CareView />}
          {ui.tab === "styleguide" && <StyleguideView />}
        </main>
      </div>

      {/* Soft Sliding-Pill Navigation */}
      <SlidingPillNav activeTab={ui.tab} motionPref={S?.motion} />

      {/* Home Indicator Bar */}
      <div className="v-home-indicator" aria-hidden="true" />

      {/* Toast Notification Container */}
      {ui.toasts && ui.toasts.length > 0 && (
        <div role="status" aria-live="polite">
          {ui.toasts.map(t => (
            <div key={t.id} className="c-toast-wrap">
              <div className="c-toast">
                <span>{t.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialogs Host */}
      {ui.prof ? <ProfileSettingsSheet /> : null}
      {ui.activeArticle ? <ArticleModal /> : null}
      {ui.partnerModal ? <PartnerModal /> : null}
      {ui.clinicianModal ? <ClinicianModal /> : null}
      {ui.conflict ? <ConflictModal /> : null}
      {ui.infoTopic ? <InfoAssistantModal /> : null}
      {ui.tourModal ? <PhaseTourModal /> : null}
      {ui.careCustomModal ? <CareCustomModal /> : null}
      {ui.deleteJournalConfirm ? <DeleteJournalModal /> : null}
    </div>
  );
}
