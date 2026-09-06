import type { FounderDiligenceRoomDTO } from "../../../diligence/founder/types";

export type FounderDiligenceAiContext = {
  room: { id: string; code: string; status: string };
  startup: { id: string; displayName: string; sector: string | null };
  deal: { id: string; round: string | null; targetAmount: number; currency: string };
  state: FounderDiligenceRoomDTO["state"];
  workstreams: FounderDiligenceRoomDTO["workstreams"];
  requests: Array<{ id: string; workstream: string; priority: string; question: string; whyItMatters: string | null; status: string; dueAt: string | null; messages: Array<{ messageType: string; authorName: string; body: string; createdAt: string }>; evidence: Array<{ id: string; title: string; claim: string | null; status: string }> }>;
  termSheet: Omit<FounderDiligenceRoomDTO["termSheet"], "rawTerms">;
  closingChecklist: Array<{ title: string; status: string; statusDetail: string | null; dueAt: string | null }>;
  wasTruncated: boolean;
};

function limit(value: string | null | undefined, max: number, state: { truncated: boolean }) {
  const text = value ?? "";
  if (text.length <= max) return text;
  state.truncated = true;
  return text.slice(0, max);
}

export function buildFounderDiligenceAiContext(room: FounderDiligenceRoomDTO): FounderDiligenceAiContext {
  const state = { truncated: false };
  return {
    room: { id: limit(room.room.id, 500, state), code: limit(room.room.code, 500, state), status: limit(room.room.status, 500, state) },
    startup: { id: limit(room.startup.id, 500, state), displayName: limit(room.startup.displayName, 500, state), sector: limit(room.startup.sector, 500, state) || null },
    deal: { id: limit(room.deal.id, 500, state), round: limit(room.deal.round, 500, state) || null, targetAmount: room.deal.targetAmount, currency: limit(room.deal.currency, 500, state) },
    state: room.state,
    workstreams: room.workstreams.slice(0, 100),
    requests: room.requests.slice(0, 100).map((request) => ({
      id: limit(request.id, 500, state), workstream: limit(request.workstreamTitle, 500, state), priority: request.priority,
      question: limit(request.question, 2000, state), whyItMatters: limit(request.whyItMatters, 2000, state) || null, status: request.status, dueAt: limit(request.dueAt, 500, state) || null,
      messages: request.messages.slice(0, 20).map((message) => ({ messageType: message.messageType, authorName: limit(message.authorName, 500, state), body: limit(message.body, 2000, state), createdAt: limit(message.createdAt, 500, state) })),
      evidence: request.evidence.slice(0, 20).map((item) => ({ id: limit(item.id, 500, state), title: limit(item.title, 500, state), claim: limit(item.claim, 2000, state) || null, status: item.status })),
    })),
    termSheet: { investment: room.termSheet.investment, instrument: limit(room.termSheet.instrument, 500, state) || null, preMoneyValuation: room.termSheet.preMoneyValuation, investorRights: limit(room.termSheet.investorRights, 2000, state) || null, governance: limit(room.termSheet.governance, 2000, state) || null, milestoneCount: room.termSheet.milestoneCount, vehicle: limit(room.termSheet.vehicle, 500, state) || null, jurisdiction: limit(room.termSheet.jurisdiction, 500, state) || null },
    closingChecklist: room.closingChecklist.map((item) => ({ title: limit(item.title, 500, state), status: item.status, statusDetail: limit(item.statusDetail, 2000, state) || null, dueAt: limit(item.dueAt, 500, state) || null })),
    wasTruncated: state.truncated,
  };
}
