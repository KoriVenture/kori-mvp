import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import {
  fileURLToPath,
} from "node:url";
import test from "node:test";

const routeSource = readFileSync(
  fileURLToPath(
    new URL(
      "./route.ts",
      import.meta.url,
    ),
  ),
  "utf8",
);

test(
  "final review does not require eligibility payload to be resent",
  () => {
    assert.match(
      routeSource,
      /if\s*\(\s*x\.eligibility\s*&&\s*x\.screen\s*>=\s*5\s*\)/,
    );

    assert.doesNotMatch(
      routeSource,
      /if\s*\(\s*x\.screen\s*>=\s*5\s*\)\s*\{/,
    );
  },
);

test(
  "database errors retain original PostgREST diagnostics in development",
  () => {
    assert.match(
      routeSource,
      /\[Kori onboarding\]/,
    );

    assert.match(
      routeSource,
      /databaseError/,
    );

    assert.match(
      routeSource,
      /error\.message/,
    );
  },
);
