import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { sha256Hex } from "./lib/identity.mjs";
import {
  VALIDATION_CURRENT_FACTS_SCHEMA,
  VALIDATION_DISPOSITIONS,
  VALIDATION_RESULT_SCHEMA,
  buildValidationEvidence,
  evaluateValidationEvidence,
  evidenceManifestIdentity,
  inspectValidationEvidence,
} from "./lib/validation-evidence.mjs";
import { run as runCli } from "./verify-validation-evidence.mjs";

const hash = (value) => sha256Hex(`vopt-a2-validation-evidence:${value}`);
const tree = "98d33473e025d2da9bf4b958ff78c2011177b458";
const clone = (value) => JSON.parse(JSON.stringify(value));

function baseInput() {
  return {
    validationPlanId: hash("plan"),
    commandIdentities: [
      { commandId: "full", identity: hash("pnpm run test") },
      { commandId: "workflow", identity: hash("pnpm run workflow:check") },
    ],
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
    population: { issues: 0, skipped: 0, testFiles: 2, tests: 5 },
    startFingerprint: hash("material"),
    endFingerprint: hash("material"),
    evidenceManifestEntries: [
      { bytes: 12, path: "evidence/full.stdout.log", sha256: hash("stdout") },
      { bytes: 0, path: "evidence/full.stderr.log", sha256: hash("stderr") },
    ],
    executedTestFiles: [
      { path: "tooling/cic/validation-evidence.test.mjs", result: "PASS" },
      { path: "tooling/cic/validation-plan.test.mjs", result: "PASS" },
    ],
    lifecycle: { knownCorrectnessBlockers: [], superseded: false },
    factAuthority: "NON_AUTHORITATIVE_INPUT",
  };
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

function reverseProperties(value) {
  if (Array.isArray(value)) return value.map(reverseProperties);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, entry]) => [key, reverseProperties(entry)]),
  );
}

describe("CIC-VOPT-A2 validation evidence identity", () => {
  it("uses the exact versioned schema and exposes every fail-closed disposition", () => {
    const evidence = buildValidationEvidence(baseInput());
    expect(evidence.schemaVersion).toBe(VALIDATION_RESULT_SCHEMA);
    expect(VALIDATION_DISPOSITIONS).toEqual([
      "CURRENT",
      "REVALIDATION_REQUIRED",
      "INVALID_EVIDENCE",
    ]);
    expect(evidence.factAuthority).toBe("NON_AUTHORITATIVE_INPUT");
  });

  it("is byte and identity stable under property-order and manifest-entry variation", () => {
    const input = baseInput();
    const reordered = reverseProperties(input);
    reordered.evidenceManifestEntries.reverse();
    const first = buildValidationEvidence(input);
    const second = buildValidationEvidence(reordered);
    expect(second).toEqual(first);
    expect(second.validationResultIdentity).toBe(first.validationResultIdentity);
    expect(evidenceManifestIdentity(input.evidenceManifestEntries)).toBe(
      first.evidenceManifest.identity,
    );
  });

  it("changes identity when one material identity changes", () => {
    const first = buildValidationEvidence(baseInput());
    const changed = baseInput();
    changed.environment.identity = hash("other-environment");
    const second = buildValidationEvidence(changed);
    expect(second.validationResultIdentity).not.toBe(first.validationResultIdentity);
  });

  it.each(["FAIL", "UNKNOWN"])("rejects a %s validation result", (result) => {
    const input = baseInput();
    input.result = result;
    expect(inspectValidationEvidence(buildValidationEvidence(input))).toMatchObject({
      disposition: "INVALID_EVIDENCE",
      reasonCodes: [`VALIDATION_RESULT_${result}`],
    });
  });

  it("rejects a missing field and schema mismatch", () => {
    const missing = buildValidationEvidence(baseInput());
    delete missing.materials;
    expect(inspectValidationEvidence(missing).reasonCodes).toContain(
      "VALIDATION_EVIDENCE_SHAPE_INVALID",
    );

    const mismatched = buildValidationEvidence(baseInput());
    mismatched.schemaVersion = "CIC-VALIDATION-RESULT-IDENTITY/2";
    expect(inspectValidationEvidence(mismatched)).toMatchObject({
      disposition: "INVALID_EVIDENCE",
      reasonCodes: ["SCHEMA_MISMATCH"],
    });
  });

  it("rejects a start/end material race", () => {
    const input = baseInput();
    input.endFingerprint = hash("moved-material");
    expect(inspectValidationEvidence(buildValidationEvidence(input))).toMatchObject({
      disposition: "INVALID_EVIDENCE",
      reasonCodes: ["MATERIAL_FINGERPRINT_RACE"],
    });
  });

  it("rejects evidence-manifest tamper", () => {
    const evidence = buildValidationEvidence(baseInput());
    evidence.evidenceManifest.entries[0].sha256 = hash("tampered");
    expect(inspectValidationEvidence(evidence)).toMatchObject({
      disposition: "INVALID_EVIDENCE",
      reasonCodes: ["EVIDENCE_MANIFEST_MISMATCH"],
    });
  });

  it("rejects skip policy and revalidates population drift", () => {
    const skipped = baseInput();
    skipped.population.skipped = 1;
    expect(inspectValidationEvidence(buildValidationEvidence(skipped)).reasonCodes).toContain(
      "SKIP_POLICY_MISMATCH",
    );

    const evidence = buildValidationEvidence(baseInput());
    const current = currentFacts(evidence);
    current.population.tests += 1;
    expect(evaluateValidationEvidence(evidence, current)).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["POPULATION_MISMATCH"],
    });
  });

  it.each([
    [
      "source generation",
      (value) => (value.sourceGeneration.generationFingerprint = hash("s2")),
      "SOURCE_GENERATION_STALE",
    ],
    [
      "repository tree",
      (value) => (value.repository.treeIdentity = "a".repeat(40)),
      "REPOSITORY_TREE_OR_VIEW_STALE",
    ],
    [
      "test identity",
      (value) => (value.materials.testIdentity = hash("t2")),
      "TEST_IDENTITY_STALE",
    ],
    [
      "config identity",
      (value) => (value.materials.configIdentity = hash("c2")),
      "CONFIG_IDENTITY_STALE",
    ],
    [
      "fixture identity",
      (value) => (value.materials.fixtureIdentity = hash("f2")),
      "FIXTURE_IDENTITY_STALE",
    ],
    [
      "environment",
      (value) => (value.environment.identity = hash("e2")),
      "ENVIRONMENT_IDENTITY_STALE",
    ],
    [
      "toolchain",
      (value) => (value.environment.toolchainIdentity = hash("tc2")),
      "TOOLCHAIN_IDENTITY_STALE",
    ],
    [
      "capability",
      (value) => (value.capability.generation = hash("cap2")),
      "CAPABILITY_IDENTITY_STALE",
    ],
    [
      "scenario/oracle",
      (value) => (value.scenarioOracle.generation = hash("oracle2")),
      "SCENARIO_ORACLE_STALE",
    ],
  ])("requires revalidation after %s drift", (_label, mutate, reason) => {
    const evidence = buildValidationEvidence(baseInput());
    const current = currentFacts(evidence);
    mutate(current);
    expect(evaluateValidationEvidence(evidence, current)).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: [reason],
    });
  });

  it("requires revalidation for supersession and a known blocker", () => {
    const evidence = buildValidationEvidence(baseInput());
    const superseded = currentFacts(evidence);
    superseded.supersededEvidenceIdentities = [evidence.validationResultIdentity];
    expect(evaluateValidationEvidence(evidence, superseded).reasonCodes).toContain(
      "EVIDENCE_SUPERSEDED",
    );

    const blocked = currentFacts(evidence);
    blocked.knownCorrectnessBlockers = ["H-NEW"];
    expect(evaluateValidationEvidence(evidence, blocked).reasonCodes).toContain(
      "KNOWN_CORRECTNESS_BLOCKER",
    );
  });

  it("treats missing or UNKNOWN current truth as revalidation-required", () => {
    const evidence = buildValidationEvidence(baseInput());
    const missing = currentFacts(evidence);
    delete missing.environment;
    expect(evaluateValidationEvidence(evidence, missing)).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["CURRENT_FACTS_INVALID_OR_UNKNOWN"],
    });

    const unknown = currentFacts(evidence);
    unknown.materialFingerprint = "UNKNOWN";
    expect(evaluateValidationEvidence(evidence, unknown)).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: ["CURRENT_FACTS_INVALID_OR_UNKNOWN"],
    });
  });

  it("returns CURRENT only for an exact valid record and current-fact set", () => {
    const evidence = buildValidationEvidence(baseInput());
    expect(evaluateValidationEvidence(evidence, currentFacts(evidence))).toMatchObject({
      disposition: "CURRENT",
      reasonCodes: [],
      validationResultIdentity: evidence.validationResultIdentity,
      factAuthority: "NON_AUTHORITATIVE_INPUT",
    });
  });

  it("CLI verifies JSON documents without promoting caller facts to physical authority", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "cic-vopt-a2-"));
    try {
      const evidence = buildValidationEvidence(baseInput());
      await writeFile(path.join(root, "evidence.json"), JSON.stringify(evidence));
      await writeFile(path.join(root, "current.json"), JSON.stringify(currentFacts(evidence)));
      const outcome = await runCli(["--json", "evidence.json", "current.json"], root);
      expect(outcome.exitCode).toBe(0);
      expect(JSON.parse(outcome.stdout)).toMatchObject({
        disposition: "CURRENT",
        factAuthority: "NON_AUTHORITATIVE_INPUT",
      });
      expect(outcome.stderr).toBe("");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
