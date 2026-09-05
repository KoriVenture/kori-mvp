export type FounderDiligenceWorkstreamKey =
  | "market" | "financial" | "product_tech" | "legal_regulatory" | "governance"
  | "operations" | "team" | "impact" | "local_context" | "execution_risk";
export type FounderDiligenceRequestStatus = "open" | "needs_response" | "awaiting_founder" | "response_submitted" | "clarification_requested" | "resolved" | "cancelled";
export type FounderDiligencePriority = "high" | "medium" | "standard";
export type FounderDiligenceRequestMessageType = "founder_response" | "reviewer_clarification" | "founder_clarification";
export type TermSheetStage = "proposed_terms" | "negotiation" | "approval" | "vehicle_formation" | "signatures" | "funding" | "close";
export type ClosingChecklistStatus = "pending" | "incomplete" | "under_review" | "complete";

export type FounderDiligenceRoomDTO = {
  room: { id: string; code: string; status: string; readinessScore: number };
  viewer: { userId: string; displayName: string; initials: string; photoUrl: string | null };
  startup: { id: string; displayName: string; legalName: string; sector: string | null };
  deal: { id: string; round: string | null; targetAmount: number; currency: string; termSheetStage: TermSheetStage };
  termSheet: { investment: { amount: number; currency: string }; instrument: string | null; preMoneyValuation: string | number | null; investorRights: string | null; governance: string | null; milestoneCount: number; vehicle: string | null; jurisdiction: string | null; rawTerms: Record<string, unknown> };
  workstreams: Array<{ id: string; key: FounderDiligenceWorkstreamKey; title: string; resolved: number; total: number; awaitingFounder: number; clarificationRequested: number; awaitingReview: number }>;
  state: { resolved: number; total: number; awaitingFounder: number; clarificationRequested: number; awaitingReview: number };
  requests: Array<{ id: string; workstreamId: string; workstreamKey: FounderDiligenceWorkstreamKey; workstreamTitle: string; priority: FounderDiligencePriority; title: string; question: string; whyItMatters: string | null; status: FounderDiligenceRequestStatus; dueAt: string | null; requestedBy: { userId: string; displayName: string; organization: string | null }; assignedFounderName: string; messages: Array<{ id: string; messageType: FounderDiligenceRequestMessageType; authorUserId: string; authorName: string; body: string; createdAt: string }>; evidence: Array<{ id: string; title: string; claim: string | null; sourceType: string | null; sourceUri: string | null; startupDocumentId: string | null; status: string; updatedAt: string }> }>;
  startupDocuments: Array<{ id: string; title: string; documentType: string; storagePath: string; mimeType: string | null; sizeBytes: number | null; createdAt: string }>;
  closingChecklist: Array<{ id: string; itemKey: string; title: string; ownerName: string; status: ClosingChecklistStatus; statusDetail: string | null; dueAt: string | null }>;
};

export const FOUNDER_WORKSTREAM_ORDER: FounderDiligenceWorkstreamKey[] = ["market", "financial", "product_tech", "legal_regulatory", "governance", "operations", "team", "impact", "local_context", "execution_risk"];

export function normalizeFounderWorkstreamKey(key: string): FounderDiligenceWorkstreamKey | null {
  const normalized: Record<string, FounderDiligenceWorkstreamKey> = {
    market_customer: "market", market: "market", financial_model: "financial", financial: "financial",
    product_technology: "product_tech", product_tech: "product_tech", legal_governance: "legal_regulatory", legal_regulatory: "legal_regulatory",
    governance: "governance", operations: "operations", team: "team", impact: "impact", local_context: "local_context", execution_risk: "execution_risk",
  };
  return normalized[key] ?? null;
}

export function deriveFounderDiligenceState(requests: Array<Pick<FounderDiligenceRoomDTO["requests"][number], "status">>) {
  const active = requests.filter((request) => request.status !== "cancelled");
  return {
    resolved: active.filter((request) => request.status === "resolved").length,
    total: active.length,
    awaitingFounder: active.filter((request) => ["open", "needs_response", "awaiting_founder"].includes(request.status)).length,
    clarificationRequested: active.filter((request) => request.status === "clarification_requested").length,
    awaitingReview: active.filter((request) => request.status === "response_submitted").length,
  };
}
