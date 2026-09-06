/* global structuredClone */

import { execFile } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  open,
  readFile,
  realpath,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { run as runCli } from "./verify-semantic-closure.mjs";
import { canonicalJson } from "./lib/canonical-json.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { observeCurrentTruth } from "./lib/current-truth.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import { defineSemanticProviderRegistration } from "./lib/semantic-provider.mjs";
import {
  comparePhysicalCurrentness,
  compareSemanticClosureWitnesses,
  parseSemanticDeclaration,
  physicalBindingSnapshot,
  verifySemanticClosure,
  verifySemanticClosureWitness,
} from "./lib/semantic-closure.mjs";
import { defineSemanticOwnerRegistration } from "./lib/semantic-registry.mjs";
import {
  I4_ACTION_FLAGS,
  admitAuthorization,
  defineOwnerDecision,
  defineTaskContract,
  recordOwnerDecision,
  recordTaskContract,
} from "./lib/task-authorization.mjs";
import { inspectStateDomainCandidate, recordStateDomainBinding } from "./lib/state-domain.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");
const runFile = promisify(execFile);
const hash = (label) => sha256Hex(`I5-C-SEMANTIC-BOUNDARY-TEST\n${label}\n`);
const SERIALIZATION_LOCK = path.join(tmpdir(), `cic-i4-tests-${process.ppid}.lock`);
const PHYSICAL_TEST_TIMEOUT_MS = 90_000;

let serializationHandle;
let fixture;
let physicalClosureWitness;

async function acquireSerializationLock() {
  for (let attempt = 0; attempt < 6_000; attempt += 1) {
    try {
      serializationHandle = await open(SERIALIZATION_LOCK, "wx");
      return;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      await delay(250);
    }
  }
  throw new Error("CIC_I4_TEST_SERIALIZATION_TIMEOUT");
}

await acquireSerializationLock();

const semanticIdentity = (schema, body) =>
  sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);

function resealClosureWitness(witness, overrides = {}) {
  const body = { ...structuredClone(witness), ...overrides };
  delete body.closureWitnessIdentity;
  return {
    ...body,
    closureWitnessIdentity: semanticIdentity("CIC_I5_C_SEMANTIC_CLOSURE_WITNESS_V1", body),
  };
}

function presentRecord(semanticKey, materialId, dependencies = []) {
  return {
    semanticKey,
    semanticKind: "component",
    presenceState: "PRESENT",
    materialId,
    negativeWitnessMaterialId: null,
    dependencies,
    payload: { state: "present" },
    absenceQueryClass: null,
  };
}

function absentRecord(semanticKey, negativeWitnessMaterialId, queryClass = "component-index") {
  return {
    semanticKey,
    semanticKind: "component",
    presenceState: "ABSENT_PROVEN",
    materialId: null,
    negativeWitnessMaterialId,
    dependencies: [],
    payload: null,
    absenceQueryClass: queryClass,
  };
}

function unknownRecord(semanticKey) {
  return {
    semanticKey,
    semanticKind: "component",
    presenceState: "UNKNOWN",
    materialId: null,
    negativeWitnessMaterialId: null,
    dependencies: [],
    payload: null,
    absenceQueryClass: null,
  };
}

function rawDeclaration({
  declarationMaterialId = "semantic-declaration",
  negativeWitnessMaterialId = "semantic-negative-witness",
  records = null,
  requestedRoots = ["component.root"],
} = {}) {
  return {
    schemaVersion: "CIC_SEMANTIC_DECLARATION_V1",
    schemaFloor: 1,
    policyFloor: 1,
    requestedRoots,
    owners: [
      {
        ownerId: "semantic-owner-a",
        semanticKinds: ["component"],
        schemaFloor: 1,
        policyFloor: 1,
      },
    ],
    providers: [
      {
        providerId: "semantic-provider-a",
        providerVersion: "1.0.0",
        ownerId: "semantic-owner-a",
        capabilities: ["semantic-projection"],
        semanticKinds: ["component"],
        schemaFloor: 1,
        policyFloor: 1,
        capabilityRecords: [
          {
            capability: "semantic-projection",
            records: records ?? [
              presentRecord("component.root", declarationMaterialId, ["component.optional"]),
              absentRecord("component.optional", negativeWitnessMaterialId),
            ],
          },
        ],
      },
    ],
  };
}

function negativeWitnessScopeIdentity({
  scope,
  taskContractIdentity,
  providerIdentity,
  record,
  materialId,
  materialPath,
}) {
  return semanticIdentity("CIC_I5_C_ABSENCE_SCOPE_V1", {
    authorizedPathSet: [...scope].sort(),
    taskContractIdentity,
    providerIdentity,
    semanticKey: record.semanticKey,
    semanticKind: record.semanticKind,
    queryClass: record.absenceQueryClass,
    negativeWitnessMaterialId: materialId,
    negativeWitnessMaterialPath: materialPath,
  });
}

function negativeWitnessMaterial({ providerId = "semantic-provider-a", record, scopeIdentity }) {
  return {
    schemaVersion: "CIC_SEMANTIC_NEGATIVE_WITNESS_MATERIAL_V1",
    result: "ABSENT_PROVEN",
    providerId,
    semanticKey: record.semanticKey,
    semanticKind: record.semanticKind,
    queryClass: record.absenceQueryClass,
    scopeIdentity,
  };
}

function baseWitness(overrides = {}, algorithm = "FAST") {
  return {
    schemaVersion: `CIC_SEMANTIC_${algorithm}_CLOSURE_WITNESS_V1`,
    status: "COMPLETE",
    authorityState: "UNPROVEN",
    projectionSetIdentity: hash("projection-set"),
    requestedRoots: ["component.root"],
    closureMembers: ["component.root"],
    absentProven: ["component.optional"],
    unknownKeys: [],
    unresolvedKeys: [],
    ownerProviderConflicts: [],
    consultedOwnerIdentities: [hash("owner")],
    consultedProviderIdentities: [hash("provider")],
    followedDependencyEdges: [
      {
        edgeIdentity: hash("edge"),
        sourceSemanticKey: "component.root",
        targetSemanticKey: "component.optional",
        originOwnerIdentity: hash("owner"),
        originProviderIdentity: hash("provider"),
        originProviderBindingIdentity: hash("provider-binding"),
        originProviderInputIdentity: hash("provider-input"),
        originProjectionIdentity: hash("projection"),
        originEvidenceIdentities: [hash("evidence")],
        originSupportingEvidenceIdentities: [],
      },
    ],
    ...(algorithm === "FAST"
      ? { traversalTrace: [{ sequence: 0, semanticKey: "component.root" }] }
      : { fixedPointTrace: [{ pass: 1, additions: ["component.root"] }] }),
    findings: [],
    witnessIdentity: hash(`${algorithm}-witness`),
    ...overrides,
  };
}

function physicalFixture(overrides = {}) {
  return {
    head: {
      authorizationHeadIdentity: hash("head"),
      generation: 1,
      state: "ACTIVE",
    },
    authorization: {
      authorizationIdentity: hash("authorization"),
      taskIdentity: hash("task"),
      taskContractIdentity: hash("task-contract"),
      semanticOwners: [hash("owner")],
    },
    currentTruth: {
      currentTruthIdentity: hash("current-truth"),
      sourceGeneration: { fingerprint: hash("source") },
      repository: {
        repositoryIdentity: hash("repository"),
        snapshotFingerprint: hash("snapshot"),
        head: { commit: "a".repeat(40), tree: "b".repeat(40) },
      },
      context: {
        contextGenerationIdentity: hash("context"),
        taskMaterialFingerprint: hash("materials"),
      },
    },
    checkpoint: { record: { checkpointRecordIdentity: hash("checkpoint-record") } },
    checkpointContent: { checkpointContentIdentity: hash("checkpoint") },
    ...overrides,
  };
}

function declarationFixture(overrides = {}) {
  return {
    materialIdentity: hash("declaration-material"),
    bytes: 123,
    sha256: hash("declaration-sha"),
    ...overrides,
  };
}

function contextIntent() {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed semantic boundary excludes ${dimension}`,
    })),
  };
}

function truthRequest(materials) {
  return { materials: materials.map(({ id, path: materialPath }) => ({ id, path: materialPath })) };
}

async function createPhysicalFixture() {
  const temporaryAlias = await mkdtemp(path.join(tmpdir(), "cic-i5c-boundary-"));
  const temporary = await realpath(temporaryAlias);
  const worktreeRoot = path.join(temporary, "worktree");
  const stateRoot = path.join(temporary, "state");
  await runFile(
    GIT_EXECUTABLE,
    ["clone", "--local", "--no-hardlinks", REPOSITORY_ROOT, worktreeRoot],
    { windowsHide: true },
  );
  await runFile(
    GIT_EXECUTABLE,
    [
      "-C",
      worktreeRoot,
      "remote",
      "set-url",
      "origin",
      "https://github.com/caosvein/retrostage-maker.git",
    ],
    { windowsHide: true },
  );
  await mkdir(path.join(worktreeRoot, "tooling", "cic", "lib"), { recursive: true });
  await copyFile(
    path.join(REPOSITORY_ROOT, "tooling", "cic", "lib", "semantic-closure.mjs"),
    path.join(worktreeRoot, "tooling", "cic", "lib", "semantic-closure.mjs"),
  );
  await copyFile(
    path.join(REPOSITORY_ROOT, "tooling", "cic", "verify-semantic-closure.mjs"),
    path.join(worktreeRoot, "tooling", "cic", "verify-semantic-closure.mjs"),
  );
  const caseSpecs = [
    { name: "mixed", witnessMode: "valid" },
    { name: "present", witnessMode: null },
    { name: "unknown", witnessMode: null },
    { name: "no-witness", witnessMode: null },
    { name: "self-witness", witnessMode: null },
    { name: "wrong-provider", witnessMode: "wrong-provider" },
    { name: "wrong-key", witnessMode: "wrong-key" },
    { name: "wrong-kind", witnessMode: "wrong-kind" },
    { name: "wrong-query", witnessMode: "wrong-query" },
    { name: "wrong-scope", witnessMode: "wrong-scope" },
    { name: "replay", witnessMode: "valid" },
    { name: "malformed", witnessMode: "malformed" },
    { name: "oversized", witnessMode: "oversized" },
    { name: "nonportable", witnessMode: "nonportable" },
  ].map((entry) => ({
    ...entry,
    declarationId: `semantic-declaration-${entry.name}`,
    declarationPath: `semantic-cases/${entry.name}.declaration.json`,
    witnessId: `semantic-negative-witness-${entry.name}`,
    witnessPath: `semantic-cases/${entry.name}.negative-witness.json`,
  }));
  const scope = caseSpecs.flatMap((entry) => [
    entry.declarationPath,
    ...(entry.witnessMode === null ? [] : [entry.witnessPath]),
  ]);
  await mkdir(stateRoot, { recursive: true });
  await mkdir(path.join(worktreeRoot, "semantic-cases"), { recursive: true });

  const declarationTemplate = rawDeclaration();
  const ownerIdentity = defineSemanticOwnerRegistration(
    declarationTemplate.owners[0],
  ).ownerIdentity;
  const portableWorktreeIdentity = hash("physical-worktree");
  const authorityIdentity = hash("physical-authority");
  const task = defineTaskContract({
    taskIdentity: hash("physical-task"),
    taskName: "i5-c-semantic-boundary",
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope,
    owners: ["owner-a"],
    semanticOwners: [ownerIdentity],
    contextIntent: contextIntent(),
  });
  const providerDeclaration = declarationTemplate.providers[0];
  const providerIdentity = defineSemanticProviderRegistration({
    providerId: providerDeclaration.providerId,
    providerVersion: providerDeclaration.providerVersion,
    ownerIdentity,
    capabilities: providerDeclaration.capabilities,
    semanticKinds: providerDeclaration.semanticKinds,
    schemaFloor: providerDeclaration.schemaFloor,
    policyFloor: providerDeclaration.policyFloor,
  }).providerIdentity;
  const materials = [];
  const requests = {};
  const materialContents = new Map();
  for (const entry of caseSpecs) {
    let records;
    let requestedRoots = ["component.optional"];
    if (entry.name === "mixed") {
      requestedRoots = ["component.root"];
      records = [
        presentRecord("component.root", entry.declarationId, ["component.optional"]),
        absentRecord("component.optional", entry.witnessId),
      ];
    } else if (entry.name === "present") {
      requestedRoots = ["component.root"];
      records = [presentRecord("component.root", entry.declarationId)];
    } else if (entry.name === "unknown") {
      requestedRoots = ["component.unknown"];
      records = [unknownRecord("component.unknown")];
    } else if (entry.name === "no-witness") {
      records = [absentRecord("component.optional", null)];
    } else if (entry.name === "self-witness") {
      records = [absentRecord("component.optional", entry.declarationId)];
    } else if (entry.name === "replay") {
      requestedRoots = ["component.root"];
      records = [
        presentRecord("component.root", entry.declarationId, [
          "component.optional-a",
          "component.optional-b",
        ]),
        absentRecord("component.optional-a", entry.witnessId),
        absentRecord("component.optional-b", entry.witnessId),
      ];
    } else {
      records = [absentRecord("component.optional", entry.witnessId)];
    }
    const declaration = rawDeclaration({
      declarationMaterialId: entry.declarationId,
      records,
      requestedRoots,
    });
    const declarationText = `${canonicalJson(declaration)}\n`;
    await writeFile(path.join(worktreeRoot, entry.declarationPath), declarationText, "utf8");
    materials.push({ id: entry.declarationId, path: entry.declarationPath });
    materialContents.set(entry.declarationPath, declarationText);

    if (entry.witnessMode !== null) {
      const witnessRecord = records.find(({ presenceState }) => presenceState === "ABSENT_PROVEN");
      const expectedScopeIdentity = negativeWitnessScopeIdentity({
        scope,
        taskContractIdentity: task.taskContractIdentity,
        providerIdentity,
        record: witnessRecord,
        materialId: entry.witnessId,
        materialPath: entry.witnessPath,
      });
      let witness = negativeWitnessMaterial({
        record: witnessRecord,
        scopeIdentity: expectedScopeIdentity,
      });
      if (entry.witnessMode === "wrong-provider") {
        witness = { ...witness, providerId: "semantic-provider-b" };
      } else if (entry.witnessMode === "wrong-key") {
        witness = { ...witness, semanticKey: "component.other" };
      } else if (entry.witnessMode === "wrong-kind") {
        witness = { ...witness, semanticKind: "other-kind" };
      } else if (entry.witnessMode === "wrong-query") {
        witness = { ...witness, queryClass: "other-index" };
      } else if (entry.witnessMode === "wrong-scope") {
        witness = { ...witness, scopeIdentity: hash("wrong-scope") };
      } else if (entry.witnessMode === "malformed") {
        witness = { ...witness, extra: "forbidden" };
      } else if (entry.witnessMode === "nonportable") {
        witness = { ...witness, queryClass: "not portable" };
      }
      let witnessText = `${canonicalJson(witness)}\n`;
      if (entry.witnessMode === "oversized") witnessText = `${" ".repeat(17 * 1024)}${witnessText}`;
      await writeFile(path.join(worktreeRoot, entry.witnessPath), witnessText, "utf8");
      materials.push({ id: entry.witnessId, path: entry.witnessPath });
      materialContents.set(entry.witnessPath, witnessText);
    }
  }
  const domainInput = {
    repositoryRoot: worktreeRoot,
    worktreeRoot,
    stateRoot,
    repositoryIdentity: REPOSITORY_IDENTITY,
    taskIdentity: task.taskIdentity,
    portableWorktreeIdentity,
  };
  const candidate = await inspectStateDomainCandidate(domainInput);
  const domain = await recordStateDomainBinding({
    ...domainInput,
    expectedLocalStateStoreBindingIdentity: candidate.localStateStoreBindingIdentity,
  });
  await recordTaskContract(domainInput, task);
  const currentTruthRequest = truthRequest(materials);
  const truth = await observeCurrentTruth({
    ...domainInput,
    taskContractIdentity: task.taskContractIdentity,
    authorityIdentity,
    ...currentTruthRequest,
  });
  const decision = defineOwnerDecision({
    decisionKind: "AUTHORIZE",
    taskIdentity: task.taskIdentity,
    taskContractIdentity: task.taskContractIdentity,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    contextIntentIdentity: task.contextIntent.contextIntentIdentity,
    authorityIdentity,
    currentTruthIdentity: truth.currentTruthIdentity,
    actions: I4_ACTION_FLAGS,
    scope: task.scope,
    owners: task.owners,
    semanticOwners: task.semanticOwners,
    reasonClassification: "i5-c-boundary-physical-admission",
    reviewedEvidenceIdentities: [hash("reviewed-evidence")],
    expectedAuthorizationHeadIdentity: null,
    expectedHeadState: null,
    expectedHeadGeneration: 0,
    expectedCurrentAuthorizationIdentity: null,
  });
  await recordOwnerDecision(domainInput, decision);
  const admitted = await admitAuthorization({
    domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest,
  });
  for (const entry of caseSpecs) {
    requests[entry.name] = {
      schemaVersion: "CIC_SEMANTIC_CLOSURE_REQUEST_V1",
      domainInput,
      authorizationIdentity: admitted.authorization.authorizationIdentity,
      expectedAuthorizationHeadIdentity: admitted.head.authorizationHeadIdentity,
      currentTruthRequest,
      semanticDeclaration: { id: entry.declarationId, path: entry.declarationPath },
    };
  }
  return {
    temporary,
    worktreeRoot,
    stateRoot,
    request: requests.mixed,
    requests,
    caseSpecs: Object.fromEntries(caseSpecs.map((entry) => [entry.name, entry])),
    materialContents,
  };
}

beforeAll(async () => {
  fixture = await createPhysicalFixture();
  physicalClosureWitness = await verifySemanticClosure(fixture.requests.mixed);
  if (physicalClosureWitness.status !== "PASS") {
    throw new Error("SEMANTIC_CLOSURE_PASS_FIXTURE_UNAVAILABLE");
  }
}, 900_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
  if (fixture?.temporary) await rm(fixture.temporary, { recursive: true, force: true });
});

describe.sequential("CIC-I5-C semantic closure physical boundary", () => {
  test("accepts only the strict bounded raw declaration and normalizes permutations", () => {
    const first = parseSemanticDeclaration(rawDeclaration());
    const permuted = rawDeclaration();
    permuted.providers[0].capabilityRecords[0].records.reverse();
    expect(canonicalJson(parseSemanticDeclaration(permuted))).toBe(canonicalJson(first));
    expect(first.providers[0]).not.toHaveProperty("providerIdentity");
    expect(
      first.providers[0].capabilityRecords[0].records.map(({ presenceState }) => presenceState),
    ).toEqual(["ABSENT_PROVEN", "PRESENT"]);
  });

  test("structurally verifies content identity and deeply freezes a physical PASS witness", () => {
    const verified = verifySemanticClosureWitness(physicalClosureWitness);
    expect(verified).toEqual(physicalClosureWitness);
    expect(Object.isFrozen(verified)).toBe(true);
    expect(Object.isFrozen(verified.followedDependencyEdges)).toBe(true);
    expect(Object.isFrozen(verified.followedDependencyEdges[0])).toBe(true);
  });

  test("rejects aggregate-identity tamper with one stable fail-closed code", () => {
    const tampered = structuredClone(physicalClosureWitness);
    tampered.repositorySnapshotIdentity = hash("tampered-snapshot");
    expect(() => verifySemanticClosureWitness(tampered)).toThrowError(
      /SEMANTIC_CLOSURE_WITNESS_INVALID/u,
    );
  });

  test("rejects extra and missing PASS witness keys", () => {
    const extra = { ...physicalClosureWitness, claimedImpactAuthority: true };
    const missing = structuredClone(physicalClosureWitness);
    delete missing.currentTruthIdentity;
    for (const invalid of [extra, missing]) {
      expect(() => verifySemanticClosureWitness(invalid)).toThrowError(
        /SEMANTIC_CLOSURE_WITNESS_INVALID/u,
      );
    }
  });

  test("rejects self-consistent unresolved and non-PASS witness claims", () => {
    const unresolved = resealClosureWitness(physicalClosureWitness, {
      unresolvedKeys: ["component.unresolved"],
    });
    const blocked = resealClosureWitness(physicalClosureWitness, { status: "BLOCKED" });
    for (const invalid of [unresolved, blocked]) {
      expect(() => verifySemanticClosureWitness(invalid)).toThrowError(
        /SEMANTIC_CLOSURE_WITNESS_INVALID/u,
      );
    }
  });

  test("rejects fabricated caller authority, bound provider, projection, witness, and PASS claims", async () => {
    for (const forbiddenKey of [
      "currentFacts",
      "authorityClaim",
      "boundProviders",
      "semanticEvidence",
      "projectionSet",
      "fastWitness",
      "shadowWitness",
      "claimedCompleteness",
      "status",
    ]) {
      const result = await verifySemanticClosure({ ...fixture.request, [forbiddenKey]: {} });
      expect(result).toMatchObject({
        status: "BLOCKED",
        reasonCode: "SEMANTIC_CLOSURE_REQUEST_INVALID",
      });
    }
    const declaration = rawDeclaration();
    declaration.providers[0].providerIdentity = hash("fabricated-provider");
    expect(() => parseSemanticDeclaration(declaration)).toThrowError(
      /SEMANTIC_DECLARATION_INVALID/u,
    );
  });

  test.each([
    ["without a physical witness material", "no-witness"],
    ["when the declaration is its own witness", "self-witness"],
  ])(
    "blocks ABSENT_PROVEN %s",
    async (_label, caseName) => {
      await expect(verifySemanticClosure(fixture.requests[caseName])).resolves.toMatchObject({
        status: "BLOCKED",
        reasonCode: "SEMANTIC_ABSENCE_PHYSICAL_PROOF_UNAVAILABLE",
        mutationAuthorization: false,
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test(
    "keeps physically current PRESENT valid",
    async () => {
      await expect(verifySemanticClosure(fixture.requests.present)).resolves.toMatchObject({
        status: "PASS",
        closureMembers: ["component.root"],
        absentProven: [],
        unknownKeys: [],
        mutationAuthorization: false,
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test.each([
    ["provider", "wrong-provider"],
    ["semantic key", "wrong-key"],
    ["semantic kind", "wrong-kind"],
    ["query class", "wrong-query"],
    ["authorization scope", "wrong-scope"],
  ])(
    "blocks a physical negative witness with the wrong %s",
    async (_label, caseName) => {
      await expect(verifySemanticClosure(fixture.requests[caseName])).resolves.toMatchObject({
        status: "BLOCKED",
        reasonCode: "SEMANTIC_NEGATIVE_WITNESS_BINDING_MISMATCH",
        mutationAuthorization: false,
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test(
    "blocks physical negative-witness replay across semantic records",
    async () => {
      await expect(verifySemanticClosure(fixture.requests.replay)).resolves.toMatchObject({
        status: "BLOCKED",
        reasonCode: "SEMANTIC_NEGATIVE_WITNESS_REPLAY",
        mutationAuthorization: false,
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test.each([
    ["malformed", "malformed"],
    ["oversized", "oversized"],
    ["nonportable", "nonportable"],
  ])(
    "blocks a %s physical negative-witness artifact",
    async (_label, caseName) => {
      await expect(verifySemanticClosure(fixture.requests[caseName])).resolves.toMatchObject({
        status: "BLOCKED",
        reasonCode: "SEMANTIC_NEGATIVE_WITNESS_INVALID",
        mutationAuthorization: false,
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test(
    "ignores caller-supplied witness checksums and trusts the physical I4 observation",
    async () => {
      const request = structuredClone(fixture.requests.mixed);
      request.currentTruthRequest.materials = request.currentTruthRequest.materials.map(
        (material) =>
          material.id === fixture.caseSpecs.mixed.witnessId
            ? { ...material, sha256: hash("mismatched-witness-bytes") }
            : material,
      );
      const result = await verifySemanticClosure(request);
      expect(result).toMatchObject({
        status: "PASS",
        closureMembers: ["component.root"],
        absentProven: ["component.optional"],
        unknownKeys: [],
        mutationAuthorization: false,
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test(
    "blocks a stale or replaced physical negative-witness material after authorization",
    async () => {
      const witnessPath = fixture.caseSpecs.mixed.witnessPath;
      const absolute = path.join(fixture.worktreeRoot, witnessPath);
      const original = fixture.materialContents.get(witnessPath);
      try {
        await writeFile(absolute, `${original} `, "utf8");
        const result = await verifySemanticClosure(fixture.requests.mixed);
        expect(result).toMatchObject({ status: "BLOCKED", mutationAuthorization: false });
        expect(result.reasonCode).not.toBeNull();
      } finally {
        await writeFile(absolute, original, "utf8");
      }
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test("compares exact material fields and ignores only algorithm-specific trace identities", () => {
    const fast = baseWitness({}, "FAST");
    const shadow = baseWitness(
      {
        schemaVersion: "AN_INDEPENDENT_SCHEMA",
        witnessIdentity: hash("different-shadow-witness"),
        fixedPointTrace: [{ pass: "FINAL_NO_CHANGE_VERIFICATION", additions: [] }],
      },
      "SHADOW",
    );
    expect(compareSemanticClosureWitnesses(fast, shadow).status).toBe("AGREED_COMPLETE");
  });

  test.each([
    ["member", { closureMembers: ["component.other"] }],
    ["absence/unknown", { absentProven: [], unknownKeys: ["component.optional"] }],
    [
      "unresolved reason",
      {
        unresolvedKeys: ["component.missing"],
        findings: [{ code: "SEMANTIC_DEPENDENCY_UNRESOLVED", semanticKey: "component.missing" }],
      },
    ],
    ["owner consultation", { consultedOwnerIdentities: [hash("other-owner")] }],
    ["provider consultation", { consultedProviderIdentities: [hash("other-provider")] }],
    ["projection identity", { projectionSetIdentity: hash("other-projection") }],
  ])("blocks %s disagreement without union, intersection, or preference", (_label, change) => {
    expect(
      compareSemanticClosureWitnesses(baseWitness(), baseWitness(change, "SHADOW")).status,
    ).toBe("CLOSURE_DISAGREEMENT");
  });

  test("compares the complete enriched dependency-edge provenance body", () => {
    const shadow = baseWitness({}, "SHADOW");
    shadow.followedDependencyEdges = shadow.followedDependencyEdges.map((edge) => ({
      ...edge,
      originProviderInputIdentity: hash("tampered-input"),
    }));
    expect(compareSemanticClosureWitnesses(baseWitness(), shadow).status).toBe(
      "CLOSURE_DISAGREEMENT",
    );
  });

  test("blocks FAST/SHADOW status asymmetry and keeps equal BLOCKED derivations blocked", () => {
    expect(
      compareSemanticClosureWitnesses(
        baseWitness({
          status: "BLOCKED",
          findings: [{ code: "CLOSURE_BOUND_EXCEEDED", semanticKey: null }],
        }),
        baseWitness({}, "SHADOW"),
      ).status,
    ).toBe("CLOSURE_DISAGREEMENT");
    expect(
      compareSemanticClosureWitnesses(
        baseWitness({}, "FAST"),
        baseWitness(
          { status: "BLOCKED", findings: [{ code: "CLOSURE_NON_CONVERGENT", semanticKey: null }] },
          "SHADOW",
        ),
      ).status,
    ).toBe("CLOSURE_DISAGREEMENT");
    const blockedFinding = [{ code: "SEMANTIC_PRESENCE_UNKNOWN", semanticKey: "component.root" }];
    expect(
      compareSemanticClosureWitnesses(
        baseWitness({
          status: "BLOCKED",
          unknownKeys: ["component.root"],
          findings: blockedFinding,
        }),
        baseWitness(
          { status: "BLOCKED", unknownKeys: ["component.root"], findings: blockedFinding },
          "SHADOW",
        ),
      ).status,
    ).toBe("AGREED_BLOCKED");
  });

  test("normalizes material arrays deterministically but never ignores material differences", () => {
    const fast = baseWitness({ closureMembers: ["component.z", "component.root"] });
    const shadow = baseWitness({ closureMembers: ["component.root", "component.z"] }, "SHADOW");
    expect(compareSemanticClosureWitnesses(fast, shadow).status).toBe("AGREED_COMPLETE");
    shadow.findings = [{ code: "UNEXPECTED", semanticKey: null }];
    expect(compareSemanticClosureWitnesses(fast, shadow).status).toBe("CLOSURE_DISAGREEMENT");
  });

  test.each([
    [
      "Source generation",
      (value) => ({
        ...value,
        currentTruth: {
          ...value.currentTruth,
          sourceGeneration: { fingerprint: hash("moved-source") },
        },
      }),
    ],
    [
      "repository snapshot",
      (value) => ({
        ...value,
        currentTruth: {
          ...value.currentTruth,
          repository: {
            ...value.currentTruth.repository,
            snapshotFingerprint: hash("moved-snapshot"),
          },
        },
      }),
    ],
    [
      "repository HEAD",
      (value) => ({
        ...value,
        currentTruth: {
          ...value.currentTruth,
          repository: {
            ...value.currentTruth.repository,
            head: { ...value.currentTruth.repository.head, commit: "c".repeat(40) },
          },
        },
      }),
    ],
    [
      "repository tree",
      (value) => ({
        ...value,
        currentTruth: {
          ...value.currentTruth,
          repository: {
            ...value.currentTruth.repository,
            head: { ...value.currentTruth.repository.head, tree: "d".repeat(40) },
          },
        },
      }),
    ],
    [
      "authorization head",
      (value) => ({
        ...value,
        head: { ...value.head, authorizationHeadIdentity: hash("moved-head") },
      }),
    ],
    [
      "revocation",
      (value) => ({ ...value, head: { ...value.head, state: "REVOKED", generation: 2 } }),
    ],
    [
      "task contract",
      (value) => ({
        ...value,
        authorization: { ...value.authorization, taskContractIdentity: hash("moved-contract") },
      }),
    ],
    [
      "context",
      (value) => ({
        ...value,
        currentTruth: {
          ...value.currentTruth,
          context: {
            ...value.currentTruth.context,
            contextGenerationIdentity: hash("moved-context"),
          },
        },
      }),
    ],
    [
      "task material",
      (value) => ({
        ...value,
        currentTruth: {
          ...value.currentTruth,
          context: {
            ...value.currentTruth.context,
            taskMaterialFingerprint: hash("moved-materials"),
          },
        },
      }),
    ],
  ])("classifies %s movement as PHYSICAL_CURRENTNESS_MOVED", (_label, mutate) => {
    const initialVerified = physicalFixture();
    const initial = physicalBindingSnapshot(initialVerified, declarationFixture());
    const final = physicalBindingSnapshot(mutate(initialVerified), declarationFixture());
    expect(comparePhysicalCurrentness(initial, final)).toEqual({
      status: "BLOCKED",
      reasonCode: "PHYSICAL_CURRENTNESS_MOVED",
    });
  });

  test("runs the physically admitted PRESENT and ABSENT_PROVEN closure through CLI exit 0", async () => {
    const outcome = await runCli(["--json"], fixture.worktreeRoot, { request: fixture.request });
    const result = JSON.parse(outcome.stdout);
    expect(outcome).toMatchObject({ exitCode: 0, stderr: "" });
    expect(outcome.stdout.endsWith("\n")).toBe(true);
    expect(outcome.stdout.trimEnd().includes("\n")).toBe(false);
    expect(result).toMatchObject({
      schemaVersion: "CIC_SEMANTIC_CLOSURE_WITNESS_V1",
      status: "PASS",
      authorityScope: "READ_ONLY_SEMANTIC_COMPLETENESS",
      mutationAuthorization: false,
      authorizationState: "ACTIVE",
      requestedRoots: ["component.root"],
      closureMembers: ["component.root"],
      absentProven: ["component.optional"],
      unknownKeys: [],
      unresolvedKeys: [],
      findings: [],
    });
    expect(result.followedDependencyEdges[0]).toMatchObject({
      sourceSemanticKey: "component.root",
      targetSemanticKey: "component.optional",
    });
    expect(result.followedDependencyEdges[0].originEvidenceIdentities).toHaveLength(1);
    expect(result.closureWitnessIdentity).toMatch(/^[0-9A-F]{64}$/u);
  }, 900_000);

  test(
    "keeps UNKNOWN distinct from ABSENT_PROVEN through verifySemanticClosure",
    async () => {
      const result = await verifySemanticClosure(fixture.requests.unknown);
      expect(result).toMatchObject({
        status: "BLOCKED",
        reasonCode: "AGREED_BLOCKED",
        mutationAuthorization: false,
        details: {
          absentProven: [],
          unknownKeys: ["component.unknown"],
        },
      });
    },
    PHYSICAL_TEST_TIMEOUT_MS,
  );

  test("uses CLI exit 2 for governed blockers and exit 64 for usage", async () => {
    const blocked = await runCli(["--json"], fixture.worktreeRoot, {
      request: { ...fixture.request, claimedCompleteness: "PASS" },
    });
    const usage = await runCli([], fixture.worktreeRoot);
    expect(blocked.exitCode).toBe(2);
    expect(JSON.parse(blocked.stdout)).toMatchObject({
      status: "BLOCKED",
      mutationAuthorization: false,
    });
    expect(usage.exitCode).toBe(64);
    expect(JSON.parse(usage.stdout)).toMatchObject({
      status: "USAGE_ERROR",
      reasonCode: "CLI_USAGE_INVALID",
    });
  });

  test("rejects CLI path escape, non-regular files, invalid UTF-8, and symbolic links", async () => {
    const invalidUtf = path.join(fixture.worktreeRoot, "invalid-request.json");
    const targetDirectory = path.join(fixture.worktreeRoot, "request-target");
    const link = path.join(fixture.worktreeRoot, "request-link");
    await writeFile(invalidUtf, new Uint8Array([0xc3, 0x28]));
    await mkdir(targetDirectory);
    await writeFile(path.join(targetDirectory, "request.json"), "{}\n", "utf8");
    await symlink(targetDirectory, link, "junction");
    const escape = await runCli(["--json", "../outside.json"], fixture.worktreeRoot);
    const directory = await runCli(["--json", ".git"], fixture.worktreeRoot);
    const utf = await runCli(["--json", "invalid-request.json"], fixture.worktreeRoot);
    const symbolic = await runCli(["--json", "request-link/request.json"], fixture.worktreeRoot);
    expect([escape, directory, utf, symbolic].map(({ exitCode }) => exitCode)).toEqual([
      2, 2, 2, 2,
    ]);
    expect(JSON.parse(utf.stdout).reasonCode).toBe("CLI_REQUEST_INVALID_UTF8");
    expect(JSON.parse(symbolic.stdout).reasonCode).toBe("CLI_REQUEST_NOT_REGULAR");
  });

  test("contains no mutation, write-preimage, pack-activation, Git-write, or CI-control imports", async () => {
    const sources = await Promise.all([
      readFile(path.join(REPOSITORY_ROOT, "tooling/cic/lib/semantic-closure.mjs"), "utf8"),
      readFile(path.join(REPOSITORY_ROOT, "tooling/cic/verify-semantic-closure.mjs"), "utf8"),
    ]);
    for (const source of sources) {
      expect(source).not.toMatch(
        /acquireMutationLease|write-preimage|activatePack|invalidatePack/u,
      );
      expect(source).not.toMatch(
        /execFile|spawn|git\s+(?:add|commit|push|reset|clean)|workflow_dispatch/u,
      );
      expect(source).not.toMatch(/writeFile|appendFile|rename|unlink|mkdir|rm\(/u);
    }
  });
});
