// Executed only by queries.test.ts; these records never enter production imports.
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type RecordRow = Record<string, unknown>;
const records: Record<string, RecordRow[]> = {
  deals: [{ id: "deal", startup_id: "startup", spv_id: "spv", round: "Seed", target_amount: 250000, currency: "USD" }],
  startups: [{ id: "startup", display_name: "Real Company", sector: "Energy", country: "Ghana" }],
  spvs: [{ id: "spv", community_id: "community" }],
  community_memberships: [{ id: "lead-membership", community_id: "community", role: "lead", status: "active", user_id: "lead" }],
  profiles: [
    { id: "viewer", display_name: "Viewer Person", country: "Ghana", photo_path: "viewer/avatar.jpg" },
    { id: "lead", display_name: "Lead Person", country: "Canada", photo_path: null },
  ],
  diligence_workstreams: [{ id: "stream", room_id: "room", title: "Legal", owner_user_id: "lead", sort_order: 0 }],
  diligence_evidence_requests: [{ id: "request", room_id: "room", workstream_id: "stream", status: "resolved" }],
  diligence_evidence_items: [{ id: "evidence", room_id: "room", workstream_id: "stream", title: "Executed contract", status: "verified", owner_user_id: "lead", updated_at: "2026-09-01T00:00:00Z", claim: null, source_type: null, source_uri: null }],
  diligence_risks: [],
  diligence_discussion_messages: [{ id: "message", room_id: "room", user_id: "lead", parent_message_id: null, body: "Please review the contract", created_at: "2026-09-01T00:00:00Z" }],
  diligence_room_members: [{ id: "member", room_id: "room", user_id: "viewer", status: "active", last_active_at: null, created_at: "2026-09-01T00:00:00Z" }],
  diligence_recommendations: [
    { id: "other-user", room_id: "room", reviewer_user_id: "lead", decision: "decline", rationale: "Other reviewer", conditions: null, submitted_at: "2026-09-06T00:00:00Z" },
    { id: "old", room_id: "room", reviewer_user_id: "viewer", decision: "pause_diligence", rationale: "Earlier", conditions: null, submitted_at: "2026-09-01T00:00:00Z" },
    { id: "latest", room_id: "room", reviewer_user_id: "viewer", decision: "proceed", rationale: "Evidence reviewed", conditions: null, submitted_at: "2026-09-05T00:00:00Z" },
  ],
};

let denied: Response | null = null;
let failTable: string | null = null;
let missingCity = false;
const reads: string[] = [];

class Query {
  table: string;
  columns = "";
  filters: Array<(row: RecordRow) => boolean> = [];
  orders: Array<{ column: string; ascending: boolean }> = [];
  start = 0;
  end = Infinity;
  one = false;
  constructor(table: string) { this.table = table; }
  select(columns: string) { this.columns = columns; return this; }
  eq(column: string, value: unknown) { this.filters.push((row) => row[column] === value); return this; }
  in(column: string, values: unknown[]) { this.filters.push((row) => values.includes(row[column])); return this; }
  order(column: string, options: { ascending: boolean }) { this.orders.push({ column, ascending: options.ascending }); return this; }
  limit(count: number) { this.end = count - 1; return this; }
  range(start: number, end: number) { this.start = start; this.end = end; return this; }
  maybeSingle() { this.one = true; return this; }
  then(resolve: (result: { data: unknown; error: unknown }) => unknown) {
    reads.push(this.table);
    if (this.table === failTable) return Promise.resolve(resolve({ data: null, error: { code: "42501", message: "private database detail" } }));
    if (this.table === "startups" && missingCity && this.columns.split(",").includes("city")) {
      return Promise.resolve(resolve({ data: null, error: { code: "42703", message: "column startups.city does not exist" } }));
    }
    const rows = (records[this.table] ?? []).filter((row) => this.filters.every((filter) => filter(row))).sort((a, b) => {
      for (const { column, ascending } of this.orders) {
        const comparison = String(a[column]).localeCompare(String(b[column]));
        if (comparison) return ascending ? comparison : -comparison;
      }
      return 0;
    }).slice(this.start, this.end + 1);
    return Promise.resolve(resolve({ data: this.one ? rows[0] ?? null : rows, error: null }));
  }
}

mock.module(new URL("./auth.ts", import.meta.url), { namedExports: {
  async requireDiligenceRoomMember(roomId: string) {
    assert.equal(roomId, "room");
    return denied ? { error: denied } : {
      error: null, userId: "viewer", membership: { role: "reviewer" },
      room: { id: "room", deal_id: "deal", room_code: "DD-REAL", status: "active_review", closes_at: null, readiness_score: 42 },
      supabase: {
        from(table: string) { return new Query(table); },
        storage: { from(bucket: string) {
          assert.equal(bucket, "profile-photos");
          return { getPublicUrl(path: string) { return { data: { publicUrl: `https://storage.example/${path}` } }; } };
        } },
      },
    };
  },
} });

const { loadDiligenceRoom, DiligenceRoomLoadError } = await import("./queries.ts");

test("authorization statuses and original response bodies survive without aggregate reads", async () => {
  for (const status of [401, 403, 404, 500]) {
    reads.length = 0;
    denied = Response.json({ error: "Authorization response" }, { status });
    await assert.rejects(loadDiligenceRoom("room"), (error: unknown) => {
      assert.ok(error instanceof DiligenceRoomLoadError);
      assert.equal(error.status, status);
      assert.equal(error.response, denied);
      assert.equal(reads.length, 0);
      return true;
    });
  }
  denied = null;
});

test("aggregate returns real data, batched names, public photo and latest own recommendation without city", async () => {
  reads.length = 0;
  missingCity = true;
  const dto = await loadDiligenceRoom("room");
  assert.equal(dto.code, "DD-REAL");
  assert.equal(dto.readinessScore, 42);
  assert.equal(dto.deal.descriptor, "Energy · Ghana");
  assert.equal(dto.deal.leadName, "Lead Person");
  assert.equal(dto.viewer.photoUrl, "https://storage.example/viewer/avatar.jpg");
  assert.equal(dto.workstreams[0].progress, 100);
  assert.equal(dto.evidence[0].ownerName, "Lead Person");
  assert.equal(dto.discussion[0].authorName, "Lead Person");
  assert.deepEqual(dto.latestRecommendation, { id: "latest", decision: "Proceed", rationale: "Evidence reviewed", conditions: null, submittedAt: "2026-09-05T00:00:00Z" });
  assert.equal(reads.filter((table) => table === "profiles").length, 1);
  missingCity = false;
});

test("every required query error fails safely without database detail", async () => {
  for (const table of Object.keys(records)) {
    failTable = table;
    try { await loadDiligenceRoom("room"); assert.fail("expected query failure"); }
    catch (error) {
      assert.ok(error instanceof DiligenceRoomLoadError);
      assert.equal(error.status, 500);
      assert.deepEqual(await error.response.json(), { error: "Unable to load diligence room." });
    }
  }
  failTable = null;
});

test("missing required records fail while absent optional SPV and recommendation stay null", async () => {
  for (const table of ["deals", "startups", "spvs", "profiles"]) {
    const original = records[table];
    try {
      records[table] = [];
      await assert.rejects(loadDiligenceRoom("room"), (error: unknown) =>
        error instanceof DiligenceRoomLoadError && error.status === 500);
    } finally { records[table] = original; }
  }
  const originalDeal = records.deals;
  const originalRecommendations = records.diligence_recommendations;
  try {
    records.deals = [{ ...originalDeal[0], spv_id: null }];
    records.diligence_recommendations = [];
    const dto = await loadDiligenceRoom("room");
    assert.equal(dto.deal.leadName, null);
    assert.equal(dto.latestRecommendation, null);
  } finally {
    records.deals = originalDeal;
    records.diligence_recommendations = originalRecommendations;
  }
});

test("every referenced non-null profile must be visible to the aggregate", async () => {
  const cases = [
    { table: "community_memberships", column: "user_id", missingId: "missing-lead" },
    { table: "diligence_workstreams", column: "owner_user_id", missingId: "missing-workstream-owner" },
    { table: "diligence_evidence_items", column: "owner_user_id", missingId: "missing-evidence-owner" },
    { table: "diligence_discussion_messages", column: "user_id", missingId: "missing-discussion-author" },
    { table: "diligence_room_members", column: "user_id", missingId: "missing-member" },
  ];

  for (const { table, column, missingId } of cases) {
    const original = records[table];
    try {
      records[table] = original.map((row, index) =>
        index === 0 ? { ...row, [column]: missingId } : row);
      try {
        await loadDiligenceRoom("room");
        assert.fail(`expected missing ${missingId} profile to fail closed`);
      } catch (error) {
        assert.ok(error instanceof DiligenceRoomLoadError);
        assert.equal(error.status, 500);
        assert.deepEqual(await error.response.json(), { error: "Unable to load diligence room." });
      }
    } finally {
      records[table] = original;
    }
  }
});

test("aggregate loads request pages beyond 1000 and excludes other rooms", async () => {
  const original = records.diligence_evidence_requests;
  try {
    records.diligence_evidence_requests = [
      ...Array.from({ length: 1000 }, (_, index) => ({ id: `r${index}`, room_id: "room", workstream_id: "stream", status: "resolved" })),
      { id: "unresolved", room_id: "room", workstream_id: "stream", status: "open" },
      { id: "foreign", room_id: "another-room", workstream_id: "stream", status: "resolved" },
    ];
    const dto = await loadDiligenceRoom("room");
    assert.deepEqual(dto.evidenceSummary, { resolved: 1000, total: 1001 });
    assert.ok(dto.workstreams[0].progress < 100);
  } finally { records.diligence_evidence_requests = original; }
});
