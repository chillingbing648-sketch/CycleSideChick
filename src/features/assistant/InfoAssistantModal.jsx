/**
 * CycleSideChick — Info & On-Device Assistant Modal Component
 * Wrapped in SheetModal primitive with drag-to-dismiss gesture.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function InfoAssistantModal() {
  const { ui } = useStore();
  const topic = ui.infoTopic;
  if (!topic) return null;

  const isAssistantAnswer = topic === "assistant_qa" && ui.assistantAnswer;
  const answer = ui.assistantAnswer || {};

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeInfo()}
      title={isAssistantAnswer ? answer.title || "Health Assistant" : "Clinical Information"}
      maxWidth="520px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Card variant="raised" style={{ padding: "16px", fontSize: "14px", lineHeight: "1.6" }}>
          {isAssistantAnswer ? (
            <div>
              <p style={{ margin: "0 0 12px" }}>{answer.text || answer.summary}</p>
              {answer.source && (
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", fontSize: "11.5px", color: "var(--text-muted)" }}>
                  <b>Source:</b> {answer.source}
                </div>
              )}
            </div>
          ) : (
            <p style={{ margin: 0 }}>
              CycleSideChick predictions and physiological explanations are estimates derived from standard ACOG clinical norms.
            </p>
          )}
        </Card>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="sm" onClick={() => actions.closeInfo()}>
            Close
          </Button>
        </div>
      </div>
    </SheetModal>
  );
}
