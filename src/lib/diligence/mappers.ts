import { buildStartupDescriptor, initials } from "./format.ts";
import type { DiligenceMemberRole, DiligenceRoomDTO, EvidenceStatus, RecommendationDecision, RiskSeverity, WorkstreamStatus } from "./types.ts";

type RequestStatus = "open" | "needs_response" | "awaiting_founder" | "response_submitted" | "clarification_requested" | "resolved" | "cancelled";
type EvidenceState = "verified" | "needs_response" | "missing";
type RiskState = DiligenceRoomDTO["risks"][number]["status"];
type Severity = "critical" | "high" | "medium";
type Decision = "proceed" | "proceed_with_conditions" | "pause_diligence" | "decline";

export type RoomRow = {
  id: string; deal_id: string; room_code: string;
  status: DiligenceRoomDTO["status"]; closes_at: string | null; readiness_score: number;
};
// Existing-table assumptions are explicit: see the external database contract.
export type DealRow = {
  id: string; startup_id: string; spv_id: string | null;
  round: string | null; target_amount: number; currency: string;
};
export type StartupRow = {
  id: string; display_name: string | null; sector: string | null;
  city?: string | null; country: string | null;
};
export type ProfileRow = {
  id: string; display_name: string | null; photo_url: string | null; country: string | null;
};
export type WorkstreamRow = { id: string; title: string; owner_user_id: string | null };
export type RequestRow = {
  id?: string; room_id?: string; workstream_id: string; status: RequestStatus;
  requested_from_user_id?: string | null; title?: string; request_text?: string;
  priority?: "high" | "medium" | "standard"; why_it_matters?: string | null;
  due_at?: string | null; created_at?: string;
};
export type RequestMessageRow = {
  id: string; request_id: string; author_user_id: string;
  message_type: "founder_response" | "reviewer_clarification" | "founder_clarification";
  body: string; created_at: string;
};
export type EvidenceRow = {
  id: string; workstream_id: string; title: string; status: EvidenceState;
  owner_user_id: string | null; updated_at: string;
  source_type: string | null; source_uri: string | null; claim: string | null;
};
export type RiskRow = {
  id: string; workstream_id: string | null; risk_code: string; severity: Severity;
  category: string; title: string; description: string; status: RiskState;
  owner_user_id: string | null; updated_at: string;
};
export type DiscussionRow = {
  id: string; parent_message_id: string | null; user_id: string; body: string; created_at: string;
};
export type MemberRow = {
  user_id: string; status: "invited" | "active" | "removed"; last_active_at: string | null;
};
export type RecommendationRow = {
  id: string; decision: Decision; rationale: string; conditions: string | null; submitted_at: string;
};
export type DiligenceRoomRows = {
  room: RoomRow; viewerUserId: string; viewerRole: DiligenceMemberRole;
  deal: DealRow; startup: StartupRow; leadUserId: string | null; profiles: ProfileRow[];
  workstreams: WorkstreamRow[]; requests: RequestRow[]; requestMessages?: RequestMessageRow[]; evidence: EvidenceRow[];
  risks: RiskRow[]; discussion: DiscussionRow[]; members: MemberRow[];
  latestRecommendation: RecommendationRow | null;
};

export function workstreamStatusLabel(status: "clear" | "review" | "blocked"): WorkstreamStatus {
  return { clear: "Clear", review: "Review", blocked: "Blocked" }[status] as WorkstreamStatus;
}
export function evidenceStatusLabel(status: EvidenceState): EvidenceStatus {
  return { verified: "Verified", needs_response: "Needs response", missing: "Missing" }[status] as EvidenceStatus;
}
export function riskSeverityLabel(severity: Severity): RiskSeverity {
  return { critical: "Critical", high: "High", medium: "Medium" }[severity] as RiskSeverity;
}
export function recommendationDecisionLabel(decision: Decision): RecommendationDecision {
  return { proceed: "Proceed", proceed_with_conditions: "Proceed with conditions", pause_diligence: "Pause diligence", decline: "Decline" }[decision] as RecommendationDecision;
}

export function evidenceSummary(requests: ReadonlyArray<Pick<RequestRow, "status">>) {
  return {
    resolved: requests.filter((request) => request.status === "resolved").length,
    total: requests.filter((request) => request.status !== "cancelled").length,
  };
}
export function workstreamProgress(requests: ReadonlyArray<Pick<RequestRow, "status">>): number {
  if (requests.length === 0) return 0;
  const resolved = requests.filter((request) => request.status === "resolved").length;
  return (resolved / requests.length) * 100;
}
export function workstreamStatus(
  evidence: ReadonlyArray<Pick<EvidenceRow, "status">>,
  risks: ReadonlyArray<Pick<RiskRow, "severity" | "status">>,
): WorkstreamStatus {
  const activeRisks = risks.filter(isActiveRisk);
  if (activeRisks.some((risk) => risk.severity === "critical")) return workstreamStatusLabel("blocked");
  if (activeRisks.some((risk) => risk.severity === "high") ||
      evidence.some((item) => item.status === "missing" || item.status === "needs_response")) {
    return workstreamStatusLabel("review");
  }
  return workstreamStatusLabel("clear");
}

function isActiveRisk(risk: Pick<RiskRow, "status">) {
  return risk.status === "open" || risk.status === "under_review";
}

function latest<T extends { id: string; updated_at: string }>(rows: readonly T[]): T | undefined {
  return rows.reduce<T | undefined>((newest, row) => {
    if (!newest) return row;
    const rowTime = Date.parse(row.updated_at);
    const newestTime = Date.parse(newest.updated_at);
    return rowTime > newestTime || (rowTime === newestTime && row.id > newest.id)
      ? row
      : newest;
  }, undefined);
}
export function buildSignals(
  evidence: ReadonlyArray<Pick<EvidenceRow, "id" | "status" | "title" | "claim" | "updated_at">>,
  risks: ReadonlyArray<Pick<RiskRow, "id" | "severity" | "status" | "title" | "updated_at">>,
): DiligenceRoomDTO["signals"] {
  const positive = latest(evidence.filter((item) => item.status === "verified"));
  const response = latest(evidence.filter((item) => item.status === "needs_response"));
  const high = latest(risks.filter((risk) => risk.severity === "high"));
  const critical = latest(risks.filter((risk) => risk.severity === "critical" && isActiveRisk(risk)));
  const signals: DiligenceRoomDTO["signals"] = [];
  if (positive) signals.push({ kind: "Positive", message: positive.claim || positive.title });
  if (response) signals.push({ kind: "Watch", message: response.claim || response.title });
  else if (high) signals.push({ kind: "Watch", message: high.title });
  if (critical) signals.push({ kind: "Critical", message: critical.title });
  return signals;
}
export function buildActivity(
  members: readonly MemberRow[],
  profiles: ReadonlyArray<Pick<ProfileRow, "id" | "display_name" | "country">>,
  now: Date,
): DiligenceRoomDTO["activity"] {
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  const active = members.filter((member) => member.status === "active");
  const today = now.toISOString().slice(0, 10);
  const activeToday = active.filter((member) => {
    if (!member.last_active_at) return false;
    const date = new Date(member.last_active_at);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === today;
  });
  const countries = activeToday.map((member) => byId.get(member.user_id)?.country)
    .filter((country): country is string => Boolean(country?.trim()));
  return {
    reviewerCount: active.length,
    activeTodayCount: activeToday.length,
    marketCount: new Set(countries).size,
    avatars: active.slice(0, 4).map((member) => {
      const displayName = byId.get(member.user_id)?.display_name ?? "";
      return { initials: initials(displayName), displayName };
    }),
  };
}
export function mapDiligenceRoom(rows: DiligenceRoomRows, now = new Date()): DiligenceRoomDTO {
  const profiles = new Map(rows.profiles.map((profile) => [profile.id, profile]));
  const ownerName = (id: string | null) => id ? profiles.get(id)?.display_name ?? null : null;
  const viewer = profiles.get(rows.viewerUserId);
  const viewerName = viewer?.display_name ?? "";
  const companyName = rows.startup.display_name ?? "";
  const recommendation = rows.latestRecommendation;
  return {
    id: rows.room.id,
    code: rows.room.room_code,
    status: rows.room.status,
    closesAt: rows.room.closes_at,
    readinessScore: rows.room.readiness_score,
    viewer: {
      userId: rows.viewerUserId, displayName: viewerName, initials: initials(viewerName),
      role: rows.viewerRole, photoUrl: viewer?.photo_url ?? null,
    },
    deal: {
      id: rows.deal.id, startupId: rows.deal.startup_id, companyName,
      companyInitials: initials(companyName),
      descriptor: buildStartupDescriptor(rows.startup.sector, rows.startup.city ?? null, rows.startup.country),
      round: rows.deal.round, targetAmount: rows.deal.target_amount, currency: rows.deal.currency,
      leadName: ownerName(rows.leadUserId),
    },
    workstreams: rows.workstreams.map((workstream) => ({
      id: workstream.id, title: workstream.title, ownerUserId: workstream.owner_user_id,
      ownerName: ownerName(workstream.owner_user_id),
      progress: workstreamProgress(rows.requests.filter((request) => request.workstream_id === workstream.id)),
      status: workstreamStatus(rows.evidence.filter((item) => item.workstream_id === workstream.id),
        rows.risks.filter((risk) => risk.workstream_id === workstream.id)),
    })),
    evidenceSummary: evidenceSummary(rows.requests),
    evidence: rows.evidence.map((item) => ({
      id: item.id, title: item.title, workstreamId: item.workstream_id,
      workstream: rows.workstreams.find((workstream) => workstream.id === item.workstream_id)?.title ?? "",
      status: evidenceStatusLabel(item.status), ownerUserId: item.owner_user_id,
      ownerName: ownerName(item.owner_user_id), updatedAt: item.updated_at,
      sourceType: item.source_type, sourceUri: item.source_uri, claim: item.claim,
    })),
    evidenceRequests: rows.requests.filter((request) => request.id).map((request) => ({
      id: request.id as string,
      workstreamId: request.workstream_id,
      workstream: rows.workstreams.find((workstream) => workstream.id === request.workstream_id)?.title ?? "",
      requestedFromUserId: request.requested_from_user_id ?? null,
      requestedFromName: ownerName(request.requested_from_user_id ?? null),
      priority: request.priority ?? "standard",
      title: request.title ?? "",
      requestText: request.request_text ?? "",
      whyItMatters: request.why_it_matters ?? null,
      status: request.status,
      dueAt: request.due_at ?? null,
      messages: (rows.requestMessages ?? []).filter((message) => message.request_id === request.id).map((message) => ({
        id: message.id, messageType: message.message_type, authorUserId: message.author_user_id,
        authorName: ownerName(message.author_user_id) ?? "", body: message.body, createdAt: message.created_at,
      })),
    })),
    risks: rows.risks.map((risk) => ({
      id: risk.id, riskCode: risk.risk_code, severity: riskSeverityLabel(risk.severity),
      category: risk.category, title: risk.title, description: risk.description,
      status: risk.status, ownerUserId: risk.owner_user_id,
    })),
    signals: buildSignals(rows.evidence, rows.risks),
    discussion: rows.discussion.map((message) => {
      const authorName = profiles.get(message.user_id)?.display_name ?? "";
      return {
        id: message.id, parentMessageId: message.parent_message_id, authorUserId: message.user_id,
        authorName, authorInitials: initials(authorName), authorRoleLabel: "Reviewer",
        body: message.body, createdAt: message.created_at,
      };
    }),
    activity: buildActivity(rows.members, rows.profiles, now),
    latestRecommendation: recommendation ? {
      id: recommendation.id, decision: recommendationDecisionLabel(recommendation.decision),
      rationale: recommendation.rationale, conditions: recommendation.conditions,
      submittedAt: recommendation.submitted_at,
    } : null,
  };
}
