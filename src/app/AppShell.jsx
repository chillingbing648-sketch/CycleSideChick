/**
 * CycleSideChick — Main Application Shell
 */

import React from "react";
import { useStore } from "./store.js";
import { actions } from "./actions.js";
import { BunnyMascot } from "../components/ui/BunnyMascot.jsx";
import { Icon } from "../components/ui/Icon.jsx";

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
  const { ui } = useStore();

  const NAV_ITEMS = [
    { key: "home", label: "Home", icon: "home" },
    { key: "calendar", label: "Calendar", icon: "calendar" },
    { key: "log", label: "Log", icon: "log", isCenter: true },
    { key: "insights", label: "Insights", icon: "insights" },
    { key: "care", label: "Care", icon: "care" }
  ];

  React.useEffect(() => {
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
    <div id="app">
      {/* Header */}
      <header className="top">
        <span className="brand" onClick={() => actions.setTab("home")} style={{ cursor: "pointer" }}>
          <BunnyMascot size={32} showLabel={false} />
          <b className="wm2">CycleSideChick</b>
        </span>
        <button
          type="button"
          className="icon"
          onClick={() => actions.openProfile()}
          aria-label="Profile and settings"
        >
          <Icon name="user" size={20} />
        </button>
      </header>

      {/* Main View Router */}
      <main className="view-enter" key={ui.tab}>
        {ui.tab === "home" && <HomeView />}
        {ui.tab === "calendar" && <CalendarView />}
        {ui.tab === "log" && <LogView />}
        {ui.tab === "insights" && <InsightsView />}
        {ui.tab === "care" && <CareView />}
        {ui.tab === "styleguide" && <StyleguideView />}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="nav" aria-label="Main Navigation">
        {NAV_ITEMS.map(item => {
          const isActive = ui.tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`nav-btn ${item.isCenter ? "nav-btn-center" : ""}`}
              onClick={() => actions.setTab(item.key)}
              aria-current={isActive ? "page" : "false"}
            >
              {item.isCenter ? (
                <div className="nav-center-icon">
                  <Icon name={item.icon} size={20} />
                </div>
              ) : (
                <Icon name={item.icon} size={20} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast Notification Container */}
      <div id="toast" role="status" aria-live="polite">
        {ui.toasts && ui.toasts.map(t => (
          <div key={t.id} className="toast-pill show">
            {t.message}
          </div>
        ))}
      </div>

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
