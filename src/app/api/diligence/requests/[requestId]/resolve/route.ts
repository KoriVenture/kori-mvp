import { requireDiligenceRoomMember } from "@/lib/diligence/auth";
import { messageIdSchema } from "@/lib/validation/diligence";

export async function POST(_request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const id = (await params).requestId; if (!messageIdSchema.safeParse(id).success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { createClient } = await import("@/lib/supabase/server"); const supabase = await createClient(); const auth = await supabase.auth.getUser();
  if (auth.error || !auth.data.user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const row = await supabase.from("diligence_evidence_requests").select("id,room_id,status").eq("id", id).maybeSingle();
  if (row.error || !row.data) return Response.json({ error: "Diligence request not found." }, { status: 404 });
  const access = await requireDiligenceRoomMember(row.data.room_id); if (access.error) return access.error;
  if (row.data.status !== "response_submitted") return Response.json({ error: "Only submitted responses can be resolved." }, { status: 409 });
  const updated = await supabase.from("diligence_evidence_requests").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id).eq("status", "response_submitted");
  if (updated.error) return Response.json({ error: "Unable to resolve diligence request." }, { status: 500 });
  return Response.json({ ok: true });
}
