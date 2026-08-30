import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERTISE_AREAS,
  INSTRUMENTS,
  TICKET_SIZES,
} from "./investor-onboarding.constants.ts";

test("Investor option sets expose the approved ticket and expertise choices", () => {
  assert.deepEqual(TICKET_SIZES, [
    "Under $5K",
    "$5K–$25K",
    "$25K–$100K",
    "$100K–$500K",
    "$500K+",
  ]);
  assert.ok(EXPERTISE_AREAS.includes("Caribbean markets"));
  assert.ok(INSTRUMENTS.includes("SAFE / Convertible"));
});
