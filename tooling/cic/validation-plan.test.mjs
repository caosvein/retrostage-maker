import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { sha256Hex } from "./lib/identity.mjs";
import {
  VALIDATION_CURRENT_FACTS_SCHEMA,
  buildValidationEvidence,
} from "./lib/validation-evidence.mjs";
import {
  VALIDATION_PHASES,
  VALIDATION_PLAN_REQUESTS,
  VALIDATION_REVALIDATION_SCOPES,
  confirmSupersetExecution,
  createFullSuiteMembershipProof,
  createValidationExecutionPlan,
  evaluatePhaseCarryForward,
} from "./lib/validation-plan.mjs";

const CIC_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CIC_ROOT, "../..");
const hash = (value) => sha256Hex(`vopt-a2-validation-plan:${value}`);
const tree = "98d33473e025d2da9bf4b958ff78c2011177b458";
const clone = (value) => JSON.parse(JSON.stringify(value));
const PLAN_ID = hash("current-pre-i5-final-plan");
const FULL_COMMAND = hash("pnpm run test");
const I4_TARGETED = Object.freeze([
  "tooling/cic/task-authorization.test.mjs",
  "tooling/cic/write-preimage.test.mjs",
  "tooling/cic/pack-lifecycle.test.mjs",
  "tooling/cic/task-pack-boundary.test.mjs",
]);
const CIC_FOCUSED = Object.freeze([
  "tooling/cic/source-generation.test.mjs",
  "tooling/cic/product-boundary.test.mjs",
  "tooling/cic/repository-identity.test.mjs",
  "tooling/cic/execution-capabilities.test.mjs",
  "tooling/cic/repository-boundary.test.mjs",
  "tooling/cic/context-provider.test.mjs",
  "tooling/cic/context-closure.test.mjs",
  "tooling/cic/context-compiler.test.mjs",
  "tooling/cic/context-boundary.test.mjs",
  ...I4_TARGETED,
]);

async function discoverRepositoryTests() {
  const result = [];
  const skippedDirectories = new Set([".git", "coverage", "dist", "node_modules", "out"]);
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && /\.test\.(?:[cm]?[jt]sx?)$/u.test(entry.name)) {
        result.push(path.relative(REPOSITORY_ROOT, absolute).replaceAll("\\", "/"));
      }
    }
  }
  for (const root of ["apps", "compliance", "packages", "tooling"]) {
    await visit(path.join(REPOSITORY_ROOT, root));
  }
  return result.sort();
}

function gates(fullFiles) {
  return [
    {
      gateId: "i4-targeted",
      kind: "DIRECT",
      mandatory: true,
      commandIdentity: hash("i4-targeted-command"),
      requiredTestFiles: [...I4_TARGETED],
    },
    {
      gateId: "cic-focused",
      kind: "DIRECT",
      mandatory: true,
      commandIdentity: hash("cic-focused-command"),
      requiredTestFiles: [...CIC_FOCUSED],
    },
    {
      gateId: "full",
      kind: "FULL_SUITE",
      mandatory: true,
      commandIdentity: FULL_COMMAND,
      requiredTestFiles: fullFiles,
    },
  ];
}

function fullEvidence(files, commandIdentities = [{ commandId: "full", identity: FULL_COMMAND }]) {
  return buildValidationEvidence({
    validationPlanId: PLAN_ID,
    commandIdentities,
    sourceGeneration: {
      generationFingerprint: hash("source"),
      manifestIdentity: hash("source-manifest"),
    },
    repository: {
      repositoryIdentity: hash("repository"),
      treeIdentity: tree,
      view: { complete: true, shallow: false },
    },
    workingSet: {
      fingerprint: hash("working-set"),
      indexTreeIdentity: tree,
      treeIdentity: tree,
    },
    materials: {
      configIdentity: hash("config"),
      fixtureIdentity: hash("fixture"),
      testIdentity: hash("tests"),
    },
    environment: {
      identity: hash("environment"),
      toolchainIdentity: hash("toolchain"),
    },
    capability: { generation: hash("capability"), required: true },
    scenarioOracle: { generation: hash("scenario-oracle"), required: true },
    result: "PASS",
    population: {
      issues: 0,
      skipped: 0,
      testFiles: files.length,
      tests: files.length + 100,
    },
    startFingerprint: hash("material"),
    endFingerprint: hash("material"),
    evidenceManifestEntries: [{ bytes: 1, path: "evidence/full.log", sha256: hash("full-log") }],
    executedTestFiles: files.map((file) => ({ path: file, result: "PASS" })),
    lifecycle: { knownCorrectnessBlockers: [], superseded: false },
    factAuthority: "NON_AUTHORITATIVE_INPUT",
  });
}

function currentFacts(evidence) {
  return {
    schemaVersion: VALIDATION_CURRENT_FACTS_SCHEMA,
    validationPlanId: evidence.validationPlanId,
    commandIdentities: clone(evidence.commandIdentities),
    sourceGeneration: clone(evidence.sourceGeneration),
    repository: clone(evidence.repository),
    workingSet: clone(evidence.workingSet),
    materials: clone(evidence.materials),
    environment: clone(evidence.environment),
    capability: clone(evidence.capability),
    scenarioOracle: clone(evidence.scenarioOracle),
    population: clone(evidence.population),
    evidenceManifestIdentity: evidence.evidenceManifest.identity,
    materialFingerprint: evidence.endFingerprint,
    supersededEvidenceIdentities: [],
    knownCorrectnessBlockers: [],
  };
}

function makePlan(files, request = "SAFE_SUPERSET_DEDUP", proofFiles = files) {
  return createValidationExecutionPlan({
    validationPlanId: PLAN_ID,
    request,
    gates: gates(files),
    membershipProof:
      proofFiles === null
        ? null
        : createFullSuiteMembershipProof({
            validationPlanId: PLAN_ID,
            fullGateId: "full",
            testFiles: proofFiles,
          }),
  });
}

function phaseFixture() {
  const evidence = fullEvidence([
    "tooling/cic/validation-evidence.test.mjs",
    "tooling/cic/validation-plan.test.mjs",
  ]);
  return { evidence, currentFacts: currentFacts(evidence) };
}

describe("CIC-VOPT-A2 conservative phase proof semantics", () => {
  it("exposes exactly the governed phase and plan-request vocabulary", () => {
    expect(VALIDATION_PHASES).toEqual([
      "IMPLEMENT_FIX",
      "STAGE",
      "COMMIT",
      "PUSH_LOCAL",
      "NATURAL_CI",
      "CLOSURE",
    ]);
    expect(VALIDATION_PLAN_REQUESTS).toEqual(["SAFE_SUPERSET_DEDUP", "ADAPTIVE_PRUNING"]);
    expect(VALIDATION_REVALIDATION_SCOPES).toEqual([
      "NONE",
      "FALLBACK_DIRECT_GATES",
      "FULL_GOVERNED_PLAN",
    ]);
  });

  it("requires fresh behavior proof for IMPLEMENT_FIX and NATURAL_CI", () => {
    const fixture = phaseFixture();
    expect(evaluatePhaseCarryForward({ phase: "IMPLEMENT_FIX", ...fixture })).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["MATERIAL_MUTATION_REQUIRES_NEW_BEHAVIOR_PROOF"],
    });
    expect(evaluatePhaseCarryForward({ phase: "NATURAL_CI", ...fixture })).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["FRESH_NATURAL_CI_REQUIRED"],
    });
  });

  it("carries STAGE only across exact blob, tree, and path representation", () => {
    const fixture = phaseFixture();
    const proof = {
      candidateIdentity: hash("candidate"),
      stagedIdentity: hash("candidate"),
      reviewedWriteTree: tree,
      stagedWriteTree: tree,
      expectedPathIdentity: hash("paths"),
      stagedPathIdentity: hash("paths"),
    };
    expect(evaluatePhaseCarryForward({ phase: "STAGE", ...fixture, proof })).toMatchObject({
      disposition: "CURRENT",
      reasonCodes: [],
    });
    proof.stagedIdentity = hash("changed-stage");
    expect(evaluatePhaseCarryForward({ phase: "STAGE", ...fixture, proof })).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["STAGE_BLOB_MISMATCH"],
    });
  });

  it("carries COMMIT only across exact tree, parent, subject, and path/blob contract", () => {
    const fixture = phaseFixture();
    const proof = {
      reviewedWriteTree: tree,
      commitTree: tree,
      expectedParent: hash("parent"),
      commitParent: hash("parent"),
      expectedSubjectIdentity: hash("subject"),
      commitSubjectIdentity: hash("subject"),
      expectedPathBlobIdentity: hash("path-blobs"),
      commitPathBlobIdentity: hash("path-blobs"),
    };
    expect(evaluatePhaseCarryForward({ phase: "COMMIT", ...fixture, proof })).toMatchObject({
      disposition: "CURRENT",
    });
    proof.commitParent = hash("wrong-parent");
    expect(evaluatePhaseCarryForward({ phase: "COMMIT", ...fixture, proof })).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["COMMIT_PARENT_MISMATCH"],
    });
  });

  it("carries unchanged PUSH_LOCAL proof but keeps fresh natural CI mandatory", () => {
    const fixture = phaseFixture();
    const commit = hash("commit");
    const proof = {
      validatedCommit: commit,
      localCommit: commit,
      remotePreimageExpected: hash("remote-preimage"),
      remotePreimageObserved: hash("remote-preimage"),
      remotePostimageObserved: commit,
      fastForward: true,
    };
    expect(evaluatePhaseCarryForward({ phase: "PUSH_LOCAL", ...fixture, proof })).toMatchObject({
      disposition: "CURRENT",
      separateProofsRequired: ["FRESH_NATURAL_CI"],
    });
  });

  it("carries CLOSURE only when local, hosted, and publication identities remain exact", () => {
    const fixture = phaseFixture();
    const proof = {
      acceptedLocalEvidenceIdentity: hash("local"),
      currentLocalEvidenceIdentity: hash("local"),
      acceptedHostedEvidenceIdentity: hash("hosted"),
      currentHostedEvidenceIdentity: hash("hosted"),
      acceptedPublicationIdentity: hash("publication"),
      currentPublicationIdentity: hash("publication"),
    };
    expect(evaluatePhaseCarryForward({ phase: "CLOSURE", ...fixture, proof })).toMatchObject({
      disposition: "CURRENT",
    });
    proof.currentHostedEvidenceIdentity = hash("other-hosted");
    expect(evaluatePhaseCarryForward({ phase: "CLOSURE", ...fixture, proof })).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["HOSTED_EVIDENCE_MISMATCH"],
    });
  });
});

describe("CIC-VOPT-A2 safe full-superset deduplication", () => {
  it("proves the physical final full-suite membership covers targeted and focused gates", async () => {
    const files = await discoverRepositoryTests();
    expect(files).toEqual(
      expect.arrayContaining([
        ...CIC_FOCUSED,
        "tooling/cic/validation-evidence.test.mjs",
        "tooling/cic/validation-plan.test.mjs",
      ]),
    );
    const plan = makePlan(files);
    expect(plan).toMatchObject({
      disposition: "PLAN_READY",
      scheduledGateIds: ["full"],
      deduplicatedGateIds: ["i4-targeted", "cic-focused"],
      fallbackGateIds: ["i4-targeted", "cic-focused"],
      reasonCodes: [],
    });
    expect(plan.coverage.map(({ disposition }) => disposition)).toEqual([
      "COVERED_BY_FULL_SUPERSET",
      "COVERED_BY_FULL_SUPERSET",
    ]);

    const evidence = fullEvidence(files);
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "CURRENT",
      revalidationScope: "NONE",
      requiredGateIds: [],
      fallbackGateIds: [],
      governedPlanRebuildRequired: false,
      missingRequiredTestFiles: [],
    });
  });

  it("fails a Source-stale deduplicated plan back to every governed gate", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files);
    const evidence = fullEvidence(files);
    const facts = currentFacts(evidence);
    facts.sourceGeneration.generationFingerprint = hash("stale-source");
    expect(
      confirmSupersetExecution({ executionPlan: plan, evidence, currentFacts: facts }),
    ).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      revalidationScope: "FULL_GOVERNED_PLAN",
      requiredGateIds: ["i4-targeted", "cic-focused", "full"],
      fallbackGateIds: ["i4-targeted", "cic-focused", "full"],
      governedPlanRebuildRequired: false,
    });
  });

  it("fails repository-tree and toolchain drift back to every governed gate", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files);
    const evidence = fullEvidence(files);
    for (const mutate of [
      (facts) => {
        facts.repository.treeIdentity = hash("stale-tree");
      },
      (facts) => {
        facts.environment.toolchainIdentity = hash("stale-toolchain");
      },
    ]) {
      const facts = currentFacts(evidence);
      mutate(facts);
      expect(
        confirmSupersetExecution({ executionPlan: plan, evidence, currentFacts: facts }),
      ).toMatchObject({
        disposition: "REVALIDATION_REQUIRED",
        revalidationScope: "FULL_GOVERNED_PLAN",
        requiredGateIds: ["i4-targeted", "cic-focused", "full"],
      });
    }
  });

  it("preserves direct gates when membership proof is missing", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files, "SAFE_SUPERSET_DEDUP", null);
    expect(plan.scheduledGateIds).toEqual(["i4-targeted", "cic-focused", "full"]);
    expect(plan.deduplicatedGateIds).toEqual([]);
    expect(plan.reasonCodes).toContain("FULL_SUPERSET_MEMBERSHIP_UNPROVEN");
  });

  it("preserves a direct gate when full membership is incomplete", async () => {
    const files = await discoverRepositoryTests();
    const incomplete = files.filter((file) => file !== I4_TARGETED[0]);
    const plan = makePlan(files, "SAFE_SUPERSET_DEDUP", incomplete);
    expect(plan.scheduledGateIds).toContain("i4-targeted");
    expect(plan.coverage[0]).toMatchObject({
      directGateId: "i4-targeted",
      disposition: "DIRECT_GATE_PRESERVED",
    });
  });

  it("rejects a generic population total without exact direct-file PASS visibility", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files);
    const incompleteExecution = files.filter((file) => file !== I4_TARGETED[0]);
    const evidence = fullEvidence(incompleteExecution);
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      revalidationScope: "FALLBACK_DIRECT_GATES",
      requiredGateIds: ["i4-targeted", "cic-focused"],
      fallbackGateIds: ["i4-targeted", "cic-focused"],
      reasonCodes: ["DIRECT_FILE_EXECUTION_UNPROVEN"],
      missingRequiredTestFiles: [I4_TARGETED[0]],
    });
  });

  it("limits current missing coverage to the exact affected direct gate", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files);
    const focusedOnlyFile = "tooling/cic/source-generation.test.mjs";
    const evidence = fullEvidence(files.filter((file) => file !== focusedOnlyFile));
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      revalidationScope: "FALLBACK_DIRECT_GATES",
      requiredGateIds: ["cic-focused"],
      fallbackGateIds: ["cic-focused"],
      missingRequiredTestFiles: [focusedOnlyFile],
    });
  });

  it("defers adaptive pruning to CIC-I6 and schedules every mandatory gate", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files, "ADAPTIVE_PRUNING");
    expect(plan).toMatchObject({
      disposition: "DEFER_TO_CIC_I6",
      scheduledGateIds: ["i4-targeted", "cic-focused", "full"],
      deduplicatedGateIds: [],
      reasonCodes: ["ADAPTIVE_PRUNING_NOT_AUTHORIZED"],
    });
    const evidence = fullEvidence(files);
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      revalidationScope: "FULL_GOVERNED_PLAN",
      requiredGateIds: ["i4-targeted", "cic-focused", "full"],
      reasonCodes: ["EXECUTION_PLAN_NOT_READY"],
    });
  });

  it("requires the full governed plan when the full-suite command is unproven", async () => {
    const files = await discoverRepositoryTests();
    const plan = makePlan(files);
    const evidence = fullEvidence(files, [{ commandId: "other", identity: hash("other-command") }]);
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      revalidationScope: "FULL_GOVERNED_PLAN",
      requiredGateIds: ["i4-targeted", "cic-focused", "full"],
      reasonCodes: ["FULL_SUITE_COMMAND_UNPROVEN"],
    });
  });

  it("requires governed-plan rebuild when no full-suite gate is scheduled", async () => {
    const files = await discoverRepositoryTests();
    const plan = createValidationExecutionPlan({
      validationPlanId: PLAN_ID,
      request: "SAFE_SUPERSET_DEDUP",
      gates: gates(files).filter(({ kind }) => kind === "DIRECT"),
      membershipProof: null,
    });
    const evidence = fullEvidence(files);
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "INVALID_EVIDENCE",
      revalidationScope: "FULL_GOVERNED_PLAN",
      requiredGateIds: null,
      fallbackGateIds: null,
      governedPlanRebuildRequired: true,
      reasonCodes: ["FULL_SUITE_NOT_SCHEDULED"],
    });
  });

  it("requires governed-plan rebuild when an execution plan is invalid", async () => {
    const files = await discoverRepositoryTests();
    const plan = clone(makePlan(files));
    plan.executionPlanIdentity = hash("invalid-plan");
    const evidence = fullEvidence(files);
    expect(
      confirmSupersetExecution({
        executionPlan: plan,
        evidence,
        currentFacts: currentFacts(evidence),
      }),
    ).toMatchObject({
      disposition: "INVALID_EVIDENCE",
      revalidationScope: "FULL_GOVERNED_PLAN",
      requiredGateIds: null,
      fallbackGateIds: null,
      governedPlanRebuildRequired: true,
      reasonCodes: ["EXECUTION_PLAN_INVALID"],
    });
  });

  it("keeps all production paths development-only, read-only, and mutation-free", async () => {
    for (const relativePath of [
      "lib/validation-evidence.mjs",
      "lib/validation-plan.mjs",
      "verify-validation-evidence.mjs",
    ]) {
      const source = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      expect(source).not.toMatch(
        /node:child_process|node:http|node:https|node:net|node:tls|\bfetch\s*\(/u,
      );
      expect(source).not.toMatch(/\b(?:writeFile|appendFile|rename|unlink|rm|mkdir|open)\s*\(/u);
      expect(source).not.toMatch(/\bgit\s+(?:add|commit|push|reset|clean|stash|merge|rebase)\b/iu);
      expect(source).not.toMatch(/\b(?:stage|commit|push|dispatch|activate)CIC\s*\(/u);
    }
  });
});
