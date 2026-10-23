/**
 * CycleSideChick — Partner & Companion Modal Adapter
 * Bridges existing actions.openPartner() to the full Cycle Care Companion system.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { CompanionShareSheet } from "../companion/CompanionShareSheet.jsx";

export function PartnerModal() {
  const { ui } = useStore();
  if (!ui.partnerModal) return null;

  return (
    <CompanionShareSheet
      isOpen={true}
      onClose={() => actions.closePartner()}
    />
  );
}
