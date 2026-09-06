import { requireRole } from "@/lib/onboarding/http";
import { initials } from "../format";
import {
  deriveFounderDiligenceState,
  FOUNDER_WORKSTREAM_ORDER,
  normalizeFounderWorkstreamKey,
  type ClosingChecklistStatus,
  type FounderDiligencePriority,
  type FounderDiligenceRequestMessageType,
  type FounderDiligenceRequestStatus,
  type FounderDiligenceRoomDTO,
  type FounderDiligenceWorkstreamKey,
  type TermSheetStage,
} from "./types";

export class FounderDiligenceLoadError extends Error {
  readonly response: Response;
  constructor(response: Response) {
    super("Unable to load founder diligence.");
    this.name = "FounderDiligenceLoadError";
    this.response = response;
  }
}

function fail(message: string, status = 500): FounderDiligenceLoadError {
  return new FounderDiligenceLoadError(Response.json({ error: message }, { status }));
}
function required<T extends { data: unknown; error: unknown }>(result: T): NonNullable<T["data"]> {
  if (result.error || result.data === null) throw fail("Unable to load founder diligence.");
  return result.data as NonNullable<T["data"]>;
}
function optional<T extends { data: unknown; error: unknown }>(result: T) {
  if (result.error) throw fail("Unable to load founder diligence.");
  return result.data;
}
function batches(ids: string[], size = 100) {
  const result: string[][] = [];
  for (let index = 0; index < ids.length; index += size) result.push(ids.slice(index, index + size));
  return result;
}
function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function termStage(value: unknown): TermSheetStage {
  const stages: TermSheetStage[] = ["proposed_terms", "negotiation", "approval", "vehicle_formation", "signatures", "funding", "close"];
  return stages.includes(value as TermSheetStage) ? value as TermSheetStage : "proposed_terms";
}
function priority(value: unknown): FounderDiligencePriority {
  return value === "high" || value === "medium" ? value : "standard";
}
function status(value: unknown): FounderDiligenceRequestStatus {
  const statuses: FounderDiligenceRequestStatus[] = ["open", "needs_response", "awaiting_founder", "response_submitted", "clarification_requested", "resolved", "cancelled"];
  return statuses.includes(value as FounderDiligenceRequestStatus) ? value as FounderDiligenceRequestStatus : "open";
}
function messageType(value: unknown): FounderDiligenceRequestMessageType {
  const values: FounderDiligenceRequestMessageType[] = ["founder_response", "reviewer_clarification", "founder_clarification"];
  return values.includes(value as FounderDiligenceRequestMessageType) ? value as FounderDiligenceRequestMessageType : "founder_response";
}
function checklistStatus(value: unknown): ClosingChecklistStatus {
  return value === "complete" || value === "incomplete" || value === "under_review" ? value : "pending";
}
function workstreamTitle(key: FounderDiligenceWorkstreamKey) {
  return { market: "Market", financial: "Financial", product_tech: "Product & tech", legal_regulatory: "Legal & reg.", governance: "Governance", operations: "Operations", team: "Team", impact: "Impact", local_context: "Local context", execution_risk: "Execution risk" }[key];
}

export async function loadFounderDiligenceRoom(roomId: string): Promise<FounderDiligenceRoomDTO> {
  const auth = await requireRole("founder");
  if (auth.error) throw new FounderDiligenceLoadError(auth.error);
  const { supabase, userId } = auth;

  try {
    const founder = required(await supabase.from("founder_profiles").select("onboarding_status").eq("user_id", userId).maybeSingle());
    if (founder.onboarding_status !== "completed") throw fail("Founder onboarding is incomplete.", 403);

    const room = required(await supabase.from("diligence_rooms").select("id,room_code,status,readiness_score,deal_id").eq("id", roomId).maybeSingle()) as { id: string; room_code: string; status: string; readiness_score: number; deal_id: string };
    const deal = required(await supabase.from("deals").select("id,startup_id,spv_id,round,target_amount,currency,terms,term_sheet_stage").eq("id", room.deal_id).maybeSingle()) as { id: string; startup_id: string; spv_id: string | null; round: string | null; target_amount: number; currency: string; terms: unknown; term_sheet_stage: string | null };
    const startup = required(await supabase.from("startups").select("id,display_name,legal_name,sector,primary_founder_user_id").eq("id", deal.startup_id).maybeSingle()) as { id: string; display_name: string | null; legal_name: string | null; sector: string | null; primary_founder_user_id: string | null };
    if (startup.primary_founder_user_id !== userId) throw fail("Diligence room not found.", 404);

    const [profile, workstreamResult, requestResult, documentsResult, checklistResult, spvResult, milestoneResult] = await Promise.all([
      supabase.from("profiles").select("id,display_name,photo_path").eq("id", userId).maybeSingle(),
      supabase.from("diligence_workstreams").select("id,title,sort_order").eq("room_id", roomId).order("sort_order", { ascending: true }),
      supabase.from("diligence_evidence_requests").select("id,room_id,workstream_id,requested_by_user_id,requested_from_user_id,title,request_text,priority,why_it_matters,status,due_at,created_at").eq("room_id", roomId).eq("requested_from_user_id", userId).order("created_at", { ascending: true }),
      supabase.from("startup_documents").select("id,title,document_type,storage_path,mime_type,size_bytes,created_at").eq("startup_id", startup.id).order("created_at", { ascending: false }),
      supabase.from("deal_closing_checklist_items").select("id,item_key,title,owner_user_id,status,status_detail,due_at,sort_order").eq("deal_id", deal.id).order("sort_order", { ascending: true }),
      deal.spv_id ? supabase.from("spvs").select("display_name,legal_structure,jurisdiction").eq("id", deal.spv_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      supabase.rpc("kori_founder_diligence_milestone_count", { p_deal_id: deal.id }),
    ]);
    const viewerProfile = optional(profile) as { id: string; display_name: string | null; photo_path: string | null } | null;
    const workstreams = (required(workstreamResult) as Array<{ id: string; title: string; sort_order: number }>);
    const requestRows = required(requestResult) as Array<Record<string, unknown>>;
    const requestIds = requestRows.map((item) => String(item.id));

    const [messagePages, evidencePages] = await Promise.all([
      Promise.all(batches(requestIds).map((ids) => supabase.from("diligence_request_messages").select("id,request_id,author_user_id,message_type,body,created_at").in("request_id", ids).order("created_at", { ascending: true }))),
      Promise.all(batches(requestIds).map((ids) => supabase.from("diligence_evidence_items").select("id,request_id,title,claim,source_type,source_uri,startup_document_id,status,updated_at").in("request_id", ids).order("updated_at", { ascending: false }))),
    ]);
    const messages = messagePages.flatMap((page) => required(page) as Array<Record<string, unknown>>);
    const evidence = evidencePages.flatMap((page) => required(page) as Array<Record<string, unknown>>);
    const actorIds = [...new Set([...requestRows.map((item) => String(item.requested_by_user_id)), ...messages.map((item) => String(item.author_user_id))].filter(Boolean))];
    const actorPages = await Promise.all(batches(actorIds).map((ids) => supabase.from("profiles").select("id,display_name,organization").in("id", ids)));
    const actors = new Map(actorPages.flatMap((page) => required(page) as Array<{ id: string; display_name: string | null; organization: string | null }>).map((item) => [item.id, item]));

    const rawTerms = asObject(deal.terms);
    const term = (...keys: string[]) => keys.map((key) => rawTerms[key]).find((value) => value !== undefined && value !== null) ?? null;
    const spv = optional(spvResult) as { display_name?: string | null; legal_structure?: string | null; jurisdiction?: string | null } | null;
    const requestDtos = requestRows.map((row) => {
      const key = normalizeFounderWorkstreamKey(String(row.workstream_id)) ?? normalizeFounderWorkstreamKey(String(row.title ?? "").toLowerCase().replaceAll(" ", "_")) ?? "execution_risk";
      const relatedWorkstream = workstreams.find((item) => item.id === row.workstream_id);
      const requestStatus = status(row.status);
      return {
        id: String(row.id), workstreamId: String(row.workstream_id), workstreamKey: key, workstreamTitle: relatedWorkstream?.title ?? workstreamTitle(key), priority: priority(row.priority), title: String(row.title ?? ""), question: String(row.request_text ?? ""), whyItMatters: text(row.why_it_matters), status: requestStatus, dueAt: text(row.due_at),
        requestedBy: { userId: String(row.requested_by_user_id), displayName: actors.get(String(row.requested_by_user_id))?.display_name ?? "Reviewer", organization: actors.get(String(row.requested_by_user_id))?.organization ?? null },
        assignedFounderName: viewerProfile?.display_name ?? "Founder",
        messages: messages.filter((item) => item.request_id === row.id).map((item) => ({ id: String(item.id), messageType: messageType(item.message_type), authorUserId: String(item.author_user_id), authorName: actors.get(String(item.author_user_id))?.display_name ?? "Reviewer", body: String(item.body ?? ""), createdAt: String(item.created_at ?? "") })),
        evidence: evidence.filter((item) => item.request_id === row.id).map((item) => ({ id: String(item.id), title: String(item.title ?? ""), claim: text(item.claim), sourceType: text(item.source_type), sourceUri: text(item.source_uri), startupDocumentId: text(item.startup_document_id), status: String(item.status ?? ""), updatedAt: String(item.updated_at ?? "") })),
      };
    }).sort((a, b) => {
      const rank = (value: FounderDiligenceRequestStatus) => ({ clarification_requested: 0, open: 1, needs_response: 1, awaiting_founder: 1, response_submitted: 2, resolved: 3, cancelled: 4 }[value]);
      const priorityRank = (value: FounderDiligencePriority) => ({ high: 0, medium: 1, standard: 2 }[value]);
      return rank(a.status) - rank(b.status) || priorityRank(a.priority) - priorityRank(b.priority) || String(a.dueAt ?? "9999").localeCompare(String(b.dueAt ?? "9999"));
    });

    const grouped = new Map<FounderDiligenceWorkstreamKey, typeof requestDtos>();
    for (const request of requestDtos) grouped.set(request.workstreamKey, [...(grouped.get(request.workstreamKey) ?? []), request]);
    const founderWorkstreams = FOUNDER_WORKSTREAM_ORDER.map((key) => {
      const items = grouped.get(key) ?? [];
      return { id: workstreams.find((item) => normalizeFounderWorkstreamKey(item.title.toLowerCase().replaceAll(" ", "_")) === key)?.id ?? key, key, title: workstreamTitle(key), resolved: items.filter((item) => item.status === "resolved").length, total: items.filter((item) => item.status !== "cancelled").length, awaitingFounder: items.filter((item) => ["open", "needs_response", "awaiting_founder"].includes(item.status)).length, clarificationRequested: items.filter((item) => item.status === "clarification_requested").length, awaitingReview: items.filter((item) => item.status === "response_submitted").length };
    });

    const milestoneCount = typeof milestoneResult.data === "number" ? milestoneResult.data : 0;
    return {
      room: { id: room.id, code: room.room_code, status: room.status, readinessScore: room.readiness_score },
      viewer: { userId, displayName: viewerProfile?.display_name ?? "", initials: initials(viewerProfile?.display_name ?? ""), photoUrl: viewerProfile?.photo_path ? supabase.storage.from("profile-photos").getPublicUrl(viewerProfile.photo_path).data.publicUrl : null },
      startup: { id: startup.id, displayName: startup.display_name ?? startup.legal_name ?? "", legalName: startup.legal_name ?? "", sector: startup.sector },
      deal: { id: deal.id, round: deal.round, targetAmount: deal.target_amount, currency: deal.currency, termSheetStage: termStage(deal.term_sheet_stage) },
      termSheet: { investment: { amount: deal.target_amount, currency: deal.currency }, instrument: text(term("instrument", "instrumentType", "security")), preMoneyValuation: term("preMoneyValuation", "pre_money_valuation", "valuation") as string | number | null, investorRights: text(term("investorRights", "investor_rights", "rights")), governance: text(term("governance", "governanceRights", "governance_rights")), milestoneCount, vehicle: text(spv?.display_name) ?? text(spv?.legal_structure), jurisdiction: text(spv?.jurisdiction), rawTerms },
      workstreams: founderWorkstreams,
      state: deriveFounderDiligenceState(requestDtos),
      requests: requestDtos,
      startupDocuments: (required(documentsResult) as Array<Record<string, unknown>>).map((item) => ({ id: String(item.id), title: String(item.title ?? ""), documentType: String(item.document_type ?? ""), storagePath: String(item.storage_path ?? ""), mimeType: text(item.mime_type), sizeBytes: typeof item.size_bytes === "number" ? item.size_bytes : null, createdAt: String(item.created_at ?? "") })),
      closingChecklist: (required(checklistResult) as Array<Record<string, unknown>>).map((item) => ({ id: String(item.id), itemKey: String(item.item_key ?? ""), title: String(item.title ?? ""), ownerName: actors.get(String(item.owner_user_id))?.display_name ?? viewerProfile?.display_name ?? "Founder", status: checklistStatus(item.status), statusDetail: text(item.status_detail), dueAt: text(item.due_at) })),
    };
  } catch (error) {
    if (error instanceof FounderDiligenceLoadError) throw error;
    throw fail("Unable to load founder diligence.");
  }
}
