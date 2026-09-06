import { requireDiligenceRoomMember } from "./auth.ts";
import { mapDiligenceRoom } from "./mappers.ts";
import type {
  DealRow, DiscussionRow, EvidenceRow, MemberRow, ProfileRow, RecommendationRow, RequestMessageRow,
  RequestRow, RiskRow, RoomRow, StartupRow, WorkstreamRow,
} from "./mappers.ts";
import type { DiligenceRoomDTO } from "./types.ts";

/** API handlers can return response; Server Components can branch on status. */
export class DiligenceRoomLoadError extends Error {
  readonly response: Response;
  readonly status: number;

  constructor(response: Response) {
    super("Unable to load diligence room.");
    this.name = "DiligenceRoomLoadError";
    this.response = response;
    this.status = response.status;
  }
}

type QueryResult<T> = { data: T | null; error: unknown };
type StoredProfileRow = Omit<ProfileRow, "photo_url"> & { photo_path: string | null };
type SpvRow = { id: string; community_id: string | null };
type LeadMembershipRow = { user_id: string };

function loadFailure(): DiligenceRoomLoadError {
  return new DiligenceRoomLoadError(Response.json(
    { error: "Unable to load diligence room." }, { status: 500 },
  ));
}

function required<T>(result: QueryResult<T>): T {
  if (result.error || result.data === null) throw loadFailure();
  return result.data;
}

function optional<T>(result: QueryResult<T>): T | null {
  if (result.error) throw loadFailure();
  return result.data;
}

function isMissingCity(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { code, message } = error as { code?: string; message?: string };
  return (code === "42703" || code === "PGRST204") && /\bcity\b/i.test(message ?? "");
}

export async function loadDiligenceRoom(roomId: string): Promise<DiligenceRoomDTO> {
  try {
    const access = await requireDiligenceRoomMember(roomId);
    if (access.error) throw new DiligenceRoomLoadError(access.error);
    const { supabase, userId } = access;
    // Authorization already fetched and checked this exact room.
    const room = access.room as RoomRow;

    // Recreate the builder per page; never return silently truncated aggregates.
    async function allRows<T>(table: string, columns: string, orderBy: string) {
      const rows: T[] = [];
      for (let start = 0; ; start += 1000) {
        const result = await supabase.from(table).select(columns).eq("room_id", roomId)
          .order(orderBy, { ascending: true }).order("id", { ascending: true })
          .range(start, start + 999);
        const page = required(result as QueryResult<T[]>);
        rows.push(...page);
        if (page.length < 1000) return rows;
      }
    }

    const [dealResult, workstreams, requests, evidence, risks, discussion, members, recommendationResult] = await Promise.all([
      supabase.from("deals").select("id,startup_id,spv_id,round,target_amount,currency")
        .eq("id", room.deal_id).maybeSingle(),
      allRows<WorkstreamRow>("diligence_workstreams", "id,title,owner_user_id", "sort_order"),
      allRows<RequestRow>("diligence_evidence_requests", "id,room_id,workstream_id,requested_from_user_id,title,request_text,priority,why_it_matters,status,due_at,created_at", "created_at"),
      allRows<EvidenceRow>("diligence_evidence_items", "id,workstream_id,title,status,owner_user_id,updated_at,source_type,source_uri,claim", "updated_at"),
      allRows<RiskRow>("diligence_risks", "id,workstream_id,risk_code,severity,category,title,description,status,owner_user_id,updated_at", "updated_at"),
      allRows<DiscussionRow>("diligence_discussion_messages", "id,parent_message_id,user_id,body,created_at", "created_at"),
      allRows<MemberRow>("diligence_room_members", "user_id,status,last_active_at", "created_at"),
      supabase.from("diligence_recommendations")
        .select("id,decision,rationale,conditions,submitted_at")
        .eq("room_id", roomId).eq("reviewer_user_id", userId)
        .order("submitted_at", { ascending: false }).order("id", { ascending: false })
        .limit(1).maybeSingle(),
    ]);
    const deal = required(dealResult as QueryResult<DealRow>);
    const latestRecommendation = optional(recommendationResult as QueryResult<RecommendationRow>);
    const requestIds = requests.map((request) => request.id).filter((id): id is string => Boolean(id));
    const requestMessagePages = [] as RequestMessageRow[][];
    for (const ids of Array.from({ length: Math.ceil(requestIds.length / 100) }, (_, index) => requestIds.slice(index * 100, index * 100 + 100))) {
      if (!ids.length) continue;
      const result = await supabase.from("diligence_request_messages").select("id,request_id,author_user_id,message_type,body,created_at").in("request_id", ids).order("created_at", { ascending: true });
      requestMessagePages.push(required(result as QueryResult<RequestMessageRow[]>));
    }
    const requestMessages = requestMessagePages.flat();

    async function loadStartup() {
      const baseColumns = "id,display_name,sector,country";
      const result = await supabase.from("startups").select(`${baseColumns},city`)
        .eq("id", deal.startup_id).maybeSingle();
      // The contract permits deployments without city, but no other failed query
      // may turn into an empty or fabricated aggregate.
      if (isMissingCity(result.error)) {
        return required(await supabase.from("startups").select(baseColumns)
          .eq("id", deal.startup_id).maybeSingle() as QueryResult<StartupRow>);
      }
      return required(result as QueryResult<StartupRow>);
    }

    async function loadLeadUserId(): Promise<string | null> {
      if (!deal.spv_id) return null;
      const spv = required(await supabase.from("spvs").select("id,community_id")
        .eq("id", deal.spv_id).maybeSingle() as QueryResult<SpvRow>);
      if (!spv.community_id) return null;
      // Existing contract assumption: an SPV's community has one active lead.
      const lead = optional(
        await supabase
          .from("community_memberships")
          .select("user_id")
          .eq(
            "community_id",
            spv.community_id,
          )
          .eq(
            "membership_role",
            "lead_investor",
          )
          .eq(
            "status",
            "active",
          )
          .maybeSingle() as QueryResult<LeadMembershipRow>,
      );
      return lead?.user_id ?? null;
    }

    const [startup, leadUserId] = await Promise.all([loadStartup(), loadLeadUserId()]);
    const profileIds = [...new Set([
      userId, leadUserId,
      ...workstreams.map((workstream) => workstream.owner_user_id),
      ...evidence.map((item) => item.owner_user_id),
      ...requests.map((request) => request.requested_from_user_id ?? null),
      ...requestMessages.map((message) => message.author_user_id),
      ...discussion.map((message) => message.user_id),
      ...members.map((member) => member.user_id),
    ].filter((id): id is string => Boolean(id)))];
    const batches: string[][] = [];
    for (let start = 0; start < profileIds.length; start += 100) batches.push(profileIds.slice(start, start + 100));
    const profiles = (await Promise.all(batches.map(async (ids) => {
      const result = await supabase.from("profiles").select("id,display_name,photo_path,country").in("id", ids);
      return required(result as QueryResult<StoredProfileRow[]>);
    }))).flat();
    const loadedProfileIds = new Set(profiles.map((profile) => profile.id));
    if (profileIds.some((id) => !loadedProfileIds.has(id))) throw loadFailure();

    return mapDiligenceRoom({
      room, viewerUserId: userId, viewerRole: access.membership.role,
      deal, startup, leadUserId,
      profiles: profiles.map(({ photo_path, ...profile }) => ({
        ...profile,
        photo_url: photo_path ? supabase.storage.from("profile-photos").getPublicUrl(photo_path).data.publicUrl : null,
      })),
      workstreams, requests, requestMessages, evidence, risks, discussion, members, latestRecommendation,
    });
  } catch (error) {
    if (error instanceof DiligenceRoomLoadError) throw error;
    throw loadFailure();
  }
}
