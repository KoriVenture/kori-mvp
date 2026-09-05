import { NextResponse } from "next/server";
import { requireRole } from "@/lib/onboarding/http";

export async function requireDiligenceRoomMember(roomId: string) {
  const access = await requireRole("investor");

  if (access.error) {
    return access;
  }

  const { supabase, user, userId } = access;
  const membershipResult = await supabase
    .from("diligence_room_members")
    .select("*")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipResult.error) {
    return {
      error: NextResponse.json(
        { error: "Unable to verify diligence room access." },
        { status: 500 },
      ),
    } as const;
  }

  if (!membershipResult.data) {
    return {
      error: NextResponse.json(
        { error: "Diligence room access denied." },
        { status: 403 },
      ),
    } as const;
  }

  const roomResult = await supabase
    .from("diligence_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  if (roomResult.error) {
    return {
      error: NextResponse.json(
        { error: "Unable to read diligence room." },
        { status: 500 },
      ),
    } as const;
  }

  if (!roomResult.data) {
    return {
      error: NextResponse.json(
        { error: "Diligence room not found." },
        { status: 404 },
      ),
    } as const;
  }

  return {
    error: null,
    supabase,
    user,
    userId,
    membership: membershipResult.data,
    room: roomResult.data,
  } as const;
}

export async function requireDiligenceLeadReviewer(roomId: string) {
  const access = await requireDiligenceRoomMember(roomId);

  if (access.error) {
    return access;
  }

  if (access.membership.role !== "lead_reviewer") {
    return {
      error: NextResponse.json(
        { error: "Lead reviewer access required." },
        { status: 403 },
      ),
    } as const;
  }

  return access;
}
