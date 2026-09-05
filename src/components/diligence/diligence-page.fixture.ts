// Executed only by room-entrypoints-contract.test.ts through the TSX test loader.
import assert from "node:assert/strict";
import { mock, test } from "node:test";

import type { ReactElement } from "react";

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

const calls: string[] = [];

mock.module(new URL("../../lib/diligence/queries.ts", import.meta.url), {
  namedExports: {
    async loadDiligenceRoom(id: string) {
      calls.push(id);
      return room;
    },
  },
});

const pageUrl = new URL(
  "../../app/dashboard/diligence/[roomId]/page.tsx",
  import.meta.url,
);
const pageModule = await import(pageUrl.href);

test("actual metadata and page exports share one room load and render the DTO prop", async () => {
  const metadata = await pageModule.generateMetadata({
    params: Promise.resolve({ roomId }),
  });
  const rendered = await pageModule.default({
    params: Promise.resolve({ roomId }),
  }) as ReactElement<{ initialRoom: DiligenceRoomDTO }>;

  assert.deepEqual(metadata, {
    title: "Diligence · Terranova Mobility · Kori",
  });
  assert.equal(typeof rendered.type, "function");
  assert.equal((rendered.type as { name?: string }).name, "DueDiligenceRoom");
  assert.deepEqual(rendered.props, { initialRoom: room });
  assert.deepEqual(calls, [roomId]);
});
