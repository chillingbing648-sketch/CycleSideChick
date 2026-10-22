/**
 * CycleSideChick — Sliding Sidebar Navigation Drawer
 * 
 * Provides an ergonomic, highly accessible sliding drawer navigation flow
 * found in modern top-tier applications.
 * Includes:
 * - Brand Droplet Logo & Title
 * - User Greeting & Live Cycle Phase Badge
 * - Primary Views Navigation
 * - Health Trackers & Tools Hub (Water, Weight, BBT, Phase Science)
 * - Privacy & Security Vault (Ledger, PIN, Data Export, Setup Recalibration)
 * - Women's Wellness & Non-Commercial Care Notice
 * - Pro Sandbox Evaluation Token
 * - Keyboard Escape listener & focus dismissal
 */

import React, { useEffect } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "./Icon.jsx";
import { BrandDropletLogo } from "./PhaseIllustrations.jsx";
import { BunnyMascot } from "./BunnyMascot.jsx";
import { calculateStats, TD, I, N } from "../../core/engine.js";
import { PinLock } from "../../core/storage.js";

export function SidebarDrawer({ isOpen = false, onClose }) {
  const { S, ui } = useStore();
  const stats = calculateStats(S);
  const isPinActive = PinLock.isEnabled();

  const curDay = stats.curDay || 1;
  const phaseKey = stats.phase || "follicular";
  const phaseLabels = {
    menstrual: "Menstrual Phase",
    follicular: "Follicular Phase",
    ovulatory: "Ovulatory Phase",
    luteal: "Luteal Phase"
  };
  const phaseColors = {
    menstrual: "#FF5B99",
    follicular: "#FF8E3C",
    ovulatory: "#6C5CE7",
    luteal: "#20BF6B"
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavClick = (tabKey) => {
    actions.setTab(tabKey);
    onClose();
  };

  const handleOpenProfileTab = (profTab) => {
    ui.profTab = profTab;
    actions.openProfile();
    onClose();
  };

  const handleReplayTour = () => {
    S.ob = 0;
    actions.persistState();
    onClose();
    actions.toast("Launching Setup Guide...");
  };

  return (
    <div
      className={`v-sidebar-drawer-root ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Drawer"
    >
      {/* Backdrop */}
      <div
        className="v-sidebar-backdrop"
        onClick={onClose}
        aria-label="Close navigation drawer"
      />

      {/* Drawer Sliding Panel */}
      <aside className="v-sidebar-panel">
        {/* Drawer Header */}
        <div className="v-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BrandDropletLogo size={36} />
            <div>
              <h2 className="v-sidebar-brand-title">CycleSideChick</h2>
              <span className="v-sidebar-brand-subtitle">Women's Health & Care</span>
            </div>
          </div>
          <button
            type="button"
            className="v-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* User & Live Cycle Status Card */}
        <div
          className="v-sidebar-user-card"
          onClick={() => handleOpenProfileTab("health")}
          role="button"
          tabIndex={0}
          aria-label="Open Health Profile"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BunnyMascot size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <b className="v-sidebar-user-name">
                {S.userName ? `Hi, ${S.userName}` : "Hi, Friend"}
              </b>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: phaseColors[phaseKey] || "var(--primary)"
                  }}
                />
                <span className="v-sidebar-phase-label">
                  Day {curDay} · {phaseLabels[phaseKey] || "Cycle Day"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="v-sidebar-scroll-content">
          
          {/* 1. Primary Views */}
          <div className="v-sidebar-group">
            <span className="v-sidebar-group-title">MAIN VIEWS</span>
            <div className="v-sidebar-group-items">
              {[
                { key: "home", label: "Today Dashboard", icon: "home" },
                { key: "calendar", label: "Cycle Calendar", icon: "calendar" },
                { key: "log", label: "Daily Symptoms Log", icon: "plus" },
                { key: "insights", label: "Body Insights & Trends", icon: "insights" },
                { key: "care", label: "Care Kit & Journal", icon: "care" }
              ].map(item => {
                const isActive = ui.tab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`v-sidebar-nav-item ${isActive ? "is-active" : ""}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <div className="v-sidebar-icon-wrap">
                      <Icon name={item.icon} size={18} />
                    </div>
                    <span className="v-sidebar-nav-label">{item.label}</span>
                    {isActive && <div className="v-sidebar-active-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Health Trackers & Tools Hub */}
          <div className="v-sidebar-group">
            <span className="v-sidebar-group-title">HEALTH TRACKERS & METRICS</span>
            <div className="v-sidebar-group-items">
              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openPeriodModal();
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--rose">
                  <Icon name="droplet" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Period & Cycle Flow</span>
                  <span className="v-sidebar-nav-sublabel">ACOG/FIGO flow tracking & history</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openWaterModal();
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--cyan">
                  <Icon name="water" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Hydration & Water Tracker</span>
                  <span className="v-sidebar-nav-sublabel">Animated fill up & appreciation</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openHealthModal("weight");
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--peach">
                  <Icon name="activity" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Body Weight & BMI</span>
                  <span className="v-sidebar-nav-sublabel">Log weigh-ins & cyclical fluid shifts</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openHealthModal("temp");
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--orange">
                  <Icon name="thermometer" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Basal Body Temperature (BBT)</span>
                  <span className="v-sidebar-nav-sublabel">Biphasic thermal shift curves</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openPhaseModal(phaseKey);
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--purple">
                  <Icon name="book" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Menstrual Phase Science</span>
                  <span className="v-sidebar-nav-sublabel">Biology of your 4 hormonal phases</span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Privacy & Security Vault */}
          <div className="v-sidebar-group">
            <span className="v-sidebar-group-title">PRIVACY & DATA VAULT</span>
            <div className="v-sidebar-group-items">
              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => handleOpenProfileTab("privacy")}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--mint">
                  <Icon name="shield" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">On-Device Privacy Ledger</span>
                  <span className="v-sidebar-nav-sublabel">100% Local Sandboxed · Zero Cloud</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => handleOpenProfileTab("privacy")}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--indigo">
                  <Icon name="lock" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">PIN Passcode Protection</span>
                  <span className="v-sidebar-nav-sublabel">
                    {isPinActive ? "Active & Enforced on launch" : "Optional 4-digit passcode"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.exportCSV();
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap">
                  <Icon name="download" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Export Medical Records</span>
                  <span className="v-sidebar-nav-sublabel">Download tabular CSV backup</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={handleReplayTour}
              >
                <div className="v-sidebar-icon-wrap">
                  <Icon name="refresh" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Recalibrate Cycle Tour</span>
                  <span className="v-sidebar-nav-sublabel">Re-run 12-step guided setup</span>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Care Mission & Evaluation Sandbox */}
          <div className="v-sidebar-group">
            <span className="v-sidebar-group-title">ABOUT & CARE</span>
            <div className="v-sidebar-group-items">
              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openWellnessNotice();
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--rose">
                  <Icon name="heart" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Women's Wellness Mission</span>
                  <span className="v-sidebar-nav-sublabel">100% Free · Non-Commercial Care</span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  actions.openPremiumModal();
                  onClose();
                }}
              >
                <div className="v-sidebar-icon-wrap v-icon-wrap--gold">
                  <Icon name="star" size={18} />
                </div>
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Pro Sandbox Evaluation</span>
                  <span className="v-sidebar-nav-sublabel">
                    {S.premium ? "Evaluation Token Active" : "Prototype Checkout Sandbox"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="v-sidebar-nav-item"
                onClick={() => {
                  window.location.hash = "#styleguide";
                  actions.setTab("styleguide");
                  onClose();
                }}
              >
                <Icon name="sparkles" size={18} />
                <div className="v-sidebar-nav-text-col">
                  <span className="v-sidebar-nav-label">Design System Styleguide</span>
                  <span className="v-sidebar-nav-sublabel">Tokens, typography & UI library</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Notice */}
        <div className="v-sidebar-footer">
          <div className="v-sidebar-footer-card">
            <Icon name="shield" size={14} />
            <span>100% Free & On-Device · Zero Telemetry</span>
          </div>
          <span className="v-sidebar-version-tag">CycleSideChick v3.0.0</span>
        </div>
      </aside>
    </div>
  );
}
