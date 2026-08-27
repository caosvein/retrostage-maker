import { canonicalJson } from "./canonical-json.mjs";
import { evaluateContextClosure, REQUIRED_CONTEXT_DIMENSIONS } from "./context-closure.mjs";
import {
  CONTEXT_PROVIDER_MOVEMENTS,
  containsNonPortableContextText,
  contextProviderResultIdentity,
  isPortableContextIdentifier,
  normalizeNegativeKnowledgeWitness,
  portableProviderData,
} from "./context-provider.mjs";
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
const PROVIDER_RESULT_KEYS = Object.freeze([
  "absenceWitness",
  "capability",
  "data",
  "excluded",
  "findings",
  "inputIdentity",
  "materialIdentity",
  "providerId",
  "providerIdentity",
  "requestId",
  "requestIdentity",
  "resultIdentity",
  "state",
]);

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
  return isPortableContextIdentifier(value);
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
  if (source?.status !== "PASS" || !identity(source.fingerprint)) {
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
    !identity(capabilities.capabilityFingerprint) ||
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
    if (!identity(rawPointer.identity) || !portableIdentifier(rawPointer.locator)) {
      return { status: "INVALID", pointer: null };
    }
    return {
      status: "VALID",
      pointer: { kind: "GOVERNED", identity: rawPointer.identity, locator: rawPointer.locator },
    };
  }
  if (rawPointer?.kind === "REPOSITORY_PATH") {
    try {
      const pointerPath = normalizeRepoRelativePath(rawPointer.path);
      if (repositoryPath === null || pointerPath !== repositoryPath) {
        return { status: "MISMATCH", pointer: null };
      }
      return { status: "VALID", pointer: { kind: "REPOSITORY_PATH", path: pointerPath } };
    } catch {
      return { status: "INVALID", pointer: null };
    }
  }
  if (repositoryPath !== null) {
    return {
      status: "VALID",
      pointer: { kind: "REPOSITORY_PATH", path: repositoryPath },
    };
  }
  return { status: "INVALID", pointer: null };
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
  const materialFacts = [];
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
      observed.content !== null && containsNonPortableContextText(observed.content);
    const requiresTier2 =
      rawMaterial.forceTier2 === true ||
      observed.content === null ||
      nonPortableContent ||
      observed.bytes.byteLength > policy.tier1MaxMaterialBytes;
    if (!requiresTier2) {
      tier1.push({ ...base, encoding: "utf8", content: observed.content });
      materialFacts.push({ ...base, placement: "TIER1", pointer: null });
      continue;
    }

    const normalizedPointer = normalizePointer(rawMaterial.pointer, repositoryPath);
    if (normalizedPointer.status === "MISMATCH") {
      findings.push(finding("TIER2_POINTER_MISMATCH", materialId));
      continue;
    }
    if (!policy.allowTier2 || normalizedPointer.status !== "VALID") {
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
    tier2.push({ ...base, pointer: normalizedPointer.pointer, embedded: false });
    materialFacts.push({
      ...base,
      placement: "TIER2",
      pointer: normalizedPointer.pointer,
    });
  }

  if (generationIdentities.size > 1) findings.push(finding("CONTEXT_GENERATION_RACE"));
  return { tier1, tier2, materialFacts };
}

function effectiveRequiredDimensions(requiredDimensions) {
  const additions = Array.isArray(requiredDimensions)
    ? requiredDimensions.filter(portableIdentifier)
    : [];
  return [...new Set([...REQUIRED_CONTEXT_DIMENSIONS, ...additions])].sort(compareText);
}

function normalizeDimensionIntent(rawDimension) {
  const state = typeof rawDimension?.state === "string" ? rawDimension.state : null;
  const reason =
    state === "NOT_APPLICABLE_WITH_REASON" &&
    typeof rawDimension?.reason === "string" &&
    !containsNonPortableContextText(rawDimension.reason.trim())
      ? rawDimension.reason.trim()
      : null;
  return {
    dimension: portableIdentifier(rawDimension?.dimension) ? rawDimension.dimension : null,
    state,
    materialIdentities: Array.isArray(rawDimension?.materialIdentities)
      ? rawDimension.materialIdentities.filter(identity).sort(compareText)
      : [],
    reason,
    absenceWitness:
      state === "ABSENT_PROVEN"
        ? normalizeNegativeKnowledgeWitness(rawDimension?.absenceWitness)
        : null,
  };
}

function taskMaterialFingerprintFromFacts(request, policy, materialFacts) {
  const semantic = {
    authorityIdentity: request?.authority?.identity ?? null,
    taskIdentity: request?.task?.identity ?? null,
    requiredDimensions: effectiveRequiredDimensions(request?.requiredDimensions),
    dimensions: (request?.dimensions ?? [])
      .map(normalizeDimensionIntent)
      .sort((left, right) => compareText(left.dimension ?? "", right.dimension ?? "")),
    tierPolicy: policy,
    materials: materialFacts,
  };
  return sha256Hex(`CIC-CONTEXT-TASK-MATERIAL-V1\n${canonicalJson(semantic)}\n`);
}

export function computeTaskMaterialFingerprint(request, rawMaterials = request?.materials ?? []) {
  const policy = normalizePolicy(request?.tierPolicy);
  const findings = [];
  const { materialFacts } = buildTiers(rawMaterials, policy, findings);
  if (findings.length !== 0) throw new TypeError("task materials are not deterministically usable");
  return taskMaterialFingerprintFromFacts(request, policy, materialFacts);
}

function providerInputIdentity(generationStart, taskMaterialFingerprint) {
  const semantic = {
    authorityIdentity: generationStart.authorityIdentity,
    sourceGenerationFingerprint: generationStart.sourceGenerationFingerprint,
    repositoryIdentity: generationStart.repositoryIdentity,
    repositorySnapshotIdentity: generationStart.repositorySnapshotIdentity,
    capabilityFingerprint: generationStart.capabilityFingerprint,
    taskMaterialFingerprint,
  };
  return sha256Hex(`CIC-CONTEXT-PROVIDER-INPUT-V1\n${canonicalJson(semantic)}\n`);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function providerResultBody(result) {
  const {
    requestId,
    providerId,
    providerIdentity,
    capability,
    inputIdentity,
    requestIdentity,
    state,
    materialIdentity,
    data,
    absenceWitness,
    excluded,
    findings,
  } = result;
  return {
    requestId,
    providerId,
    providerIdentity,
    capability,
    inputIdentity,
    requestIdentity,
    state,
    materialIdentity,
    data,
    absenceWitness,
    excluded,
    findings,
  };
}

function normalizeProviderResult(result, expectedInputIdentity) {
  if (
    !isPlainObject(result) ||
    Object.keys(result).sort(compareText).join("\0") !==
      [...PROVIDER_RESULT_KEYS].sort(compareText).join("\0") ||
    !portableIdentifier(result.requestId) ||
    !portableIdentifier(result.providerId) ||
    !portableIdentifier(result.capability) ||
    !identity(result.providerIdentity) ||
    !identity(result.inputIdentity) ||
    !identity(result.requestIdentity) ||
    !identity(result.materialIdentity) ||
    !identity(result.resultIdentity) ||
    !new Set(["PRESENT", "ABSENT_PROVEN"]).has(result.state) ||
    !isPlainObject(result.excluded) ||
    Object.keys(result.excluded).sort(compareText).join("\0") !== "localPathValues\0secretValues" ||
    !Number.isSafeInteger(result.excluded.localPathValues) ||
    result.excluded.localPathValues < 0 ||
    !Number.isSafeInteger(result.excluded.secretValues) ||
    result.excluded.secretValues < 0 ||
    !Array.isArray(result.findings) ||
    result.findings.length !== 0
  ) {
    return { status: "INVALID", result: null };
  }
  if (result.inputIdentity !== expectedInputIdentity) {
    return { status: "STALE_INPUT", result: null };
  }

  let portable;
  try {
    portable = portableProviderData(result.data);
    if (
      portable.excluded.localPathValues !== 0 ||
      portable.excluded.secretValues !== 0 ||
      canonicalJson(portable.data) !== canonicalJson(result.data)
    ) {
      return { status: "INVALID", result: null };
    }
  } catch {
    return { status: "INVALID", result: null };
  }

  const absenceWitness = normalizeNegativeKnowledgeWitness(result.absenceWitness);
  if (
    (result.state === "PRESENT" && result.absenceWitness !== null) ||
    (result.state === "ABSENT_PROVEN" &&
      (absenceWitness === null || absenceWitness.providerIdentity !== result.providerIdentity))
  ) {
    return { status: "INVALID", result: null };
  }

  const normalized = {
    ...providerResultBody(result),
    data: portable.data,
    absenceWitness: result.state === "ABSENT_PROVEN" ? absenceWitness : null,
  };
  if (contextProviderResultIdentity(normalized) !== result.resultIdentity) {
    return { status: "INVALID", result: null };
  }
  return { status: "VALID", result: { ...normalized, resultIdentity: result.resultIdentity } };
}

function verifyProviderObservation(rawObservation, expectedInputIdentity, findings) {
  if (
    !isPlainObject(rawObservation) ||
    rawObservation.schemaVersion !== "CIC_CONTEXT_PROVIDER_OBSERVATION_V1" ||
    rawObservation.status !== "PASS" ||
    !CONTEXT_PROVIDER_MOVEMENTS.includes(rawObservation.movement) ||
    !Array.isArray(rawObservation.results) ||
    !Array.isArray(rawObservation.findings) ||
    rawObservation.findings.length !== 0 ||
    !identity(rawObservation.observationFingerprint)
  ) {
    findings.push(finding("PROVIDER_OBSERVATION_BLOCKED"));
    return null;
  }

  const results = [];
  const requestIdentities = new Set();
  const resultIdentities = new Set();
  for (const rawResult of rawObservation.results) {
    const verified = normalizeProviderResult(rawResult, expectedInputIdentity);
    if (verified.status === "STALE_INPUT") {
      findings.push(finding("PROVIDER_INPUT_BINDING_MISMATCH"));
      return null;
    }
    if (verified.status !== "VALID") {
      findings.push(finding("PROVIDER_RESULT_REVERIFICATION_FAILED"));
      return null;
    }
    if (
      requestIdentities.has(verified.result.requestIdentity) ||
      resultIdentities.has(verified.result.resultIdentity)
    ) {
      findings.push(finding("CONTEXT_IDENTITY_COLLISION"));
      return null;
    }
    requestIdentities.add(verified.result.requestIdentity);
    resultIdentities.add(verified.result.resultIdentity);
    results.push(verified.result);
  }

  const semantic = { movement: rawObservation.movement, results, findings: [] };
  const expectedFingerprint = sha256Hex(
    `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(semantic)}\n`,
  );
  if (rawObservation.observationFingerprint !== expectedFingerprint) {
    findings.push(finding("PROVIDER_OBSERVATION_BLOCKED"));
    return null;
  }
  return {
    schemaVersion: "CIC_CONTEXT_PROVIDER_OBSERVATION_V1",
    status: "PASS",
    ...semantic,
    observationFingerprint: expectedFingerprint,
  };
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

  let rawMaterials = [];
  try {
    rawMaterials = await readMaterials(request?.materials ?? []);
    if (!Array.isArray(rawMaterials)) throw new TypeError("materials must be an array");
  } catch {
    findings.push(finding("REQUIRED_MATERIAL_READ_FAILED"));
  }
  const preparedTiers = buildTiers(rawMaterials, policy, findings);
  const tiers = { tier1: preparedTiers.tier1, tier2: preparedTiers.tier2 };
  const expectedTaskMaterialFingerprint = taskMaterialFingerprintFromFacts(
    request,
    policy,
    preparedTiers.materialFacts,
  );

  let generationStart = null;
  let generationEnd = null;
  if (typeof observeGeneration !== "function") {
    findings.push(finding("GENERATION_OBSERVER_MISSING"));
  } else {
    try {
      generationStart = normalizeGenerationWitness(
        await observeGeneration("GEN_START", {
          request,
          materials: rawMaterials,
          taskMaterialFingerprint: expectedTaskMaterialFingerprint,
        }),
      );
    } catch {
      findings.push(finding("GENERATION_OBSERVATION_FAILED"));
    }
  }

  let providerObservation = null;
  if (generationStart !== null) {
    const startMatchesCurrent =
      generationStart.authorityIdentity === request?.authority?.identity &&
      generationStart.sourceGenerationFingerprint ===
        request?.prerequisites?.sourceGeneration?.fingerprint &&
      generationStart.repositoryIdentity ===
        request?.prerequisites?.repository?.repositoryIdentity &&
      generationStart.repositorySnapshotIdentity ===
        request?.prerequisites?.repository?.snapshotFingerprint &&
      generationStart.capabilityFingerprint ===
        request?.prerequisites?.capabilities?.capabilityFingerprint &&
      generationStart.taskMaterialFingerprint === expectedTaskMaterialFingerprint;
    if (!startMatchesCurrent) {
      providerObservation = null;
    } else if (typeof observeProviders !== "function") {
      findings.push(finding("PROVIDER_OBSERVER_MISSING"));
    } else {
      try {
        const expectedProviderInputIdentity = providerInputIdentity(
          generationStart,
          expectedTaskMaterialFingerprint,
        );
        const rawProviderObservation = await observeProviders({
          inputIdentity: expectedProviderInputIdentity,
          taskMaterialFingerprint: expectedTaskMaterialFingerprint,
          generationWitness: generationStart,
        });
        providerObservation = verifyProviderObservation(
          rawProviderObservation,
          expectedProviderInputIdentity,
          findings,
        );
      } catch {
        providerObservation = null;
        findings.push(finding("PROVIDER_OBSERVATION_FAILED"));
      }
    }
  }

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
  }

  const tier0 = {
    schemaVersion: "CIC_CONTEXT_TIER0_V1",
    authorityIdentity: request?.authority?.identity ?? null,
    taskIdentity: request?.task?.identity ?? null,
    sourceGenerationFingerprint: request?.prerequisites?.sourceGeneration?.fingerprint ?? null,
    repositoryIdentity: request?.prerequisites?.repository?.repositoryIdentity ?? null,
    repositorySnapshotIdentity: request?.prerequisites?.repository?.snapshotFingerprint ?? null,
    capabilityFingerprint: request?.prerequisites?.capabilities?.capabilityFingerprint ?? null,
    taskMaterialFingerprint: expectedTaskMaterialFingerprint,
    providerInputIdentity:
      generationStart === null
        ? null
        : providerInputIdentity(generationStart, expectedTaskMaterialFingerprint),
    providerObservationFingerprint: providerObservation?.observationFingerprint ?? null,
    tierPolicy: policy,
  };
  if (new TextEncoder().encode(canonicalJson(tier0)).byteLength > policy.tier0MaxBytes) {
    findings.push(finding("TIER0_BOUNDS_EXCEEDED"));
  }

  if (generationStart !== null && typeof observeGeneration === "function") {
    try {
      generationEnd = normalizeGenerationWitness(
        await observeGeneration("GEN_END", {
          request,
          materials: rawMaterials,
          taskMaterialFingerprint: expectedTaskMaterialFingerprint,
        }),
      );
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
  if (
    [generationStart, generationEnd]
      .filter((value) => value !== null)
      .some((witness) => witness.taskMaterialFingerprint !== expectedTaskMaterialFingerprint)
  ) {
    findings.push(finding("TASK_MATERIAL_FINGERPRINT_MISMATCH"));
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
