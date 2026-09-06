export type DiligenceView =
  | "Overview"
  | "Evidence"
  | "Risks"
  | "Discussion"
  | "Decision";

export type DiligenceMemberRole = "lead_reviewer" | "reviewer";
export type WorkstreamStatus = "Clear" | "Review" | "Blocked";
export type EvidenceStatus = "Verified" | "Needs response" | "Missing";
export type RiskSeverity = "Critical" | "High" | "Medium";
export type SignalKind = "Positive" | "Watch" | "Critical";
export type RecommendationDecision =
  | "Proceed"
  | "Proceed with conditions"
  | "Pause diligence"
  | "Decline";

export type DiligenceRoomDTO = {
  id: string;
  code: string;
  status: "active_review" | "paused" | "decision_recorded" | "closed";
  closesAt: string | null;
  readinessScore: number;
  viewer: {
    userId: string;
    displayName: string;
    initials: string;
    role: DiligenceMemberRole;
    photoUrl: string | null;
  };
  deal: {
    id: string;
    startupId: string;
    companyName: string;
    companyInitials: string;
    descriptor: string;
    round: string | null;
    targetAmount: number;
    currency: string;
    leadName: string | null;
  };
  workstreams: Array<{
    id: string;
    title: string;
    ownerUserId: string | null;
    ownerName: string | null;
    progress: number;
    status: WorkstreamStatus;
  }>;
  evidenceSummary: {
    resolved: number;
    total: number;
  };
  evidence: Array<{
    id: string;
    title: string;
    workstreamId: string;
    workstream: string;
    status: EvidenceStatus;
    ownerUserId: string | null;
    ownerName: string | null;
    updatedAt: string;
    sourceType: string | null;
    sourceUri: string | null;
    claim: string | null;
  }>;
  evidenceRequests?: Array<{
    id: string;
    workstreamId: string;
    workstream: string;
    requestedFromUserId: string | null;
    requestedFromName: string | null;
    priority: "high" | "medium" | "standard";
    title: string;
    requestText: string;
    whyItMatters: string | null;
    status: "open" | "needs_response" | "awaiting_founder" | "response_submitted" | "clarification_requested" | "resolved" | "cancelled";
    dueAt: string | null;
    messages: Array<{
      id: string;
      messageType: "founder_response" | "reviewer_clarification" | "founder_clarification";
      authorUserId: string;
      authorName: string;
      body: string;
      createdAt: string;
    }>;
  }>;
  risks: Array<{
    id: string;
    riskCode: string;
    severity: RiskSeverity;
    category: string;
    title: string;
    description: string;
    status: "open" | "under_review" | "mitigated" | "accepted" | "closed";
    ownerUserId: string | null;
  }>;
  signals: Array<{
    kind: SignalKind;
    message: string;
  }>;
  discussion: Array<{
    id: string;
    parentMessageId: string | null;
    authorUserId: string;
    authorName: string;
    authorInitials: string;
    authorRoleLabel: "Reviewer";
    body: string;
    createdAt: string;
  }>;
  activity: {
    reviewerCount: number;
    activeTodayCount: number;
    marketCount: number;
    avatars: Array<{
      initials: string;
      displayName: string;
    }>;
  };
  latestRecommendation: {
    id: string;
    decision: RecommendationDecision;
    rationale: string;
    conditions: string | null;
    submittedAt: string;
  } | null;
};
