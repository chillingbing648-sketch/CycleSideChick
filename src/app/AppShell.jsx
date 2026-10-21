/**
 * CycleSideChick — Main Application Shell
 * Responsive adaptive shell:
 * - Mobile (<600px): Centered single-column, bottom nav bar, 44px min touch targets
 * - Tablet (600-1023px): Max-width 720px, floating dock nav
 * - Desktop (>=1024px): Max-width 1280px, persistent left navigation rail / sidebar
 */

import React, { useEffect } from "react";
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
    <div id="app">
      {/* Desktop Persistent Navigation Sidebar (>=1024px) */}
      <aside className="v-sidebar">
        <div>
          <div className="v-sidebar__brand" onClick={() => actions.setTab("home")}>
            <BunnyMascot size={36} showLabel={false} />
            <span className="v-sidebar__title">CycleSideChick</span>
          </div>

          <nav className="v-sidebar__nav" aria-label="Desktop Navigation">
            {NAV_ITEMS.map(item => {
              const isActive = ui.tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`v-sidebar__item ${isActive ? "active" : ""}`}
                  onClick={() => actions.setTab(item.key)}
                  aria-current={isActive ? "page" : "false"}
                >
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="v-sidebar__footer">
          <button
            type="button"
            className="v-sidebar__item"
            onClick={() => actions.openProfile()}
            aria-label="Profile and settings"
          >
            <Icon name="user" size={20} />
            <span>Profile & Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="v-main-content">
        {/* Mobile / Tablet Header (<1024px) for non-home views */}
        {ui.tab !== "home" && (
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

      {/* Floating Bottom Navigation for Mobile & Tablet */}
      <nav className="v-nav-bar" aria-label="Main Navigation">
        {NAV_ITEMS.map(item => {
          const isActive = ui.tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`v-nav-item ${isActive ? "active" : ""}`}
              onClick={() => actions.setTab(item.key)}
              aria-current={isActive ? "page" : "false"}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

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
