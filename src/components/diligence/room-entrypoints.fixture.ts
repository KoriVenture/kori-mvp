// Executed only by room-entrypoints-contract.test.ts with module mocking enabled.
import assert from "node:assert/strict";
import { mock, test } from "node:test";

import type { DiligenceRoomDTO } from "../../lib/diligence/types.ts";

const roomId = "8f14e45f-ea67-4f21-9ba0-23c80b3e6a3e";
const room: DiligenceRoomDTO = {
  id: roomId,
  code: "KV-024",
  status: "active_review",
  closesAt: "2026-09-18T00:00:00.000Z",
  readinessScore: 68,
  viewer: {
    userId: "610b32ba-8f87-4d26-94fb-6fbe18bd96f9",
    displayName: "Adaeze Okafor",
    initials: "AO",
    role: "reviewer",
    photoUrl: null,
  },
  deal: {
    id: "f5279d15-ab4e-40b7-bc6e-833bf745c69d",
    startupId: "9212af34-1380-4dc3-b79c-5ccbfad12f5f",
    companyName: "Terranova Mobility",
    companyInitials: "TM",
    descriptor: "Electric logistics · Kigali, Rwanda",
    round: "Seed",
    targetAmount: 2_400_000,
    currency: "USD",
    leadName: "Baobab Capital",
  },
  workstreams: [],
  evidenceSummary: { resolved: 0, total: 0 },
  evidence: [],
  risks: [],
  signals: [],
  discussion: [],
  activity: {
    reviewerCount: 1,
    activeTodayCount: 1,
    marketCount: 1,
    avatars: [{ initials: "AO", displayName: "Adaeze Okafor" }],
  },
  latestRecommendation: null,
};

class DiligenceRoomLoadError extends Error {
  readonly response: Response;
  readonly status: number;

  constructor(response: Response) {
    super("Unable to load diligence room.");
    this.name = "DiligenceRoomLoadError";
    this.response = response;
    this.status = response.status;
  }
}

let calls: string[] = [];
let implementation: (id: string) => Promise<DiligenceRoomDTO> = async () => room;

mock.module(new URL("../../lib/diligence/queries.ts", import.meta.url), {
  namedExports: {
    DiligenceRoomLoadError,
    async loadDiligenceRoom(id: string) {
      calls.push(id);
      return implementation(id);
    },
  },
});

const routeUrl = new URL(
  "../../app/api/diligence/rooms/[roomId]/route.ts",
  import.meta.url,
);
const { GET } = await import(routeUrl.href);

function context(id: string) {
  return { params: Promise.resolve({ roomId: id }) };
}

test("rejects an invalid UUID before loading", async () => {
  calls = [];
  const response = await GET(new Request("http://localhost"), context("not-a-uuid"));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Invalid diligence room id." });
  assert.deepEqual(calls, []);
});

test("returns the loaded DTO", async () => {
  calls = [];
  implementation = async () => room;
  const response = await GET(new Request("http://localhost"), context(roomId));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), room);
  assert.deepEqual(calls, [roomId]);
});

test("preserves loader authorization responses", async () => {
  for (const status of [401, 403, 404, 500]) {
    calls = [];
    const message = status === 500
      ? "Unable to load diligence room."
      : `loader ${status}`;
    implementation = async () => {
      throw new DiligenceRoomLoadError(
        Response.json({ error: message }, { status }),
      );
    };

    const response = await GET(new Request("http://localhost"), context(roomId));
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error: message });
    assert.deepEqual(calls, [roomId]);
  }
});

test("hides unexpected failures", async () => {
  implementation = async () => {
    throw new Error("private database detail");
  };

  const response = await GET(new Request("http://localhost"), context(roomId));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Unable to load diligence room." });
});
