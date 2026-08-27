import { canonicalJson } from "./canonical-json.mjs";
import { evaluateContextClosure } from "./context-closure.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";
import { TextEncoder } from "node:util";

export const CIC_I3_PREP1_REQUIREMENTS = Object.freeze({
  sourceGenerationFingerprint: "6785498B15F1E37163EB8C2E2FE2406F830CD68F99D18397CE157CA3A581BA55",
  repositoryIdentity: "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A",
  capabilityFingerprint: "2BE9757984D93E4F8B158A1C677B6CA41BF0FC1C0275B9123290C7C75C9D2D8C",
});

export const DEFAULT_CONTEXT_TIER_POLICY = Object.freeze({
  tier0MaxBytes: 4096,
  tier1MaxMaterialBytes: 64 * 1024,
  allowTier2: true,
});

const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const PORTABLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/u;
const SECRET_MATERIAL_PATTERN =
  /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+\S+|\b(?:password|secret|token)\s*[:=]\s*\S+)/iu;
const LOCAL_PATH_MATERIAL_PATTERN =
  /(?:^|[\s"'=:(])(?:[A-Za-z]:[\\/]|\\\\|\/(?:home|Users|tmp|var)\/)/u;

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function finding(code, material = null) {
  return material === null ? { code } : { code, material };
}

function identity(value) {
  return typeof value === "string" && IDENTITY_PATTERN.test(value);
}

function portableIdentifier(value) {
  return (
    typeof value === "string" &&
    PORTABLE_IDENTIFIER_PATTERN.test(value) &&
    !SECRET_MATERIAL_PATTERN.test(value) &&
    !/^(?:[A-Za-z]:[\\/]|\\\\|\/)/u.test(value)
  );
}

function normalizeRequirements(requirements) {
  return {
    sourceGenerationFingerprint: requirements.sourceGenerationFingerprint,
    repositoryIdentity: requirements.repositoryIdentity,
    capabilityFingerprint: requirements.capabilityFingerprint,
  };
}

function prerequisiteFindings(prerequisites, requirements) {
  const findings = [];
  const source = prerequisites?.sourceGeneration;
  const repository = prerequisites?.repository;
  const capabilities = prerequisites?.capabilities;
  if (
    source?.status !== "PASS" ||
    source.fingerprint !== requirements.sourceGenerationFingerprint
  ) {
    findings.push(finding("SOURCE_GENERATION_PREREQUISITE_BLOCKED"));
  }
  if (
    repository?.status !== "PASS" ||
    repository.repositoryIdentity !== requirements.repositoryIdentity ||
    !identity(repository.snapshotFingerprint) ||
    repository.view?.complete !== true ||
    repository.view?.shallow !== false
  ) {
    findings.push(finding("REPOSITORY_PREREQUISITE_BLOCKED"));
  }
  if (
    capabilities?.status !== "PASS" ||
    capabilities.capabilityFingerprint !== requirements.capabilityFingerprint ||
    capabilities.requiredStatus !== "PASS"
  ) {
    findings.push(finding("REQUIRED_CAPABILITIES_BLOCKED"));
  }
  return findings;
}

function normalizePolicy(policy = {}) {
  const normalized = { ...DEFAULT_CONTEXT_TIER_POLICY, ...policy };
  if (
    !Number.isSafeInteger(normalized.tier0MaxBytes) ||
    normalized.tier0MaxBytes <= 0 ||
    !Number.isSafeInteger(normalized.tier1MaxMaterialBytes) ||
    normalized.tier1MaxMaterialBytes <= 0 ||
    typeof normalized.allowTier2 !== "boolean"
  ) {
    throw new TypeError("invalid context tier policy");
  }
  return normalized;
}

function normalizeGenerationWitness(raw) {
  const witness = {
    authorityIdentity: raw?.authorityIdentity,
    sourceGenerationFingerprint: raw?.sourceGenerationFingerprint,
    repositoryIdentity: raw?.repositoryIdentity,
    repositorySnapshotIdentity: raw?.repositorySnapshotIdentity,
    capabilityFingerprint: raw?.capabilityFingerprint,
    taskMaterialFingerprint: raw?.taskMaterialFingerprint,
    movement: raw?.movement ?? "STABLE",
  };
  if (
    !identity(witness.authorityIdentity) ||
    !identity(witness.sourceGenerationFingerprint) ||
    !identity(witness.repositoryIdentity) ||
    !identity(witness.repositorySnapshotIdentity) ||
    !identity(witness.capabilityFingerprint) ||
    !identity(witness.taskMaterialFingerprint) ||
    !new Set(["STABLE", "REPEATED_MOVEMENT"]).has(witness.movement)
  ) {
    throw new TypeError("invalid context generation witness");
  }
  return witness;
}

function semanticCollisionKey(value) {
  return value.normalize("NFC").toUpperCase();
}

function normalizePointer(rawPointer, repositoryPath) {
  if (rawPointer?.kind === "GOVERNED") {
    if (!identity(rawPointer.identity) || !portableIdentifier(rawPointer.locator)) return null;
    return { kind: "GOVERNED", identity: rawPointer.identity, locator: rawPointer.locator };
  }
  if (rawPointer?.kind === "REPOSITORY_PATH") {
    try {
      return { kind: "REPOSITORY_PATH", path: normalizeRepoRelativePath(rawPointer.path) };
    } catch {
      return null;
    }
  }
  if (repositoryPath !== null) return { kind: "REPOSITORY_PATH", path: repositoryPath };
  return null;
}

function materialBytes(rawMaterial) {
  if (typeof rawMaterial.content === "string") {
    return { bytes: new TextEncoder().encode(rawMaterial.content), content: rawMaterial.content };
  }
  if (rawMaterial.content instanceof Uint8Array) {
    return { bytes: rawMaterial.content, content: null };
  }
  throw new TypeError("material content must be a string or Uint8Array");
}

function buildTiers(rawMaterials, policy, findings) {
  const tier1 = [];
  const tier2 = [];
  const collisionKeys = new Set();
  const generationIdentities = new Set();

  for (const rawMaterial of [...rawMaterials].sort((left, right) =>
    compareText(left.id ?? "", right.id ?? ""),
  )) {
    const materialId = rawMaterial.id;
    if (!portableIdentifier(materialId)) {
      findings.push(finding("MATERIAL_IDENTITY_INVALID"));
      continue;
    }
    const idCollisionKey = `id:${semanticCollisionKey(materialId)}`;
    if (collisionKeys.has(idCollisionKey)) {
      findings.push(finding("CONTEXT_IDENTITY_COLLISION", materialId));
      continue;
    }
    collisionKeys.add(idCollisionKey);

    let repositoryPath = null;
    if (rawMaterial.path !== undefined) {
      try {
        repositoryPath = normalizeRepoRelativePath(rawMaterial.path);
      } catch {
        findings.push(finding("MATERIAL_PATH_INVALID", materialId));
        continue;
      }
      const pathCollisionKey = `path:${semanticCollisionKey(repositoryPath)}`;
      if (collisionKeys.has(pathCollisionKey)) {
        findings.push(finding("CONTEXT_IDENTITY_COLLISION", materialId));
        continue;
      }
      collisionKeys.add(pathCollisionKey);
    }

    let observed;
    try {
      observed = materialBytes(rawMaterial);
    } catch {
      findings.push(finding("REQUIRED_MATERIAL_READ_FAILED", materialId));
      continue;
    }
    const contentSha256 = sha256Hex(observed.bytes);
    if (
      (rawMaterial.sha256 !== undefined && rawMaterial.sha256 !== contentSha256) ||
      (rawMaterial.bytes !== undefined && rawMaterial.bytes !== observed.bytes.byteLength)
    ) {
      findings.push(finding("MATERIAL_IDENTITY_MISMATCH", materialId));
      continue;
    }
    if (rawMaterial.generationIdentity !== undefined) {
      if (!identity(rawMaterial.generationIdentity)) {
        findings.push(finding("MATERIAL_GENERATION_INVALID", materialId));
        continue;
      }
      generationIdentities.add(rawMaterial.generationIdentity);
    }

    const base = {
      id: materialId,
      path: repositoryPath,
      bytes: observed.bytes.byteLength,
      sha256: contentSha256,
      generationIdentity: rawMaterial.generationIdentity ?? null,
    };
    const nonPortableContent =
      observed.content !== null &&
      (SECRET_MATERIAL_PATTERN.test(observed.content) ||
        LOCAL_PATH_MATERIAL_PATTERN.test(observed.content));
    const requiresTier2 =
      rawMaterial.forceTier2 === true ||
      observed.content === null ||
      nonPortableContent ||
      observed.bytes.byteLength > policy.tier1MaxMaterialBytes;
    if (!requiresTier2) {
      tier1.push({ ...base, encoding: "utf8", content: observed.content });
      continue;
    }

    const pointer = normalizePointer(rawMaterial.pointer, repositoryPath);
    if (!policy.allowTier2 || pointer === null) {
      findings.push(
        finding(
          observed.bytes.byteLength > policy.tier1MaxMaterialBytes
            ? "TIER1_MATERIAL_OVERSIZED"
            : "REQUIRED_OBJECT_UNAVAILABLE",
          materialId,
        ),
      );
      continue;
    }
    tier2.push({ ...base, pointer, embedded: false });
  }

  if (generationIdentities.size > 1) findings.push(finding("CONTEXT_GENERATION_RACE"));
  return { tier1, tier2 };
}

function blockedResult({ findings, closure, generation, tiers, tier0 }) {
  return {
    schemaVersion: "CIC_CONTEXT_COMPILATION_V1",
    status: "BLOCKED",
    active: false,
    contextGenerationIdentity: null,
    generation,
    closure,
    tiers: { tier0, ...tiers },
    findings,
  };
}

export async function compileContext(
  request,
  {
    observeGeneration,
    observeProviders,
    readMaterials = async (materials) => materials,
    requirements = CIC_I3_PREP1_REQUIREMENTS,
  } = {},
) {
  const findings = [];
  const normalizedRequirements = normalizeRequirements(requirements);
  let policy;
  try {
    policy = normalizePolicy(request?.tierPolicy);
  } catch {
    policy = DEFAULT_CONTEXT_TIER_POLICY;
    findings.push(finding("CONTEXT_TIER_POLICY_INVALID"));
  }
  findings.push(...prerequisiteFindings(request?.prerequisites, normalizedRequirements));

  if (!identity(request?.authority?.identity)) findings.push(finding("AUTHORITY_IDENTITY_INVALID"));
  if (!identity(request?.task?.identity)) findings.push(finding("TASK_IDENTITY_INVALID"));

  let generationStart = null;
  let generationEnd = null;
  if (typeof observeGeneration !== "function") {
    findings.push(finding("GENERATION_OBSERVER_MISSING"));
  } else {
    try {
      generationStart = normalizeGenerationWitness(await observeGeneration("GEN_START"));
    } catch {
      findings.push(finding("GENERATION_OBSERVATION_FAILED"));
    }
  }

  let providerObservation = null;
  if (generationStart !== null) {
    if (typeof observeProviders !== "function") {
      findings.push(finding("PROVIDER_OBSERVER_MISSING"));
    } else {
      try {
        providerObservation = await observeProviders();
        const providerSemantic = {
          results: providerObservation?.results,
          findings: providerObservation?.findings,
        };
        const expectedFingerprint = sha256Hex(
          `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(providerSemantic)}\n`,
        );
        if (
          providerObservation?.schemaVersion !== "CIC_CONTEXT_PROVIDER_OBSERVATION_V1" ||
          providerObservation.status !== "PASS" ||
          providerObservation.observationFingerprint !== expectedFingerprint ||
          !Array.isArray(providerObservation.results) ||
          !Array.isArray(providerObservation.findings) ||
          providerObservation.findings.length !== 0 ||
          providerObservation.results.some(
            (result) =>
              result.state === "UNKNOWN" ||
              !identity(result.providerIdentity) ||
              !identity(result.materialIdentity) ||
              !identity(result.resultIdentity),
          )
        ) {
          findings.push(finding("PROVIDER_OBSERVATION_BLOCKED"));
        }
      } catch {
        providerObservation = null;
        findings.push(finding("PROVIDER_OBSERVATION_FAILED"));
      }
    }
  }

  let rawMaterials = [];
  if (generationStart !== null) {
    try {
      rawMaterials = await readMaterials(request?.materials ?? []);
      if (!Array.isArray(rawMaterials)) throw new TypeError("materials must be an array");
    } catch {
      findings.push(finding("REQUIRED_MATERIAL_READ_FAILED"));
    }
  }
  const tiers = buildTiers(rawMaterials, policy, findings);
  const resolvedMaterialIdentities = new Set([
    ...tiers.tier1.map(({ sha256 }) => sha256),
    ...tiers.tier2.map(({ sha256 }) => sha256),
    ...(providerObservation?.results ?? []).map(({ materialIdentity }) => materialIdentity),
  ]);
  for (const dimension of request?.dimensions ?? []) {
    if (
      dimension.state === "PRESENT" &&
      (!Array.isArray(dimension.materialIdentities) ||
        dimension.materialIdentities.some(
          (materialIdentity) => !resolvedMaterialIdentities.has(materialIdentity),
        ))
    ) {
      findings.push(finding("REQUIRED_MATERIAL_UNRESOLVED", dimension.dimension ?? null));
    }
    if (
      dimension.state === "ABSENT_PROVEN" &&
      !(providerObservation?.results ?? []).some(
        (result) =>
          result.state === "ABSENT_PROVEN" &&
          result.providerIdentity === dimension.absenceWitness?.providerIdentity,
      )
    ) {
      findings.push(finding("NEGATIVE_KNOWLEDGE_UNDER_PROVEN", dimension.dimension ?? null));
    }
  }

  const tier0 = {
    schemaVersion: "CIC_CONTEXT_TIER0_V1",
    authorityIdentity: request?.authority?.identity ?? null,
    taskIdentity: request?.task?.identity ?? null,
    sourceGenerationFingerprint: request?.prerequisites?.sourceGeneration?.fingerprint ?? null,
    repositoryIdentity: request?.prerequisites?.repository?.repositoryIdentity ?? null,
    repositorySnapshotIdentity: request?.prerequisites?.repository?.snapshotFingerprint ?? null,
    capabilityFingerprint: request?.prerequisites?.capabilities?.capabilityFingerprint ?? null,
    providerObservationFingerprint: providerObservation?.observationFingerprint ?? null,
    tierPolicy: policy,
  };
  if (new TextEncoder().encode(canonicalJson(tier0)).byteLength > policy.tier0MaxBytes) {
    findings.push(finding("TIER0_BOUNDS_EXCEEDED"));
  }

  if (generationStart !== null && typeof observeGeneration === "function") {
    try {
      generationEnd = normalizeGenerationWitness(await observeGeneration("GEN_END"));
    } catch {
      findings.push(finding("GENERATION_OBSERVATION_FAILED"));
    }
  }
  if (
    generationStart?.movement === "REPEATED_MOVEMENT" ||
    generationEnd?.movement === "REPEATED_MOVEMENT" ||
    providerObservation?.movement === "REPEATED_MOVEMENT"
  ) {
    findings.push(finding("WORKSPACE_NOT_QUIESCENT"));
  } else if (
    generationStart !== null &&
    generationEnd !== null &&
    canonicalJson(generationStart) !== canonicalJson(generationEnd)
  ) {
    findings.push(finding("CONTEXT_GENERATION_RACE"));
  }

  const generationWitnessMismatch = [generationStart, generationEnd]
    .filter((value) => value !== null)
    .some(
      (witness) =>
        witness.authorityIdentity !== request?.authority?.identity ||
        witness.sourceGenerationFingerprint !==
          request?.prerequisites?.sourceGeneration?.fingerprint ||
        witness.repositoryIdentity !== request?.prerequisites?.repository?.repositoryIdentity ||
        witness.repositorySnapshotIdentity !==
          request?.prerequisites?.repository?.snapshotFingerprint ||
        witness.capabilityFingerprint !==
          request?.prerequisites?.capabilities?.capabilityFingerprint,
    );
  if (generationWitnessMismatch) {
    findings.push(finding("GENERATION_WITNESS_MISMATCH"));
  }

  const providerResults = providerObservation?.results ?? [];
  const closure = evaluateContextClosure({
    dimensions: request?.dimensions,
    requiredDimensions: request?.requiredDimensions,
    prerequisiteStatus: findings.some(({ code }) => code.endsWith("PREREQUISITE_BLOCKED"))
      ? "BLOCKED"
      : "PASS",
    providerResults,
    inheritedFindings: findings,
  });
  findings.splice(0, findings.length, ...closure.findings);

  const generation = {
    start: generationStart,
    end: generationEnd,
    coherent:
      generationStart !== null &&
      generationEnd !== null &&
      generationStart.movement === "STABLE" &&
      generationEnd.movement === "STABLE" &&
      canonicalJson(generationStart) === canonicalJson(generationEnd),
  };
  if (closure.status !== "COMPLETE") {
    return blockedResult({ findings, closure, generation, tiers, tier0 });
  }

  const candidate = {
    lifecycle: "VERIFIED_NON_ACTIVE",
    generation,
    closure,
    tiers: { tier0, ...tiers },
  };
  return {
    schemaVersion: "CIC_CONTEXT_COMPILATION_V1",
    status: "VERIFIED",
    active: false,
    contextGenerationIdentity: sha256Hex(
      `CIC-CONTEXT-GENERATION-V1\n${canonicalJson(candidate)}\n`,
    ),
    ...candidate,
    findings,
  };
}

export function serializeContextCompilation(result) {
  return `${canonicalJson(result)}\n`;
}
