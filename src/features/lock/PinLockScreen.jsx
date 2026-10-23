/**
 * CycleSideChick — PIN Lock Screen Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import { Icon } from "../../components/ui/Icon.jsx";

export function PinLockScreen() {
  const { ui } = useStore();
  const inputLen = (ui.pinInput || "").length;

  return (
    <div className={`pin-screen ${ui.pinError ? "pin-error-shake" : ""}`}>
      <div className="pin-brand">
        <BunnyMascot size={64} showLabel={false} />
        <h2>CycleSideChick</h2>
        <p className="subtle">Enter your 4-digit PIN to unlock</p>
      </div>

      <div className="pin-dots" aria-live="polite" aria-label={`${inputLen} of 4 digits entered`}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`pin-dot ${i < inputLen ? "filled" : ""}`}
          />
        ))}
      </div>

      <div className="pin-keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            type="button"
            className="pin-key"
            onClick={() => actions.enterPinKey(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="pin-key pin-key-action"
          onClick={() => actions.clearPin()}
          aria-label="Clear PIN input"
        >
          Clear
        </button>
        <button
          type="button"
          className="pin-key"
          onClick={() => actions.enterPinKey(0)}
        >
          0
        </button>
        <button
          type="button"
          className="pin-key pin-key-action"
          onClick={() => actions.deletePinKey()}
          aria-label="Delete last digit"
        >
          <Icon name="arrowLeft" size={20} />
        </button>
      </div>
    </div>
  );
}
