import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type DiligenceViewerKind = "investor" | "founder";
export type DiligenceViewPreference = "investor" | "founder" | null;

export type DiligenceRoomAccess = {
  userId: string;
  roomId: string;
  canViewAsInvestor: boolean;
  canViewAsFounder: boolean;
  selectedView: DiligenceViewerKind;
};

export class DiligenceAccessError extends Error {
  readonly response: Response;
  constructor(response: Response) {
    super("Unable to verify diligence access.");
    this.name = "DiligenceAccessError";
    this.response = response;
  }
}

export function selectDiligenceViewerKind(
  canViewAsInvestor: boolean,
  canViewAsFounder: boolean,
  preference: DiligenceViewPreference = null,
): DiligenceViewerKind | null {
  if (preference === "founder" && canViewAsFounder) return "founder";
  if (preference === "investor" && canViewAsInvestor) return "investor";
  if (canViewAsFounder && !canViewAsInvestor) return "founder";
  if (canViewAsInvestor) return "investor";
  if (canViewAsFounder) return "founder";
  return null;
}

function denied(message: string, status: number) {
  return new DiligenceAccessError(Response.json({ error: message }, { status }));
}

export async function resolveDiligenceRoomAccess(
  roomId: string,
  preference: DiligenceViewPreference = null,
): Promise<DiligenceRoomAccess> {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  if (auth.error || !auth.data.user) throw denied("Authentication required.", 401);

  const userId = auth.data.user.id;
  const profile = await supabase.from("profiles").select("roles").eq("id", userId).maybeSingle();
  if (profile.error || !profile.data) throw denied("Diligence room not found.", 404);
  const roles = Array.isArray(profile.data.roles) ? (profile.data.roles as string[]) : [];

  let canViewAsInvestor = false;
  if (roles.includes("investor")) {
    const [investorProfile, membership] = await Promise.all([
      supabase.from("investor_profiles").select("user_id").eq("user_id", userId).maybeSingle(),
      supabase.from("diligence_room_members").select("room_id").eq("room_id", roomId).eq("user_id", userId).eq("status", "active").maybeSingle(),
    ]);
    canViewAsInvestor = !investorProfile.error && Boolean(investorProfile.data) && !membership.error && Boolean(membership.data);
  }

  let canViewAsFounder = false;
  if (roles.includes("founder")) {
    const founderProfile = await supabase.from("founder_profiles").select("onboarding_status").eq("user_id", userId).maybeSingle();
    const room = await supabase.from("diligence_rooms").select("deal_id").eq("id", roomId).maybeSingle();
    if (!founderProfile.error && founderProfile.data?.onboarding_status === "completed" && !room.error && room.data) {
      const deal = await supabase.from("deals").select("startup_id").eq("id", room.data.deal_id).maybeSingle();
      if (!deal.error && deal.data) {
        const startup = await supabase.from("startups").select("id").eq("id", deal.data.startup_id).eq("primary_founder_user_id", userId).maybeSingle();
        canViewAsFounder = !startup.error && Boolean(startup.data);
      }
    }
  }

  const selectedView = selectDiligenceViewerKind(canViewAsInvestor, canViewAsFounder, preference);
  if (!selectedView) throw denied("Diligence room not found.", 404);

  return { userId, roomId, canViewAsInvestor, canViewAsFounder, selectedView };
}
