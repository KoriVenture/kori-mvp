import { requireRole } from "@/lib/onboarding/http";
import { founderDiligenceResponseSchema } from "@/lib/validation/diligence-founder";
import { messageIdSchema } from "@/lib/validation/diligence";

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const auth = await requireRole("founder"); if (auth.error) return auth.error;
  const id = (await params).requestId; if (!messageIdSchema.safeParse(id).success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const parsed = founderDiligenceResponseSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const item = await auth.supabase.from("diligence_evidence_requests").select("id,requested_from_user_id,status").eq("id", id).maybeSingle();
  if (item.error) return Response.json({ error: "Unable to read diligence request." }, { status: 500 });
  if (!item.data || item.data.requested_from_user_id !== auth.userId) return Response.json({ error: "Diligence request not found." }, { status: 404 });
  if (item.data.status === "resolved" || item.data.status === "cancelled") return Response.json({ error: "This diligence request is closed." }, { status: 409 });
  const messageType = item.data.status === "clarification_requested" ? "founder_clarification" : "founder_response";
  const saved = await auth.supabase.from("diligence_request_messages").insert({ request_id: id, author_user_id: auth.userId, message_type: messageType, body: parsed.data.body });
  if (saved.error) return Response.json({ error: "Unable to save founder response." }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
