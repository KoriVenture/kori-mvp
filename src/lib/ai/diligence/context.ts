import type { DiligenceRoomDTO } from "../../diligence/types";

export type DiligenceAiContext = {
  room: {
    code: string;
    status: DiligenceRoomDTO["status"];
    readinessScore: number;
    closesAt: string | null;
  };
  deal: {
    companyName: string;
    descriptor: string;
    round: string | null;
    targetAmount: number;
    currency: string;
    leadName: string | null;
  };
  workstreams: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
  }>;
  evidence: Array<{
    id: string;
    title: string;
    workstream: string;
    status: string;
    updatedAt: string;
    sourceType: string | null;
    sourceUri: string | null;
    claim: string | null;
  }>;
  risks: Array<{
    id: string;
    riskCode: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    status: string;
  }>;
  discussion: Array<{
    id: string;
    authorName: string;
    body: string;
    createdAt: string;
  }>;
  recommendation: {
    decision: string;
    rationale: string;
    conditions: string | null;
    submittedAt: string;
  } | null;
  wasTruncated: boolean;
};

function bounded(value: string | null | undefined, max: number, state: { value: boolean }) {
  const text = value ?? "";
  if (text.length <= max) return text;
  state.value = true;
  return text.slice(0, max);
}

export function buildDiligenceAiContext(room: DiligenceRoomDTO): DiligenceAiContext {
  const state = { value: false };
  return {
    room: {
      code: bounded(room.code, 500, state),
      status: room.status,
      readinessScore: room.readinessScore,
      closesAt: bounded(room.closesAt, 500, state) || null,
    },
    deal: {
      companyName: bounded(room.deal.companyName, 500, state),
      descriptor: bounded(room.deal.descriptor, 500, state),
      round: bounded(room.deal.round, 500, state) || null,
      targetAmount: room.deal.targetAmount,
      currency: bounded(room.deal.currency, 500, state),
      leadName: bounded(room.deal.leadName, 500, state) || null,
    },
    workstreams: room.workstreams.slice(0, 100).map((item) => ({
      id: bounded(item.id, 500, state),
      title: bounded(item.title, 500, state),
      progress: item.progress,
      status: bounded(item.status, 500, state),
    })),
    evidence: room.evidence.slice(0, 100).map((item) => ({
      id: bounded(item.id, 500, state),
      title: bounded(item.title, 500, state),
      workstream: bounded(item.workstream, 500, state),
      status: bounded(item.status, 500, state),
      updatedAt: bounded(item.updatedAt, 500, state),
      sourceType: bounded(item.sourceType, 500, state) || null,
      sourceUri: bounded(item.sourceUri, 500, state) || null,
      claim: bounded(item.claim, 2_000, state) || null,
    })),
    risks: room.risks.slice(0, 100).map((item) => ({
      id: bounded(item.id, 500, state),
      riskCode: bounded(item.riskCode, 500, state),
      severity: bounded(item.severity, 500, state),
      category: bounded(item.category, 500, state),
      title: bounded(item.title, 500, state),
      description: bounded(item.description, 2_000, state),
      status: bounded(item.status, 500, state),
    })),
    discussion: room.discussion.slice(0, 100).map((item) => ({
      id: bounded(item.id, 500, state),
      authorName: bounded(item.authorName, 500, state),
      body: bounded(item.body, 2_000, state),
      createdAt: bounded(item.createdAt, 500, state),
    })),
    recommendation: room.latestRecommendation
      ? {
          decision: bounded(room.latestRecommendation.decision, 500, state),
          rationale: bounded(room.latestRecommendation.rationale, 2_000, state),
          conditions: bounded(room.latestRecommendation.conditions, 2_000, state) || null,
          submittedAt: bounded(room.latestRecommendation.submittedAt, 500, state),
        }
      : null,
    wasTruncated: state.value,
  };
}
