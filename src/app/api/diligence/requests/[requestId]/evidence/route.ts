import { requireRole } from "@/lib/onboarding/http";
import { founderDiligenceEvidenceSchema } from "@/lib/validation/diligence-founder";
import { messageIdSchema } from "@/lib/validation/diligence";

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const auth = await requireRole("founder"); if (auth.error) return auth.error;
  const id = (await params).requestId; if (!messageIdSchema.safeParse(id).success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const parsed = founderDiligenceEvidenceSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const item = await auth.supabase.from("diligence_evidence_requests").select("id,room_id,workstream_id,requested_from_user_id,status").eq("id", id).maybeSingle();
  if (item.error) return Response.json({ error: "Unable to read diligence request." }, { status: 500 });
  if (!item.data || item.data.requested_from_user_id !== auth.userId) return Response.json({ error: "Diligence request not found." }, { status: 404 });
  if (item.data.status === "resolved" || item.data.status === "cancelled") return Response.json({ error: "This diligence request is closed." }, { status: 409 });
  const document = await auth.supabase.from("startup_documents").select("id,startup_id,title,storage_path").eq("id", parsed.data.startupDocumentId).eq("uploaded_by_user_id", auth.userId).maybeSingle();
  if (document.error) return Response.json({ error: "Unable to verify document." }, { status: 500 });
  if (!document.data) return Response.json({ error: "Startup document not found." }, { status: 404 });
  const deal = await auth.supabase.from("diligence_rooms").select("deal_id").eq("id", item.data.room_id).maybeSingle();
  if (deal.error || !deal.data) return Response.json({ error: "Diligence room not found." }, { status: 404 });
  const startup = await auth.supabase.from("deals").select("startup_id").eq("id", deal.data.deal_id).eq("startup_id", document.data.startup_id).maybeSingle();
  if (startup.error || !startup.data) return Response.json({ error: "Document is not attached to this diligence room." }, { status: 403 });
  const duplicate = await auth.supabase.from("diligence_evidence_items").select("id").eq("request_id", id).eq("startup_document_id", document.data.id).maybeSingle();
  if (duplicate.error) return Response.json({ error: "Unable to verify evidence." }, { status: 500 });
  if (duplicate.data) return Response.json({ error: "Evidence is already attached." }, { status: 409 });
  const saved = await auth.supabase.from("diligence_evidence_items").insert({ room_id: item.data.room_id, workstream_id: item.data.workstream_id, request_id: id, review_id: null, title: document.data.title, source_type: "startup_document", source_uri: document.data.storage_path, claim: parsed.data.claim ?? null, owner_user_id: auth.userId, status: "needs_response", startup_document_id: document.data.id }).select("id").single();
  if (saved.error) return Response.json({ error: "Unable to attach evidence." }, { status: 500 });
  return Response.json({ id: saved.data.id }, { status: 201 });
}
