import { loadFounderDiligenceRoom, FounderDiligenceLoadError } from "@/lib/diligence/founder/queries";
import { roomIdSchema } from "@/lib/validation/diligence";

type Context = { params: Promise<{ roomId: string }> };
export async function GET(_request: Request, { params }: Context) {
  const parsed = roomIdSchema.safeParse((await params).roomId);
  if (!parsed.success) return Response.json({ error: "Invalid diligence room." }, { status: 400 });
  try { return Response.json(await loadFounderDiligenceRoom(parsed.data)); }
  catch (error) { if (error instanceof FounderDiligenceLoadError) return error.response; return Response.json({ error: "Unable to load founder diligence." }, { status: 500 }); }
}
