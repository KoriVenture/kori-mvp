import assert from "node:assert/strict";
import test from "node:test";

import {
  EVIDENCE_LIMITS,
  canonicalizeEvidenceManifest,
  prepareEvidenceManifest,
  sha256Hex,
  verifyEvidenceManifest,
  type EvidenceManifest,
} from "./evidence.ts";

const manifest: EvidenceManifest = {
  schemaVersion: 1,
  dealId: "kigali-transport",
  contractId: "CC3XSKZRZU773NVC7XXO2FVKN3GGPD63OX3BBWAOQCFJYKMUTNONHHGL",
  milestone: "Signed off-take agreement",
  submitter: "GDTMTVD7IMBV5MVYDA42KM7R4DZXOPNKH6Y7RUKJN3DXNSOBUS6CKEUQ",
  statement: "The signed agreement and revenue proof are attached.",
  createdAt: "2026-09-05T18:00:00.000Z",
  files: [
    {
      name: "agreement.pdf",
      mimeType: "application/pdf",
      sizeBytes: 42,
      sha256: "00".repeat(32),
    },
  ],
};

test("evidence canonicalization is stable and sorts object keys", () => {
  const canonical = canonicalizeEvidenceManifest(manifest);
  assert.equal(canonical.startsWith('{"contractId"'), true);
  assert.equal(canonical.includes("\n"), false);
  assert.equal(canonical, canonicalizeEvidenceManifest(JSON.parse(canonical)));
});

test("evidence hashing has a known SHA-256 result", async () => {
  assert.equal(
    await sha256Hex("kori"),
    "b922c63c8cbd332c7a96d9761d49c0b13901825fecee7d78c0a46e646e96e8fb",
  );
});

test("generated evidence uses a stable file order", async () => {
  const shared = {
    dealId: manifest.dealId,
    contractId: manifest.contractId,
    milestone: manifest.milestone,
    submitter: manifest.submitter,
    statement: manifest.statement,
    createdAt: manifest.createdAt,
  };
  const alpha = new File(["alpha"], "a.txt", { type: "text/plain" });
  const zulu = new File(["zulu"], "z.txt", { type: "text/plain" });

  const first = await prepareEvidenceManifest({
    ...shared,
    files: [zulu, alpha],
  });
  const second = await prepareEvidenceManifest({
    ...shared,
    files: [alpha, zulu],
  });

  assert.deepEqual(first.manifest.files.map(({ name }) => name), ["a.txt", "z.txt"]);
  assert.equal(first.canonicalJson, second.canonicalJson);
  assert.equal(first.hashHex, second.hashHex);
});

test("an imported manifest must match the on-chain evidence hash", async () => {
  const canonical = canonicalizeEvidenceManifest(manifest);
  const hash = await sha256Hex(canonical);
  const verified = await verifyEvidenceManifest(JSON.parse(canonical), hash);
  assert.equal(verified.hashHex, hash);

  await assert.rejects(
    () => verifyEvidenceManifest(JSON.parse(canonical), "ff".repeat(32)),
    /does not match/,
  );
});

test("an imported manifest rejects malformed dates and empty required fields", async () => {
  await assert.rejects(
    () =>
      verifyEvidenceManifest({
        ...manifest,
        createdAt: "not-a-date",
      }),
    /invalid required values/,
  );

  await assert.rejects(
    () =>
      verifyEvidenceManifest({
        ...manifest,
        statement: "   ",
      }),
    /invalid required values/,
  );
});

test("an imported manifest enforces the bounded source-file envelope", async () => {
  await assert.rejects(
    () =>
      verifyEvidenceManifest({
        ...manifest,
        files: Array.from({ length: 11 }, (_, index) => ({
          ...manifest.files[0],
          name: `evidence-${index}.pdf`,
        })),
      }),
    /invalid required values/,
  );

  await assert.rejects(
    () =>
      verifyEvidenceManifest({
        ...manifest,
        files: [
          {
            ...manifest.files[0],
            sizeBytes: 25 * 1024 * 1024 + 1,
          },
        ],
      }),
    /25 MB/,
  );

  await assert.rejects(
    () =>
      verifyEvidenceManifest({
        ...manifest,
        statement: "x".repeat(EVIDENCE_LIMITS.maxStatementCharacters + 1),
      }),
    /invalid required values/,
  );

  await assert.rejects(
    () =>
      verifyEvidenceManifest({
        ...manifest,
        files: [
          {
            ...manifest.files[0],
            name: "x".repeat(EVIDENCE_LIMITS.maxIdentifierCharacters + 1),
          },
        ],
      }),
    /invalid file metadata/,
  );
});
