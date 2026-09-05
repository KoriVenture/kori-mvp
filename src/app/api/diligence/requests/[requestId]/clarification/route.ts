import { requireDiligenceRoomMember } from "@/lib/diligence/auth";
import { discussionPayloadSchema, messageIdSchema } from "@/lib/validation/diligence";

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const id = (await params).requestId; if (!messageIdSchema.safeParse(id).success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const body = discussionPayloadSchema.safeParse(await request.json().catch(() => null)); if (!body.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { createClient } = await import("@/lib/supabase/server"); const supabase = await createClient(); const auth = await supabase.auth.getUser();
  if (auth.error || !auth.data.user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const requestRow = await supabase.from("diligence_evidence_requests").select("id,room_id,status").eq("id", id).maybeSingle();
  if (requestRow.error || !requestRow.data) return Response.json({ error: "Diligence request not found." }, { status: 404 });
  const access = await requireDiligenceRoomMember(requestRow.data.room_id); if (access.error) return access.error;
  if (requestRow.data.status !== "response_submitted") return Response.json({ error: "Only submitted responses can be clarified." }, { status: 409 });
  const saved = await supabase.from("diligence_request_messages").insert({ request_id: id, author_user_id: auth.data.user.id, message_type: "reviewer_clarification", body: body.data.body });
  if (saved.error) return Response.json({ error: "Unable to save clarification." }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
