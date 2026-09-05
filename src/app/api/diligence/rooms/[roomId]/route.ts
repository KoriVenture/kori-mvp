import { DiligenceRoomLoadError, loadDiligenceRoom } from "../../../../../lib/diligence/queries.ts";
import { roomIdSchema } from "../../../../../lib/validation/diligence.ts";

type RoomRouteContext = {
  params: Promise<{ roomId: string }>;
};

export async function GET(_request: Request, { params }: RoomRouteContext) {
  const parsed = roomIdSchema.safeParse((await params).roomId);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid diligence room id." },
      { status: 400 },
    );
  }

  try {
    const room = await loadDiligenceRoom(parsed.data);
    return Response.json(room);
  } catch (error) {
    if (error instanceof DiligenceRoomLoadError) {
      return error.response;
    }

    return Response.json(
      { error: "Unable to load diligence room." },
      { status: 500 },
    );
  }
}
