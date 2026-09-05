import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";

export function FounderDiligenceState({ state }: { state: FounderDiligenceRoomDTO["state"] }) {
  return <section className="dd-founder-state"><strong>{state.total ? `Diligence State: ${state.resolved} of ${state.total} Resolved` : "Diligence State: No investor questions yet"}</strong><div><span>{state.awaitingFounder} Awaiting Founder</span><span>{state.clarificationRequested} Clarification Requested</span><span>{state.awaitingReview} Awaiting Review</span></div></section>;
}
