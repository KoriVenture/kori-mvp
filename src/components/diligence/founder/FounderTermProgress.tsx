import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";

const STAGES = ["proposed_terms", "negotiation", "approval", "vehicle_formation", "signatures", "funding", "close"] as const;
const LABELS = ["Proposed terms", "Negotiation", "Approval", "Vehicle formation", "Signatures", "Funding", "Close"];
export function FounderTermProgress({ stage }: { stage: FounderDiligenceRoomDTO["deal"]["termSheetStage"] }) {
  const current = STAGES.indexOf(stage);
  return <div className="dd-founder-term-progress">{STAGES.map((item, index) => <span className={index < current ? "complete" : index === current ? "current" : ""} key={item}>{LABELS[index]}</span>)}</div>;
}
