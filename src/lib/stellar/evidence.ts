export type EvidenceFileRecord = {
  name: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
};

export type EvidenceManifest = {
  schemaVersion: 1;
  dealId: string;
  contractId: string;
  milestone: string;
  submitter: string;
  statement: string;
  createdAt: string;
  files: EvidenceFileRecord[];
};

export type PreparedEvidence = {
  manifest: EvidenceManifest;
  canonicalJson: string;
  hashHex: string;
};

export const EVIDENCE_LIMITS = {
  maxFiles: 10,
  maxTotalBytes: 25 * 1024 * 1024,
  maxStatementCharacters: 10_000,
  maxIdentifierCharacters: 255,
  maxMilestoneCharacters: 2_000,
} as const;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function canonicalValue(value: JsonValue): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Evidence manifests cannot contain non-finite numbers.");
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalValue).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalValue(value[key])}`)
    .join(",")}}`;
}

export function canonicalizeEvidenceManifest(manifest: EvidenceManifest) {
  return canonicalValue(manifest as unknown as JsonValue);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value: ArrayBuffer | Uint8Array | string) {
  const input =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);
  const buffer = new ArrayBuffer(input.byteLength);
  new Uint8Array(buffer).set(input);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(digest));
}

export async function prepareEvidenceManifest(input: {
  dealId: string;
  contractId: string;
  milestone: string;
  submitter: string;
  statement: string;
  createdAt?: string;
  files?: readonly File[];
}): Promise<PreparedEvidence> {
  const statement = input.statement.trim();
  if (statement.length < 10) {
    throw new Error("Describe the milestone evidence in at least 10 characters.");
  }
  if (statement.length > EVIDENCE_LIMITS.maxStatementCharacters) {
    throw new Error("The milestone statement is too long for this evidence manifest.");
  }
  if (
    !input.dealId.trim() ||
    !input.contractId.trim() ||
    !input.milestone.trim() ||
    !input.submitter.trim() ||
    input.dealId.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
    input.contractId.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
    input.submitter.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
    input.milestone.length > EVIDENCE_LIMITS.maxMilestoneCharacters
  ) {
    throw new Error("The evidence manifest contains invalid identifying fields.");
  }
  if ((input.files?.length ?? 0) > EVIDENCE_LIMITS.maxFiles) {
    throw new Error(
      `Attach at most ${EVIDENCE_LIMITS.maxFiles} source files to one evidence manifest.`,
    );
  }
  const totalSize = (input.files ?? []).reduce(
    (sum, file) => sum + file.size,
    0,
  );
  if (totalSize > EVIDENCE_LIMITS.maxTotalBytes) {
    throw new Error("The source files may total at most 25 MB in this browser demo.");
  }

  for (const file of input.files ?? []) {
    if (
      !file.name.trim() ||
      file.name.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
      file.type.length > EVIDENCE_LIMITS.maxIdentifierCharacters
    ) {
      throw new Error("A source file has invalid or excessively long metadata.");
    }
  }

  const fileRecords = await Promise.all(
    (input.files ?? []).map(async (file) => ({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      sha256: await sha256Hex(await file.arrayBuffer()),
    })),
  );
  fileRecords.sort((left, right) => {
    const leftKey = `${left.name}\u0000${left.mimeType}\u0000${left.sizeBytes}\u0000${left.sha256}`;
    const rightKey = `${right.name}\u0000${right.mimeType}\u0000${right.sizeBytes}\u0000${right.sha256}`;
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });

  const createdAt = input.createdAt ?? new Date().toISOString();
  if (Number.isNaN(Date.parse(createdAt))) {
    throw new Error("The evidence creation time is invalid.");
  }

  const manifest: EvidenceManifest = {
    schemaVersion: 1,
    dealId: input.dealId,
    contractId: input.contractId,
    milestone: input.milestone,
    submitter: input.submitter,
    statement,
    createdAt,
    files: fileRecords,
  };
  const canonicalJson = canonicalizeEvidenceManifest(manifest);

  return {
    manifest,
    canonicalJson,
    hashHex: await sha256Hex(canonicalJson),
  };
}

export async function verifyEvidenceManifest(
  value: unknown,
  expectedHashHex?: string,
): Promise<PreparedEvidence> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The evidence manifest must be a JSON object.");
  }

  const candidate = value as Partial<EvidenceManifest>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.dealId !== "string" ||
    typeof candidate.contractId !== "string" ||
    typeof candidate.milestone !== "string" ||
    typeof candidate.submitter !== "string" ||
    typeof candidate.statement !== "string" ||
    typeof candidate.createdAt !== "string" ||
    !Array.isArray(candidate.files)
  ) {
    throw new Error("The evidence manifest does not match schema version 1.");
  }

  if (
    !candidate.dealId.trim() ||
    !candidate.contractId.trim() ||
    !candidate.milestone.trim() ||
    !candidate.submitter.trim() ||
    candidate.dealId.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
    candidate.contractId.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
    candidate.submitter.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
    candidate.milestone.length > EVIDENCE_LIMITS.maxMilestoneCharacters ||
    candidate.statement.trim().length < 10 ||
    candidate.statement.length > EVIDENCE_LIMITS.maxStatementCharacters ||
    Number.isNaN(Date.parse(candidate.createdAt)) ||
    candidate.files.length > EVIDENCE_LIMITS.maxFiles
  ) {
    throw new Error("The evidence manifest contains invalid required values.");
  }

  let totalSize = 0;

  for (const file of candidate.files) {
    if (
      !file ||
      typeof file.name !== "string" ||
      typeof file.mimeType !== "string" ||
      !file.name.trim() ||
      file.name.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
      file.mimeType.length > EVIDENCE_LIMITS.maxIdentifierCharacters ||
      !Number.isSafeInteger(file.sizeBytes) ||
      file.sizeBytes < 0 ||
      !/^[0-9a-f]{64}$/i.test(file.sha256)
    ) {
      throw new Error("The evidence manifest contains invalid file metadata.");
    }
    totalSize += file.sizeBytes;
  }

  if (totalSize > EVIDENCE_LIMITS.maxTotalBytes) {
    throw new Error("The evidence manifest exceeds the 25 MB source-file limit.");
  }

  const manifest = candidate as EvidenceManifest;
  const canonicalJson = canonicalizeEvidenceManifest(manifest);
  const hashHex = await sha256Hex(canonicalJson);
  if (expectedHashHex && hashHex.toLowerCase() !== expectedHashHex.toLowerCase()) {
    throw new Error("This manifest does not match the evidence hash anchored on-chain.");
  }

  return { manifest, canonicalJson, hashHex };
}
