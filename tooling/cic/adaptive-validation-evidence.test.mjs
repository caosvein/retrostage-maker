import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import { ADAPTIVE_VALIDATION_PLAN_SCHEMA } from "./lib/adaptive-validation-plan.mjs";
import {
  ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA,
  ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA,
  ADAPTIVE_VALIDATION_CURRENT_FACTS_SCHEMA,
  ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA,
  ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA,
  ADAPTIVE_VALIDATION_REPLAY_SCHEMA,
  ADAPTIVE_VALIDATION_RESULTS,
  ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA,
  ADAPTIVE_VALIDATION_STALENESS_DISPOSITIONS,
  ADAPTIVE_VALIDATION_STALENESS_SCHEMA,
  adaptiveValidationPlanContentIdentity,
  appendAdaptiveValidationAttempt,
  bindProvenUnaffectedAdaptiveEvidence,
  buildAdaptiveValidationEvidence,
  createAdaptiveValidationAttemptLedger,
  defineAdaptiveValidationPriorLifecycle,
  evaluateAdaptiveValidationEvidence,
  verifyAdaptiveValidationAttempt,
  verifyAdaptiveValidationAttemptLedger,
  verifyAdaptiveValidationEvidence,
  verifyAdaptiveValidationPriorLifecycle,
  verifyAdaptiveValidationReuseEvidence,
} from "./lib/adaptive-validation-evidence.mjs";

function hash(label) {
  return sha256Hex("adaptive-validation-evidence-test:" + label);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function recordIdentity(schema, body) {
  return sha256Hex(schema + "\n" + canonicalJson(body) + "\n");
}

const scenarioIdentity = hash("scenario");
const scenarioRevisionIdentity = hash("scenario-revision");
const oracleIdentity = hash("oracle");
const implementationBindingIdentity = hash("implementation-binding");
const actionIdentity = hash("scenario-action");
const commandIdentity = hash("scenario-command");
const gateCommandIdentity = hash("gate-command");
const materialInput = Object.freeze({
  codeIdentity: hash("code"),
  configIdentity: hash("config"),
  fixtureIdentity: hash("fixture"),
  oracleIdentity,
});
const materialIdentities = Object.freeze(Object.values(materialInput).sort());
const finalSnapshot = Object.freeze({
  indexIdentity: hash("index"),
  repositorySnapshotIdentity: hash("repository-snapshot"),
  worktreeIdentity: hash("worktree"),
});

function planRecord({
  reuseDecision = null,
  sourceGenerationFingerprint = hash("source-generation"),
  catalogGenerationIdentity = hash("catalog-generation"),
  contextGenerationIdentity = hash("context-generation"),
  repositorySnapshotIdentity = finalSnapshot.repositorySnapshotIdentity,
} = {}) {
  const scheduled = [scenarioIdentity];
  const body = {
    schemaVersion: ADAPTIVE_VALIDATION_PLAN_SCHEMA,
    disposition: "READY",
    reasonCodes: [],
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    targetedPruning: "OFF",
    authorizationIdentity: hash("authorization"),
    taskIdentity: hash("task"),
    taskContractIdentity: hash("task-contract"),
    taskMaterialFingerprint: hash("task-material"),
    sourceGenerationFingerprint,
    sourceManifestIdentity: hash("source-manifest"),
    sourceAnchorIdentities: [hash("source-anchor")],
    repositoryIdentity: hash("repository"),
    repositorySnapshotIdentity,
    workingSetIdentity: hash("working-set"),
    repositoryHeadCommit: "a".repeat(40),
    repositoryHeadTree: "b".repeat(40),
    currentTruthIdentity: hash("current-truth"),
    contextGenerationIdentity,
    contextClosureIdentity: hash("context-closure"),
    semanticClosureWitnessIdentity:
      reuseDecision === null ? hash("semantic-closure") : reuseDecision.closureWitnessIdentity,
    catalogIdentity: hash("catalog"),
    catalogGenerationIdentity,
    physicalImpactIdentity: hash("physical-impact"),
    semanticImpactIdentity: hash("semantic-impact"),
    riskIdentity: hash("risk"),
    riskClass: "HIGH",
    capabilityIdentity: hash("capability"),
    environmentIdentity: hash("environment"),
    requiredCapabilities: ["node.execute"],
    missingCapabilities: [],
    unknownRequiredCapabilities: [],
    requiredScenarioIdentities: [scenarioIdentity],
    scheduledScenarioIdentities: scheduled,
    targetedScenarioIdentities: [],
    reusedScenarioEvidence: reuseDecision === null ? [] : [reuseDecision],
    scenarioExecutionBindings: [
      {
        scenarioIdentity,
        scenarioRevisionIdentity,
        oracleIdentity,
        implementationBindingIdentity:
          reuseDecision === null
            ? implementationBindingIdentity
            : reuseDecision.implementationBindingIdentity,
        validationActions: [{ actionIdentity, commandIdentity }],
        materialIdentities: [...materialIdentities],
        testFiles: ["tooling/cic/adaptive-validation-evidence.test.mjs"],
        requiredCapabilities: ["node.execute"],
      },
    ],
    mandatoryWiderGates: [
      {
        gateId: "canonical-validation",
        required: true,
        commandIdentity: gateCommandIdentity,
        requiredCapabilities: ["node.execute"],
      },
    ],
    scheduledGateIds: ["canonical-validation"],
    independentReviewRequirement: {
      state: "NOT_REQUIRED",
      scenarioIdentities: [],
      reviewIdentity: null,
    },
  };
  return Object.freeze({
    ...body,
    planIdentity: recordIdentity(ADAPTIVE_VALIDATION_PLAN_SCHEMA, body),
  });
}

function rehashPlan(plan, changes) {
  const body = { ...clone(plan), ...changes };
  delete body.planIdentity;
  return {
    ...body,
    planIdentity: recordIdentity(ADAPTIVE_VALIDATION_PLAN_SCHEMA, body),
  };
}

function attemptInput(
  plan,
  {
    kind = "SCENARIO",
    result = "PASS",
    capabilityStatus = "AVAILABLE",
    executionKind = "EXAMPLE",
    materials = materialInput,
    replay = null,
  } = {},
) {
  const gate = kind === "MANDATORY_GATE";
  return {
    plan,
    target: {
      kind,
      id: gate ? "canonical-validation" : scenarioIdentity,
    },
    execution: {
      kind: executionKind,
      actionIdentity: gate ? hash("gate-action") : actionIdentity,
      commandIdentity: gate ? gateCommandIdentity : commandIdentity,
    },
    capability: {
      identity: plan.capabilityIdentity,
      status: capabilityStatus,
    },
    environmentIdentity: plan.environmentIdentity,
    materials,
    snapshots: {
      start: finalSnapshot,
      end: finalSnapshot,
    },
    replay,
    evidenceManifestIdentity: hash(gate ? "gate-evidence" : "scenario-evidence"),
    resultPayloadIdentity: hash(gate ? "gate-result" : "scenario-result"),
    result,
    reasonCodes:
      result === "PASS"
        ? []
        : capabilityStatus === "AVAILABLE"
          ? ["ASSERTION_FAILED"]
          : ["REQUIRED_CAPABILITY_UNAVAILABLE"],
  };
}

function passingLedger(plan, { includeScenario = true, includeGate = true } = {}) {
  let ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
  if (includeScenario) ledger = appendAdaptiveValidationAttempt(ledger, attemptInput(plan));
  if (includeGate) {
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(plan, { kind: "MANDATORY_GATE" }),
    );
  }
  return ledger;
}

function evidenceFor(plan, ledger, priorEvidenceRecords = []) {
  return buildAdaptiveValidationEvidence({
    plan,
    attemptLedger: ledger,
    finalSnapshot,
    priorEvidenceRecords,
  });
}

function callerClaimedAcceptedPriorEvidenceRecord(evidence) {
  const lifecycle = defineAdaptiveValidationPriorLifecycle({
    evidenceIdentity: evidence.evidenceIdentity,
    acceptanceIdentity: hash("prior-acceptance"),
    knownCorrectnessBlockers: [],
    reviewIdentity: hash("prior-review"),
    state: "ACCEPTED_CURRENT",
    superseded: false,
  });
  return {
    evidence,
    lifecycle: verifyAdaptiveValidationPriorLifecycle(lifecycle),
  };
}

function currentFacts(evidence, plan = evidence.plan) {
  const targetFacts = evidence.coverage
    .filter(({ disposition, target }) => disposition === "EXECUTED_PASS" && target.required)
    .map((coverage) => {
      const attempt = evidence.attemptLedger.attempts.find(
        ({ attemptIdentity: value }) => value === coverage.bindingIdentity,
      );
      return {
        target: attempt.target,
        execution: attempt.execution,
        capabilityIdentity: attempt.capability.identity,
        environmentIdentity: attempt.environmentIdentity,
        materials: attempt.materials,
        evidenceManifestIdentity: attempt.evidenceManifestIdentity,
      };
    });
  return {
    schemaVersion: ADAPTIVE_VALIDATION_CURRENT_FACTS_SCHEMA,
    plan,
    finalSnapshot,
    targetFacts,
    supersededEvidenceIdentities: [],
  };
}

describe("CIC-I6 adaptive validation attempt evidence", () => {
  it("creates deterministic, deeply immutable, exact-schema PASS evidence", () => {
    const plan = planRecord();
    const ledger = passingLedger(plan);
    const first = evidenceFor(plan, ledger);
    const second = evidenceFor(plan, ledger);

    expect(first.result).toBe("PASS");
    expect(first.reasonCodes).toEqual([]);
    expect(first.evidenceIdentity).toBe(second.evidenceIdentity);
    expect(first.schemaVersion).toBe(ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA);
    expect(first.attemptLedger.schemaVersion).toBe(ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA);
    expect(first.attemptLedger.attempts[0].schemaVersion).toBe(ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA);
    expect(adaptiveValidationPlanContentIdentity(plan)).toMatch(/^[0-9A-F]{64}$/u);
    expect(ADAPTIVE_VALIDATION_RESULTS).toEqual(["PASS", "FAIL", "BLOCKED"]);
    expect(ADAPTIVE_VALIDATION_STALENESS_DISPOSITIONS).toEqual([
      "CURRENT",
      "TEST_RESULT_STALE",
      "INVALID_EVIDENCE",
    ]);
    expect(verifyAdaptiveValidationEvidence(first)).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.attemptLedger.attempts)).toBe(true);
    expect(Object.isFrozen(first.bindings.sourceAnchorIdentities)).toBe(true);
    expect(() => first.coverage.push({})).toThrow();
  });

  it("preserves every retry with consecutive numbering and a prior-attempt hash chain", () => {
    const plan = planRecord();
    const empty = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    const first = appendAdaptiveValidationAttempt(empty, attemptInput(plan, { result: "FAIL" }));
    const second = appendAdaptiveValidationAttempt(first, attemptInput(plan, { result: "FAIL" }));

    expect(empty.attempts).toHaveLength(0);
    expect(first.attempts).toHaveLength(1);
    expect(second.attempts).toHaveLength(2);
    expect(second.attempts[1]).toMatchObject({
      attemptNumber: 2,
      priorAttemptIdentity: second.attempts[0].attemptIdentity,
    });
    expect(verifyAdaptiveValidationAttemptLedger(second)).toEqual(second);
  });

  it("rejects a reordered, deleted, or relinked attempt history", () => {
    const plan = planRecord();
    let ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    ledger = appendAdaptiveValidationAttempt(ledger, attemptInput(plan, { result: "FAIL" }));
    ledger = appendAdaptiveValidationAttempt(ledger, attemptInput(plan, { result: "FAIL" }));
    const tampered = clone(ledger);
    tampered.attempts[1].priorAttemptIdentity = hash("fabricated-prior");
    expect(() => verifyAdaptiveValidationAttemptLedger(tampered)).toThrow(
      /ADAPTIVE_VALIDATION_ATTEMPT_IDENTITY_MISMATCH|ADAPTIVE_VALIDATION_ATTEMPT_CHAIN_INVALID/u,
    );
  });

  it("retains an executable deterministic replay record and exact seed for generated failure", () => {
    const plan = planRecord();
    let ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(plan, {
        result: "FAIL",
        executionKind: "GENERATED_PROPERTY",
        replay: {
          generatorIdentity: hash("generator"),
          generatorLocator: "tooling/cic/property-generator",
          replayActionIdentity: hash("replay-action"),
          replayActionLocator: "tooling/cic/replay:counterexample",
          seed: "18446744073709551615",
          counterexampleIdentity: hash("counterexample"),
          counterexampleLocator: "support/counterexample-01.json",
          fixtureIdentity: materialInput.fixtureIdentity,
          fixtureLocator: "tooling/cic/fixtures/property-v1.json",
        },
      }),
    );
    const attempt = ledger.attempts[0];

    expect(attempt.replay).toMatchObject({
      schemaVersion: ADAPTIVE_VALIDATION_REPLAY_SCHEMA,
      seed: "18446744073709551615",
      generatorLocator: "tooling/cic/property-generator",
      counterexampleLocator: "support/counterexample-01.json",
    });
    expect(attempt.replay.seedIdentity).toMatch(/^[0-9A-F]{64}$/u);
    expect(verifyAdaptiveValidationAttempt(attempt)).toEqual(attempt);
    const tampered = clone(attempt);
    tampered.replay.seed = "18446744073709551614";
    expect(() => verifyAdaptiveValidationAttempt(tampered)).toThrow(
      /ADAPTIVE_VALIDATION_REPLAY_SEED_IDENTITY_MISMATCH/u,
    );
  });

  it("rejects generated failure without replayable seed/counterexample/fixture evidence", () => {
    const plan = planRecord();
    const ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    expect(() =>
      appendAdaptiveValidationAttempt(
        ledger,
        attemptInput(plan, {
          result: "FAIL",
          executionKind: "GENERATED_PROPERTY",
          replay: null,
        }),
      ),
    ).toThrow(/ADAPTIVE_VALIDATION_REPLAY_REQUIRED/u);
  });

  it("rejects silent SKIP and required capability fail-open", () => {
    const plan = planRecord();
    const ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    expect(() =>
      appendAdaptiveValidationAttempt(ledger, {
        ...attemptInput(plan),
        result: "SKIP",
      }),
    ).toThrow(/ADAPTIVE_VALIDATION_RESULT_INVALID/u);
    expect(() =>
      appendAdaptiveValidationAttempt(
        ledger,
        attemptInput(plan, { capabilityStatus: "UNAVAILABLE" }),
      ),
    ).toThrow(/ADAPTIVE_VALIDATION_CAPABILITY_FAIL_OPEN/u);
  });

  it("records required unavailable capability as BLOCKED and never PASS", () => {
    const plan = planRecord();
    let ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(plan, {
        result: "BLOCKED",
        capabilityStatus: "UNAVAILABLE",
      }),
    );
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(plan, { kind: "MANDATORY_GATE" }),
    );
    const evidence = evidenceFor(plan, ledger);
    expect(evidence.result).toBe("BLOCKED");
    expect(evidence.reasonCodes).toContain("REQUIRED_CAPABILITY_UNAVAILABLE");
  });

  it("does not launder mixed FAIL/PASS retries for the same exact required scope", () => {
    const plan = planRecord();
    let ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    ledger = appendAdaptiveValidationAttempt(ledger, attemptInput(plan, { result: "FAIL" }));
    ledger = appendAdaptiveValidationAttempt(ledger, attemptInput(plan));
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(plan, { kind: "MANDATORY_GATE" }),
    );
    const evidence = evidenceFor(plan, ledger);

    expect(evidence.result).toBe("BLOCKED");
    expect(evidence.reasonCodes).toContain("UNRESOLVED_REQUIRED_FLAKE");
    expect(evidence.attemptLedger.attempts).toHaveLength(3);
  });

  it("requires every mandatory wider gate at the exact final snapshot", () => {
    const plan = planRecord();
    const evidence = evidenceFor(plan, passingLedger(plan, { includeGate: false }));
    expect(evidence.result).toBe("BLOCKED");
    expect(evidence.reasonCodes).toEqual(
      expect.arrayContaining(["MANDATORY_WIDER_GATE_NOT_PROVEN", "REQUIRED_VALIDATION_MISSING"]),
    );
  });

  it("rejects an arbitrary scenario action/command outside the plan binding", () => {
    const plan = planRecord();
    const ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    const input = attemptInput(plan);
    input.execution.commandIdentity = hash("arbitrary-command");
    expect(() => appendAdaptiveValidationAttempt(ledger, input)).toThrow(
      /ADAPTIVE_VALIDATION_SCENARIO_EXECUTION_BINDING_MISMATCH/u,
    );
  });

  it("rejects attempt snapshots outside the repository snapshot bound by the plan", () => {
    const plan = planRecord();
    const ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: plan.taskIdentity });
    const wrongSnapshot = {
      ...finalSnapshot,
      repositorySnapshotIdentity: hash("wrong-repository-snapshot"),
    };
    const input = attemptInput(plan);
    input.snapshots = { start: wrongSnapshot, end: wrongSnapshot };
    expect(() => appendAdaptiveValidationAttempt(ledger, input)).toThrow(
      /ADAPTIVE_VALIDATION_REPOSITORY_SNAPSHOT_BINDING_MISMATCH/u,
    );
  });
});

describe("CIC-I6 adaptive validation freshness and safe reuse", () => {
  it("returns CURRENT only for exact plan, material, action, environment, and currentness facts", () => {
    const plan = planRecord();
    const evidence = evidenceFor(plan, passingLedger(plan));
    expect(evaluateAdaptiveValidationEvidence(evidence, currentFacts(evidence))).toMatchObject({
      schemaVersion: ADAPTIVE_VALIDATION_STALENESS_SCHEMA,
      disposition: "CURRENT",
      reasonCodes: [],
      evidenceIdentity: evidence.evidenceIdentity,
    });
  });

  it.each([
    [
      "Source generation",
      (plan) => rehashPlan(plan, { sourceGenerationFingerprint: hash("changed-source") }),
      "SOURCE_GENERATION_DRIFT",
    ],
    [
      "scenario/oracle generation",
      (plan) => rehashPlan(plan, { catalogGenerationIdentity: hash("changed-catalog") }),
      "SCENARIO_ORACLE_GENERATION_DRIFT",
    ],
    [
      "context generation",
      (plan) => rehashPlan(plan, { contextGenerationIdentity: hash("changed-context") }),
      "CONTEXT_CURRENTNESS_DRIFT",
    ],
    [
      "repository currentness",
      (plan) =>
        rehashPlan(plan, { repositorySnapshotIdentity: hash("changed-repository-snapshot") }),
      "REPOSITORY_CURRENTNESS_DRIFT",
    ],
    [
      "working-set currentness",
      (plan) => rehashPlan(plan, { workingSetIdentity: hash("changed-working-set") }),
      "REPOSITORY_CURRENTNESS_DRIFT",
    ],
  ])("marks an exact PASS TEST_RESULT_STALE after %s drift", (_label, mutate, reason) => {
    const plan = planRecord();
    const evidence = evidenceFor(plan, passingLedger(plan));
    const current = currentFacts(evidence, mutate(plan));
    expect(evaluateAdaptiveValidationEvidence(evidence, current)).toMatchObject({
      disposition: "TEST_RESULT_STALE",
      reasonCodes: expect.arrayContaining([reason]),
    });
  });

  it("marks affected code/config/fixture/oracle material drift TEST_RESULT_STALE", () => {
    const plan = planRecord();
    const evidence = evidenceFor(plan, passingLedger(plan));
    const current = currentFacts(evidence);
    const changedBody = {
      codeIdentity: hash("changed-code"),
      configIdentity: current.targetFacts[0].materials.configIdentity,
      fixtureIdentity: current.targetFacts[0].materials.fixtureIdentity,
      oracleIdentity: current.targetFacts[0].materials.oracleIdentity,
    };
    current.targetFacts[0].materials = {
      ...changedBody,
      materialIdentity: recordIdentity("CIC_ADAPTIVE_VALIDATION_MATERIAL_V1", changedBody),
    };
    expect(evaluateAdaptiveValidationEvidence(evidence, current)).toMatchObject({
      disposition: "TEST_RESULT_STALE",
      reasonCodes: expect.arrayContaining(["AFFECTED_MATERIAL_DRIFT"]),
    });
  });

  it("stales PASS when command, capability, environment, snapshot, or evidence identity drifts", () => {
    const plan = planRecord();
    const evidence = evidenceFor(plan, passingLedger(plan));
    const cases = [
      {
        mutate: (facts) => {
          facts.targetFacts[0].execution.commandIdentity = hash("changed-command");
        },
        reason: "VALIDATION_ACTION_DRIFT",
      },
      {
        mutate: (facts) => {
          facts.targetFacts[0].capabilityIdentity = hash("changed-capability");
        },
        reason: "CAPABILITY_DRIFT",
      },
      {
        mutate: (facts) => {
          facts.targetFacts[0].environmentIdentity = hash("changed-environment");
        },
        reason: "ENVIRONMENT_DRIFT",
      },
      {
        mutate: (facts) => {
          facts.finalSnapshot.worktreeIdentity = hash("changed-worktree");
        },
        reason: "REPOSITORY_CURRENTNESS_DRIFT",
      },
      {
        mutate: (facts) => {
          facts.targetFacts[0].evidenceManifestIdentity = hash("changed-evidence-manifest");
        },
        reason: "EVIDENCE_MATERIAL_DRIFT",
      },
    ];

    for (const { mutate, reason } of cases) {
      const facts = clone(currentFacts(evidence));
      mutate(facts);
      expect(evaluateAdaptiveValidationEvidence(evidence, facts)).toMatchObject({
        disposition: "TEST_RESULT_STALE",
        reasonCodes: expect.arrayContaining([reason]),
      });
    }
  });

  it("keeps caller-claimed prior PASS reuse advisory and requires current execution", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("current-impact-witness"),
      closureWitnessIdentity: hash("current-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    const currentLedger = passingLedger(currentPlan, { includeScenario: false });
    const priorEvidenceRecord = callerClaimedAcceptedPriorEvidenceRecord(priorEvidence);
    const evidence = evidenceFor(currentPlan, currentLedger, [priorEvidenceRecord]);

    expect(evidence).toMatchObject({
      result: "BLOCKED",
      reasonCodes: expect.arrayContaining([
        "PRIOR_REUSE_NOT_AUTHORITATIVE_FOR_REQUIRED_COVERAGE",
        "REQUIRED_SCENARIO_NOT_PROVEN",
        "REQUIRED_VALIDATION_MISSING",
      ]),
    });
    expect(evidence.coverage).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ disposition: "REUSED_PASS" })]),
    );
    const reuse = bindProvenUnaffectedAdaptiveEvidence({
      plan: currentPlan,
      decision: currentPlan.reusedScenarioEvidence[0],
      priorEvidenceRecord,
    });
    expect(reuse).toMatchObject({
      schemaVersion: ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA,
      priorEvidenceIdentity: priorEvidence.evidenceIdentity,
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      factAuthority: "DERIVED_NON_AUTHORITATIVE",
      mutationAuthorization: false,
    });
    expect(verifyAdaptiveValidationReuseEvidence(reuse)).toEqual(reuse);
    expect(priorEvidenceRecord.lifecycle.schemaVersion).toBe(
      ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA,
    );
  });

  it("blocks reuse when actual prior PASS evidence is missing or binding-mismatched", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("current-impact-witness"),
      closureWitnessIdentity: hash("current-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity: hash("different-implementation-binding"),
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    const currentLedger = passingLedger(currentPlan, { includeScenario: false });

    expect(evidenceFor(currentPlan, currentLedger, []).reasonCodes).toContain(
      "SAFE_REUSE_PRIOR_EVIDENCE_UNAVAILABLE",
    );
    expect(
      evidenceFor(currentPlan, currentLedger, [
        callerClaimedAcceptedPriorEvidenceRecord(priorEvidence),
      ]),
    ).toMatchObject({
      result: "BLOCKED",
      reasonCodes: expect.arrayContaining(["SAFE_REUSE_PRIOR_PASS_OR_BINDING_INVALID"]),
    });
  });

  it("requires and accepts current PASS despite a caller-claimed reusable prior PASS", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("fallback-impact-witness"),
      closureWitnessIdentity: hash("fallback-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    const evidence = evidenceFor(currentPlan, passingLedger(currentPlan), [
      callerClaimedAcceptedPriorEvidenceRecord(priorEvidence),
    ]);

    expect(evidence).toMatchObject({ result: "PASS", reasonCodes: [] });
    expect(evidence.coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          disposition: "EXECUTED_PASS",
          target: expect.objectContaining({ id: scenarioIdentity }),
        }),
      ]),
    );
    expect(evidence.coverage).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ disposition: "REUSED_PASS" })]),
    );
  });

  it("rejects unresolved or superseded prior-evidence lifecycle claims", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    expect(() =>
      defineAdaptiveValidationPriorLifecycle({
        evidenceIdentity: priorEvidence.evidenceIdentity,
        acceptanceIdentity: hash("blocked-acceptance"),
        knownCorrectnessBlockers: ["KNOWN_CORRECTNESS_BLOCKER"],
        reviewIdentity: hash("blocked-review"),
        state: "ACCEPTED_CURRENT",
        superseded: false,
      }),
    ).toThrow(/ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID/u);

    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("superseded-impact-witness"),
      closureWitnessIdentity: hash("superseded-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    const supersededRecord = {
      evidence: priorEvidence,
      lifecycle: defineAdaptiveValidationPriorLifecycle({
        evidenceIdentity: priorEvidence.evidenceIdentity,
        acceptanceIdentity: hash("superseded-acceptance"),
        knownCorrectnessBlockers: ["SUPERSEDED_BY_REVIEW"],
        reviewIdentity: hash("superseded-review"),
        state: "SUPERSEDED",
        superseded: true,
      }),
    };
    const evidence = evidenceFor(
      currentPlan,
      passingLedger(currentPlan, { includeScenario: false }),
      [supersededRecord],
    );
    expect(evidence).toMatchObject({
      result: "BLOCKED",
      reasonCodes: expect.arrayContaining(["SAFE_REUSE_PRIOR_PASS_OR_BINDING_INVALID"]),
    });
  });

  it("marks advisory prior evidence stale when it is later superseded", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("later-superseded-impact-witness"),
      closureWitnessIdentity: hash("later-superseded-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    const evidence = evidenceFor(currentPlan, passingLedger(currentPlan), [
      callerClaimedAcceptedPriorEvidenceRecord(priorEvidence),
    ]);
    const facts = currentFacts(evidence);
    facts.supersededEvidenceIdentities = [priorEvidence.evidenceIdentity];

    expect(evaluateAdaptiveValidationEvidence(evidence, facts)).toMatchObject({
      disposition: "TEST_RESULT_STALE",
      reasonCodes: expect.arrayContaining(["REUSED_EVIDENCE_SUPERSEDED"]),
    });
  });

  it("never lets reusable prior PASS evidence hide a current failing attempt", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("current-failure-impact-witness"),
      closureWitnessIdentity: hash("current-failure-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    let ledger = createAdaptiveValidationAttemptLedger({
      taskIdentity: currentPlan.taskIdentity,
    });
    ledger = appendAdaptiveValidationAttempt(ledger, attemptInput(currentPlan, { result: "FAIL" }));
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(currentPlan, { kind: "MANDATORY_GATE" }),
    );
    const evidence = evidenceFor(currentPlan, ledger, [
      callerClaimedAcceptedPriorEvidenceRecord(priorEvidence),
    ]);

    expect(evidence.result).toBe("FAIL");
    expect(evidence.reasonCodes).toContain("REQUIRED_VALIDATION_FAILED");
    expect(evidence.coverage).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ disposition: "REUSED_PASS" })]),
    );
  });

  it("never lets advisory prior PASS evidence hide a current BLOCKED attempt", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("current-blocked-impact-witness"),
      closureWitnessIdentity: hash("current-blocked-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    let ledger = createAdaptiveValidationAttemptLedger({ taskIdentity: currentPlan.taskIdentity });
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(currentPlan, { result: "BLOCKED", capabilityStatus: "UNAVAILABLE" }),
    );
    ledger = appendAdaptiveValidationAttempt(
      ledger,
      attemptInput(currentPlan, { kind: "MANDATORY_GATE" }),
    );
    const evidence = evidenceFor(currentPlan, ledger, [
      callerClaimedAcceptedPriorEvidenceRecord(priorEvidence),
    ]);

    expect(evidence).toMatchObject({
      result: "BLOCKED",
      reasonCodes: expect.arrayContaining(["REQUIRED_CAPABILITY_UNAVAILABLE"]),
    });
    expect(evidence.coverage).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ disposition: "REUSED_PASS" })]),
    );
  });

  it("never permits prior scenario reuse metadata to satisfy a mandatory wider gate", () => {
    const priorPlan = planRecord();
    const priorEvidence = evidenceFor(priorPlan, passingLedger(priorPlan));
    const decision = {
      scenarioIdentity,
      evidenceIdentity: priorEvidence.evidenceIdentity,
      impactWitnessIdentity: hash("mandatory-gate-impact-witness"),
      closureWitnessIdentity: hash("mandatory-gate-closure-witness"),
      scenarioRevisionIdentity,
      oracleIdentity,
      implementationBindingIdentity,
      materialIdentities: [...materialIdentities],
      disposition: "PROVEN_UNAFFECTED",
    };
    const currentPlan = planRecord({ reuseDecision: decision });
    const evidence = evidenceFor(currentPlan, passingLedger(currentPlan, { includeGate: false }), [
      callerClaimedAcceptedPriorEvidenceRecord(priorEvidence),
    ]);

    expect(evidence).toMatchObject({
      result: "BLOCKED",
      reasonCodes: expect.arrayContaining([
        "MANDATORY_WIDER_GATE_NOT_PROVEN",
        "REQUIRED_VALIDATION_MISSING",
      ]),
    });
  });

  it("fails closed on malformed schema, unknown keys, and tampered aggregate derivation", () => {
    const plan = planRecord();
    const evidence = evidenceFor(plan, passingLedger(plan));
    const malformed = clone(evidence);
    malformed.unknown = true;
    expect(() => verifyAdaptiveValidationEvidence(malformed)).toThrow(
      /ADAPTIVE_VALIDATION_EVIDENCE_INVALID/u,
    );
    const tampered = clone(evidence);
    tampered.result = "BLOCKED";
    expect(() => verifyAdaptiveValidationEvidence(tampered)).toThrow(
      /ADAPTIVE_VALIDATION_EVIDENCE_DERIVATION_MISMATCH/u,
    );
  });
});
