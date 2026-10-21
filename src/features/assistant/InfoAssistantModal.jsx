/**
 * CycleSideChick — Info & On-Device Assistant Modal Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";

export function InfoAssistantModal() {
  const { ui } = useStore();
  const topic = ui.infoTopic;
  if (!topic) return null;

  const isAssistantAnswer = topic === "assistant_qa" && ui.assistantAnswer;
  const answer = ui.assistantAnswer || {};

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={() => actions.closeInfo()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <span className="pill-tag" style={{ background: "var(--tint-mint-bg)", color: "var(--tint-mint-text)" }}>
              {isAssistantAnswer ? "On-Device Assistant" : "Evidence Guide"}
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "19px" }}>
              {isAssistantAnswer ? answer.title || "Health Insights" : "Clinical Information"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closeInfo()}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {isAssistantAnswer ? (
          <div>
            <p className="mut" style={{ fontSize: "12px", margin: "0 0 10px" }}>{answer.context}</p>
            <div style={{ fontSize: "13.5px", lineHeight: "1.6", whiteSpace: "pre-line", marginBottom: "16px" }}>
              {answer.body}
            </div>
            {answer.clinicianAdvice && (
              <div className="card tint-rose" style={{ padding: "12px", fontSize: "12px", marginBottom: "12px" }}>
                <b>When to consult:</b> {answer.clinicianAdvice}
              </div>
            )}
            <div className="card tint-mint" style={{ padding: "10px", fontSize: "11.5px" }}>
              <b>Source:</b> {answer.source || "ACOG Clinical Library"}
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "13.5px", lineHeight: "1.6" }}>
              All estimates and calculations in CycleSideChick are based on standard clinical guidelines from ACOG and FIGO.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
