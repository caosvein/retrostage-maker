import { execFileSync } from "node:child_process";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA,
  ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA,
  ADAPTIVE_ORACLE_SCHEMA,
  ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA,
  ADAPTIVE_PHYSICAL_IMPACT_SCHEMA,
  ADAPTIVE_REUSE_WITNESS_SCHEMA,
  ADAPTIVE_RISK_ASSESSMENT_SCHEMA,
  ADAPTIVE_RISK_CLASSES,
  ADAPTIVE_SCENARIO_CATALOG_SCHEMA,
  ADAPTIVE_SCENARIO_REVISION_SCHEMA,
  ADAPTIVE_SEMANTIC_IMPACT_SCHEMA,
  ADAPTIVE_VALIDATION_DISPOSITIONS,
  ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA,
  ADAPTIVE_VALIDATION_PLAN_SCHEMA,
  ADAPTIVE_VALIDATION_TOPOLOGY_DISPOSITIONS,
  ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA,
  TARGETED_PRUNING_POLICY,
  buildAdaptivePhysicalImpact,
  buildAdaptiveScenarioCatalog,
  buildAdaptiveSemanticImpact,
  defineAdaptiveCapabilitySnapshot,
  defineAdaptiveImplementationBinding,
  defineAdaptiveOracle,
  defineAdaptivePhysicalDependencyClosure,
  defineAdaptiveReuseWitness,
  defineAdaptiveRiskAssessment,
  defineAdaptiveScenarioRevision,
  defineAdaptiveValidationMaterialization,
  deriveAdaptiveValidationPlan,
  deriveAdaptiveValidationTopology,
  supersedeAdaptiveOracle,
  supersedeAdaptiveScenarioRevision,
  verifyAdaptiveScenarioCatalog,
  verifyAdaptiveScenarioRevision,
  verifyAdaptiveOracle,
  verifyAdaptiveImplementationBinding,
  verifyAdaptivePhysicalDependencyClosure,
  verifyAdaptivePhysicalImpact,
  verifyAdaptiveSemanticImpact,
  verifyAdaptiveRiskAssessment,
  verifyAdaptiveCapabilitySnapshot,
  verifyAdaptiveReuseWitness,
  verifyAdaptiveValidationMaterialization,
  verifyAdaptiveValidationPlan,
  verifyAdaptiveValidationTopology,
} from "./lib/adaptive-validation-plan.mjs";
import { verifySemanticClosureWitness } from "./lib/semantic-closure.mjs";

const clone = (value) => JSON.parse(JSON.stringify(value));
const hash = (value) => sha256Hex(`cic-i6-adaptive-validation-test:${value}`);
const OWNER = hash("owner");

function rehashPlan(plan, changes) {
  const body = { ...clone(plan), ...changes };
  delete body.planIdentity;
  return {
    ...body,
    planIdentity: sha256Hex(`${ADAPTIVE_VALIDATION_PLAN_SCHEMA}\n${canonicalJson(body)}\n`),
  };
}

function semanticIdentity(schema, body) {
  return sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);
}

function closureWitness(
  ownerIdentity = OWNER,
  { affectedSelectors = [], provenAbsentSelectors = [] } = {},
) {
  const body = {
    schemaVersion: "CIC_SEMANTIC_CLOSURE_WITNESS_V1",
    status: "PASS",
    authorityScope: "READ_ONLY_SEMANTIC_COMPLETENESS",
    sourceGenerationFingerprint: hash("source-generation"),
    repositoryIdentity: hash("repository"),
    repositorySnapshotIdentity: hash("repository-snapshot"),
    repositoryHeadCommit: "a".repeat(40),
    repositoryHeadTree: "b".repeat(40),
    taskIdentity: hash("task"),
    taskContractIdentity: hash("task-contract"),
    authorizationIdentity: hash("authorization"),
    authorizationHeadIdentity: hash("authorization-head"),
    authorizationHeadGeneration: 1,
    authorizationState: "ACTIVE",
    currentTruthIdentity: hash("current-truth"),
    contextGenerationIdentity: hash("context-generation"),
    taskMaterialFingerprint: hash("task-material"),
    effectiveCheckpointRecordIdentity: hash("checkpoint-record"),
    effectiveCheckpointContentIdentity: hash("checkpoint-content"),
    authorizedSemanticOwnerSet: [ownerIdentity],
    semanticDeclarationMaterialIdentity: hash("semantic-declaration-material"),
    semanticDeclarationBytes: 1,
    semanticDeclarationSha256: hash("semantic-declaration"),
    registryIdentity: hash("registry"),
    projectionSetIdentity: hash("projection-set"),
    normalizedFastComparisonIdentity: hash("fast-comparison"),
    normalizedShadowComparisonIdentity: hash("shadow-comparison"),
    fastWitnessIdentity: hash("fast-witness"),
    shadowWitnessIdentity: hash("shadow-witness"),
    comparisonIdentity: hash("comparison"),
    requestedRoots: ["adaptive-validation"],
    closureMembers: ["adaptive-validation", ...affectedSelectors].sort(),
    absentProven: [...provenAbsentSelectors].sort(),
    unknownKeys: [],
    unresolvedKeys: [],
    ownerProviderConflicts: [],
    consultedOwnerIdentities: [ownerIdentity],
    consultedProviderIdentities: [],
    followedDependencyEdges: [],
    findings: [],
    mutationAuthorization: false,
  };
  return {
    ...body,
    closureWitnessIdentity: semanticIdentity("CIC_I5_C_SEMANTIC_CLOSURE_WITNESS_V1", body),
  };
}

function scenario(key, options = {}) {
  const required = options.required ?? true;
  const riskClass = options.riskClass ?? "MEDIUM";
  const requiredCapabilities = options.requiredCapabilities ?? ["node"];
  const revision = defineAdaptiveScenarioRevision({
    ownerIdentity: options.ownerIdentity ?? OWNER,
    semanticKey: key,
    revisionId: `${key.replaceAll(".", "-")}-r1`,
    version: 1,
    generation: 1,
    predecessorRevisionId: null,
    predecessorRevisionIdentity: null,
    provenanceIdentity: hash(`${key}:scenario-provenance`),
    semanticIntentIdentity: hash(`${key}:intent`),
    semanticKind: "BEHAVIORAL_ORACLE",
    semanticSelectors: options.semanticSelectors ?? [`${key}.intent`],
    required,
    requiredCapabilities,
    semanticRelationIdentities: [hash(`${key}:semantic-relation`)],
    riskClass,
  });
  const oracle = defineAdaptiveOracle({
    scenarioIdentity: revision.scenarioIdentity,
    ownerIdentity: options.ownerIdentity ?? OWNER,
    oracleKey: `${key}.oracle`,
    oracleRevisionId: `${key.replaceAll(".", "-")}-o1`,
    version: 1,
    generation: 1,
    predecessorOracleRevisionId: null,
    predecessorOracleIdentity: null,
    expectationIdentity: hash(`${key}:expectation`),
    provenanceIdentity: hash(`${key}:oracle-provenance`),
    reviewIdentity: hash(`${key}:oracle-review`),
    changeIdentity: hash(`${key}:oracle-change`),
    changeKind: "INITIAL_REVIEWED_EXPECTATION",
  });
  const actionIdentity = hash(`${key}:action`);
  const commandIdentity = hash(`${key}:command`);
  const binding = defineAdaptiveImplementationBinding({
    scenarioIdentity: revision.scenarioIdentity,
    scenarioRevisionIdentity: revision.revisionIdentity,
    bindingVersion: 1,
    generation: 1,
    provenanceIdentity: hash(`${key}:binding-provenance`),
    implementationPaths: [options.implementationPath ?? `tooling/cic/lib/${key}.mjs`],
    testFiles: [options.testFile ?? `tooling/cic/${key}.test.mjs`],
    validationActions: [{ actionIdentity, commandIdentity }],
    materialIdentities: [hash(`${key}:material`)],
  });
  return { actionIdentity, binding, commandIdentity, oracle, revision };
}

function fixture(options = {}) {
  const entries = options.entries ?? [
    scenario("required.behavior"),
    scenario("optional.behavior", { required: false, requiredCapabilities: ["gpu"] }),
  ];
  const catalog = buildAdaptiveScenarioCatalog({
    ownerIdentity: options.catalogOwnerIdentity ?? OWNER,
    catalogKey: "adaptive-validation",
    generation: 1,
    predecessorCatalogGenerationIdentity: null,
    provenanceIdentity: hash("catalog-provenance"),
    scenarioRevisions: entries.map(({ revision }) => revision),
    oracles: entries.map(({ oracle }) => oracle),
    implementationBindings: entries.map(({ binding }) => binding),
  });
  const ids = entries.map(({ revision }) => revision.scenarioIdentity).sort();
  const affected =
    options.affected ??
    entries
      .filter(({ revision }) => revision.required)
      .map(({ revision }) => revision.scenarioIdentity);
  const unknown = options.unknown ?? [];
  const unaffected = options.unaffected ?? ids.filter((id) => !affected.includes(id));
  const selectorFor = (scenarioIdentity) =>
    entries.find(({ revision }) => revision.scenarioIdentity === scenarioIdentity).revision
      .semanticSelectors;
  const closure =
    options.closure ??
    closureWitness(OWNER, {
      affectedSelectors: affected.flatMap(selectorFor),
      provenAbsentSelectors: unaffected.flatMap(selectorFor),
    });
  const workingSetIdentity = hash("working-set");
  const dependencyClosures = entries
    .filter(({ revision }) => !unknown.includes(revision.scenarioIdentity))
    .map(({ revision, binding }) =>
      defineAdaptivePhysicalDependencyClosure({
        scenarioIdentity: revision.scenarioIdentity,
        scenarioRevisionIdentity: revision.revisionIdentity,
        implementationBindingIdentity: binding.implementationBindingIdentity,
        completeness: "COMPLETE",
        paths: [...binding.implementationPaths, ...binding.testFiles],
        materialIdentities: binding.materialIdentities,
        provenanceIdentity: hash(`${revision.semanticKey}:dependency-closure`),
      }),
    );
  const changedMaterials = entries
    .filter(({ revision }) => affected.includes(revision.scenarioIdentity))
    .map(({ revision, binding }) => ({
      path: binding.implementationPaths[0],
      materialIdentities: binding.materialIdentities,
      changeIdentity: hash(`${revision.semanticKey}:change`),
    }));
  const physicalImpact = buildAdaptivePhysicalImpact({
    catalog,
    currentTruthIdentity: closure.currentTruthIdentity,
    sourceGenerationFingerprint: closure.sourceGenerationFingerprint,
    repositoryIdentity: closure.repositoryIdentity,
    repositorySnapshotIdentity: closure.repositorySnapshotIdentity,
    workingSetIdentity,
    dependencyClosures,
    changedMaterials,
  });
  const semanticImpact = buildAdaptiveSemanticImpact({
    catalog,
    semanticClosureWitness: closure,
  });
  const riskAssessment = defineAdaptiveRiskAssessment({
    taskIdentity: closure.taskIdentity,
    catalogGenerationIdentity: catalog.catalogGenerationIdentity,
    physicalImpactIdentity: physicalImpact.physicalImpactIdentity,
    semanticImpactIdentity: semanticImpact.semanticImpactIdentity,
    assessmentVersion: 1,
    classification: options.riskClass ?? "MEDIUM",
    riskFactorIdentities: [hash("risk-factor")],
    changedImplementationScenarioIdentities: options.changedImplementation ?? [],
    changedOracleScenarioIdentities: options.changedOracle ?? [],
  });
  const capabilitySnapshot = defineAdaptiveCapabilitySnapshot({
    environmentIdentity: hash("environment"),
    availableCapabilities: options.availableCapabilities ?? ["gpu", "node", "shell"],
    unknownCapabilities: options.unknownCapabilities ?? [],
  });
  const mandatoryWiderGates = [
    {
      gateId: "cic-neighboring",
      required: true,
      commandIdentity: hash("cic-neighboring-command"),
      requiredCapabilities: ["node"],
    },
    {
      gateId: "repository-validate",
      required: true,
      commandIdentity: hash("repository-validate-command"),
      requiredCapabilities: ["shell"],
    },
  ];
  const input = {
    bindings: {
      contextClosureIdentity: hash("context-closure"),
      sourceAnchorIdentities: [hash("source-anchor")],
      sourceManifestIdentity: hash("source-manifest"),
      workingSetIdentity,
    },
    capabilitySnapshot,
    catalog,
    independentReviewIdentity: options.independentReviewIdentity ?? null,
    mandatoryWiderGates,
    physicalImpact,
    reuseWitnesses: options.reuseWitnesses ?? [],
    riskAssessment,
    semanticClosureWitness: closure,
    semanticImpact,
    targetedScenarioIdentities: options.targeted ?? [],
  };
  return {
    catalog,
    closure,
    dependencyClosures,
    entries,
    ids,
    input,
    mandatoryWiderGates,
    physicalImpact,
    semanticImpact,
    workingSetIdentity,
  };
}

function reuseWitness(state, entry = state.entries[0]) {
  return defineAdaptiveReuseWitness({
    scenarioIdentity: entry.revision.scenarioIdentity,
    scenarioRevisionIdentity: entry.revision.revisionIdentity,
    oracleIdentity: entry.oracle.oracleIdentity,
    implementationBindingIdentity: entry.binding.implementationBindingIdentity,
    materialIdentities: entry.binding.materialIdentities,
    evidenceIdentity: hash("prior-pass-evidence"),
    catalogGenerationIdentity: state.catalog.catalogGenerationIdentity,
    physicalImpactIdentity: state.physicalImpact.physicalImpactIdentity,
    physicalDependencySetIdentity: state.physicalImpact.physicalDependencySetIdentity,
    semanticImpactIdentity: state.semanticImpact.semanticImpactIdentity,
    semanticClosureProjectionIdentity: state.semanticImpact.semanticClosureProjectionIdentity,
    closureWitnessIdentity: state.closure.closureWitnessIdentity,
    currentTruthIdentity: state.closure.currentTruthIdentity,
    sourceGenerationFingerprint: state.closure.sourceGenerationFingerprint,
    sourceManifestIdentity: state.input.bindings.sourceManifestIdentity,
    repositoryIdentity: state.closure.repositoryIdentity,
    repositorySnapshotIdentity: state.closure.repositorySnapshotIdentity,
    contextGenerationIdentity: state.closure.contextGenerationIdentity,
    contextClosureIdentity: state.input.bindings.contextClosureIdentity,
    taskMaterialFingerprint: state.closure.taskMaterialFingerprint,
    workingSetIdentity: state.workingSetIdentity,
    disposition: "PRIOR_PASS_CANDIDATE",
  });
}

describe("adaptive validation public record contract", () => {
  it("exposes versioned schemas and structurally verifies every public record kind", () => {
    const state = fixture();
    const entry = state.entries[0];
    const plan = deriveAdaptiveValidationPlan(state.input);
    const reuseState = fixture({
      entries: [entry],
      affected: [],
      unaffected: [entry.revision.scenarioIdentity],
    });
    const reuse = reuseWitness(reuseState, entry);

    expect(verifyAdaptiveScenarioRevision(entry.revision).schemaVersion).toBe(
      ADAPTIVE_SCENARIO_REVISION_SCHEMA,
    );
    expect(verifyAdaptiveOracle(entry.oracle).schemaVersion).toBe(ADAPTIVE_ORACLE_SCHEMA);
    expect(verifyAdaptiveImplementationBinding(entry.binding).schemaVersion).toBe(
      ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA,
    );
    expect(verifyAdaptiveScenarioCatalog(state.catalog).schemaVersion).toBe(
      ADAPTIVE_SCENARIO_CATALOG_SCHEMA,
    );
    expect(verifyAdaptivePhysicalDependencyClosure(state.dependencyClosures[0]).schemaVersion).toBe(
      ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA,
    );
    expect(verifyAdaptivePhysicalImpact(state.physicalImpact).schemaVersion).toBe(
      ADAPTIVE_PHYSICAL_IMPACT_SCHEMA,
    );
    expect(verifyAdaptiveSemanticImpact(state.semanticImpact).schemaVersion).toBe(
      ADAPTIVE_SEMANTIC_IMPACT_SCHEMA,
    );
    expect(verifyAdaptiveRiskAssessment(state.input.riskAssessment).schemaVersion).toBe(
      ADAPTIVE_RISK_ASSESSMENT_SCHEMA,
    );
    expect(verifyAdaptiveCapabilitySnapshot(state.input.capabilitySnapshot).schemaVersion).toBe(
      ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA,
    );
    expect(verifyAdaptiveReuseWitness(reuse).schemaVersion).toBe(ADAPTIVE_REUSE_WITNESS_SCHEMA);
    expect(verifyAdaptiveValidationPlan(plan).schemaVersion).toBe(ADAPTIVE_VALIDATION_PLAN_SCHEMA);
    expect(ADAPTIVE_VALIDATION_DISPOSITIONS).toEqual(["READY", "BLOCKED"]);
    expect(ADAPTIVE_RISK_CLASSES).toEqual(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
  });
});

describe("adaptive validation scenario and oracle intent", () => {
  it("keeps semantic scenario identity stable across revision and implementation-name changes", () => {
    const first = scenario("stable.behavior", {
      implementationPath: "tooling/cic/lib/old-name.mjs",
      testFile: "tooling/cic/old-name.test.mjs",
    });
    const secondRevision = supersedeAdaptiveScenarioRevision(first.revision, {
      revisionId: "stable-behavior-r2",
      generation: 2,
      provenanceIdentity: hash("stable:r2-provenance"),
      semanticIntentIdentity: hash("stable:r2-intent"),
      semanticKind: "BEHAVIORAL_ORACLE",
      semanticSelectors: first.revision.semanticSelectors,
      required: true,
      requiredCapabilities: ["node"],
      semanticRelationIdentities: [hash("stable:r2-relation")],
      riskClass: "MEDIUM",
    });
    const renamedBinding = defineAdaptiveImplementationBinding({
      scenarioIdentity: first.revision.scenarioIdentity,
      scenarioRevisionIdentity: first.revision.revisionIdentity,
      bindingVersion: 2,
      generation: 1,
      provenanceIdentity: hash("renamed-binding"),
      implementationPaths: ["tooling/cic/lib/new-name.mjs"],
      testFiles: ["tooling/cic/new-name.test.mjs"],
      validationActions: [
        { actionIdentity: first.actionIdentity, commandIdentity: first.commandIdentity },
      ],
      materialIdentities: first.binding.materialIdentities,
    });
    const originalCatalog = buildAdaptiveScenarioCatalog({
      ownerIdentity: OWNER,
      catalogKey: "stable-catalog",
      generation: 1,
      predecessorCatalogGenerationIdentity: null,
      provenanceIdentity: hash("original-catalog"),
      scenarioRevisions: [first.revision],
      oracles: [first.oracle],
      implementationBindings: [first.binding],
    });
    const renamedCatalog = buildAdaptiveScenarioCatalog({
      ownerIdentity: OWNER,
      catalogKey: "stable-catalog",
      generation: 1,
      predecessorCatalogGenerationIdentity: null,
      provenanceIdentity: hash("original-catalog"),
      scenarioRevisions: [first.revision],
      oracles: [first.oracle],
      implementationBindings: [renamedBinding],
    });

    expect(secondRevision.scenarioIdentity).toBe(first.revision.scenarioIdentity);
    expect(secondRevision.revisionIdentity).not.toBe(first.revision.revisionIdentity);
    expect(renamedCatalog.catalogIdentity).toBe(originalCatalog.catalogIdentity);
    expect(renamedCatalog.catalogGenerationIdentity).not.toBe(
      originalCatalog.catalogGenerationIdentity,
    );
  });

  it("requires explicit reviewed versioned oracle supersession and rejects auto-green", () => {
    const first = scenario("oracle.behavior");
    const second = supersedeAdaptiveOracle(first.oracle, {
      oracleRevisionId: "oracle-behavior-o2",
      generation: 2,
      expectationIdentity: hash("oracle:new-expectation"),
      provenanceIdentity: hash("oracle:new-provenance"),
      reviewIdentity: hash("oracle:new-review"),
      changeIdentity: hash("oracle:new-change"),
    });
    expect(second.version).toBe(2);
    expect(second.predecessorOracleIdentity).toBe(first.oracle.oracleIdentity);
    expect(second.changeKind).toBe("REVIEWED_SEMANTIC_SUPERSESSION");

    expect(() =>
      defineAdaptiveOracle({
        scenarioIdentity: first.revision.scenarioIdentity,
        ownerIdentity: OWNER,
        oracleKey: "oracle.behavior.oracle",
        oracleRevisionId: "oracle-auto-green",
        version: 1,
        generation: 1,
        predecessorOracleRevisionId: null,
        predecessorOracleIdentity: null,
        expectationIdentity: hash("candidate-output"),
        provenanceIdentity: hash("auto-green-provenance"),
        reviewIdentity: hash("auto-green-review"),
        changeIdentity: hash("auto-green-change"),
        changeKind: "AUTO_GREEN_FROM_CANDIDATE",
      }),
    ).toThrow("ADAPTIVE_ORACLE_AUTO_GREEN_FORBIDDEN");
  });

  it("rejects case-ambiguous semantic keys and unknown schema fields", () => {
    expect(() => scenario("Case.Ambiguous")).toThrow("ADAPTIVE_SCENARIO_REVISION_INVALID");
    const record = clone(scenario("strict.behavior").revision);
    record.extra = true;
    expect(() =>
      buildAdaptiveScenarioCatalog({
        ownerIdentity: OWNER,
        catalogKey: "strict-catalog",
        generation: 1,
        predecessorCatalogGenerationIdentity: null,
        provenanceIdentity: hash("strict-catalog"),
        scenarioRevisions: [record],
        oracles: [scenario("strict.behavior").oracle],
        implementationBindings: [scenario("strict.behavior").binding],
      }),
    ).toThrow("ADAPTIVE_SCENARIO_REVISION_INVALID");
  });
});

describe("adaptive validation catalog fails closed", () => {
  function catalogInput(entry, overrides = {}) {
    return {
      ownerIdentity: OWNER,
      catalogKey: "lineage-catalog",
      generation: overrides.generation ?? 3,
      predecessorCatalogGenerationIdentity: hash("prior-catalog"),
      provenanceIdentity: hash("lineage-catalog"),
      scenarioRevisions: overrides.scenarioRevisions ?? [entry.revision],
      oracles: overrides.oracles ?? [entry.oracle],
      implementationBindings: overrides.implementationBindings ?? [entry.binding],
    };
  }

  it("is deterministic under input ordering", () => {
    const one = scenario("catalog.one");
    const two = scenario("catalog.two");
    const forward = buildAdaptiveScenarioCatalog(
      catalogInput(one, {
        scenarioRevisions: [one.revision, two.revision],
        oracles: [one.oracle, two.oracle],
        implementationBindings: [one.binding, two.binding],
      }),
    );
    const reverse = buildAdaptiveScenarioCatalog(
      catalogInput(one, {
        scenarioRevisions: [two.revision, one.revision],
        oracles: [two.oracle, one.oracle],
        implementationBindings: [two.binding, one.binding],
      }),
    );
    expect(reverse.catalogGenerationIdentity).toBe(forward.catalogGenerationIdentity);
    expect(Object.isFrozen(verifyAdaptiveScenarioCatalog(forward))).toBe(true);
  });

  it("rejects duplicate, missing, forked, cyclic, and ambiguous scenario lineages", () => {
    const root = scenario("lineage.behavior");
    expect(() =>
      buildAdaptiveScenarioCatalog(
        catalogInput(root, { scenarioRevisions: [root.revision, root.revision] }),
      ),
    ).toThrow("ADAPTIVE_SCENARIO_LINEAGE_DUPLICATE");

    const missing = defineAdaptiveScenarioRevision({
      ...Object.fromEntries(
        Object.entries(root.revision).filter(
          ([key]) => !["revisionIdentity", "scenarioIdentity", "schemaVersion"].includes(key),
        ),
      ),
      revisionId: "lineage-missing",
      version: 2,
      generation: 2,
      predecessorRevisionId: "does-not-exist",
      predecessorRevisionIdentity: hash("does-not-exist"),
    });
    expect(() =>
      buildAdaptiveScenarioCatalog(catalogInput(root, { scenarioRevisions: [missing] })),
    ).toThrow("ADAPTIVE_SCENARIO_LINEAGE_PREDECESSOR_MISSING");

    const childOne = supersedeAdaptiveScenarioRevision(root.revision, {
      revisionId: "lineage-child-one",
      generation: 2,
      provenanceIdentity: hash("child-one-provenance"),
      semanticIntentIdentity: hash("child-one-intent"),
      semanticKind: "BEHAVIORAL_ORACLE",
      semanticSelectors: root.revision.semanticSelectors,
      required: true,
      requiredCapabilities: ["node"],
      semanticRelationIdentities: [],
      riskClass: "MEDIUM",
    });
    const childTwo = supersedeAdaptiveScenarioRevision(root.revision, {
      revisionId: "lineage-child-two",
      generation: 2,
      provenanceIdentity: hash("child-two-provenance"),
      semanticIntentIdentity: hash("child-two-intent"),
      semanticKind: "BEHAVIORAL_ORACLE",
      semanticSelectors: root.revision.semanticSelectors,
      required: true,
      requiredCapabilities: ["node"],
      semanticRelationIdentities: [],
      riskClass: "MEDIUM",
    });
    expect(() =>
      buildAdaptiveScenarioCatalog(
        catalogInput(root, {
          scenarioRevisions: [root.revision, childOne, childTwo],
        }),
      ),
    ).toThrow("ADAPTIVE_SCENARIO_LINEAGE_FORKED");

    const cycleA = defineAdaptiveScenarioRevision({
      ownerIdentity: OWNER,
      semanticKey: "lineage.behavior",
      revisionId: "cycle-a",
      version: 2,
      generation: 2,
      predecessorRevisionId: "cycle-b",
      predecessorRevisionIdentity: hash("cycle-b"),
      provenanceIdentity: hash("cycle-a-provenance"),
      semanticIntentIdentity: hash("cycle-a-intent"),
      semanticKind: "BEHAVIORAL_ORACLE",
      semanticSelectors: root.revision.semanticSelectors,
      required: true,
      requiredCapabilities: [],
      semanticRelationIdentities: [],
      riskClass: "LOW",
    });
    const cycleB = defineAdaptiveScenarioRevision({
      ownerIdentity: OWNER,
      semanticKey: "lineage.behavior",
      revisionId: "cycle-b",
      version: 3,
      generation: 3,
      predecessorRevisionId: "cycle-a",
      predecessorRevisionIdentity: hash("cycle-a"),
      provenanceIdentity: hash("cycle-b-provenance"),
      semanticIntentIdentity: hash("cycle-b-intent"),
      semanticKind: "BEHAVIORAL_ORACLE",
      semanticSelectors: root.revision.semanticSelectors,
      required: true,
      requiredCapabilities: [],
      semanticRelationIdentities: [],
      riskClass: "LOW",
    });
    expect(() =>
      buildAdaptiveScenarioCatalog(catalogInput(root, { scenarioRevisions: [cycleA, cycleB] })),
    ).toThrow("ADAPTIVE_SCENARIO_LINEAGE_CYCLIC");

    const secondRoot = defineAdaptiveScenarioRevision({
      ...Object.fromEntries(
        Object.entries(root.revision).filter(
          ([key]) => !["revisionIdentity", "scenarioIdentity", "schemaVersion"].includes(key),
        ),
      ),
      revisionId: "lineage-second-root",
      provenanceIdentity: hash("second-root"),
    });
    expect(() =>
      buildAdaptiveScenarioCatalog(
        catalogInput(root, { scenarioRevisions: [root.revision, secondRoot] }),
      ),
    ).toThrow("ADAPTIVE_SCENARIO_LINEAGE_AMBIGUOUS");
  });

  it("rejects forked oracle histories and ambiguous implementation bindings", () => {
    const entry = scenario("oracle-lineage.behavior");
    const childOne = supersedeAdaptiveOracle(entry.oracle, {
      oracleRevisionId: "oracle-lineage-child-one",
      generation: 2,
      expectationIdentity: hash("oracle-child-one-expectation"),
      provenanceIdentity: hash("oracle-child-one-provenance"),
      reviewIdentity: hash("oracle-child-one-review"),
      changeIdentity: hash("oracle-child-one-change"),
    });
    const childTwo = supersedeAdaptiveOracle(entry.oracle, {
      oracleRevisionId: "oracle-lineage-child-two",
      generation: 2,
      expectationIdentity: hash("oracle-child-two-expectation"),
      provenanceIdentity: hash("oracle-child-two-provenance"),
      reviewIdentity: hash("oracle-child-two-review"),
      changeIdentity: hash("oracle-child-two-change"),
    });
    expect(() =>
      buildAdaptiveScenarioCatalog(
        catalogInput(entry, { oracles: [entry.oracle, childOne, childTwo] }),
      ),
    ).toThrow("ADAPTIVE_ORACLE_LINEAGE_FORKED");
    expect(() =>
      buildAdaptiveScenarioCatalog(
        catalogInput(entry, {
          implementationBindings: [entry.binding, entry.binding],
        }),
      ),
    ).toThrow("ADAPTIVE_IMPLEMENTATION_BINDING_AMBIGUOUS");
  });
});

describe("adaptive validation plan", () => {
  it("derives an exact deterministic plan with additive targeting and unpruned wider gates", () => {
    const state = fixture();
    const optionalId = state.entries.find(({ revision }) => !revision.required).revision
      .scenarioIdentity;
    state.input.targetedScenarioIdentities = [optionalId];
    const first = deriveAdaptiveValidationPlan(state.input);
    const reordered = clone(state.input);
    reordered.mandatoryWiderGates.reverse();
    reordered.targetedScenarioIdentities.reverse();
    const second = deriveAdaptiveValidationPlan(reordered);

    expect(first.schemaVersion).toBe(ADAPTIVE_VALIDATION_PLAN_SCHEMA);
    expect(first.planIdentity).toBe(second.planIdentity);
    expect(first.disposition).toBe("READY");
    expect(first.targetedPruning).toBe(TARGETED_PRUNING_POLICY);
    expect(first.scheduledScenarioIdentities).toEqual(state.ids);
    expect(first.scheduledGateIds).toEqual(["cic-neighboring", "repository-validate"]);
    expect(first.mandatoryWiderGates).toHaveLength(2);
    expect(first.scenarioExecutionBindings[0].validationActions[0]).toEqual(
      expect.objectContaining({
        actionIdentity: expect.any(String),
        commandIdentity: expect.any(String),
      }),
    );
    expect(first.factAuthority).toBe("DERIVED_NON_AUTHORITATIVE");
    expect(first.mutationAuthorization).toBe(false);
    expect(Object.isFrozen(verifyAdaptiveValidationPlan(first))).toBe(true);
  });

  it("fails closed for unavailable and unknown required capabilities", () => {
    const missing = fixture({ availableCapabilities: ["gpu", "shell"] });
    const missingPlan = deriveAdaptiveValidationPlan(missing.input);
    expect(missingPlan.disposition).toBe("BLOCKED");
    expect(missingPlan.reasonCodes).toContain("REQUIRED_CAPABILITY_UNAVAILABLE");
    expect(missingPlan.missingCapabilities).toContain("node");

    const unknown = fixture({
      availableCapabilities: ["gpu", "shell"],
      unknownCapabilities: ["node"],
    });
    const unknownPlan = deriveAdaptiveValidationPlan(unknown.input);
    expect(unknownPlan.disposition).toBe("BLOCKED");
    expect(unknownPlan.reasonCodes).toContain("REQUIRED_CAPABILITY_UNKNOWN");
    expect(unknownPlan.unknownRequiredCapabilities).toContain("node");
  });

  it("makes high-risk implementation and oracle co-change review-visible and blocking", () => {
    const high = scenario("high-risk.behavior", { riskClass: "HIGH" });
    const state = fixture({
      entries: [high],
      affected: [high.revision.scenarioIdentity],
      unaffected: [],
      riskClass: "HIGH",
      changedImplementation: [high.revision.scenarioIdentity],
      changedOracle: [high.revision.scenarioIdentity],
    });
    const blocked = deriveAdaptiveValidationPlan(state.input);
    expect(blocked.disposition).toBe("BLOCKED");
    expect(blocked.reasonCodes).toContain(
      "HIGH_RISK_IMPLEMENTATION_ORACLE_COCHANGE_REVIEW_REQUIRED",
    );
    expect(blocked.independentReviewRequirement).toEqual({
      state: "REQUIRED",
      scenarioIdentities: [high.revision.scenarioIdentity],
      reviewIdentity: null,
    });

    const arbitraryReviewIdentity = hash("arbitrary-independent-review");
    state.input.independentReviewIdentity = arbitraryReviewIdentity;
    const stillBlocked = deriveAdaptiveValidationPlan(state.input);
    expect(stillBlocked.disposition).toBe("BLOCKED");
    expect(stillBlocked.reasonCodes).toContain(
      "HIGH_RISK_IMPLEMENTATION_ORACLE_COCHANGE_REVIEW_REQUIRED",
    );
    expect(stillBlocked.independentReviewRequirement).toEqual({
      state: "REQUIRED",
      scenarioIdentities: [high.revision.scenarioIdentity],
      reviewIdentity: arbitraryReviewIdentity,
    });
    expect(stillBlocked.independentReviewRequirement.state).not.toBe("SATISFIED");

    const selfSealedSatisfiedClaim = rehashPlan(stillBlocked, {
      disposition: "READY",
      reasonCodes: [],
      independentReviewRequirement: {
        state: "SATISFIED",
        scenarioIdentities: [high.revision.scenarioIdentity],
        reviewIdentity: arbitraryReviewIdentity,
      },
    });
    expect(() => verifyAdaptiveValidationPlan(selfSealedSatisfiedClaim)).toThrow(
      "ADAPTIVE_INDEPENDENT_REVIEW_REQUIREMENT_INVALID",
    );
    expect(() =>
      deriveAdaptiveValidationPlan({
        ...state.input,
        independentReviewIdentity: { identity: arbitraryReviewIdentity },
      }),
    ).toThrow("ADAPTIVE_INDEPENDENT_REVIEW_INVALID");
    expect(() =>
      deriveAdaptiveValidationPlan({
        ...state.input,
        independentReviewMetadata: { identity: arbitraryReviewIdentity },
      }),
    ).toThrow("ADAPTIVE_VALIDATION_PLAN_INPUT_INVALID");
  });

  it("leaves ordinary non-cochange plans unchanged by advisory review identity input", () => {
    const state = fixture();
    const withoutAdvisoryIdentity = deriveAdaptiveValidationPlan(state.input);
    state.input.independentReviewIdentity = hash("irrelevant-advisory-review");
    const withAdvisoryIdentity = deriveAdaptiveValidationPlan(state.input);

    expect(withAdvisoryIdentity).toEqual(withoutAdvisoryIdentity);
    expect(withAdvisoryIdentity).toMatchObject({
      disposition: "READY",
      independentReviewRequirement: {
        state: "NOT_REQUIRED",
        scenarioIdentities: [],
        reviewIdentity: null,
      },
    });
  });

  it("permits only current exact-binding unaffected reuse decisions", () => {
    const only = scenario("reuse.behavior");
    const state = fixture({
      entries: [only],
      affected: [],
      unaffected: [only.revision.scenarioIdentity],
    });
    state.input.reuseWitnesses = [reuseWitness(state, only)];
    const plan = deriveAdaptiveValidationPlan(state.input);
    expect(plan.disposition).toBe("READY");
    expect(plan.requiredScenarioIdentities).toEqual([only.revision.scenarioIdentity]);
    expect(plan.scheduledScenarioIdentities).toEqual([only.revision.scenarioIdentity]);
    expect(plan.scenarioExecutionBindings).toHaveLength(1);
    expect(plan.reusedScenarioEvidence).toEqual([
      expect.objectContaining({
        scenarioIdentity: only.revision.scenarioIdentity,
        scenarioRevisionIdentity: only.revision.revisionIdentity,
        oracleIdentity: only.oracle.oracleIdentity,
        implementationBindingIdentity: only.binding.implementationBindingIdentity,
        materialIdentities: only.binding.materialIdentities,
        closureWitnessIdentity: state.closure.closureWitnessIdentity,
        disposition: "PROVEN_UNAFFECTED",
      }),
    ]);

    const stale = clone(reuseWitness(state, only));
    stale.implementationBindingIdentity = hash("stale-binding");
    stale.impactWitnessIdentity = hash("rehash-not-authorized");
    expect(() => deriveAdaptiveValidationPlan({ ...state.input, reuseWitnesses: [stale] })).toThrow(
      "ADAPTIVE_REUSE_WITNESS_IDENTITY_MISMATCH",
    );
  });

  it("rejects reuse unless both physical and semantic impact prove the scenario unaffected", () => {
    const only = scenario("unsafe-reuse.behavior");
    const state = fixture({
      entries: [only],
      affected: [only.revision.scenarioIdentity],
      unaffected: [],
    });
    state.input.reuseWitnesses = [reuseWitness(state, only)];
    const plan = deriveAdaptiveValidationPlan(state.input);

    expect(plan.disposition).toBe("BLOCKED");
    expect(plan.reasonCodes).toContain("UNSAFE_UNAFFECTED_REUSE_REJECTED");
    expect(plan.scheduledScenarioIdentities).toEqual([only.revision.scenarioIdentity]);
    expect(plan.reusedScenarioEvidence).toEqual([]);
  });

  it("rejects unauthenticated owners and currentness or catalog drift", () => {
    const unowned = scenario("unowned.behavior", { ownerIdentity: hash("unowned") });
    const ownerState = fixture({ entries: [unowned], catalogOwnerIdentity: OWNER });
    expect(() => deriveAdaptiveValidationPlan(ownerState.input)).toThrow(
      "ADAPTIVE_SCENARIO_OWNER_UNAUTHORIZED",
    );

    const state = fixture();
    const driftedPhysical = buildAdaptivePhysicalImpact({
      catalog: state.catalog,
      currentTruthIdentity: hash("later-current-truth"),
      sourceGenerationFingerprint: state.closure.sourceGenerationFingerprint,
      repositoryIdentity: state.closure.repositoryIdentity,
      repositorySnapshotIdentity: state.closure.repositorySnapshotIdentity,
      workingSetIdentity: state.workingSetIdentity,
      dependencyClosures: state.dependencyClosures,
      changedMaterials: [],
    });
    expect(() =>
      deriveAdaptiveValidationPlan({ ...state.input, physicalImpact: driftedPhysical }),
    ).toThrow("ADAPTIVE_PLAN_CURRENTNESS_BINDING_MISMATCH");
  });

  it("re-derives physical and semantic partitions instead of trusting relabeled impact records", () => {
    const state = fixture();
    const tamperedPhysical = clone(state.physicalImpact);
    [
      tamperedPhysical.affectedScenarioIdentities,
      tamperedPhysical.provenUnaffectedScenarioIdentities,
    ] = [
      tamperedPhysical.provenUnaffectedScenarioIdentities,
      tamperedPhysical.affectedScenarioIdentities,
    ];
    delete tamperedPhysical.physicalImpactIdentity;
    tamperedPhysical.physicalImpactIdentity = sha256Hex(
      `${tamperedPhysical.schemaVersion}\n${canonicalJson(tamperedPhysical)}\n`,
    );
    const physicalRisk = defineAdaptiveRiskAssessment({
      taskIdentity: state.closure.taskIdentity,
      catalogGenerationIdentity: state.catalog.catalogGenerationIdentity,
      physicalImpactIdentity: tamperedPhysical.physicalImpactIdentity,
      semanticImpactIdentity: state.semanticImpact.semanticImpactIdentity,
      assessmentVersion: 1,
      classification: "MEDIUM",
      riskFactorIdentities: [hash("risk-factor")],
      changedImplementationScenarioIdentities: [],
      changedOracleScenarioIdentities: [],
    });
    expect(() =>
      deriveAdaptiveValidationPlan({
        ...state.input,
        physicalImpact: tamperedPhysical,
        riskAssessment: physicalRisk,
      }),
    ).toThrow("ADAPTIVE_PHYSICAL_IMPACT_DERIVATION_MISMATCH");

    const tamperedSemantic = clone(state.semanticImpact);
    [
      tamperedSemantic.affectedScenarioIdentities,
      tamperedSemantic.provenUnaffectedScenarioIdentities,
    ] = [
      tamperedSemantic.provenUnaffectedScenarioIdentities,
      tamperedSemantic.affectedScenarioIdentities,
    ];
    delete tamperedSemantic.semanticImpactIdentity;
    tamperedSemantic.semanticImpactIdentity = sha256Hex(
      `${tamperedSemantic.schemaVersion}\n${canonicalJson(tamperedSemantic)}\n`,
    );
    const semanticRisk = defineAdaptiveRiskAssessment({
      taskIdentity: state.closure.taskIdentity,
      catalogGenerationIdentity: state.catalog.catalogGenerationIdentity,
      physicalImpactIdentity: state.physicalImpact.physicalImpactIdentity,
      semanticImpactIdentity: tamperedSemantic.semanticImpactIdentity,
      assessmentVersion: 1,
      classification: "MEDIUM",
      riskFactorIdentities: [hash("risk-factor")],
      changedImplementationScenarioIdentities: [],
      changedOracleScenarioIdentities: [],
    });
    expect(() =>
      deriveAdaptiveValidationPlan({
        ...state.input,
        semanticImpact: tamperedSemantic,
        riskAssessment: semanticRisk,
      }),
    ).toThrow("ADAPTIVE_SEMANTIC_IMPACT_DERIVATION_MISMATCH");
  });

  it("blocks change/impact contradictions while keeping high-risk oracle co-change visible", () => {
    const high = scenario("contradictory-change.behavior", { riskClass: "HIGH" });
    const state = fixture({
      entries: [high],
      affected: [],
      unaffected: [high.revision.scenarioIdentity],
      riskClass: "LOW",
      changedImplementation: [high.revision.scenarioIdentity],
      changedOracle: [high.revision.scenarioIdentity],
    });
    const plan = deriveAdaptiveValidationPlan(state.input);

    expect(plan.disposition).toBe("BLOCKED");
    expect(plan.reasonCodes).toEqual(
      expect.arrayContaining([
        "CHANGE_IMPACT_CONTRADICTION",
        "HIGH_RISK_IMPLEMENTATION_ORACLE_COCHANGE_REVIEW_REQUIRED",
        "RISK_UNDERCLASSIFIED",
      ]),
    );
    expect(plan.independentReviewRequirement.state).toBe("REQUIRED");
  });

  it("blocks unknown impact truth and rejects plan tampering", () => {
    const unknown = fixture({ affected: [], unaffected: [], unknown: fixture().ids });
    const unknownPlan = deriveAdaptiveValidationPlan(unknown.input);
    expect(unknownPlan.disposition).toBe("BLOCKED");
    expect(unknownPlan.reasonCodes).toContain("PHYSICAL_IMPACT_UNKNOWN");
    expect(unknownPlan.scheduledScenarioIdentities).toEqual(unknown.ids);

    const valid = deriveAdaptiveValidationPlan(fixture().input);
    const tampered = clone(valid);
    tampered.targetedPruning = "ON";
    expect(() => verifyAdaptiveValidationPlan(tampered)).toThrow(
      "ADAPTIVE_VALIDATION_PLAN_INVALID",
    );
    const omittedGate = clone(valid);
    omittedGate.scheduledGateIds.pop();
    expect(() => verifyAdaptiveValidationPlan(omittedGate)).toThrow(
      "ADAPTIVE_MANDATORY_GATE_OMITTED",
    );
  });

  it("structurally verifies semantic closure witness content before deriving a plan", () => {
    const state = fixture();
    expect(verifySemanticClosureWitness(state.closure).closureWitnessIdentity).toBe(
      state.closure.closureWitnessIdentity,
    );
    const malformed = clone(state.closure);
    malformed.unknownKeys = ["not-proven"];
    expect(() =>
      deriveAdaptiveValidationPlan({ ...state.input, semanticClosureWitness: malformed }),
    ).toThrow("ADAPTIVE_SEMANTIC_CLOSURE_WITNESS_INVALID");
  });
});

function gitObjectSha(type, raw) {
  return createHash("sha1").update(`${type} ${raw.byteLength}\0`, "utf8").update(raw).digest("hex");
}

function gitTreeRaw(entries) {
  return Buffer.concat(
    [...entries]
      .sort((left, right) => left.path.localeCompare(right.path, "en"))
      .map(({ mode = "100644", path, objectId }) =>
        Buffer.concat([Buffer.from(`${mode} ${path}\0`, "utf8"), Buffer.from(objectId, "hex")]),
      ),
  );
}

function gitCommitRaw(tree, parent, { secondParent = null } = {}) {
  return Buffer.from(
    [
      `tree ${tree}`,
      `parent ${parent}`,
      ...(secondParent === null ? [] : [`parent ${secondParent}`]),
      "author RetroStage Fixture <fixture@invalid> 0 +0000",
      "committer RetroStage Fixture <fixture@invalid> 0 +0000",
      "",
      "validation-only materialization",
      "",
    ].join("\n"),
    "utf8",
  );
}

function materialIdentityAsGitObject(value) {
  return /^[0-9a-f]{40}$/u.test(value)
    ? value
    : createHash("sha1").update(value, "utf8").digest("hex");
}

function topologyOwner(path, materialIdentity, overrides = {}) {
  return {
    path,
    materialIdentity,
    ownershipComplete: true,
    readsLiveWorkingTree: true,
    readsHead: false,
    readsHeadTree: false,
    readsCommittedObjects: false,
    readsHistory: false,
    createsLocalClone: false,
    expectsCleanCloneCandidate: false,
    materializesCommittedState: false,
    ...overrides,
  };
}

function topologyFixture(overrides = {}) {
  const path = "example-candidate.mjs";
  const observerPath = "example-live-reader.mjs";
  const candidatePaths = [{ path, sha256: hash("candidate-postimage"), gitBlob: "c".repeat(40) }];
  const candidateWorktree = {
    workingSetIdentity: hash("working-set"),
    worktreeIdentity: hash("worktree"),
    stagedPaths: [],
    modifiedTrackedPaths: [path],
    untrackedPaths: [],
  };
  const repositoryIdentity = hash("topology-repository");
  const repositorySnapshotIdentity = hash("topology-repository-snapshot");
  const currentTruthIdentity = hash("topology-current-truth");
  const sourceGenerationFingerprint = hash("topology-source-generation");
  const entry = scenario("topology.observer", {
    implementationPath: path,
    testFile: observerPath,
  });
  const scenarioCatalog = buildAdaptiveScenarioCatalog({
    ownerIdentity: OWNER,
    catalogKey: "topology-observer",
    generation: 1,
    predecessorCatalogGenerationIdentity: null,
    provenanceIdentity: hash("topology-catalog-provenance"),
    scenarioRevisions: [entry.revision],
    oracles: [entry.oracle],
    implementationBindings: [entry.binding],
  });
  const dependencyClosure = defineAdaptivePhysicalDependencyClosure({
    scenarioIdentity: entry.revision.scenarioIdentity,
    scenarioRevisionIdentity: entry.revision.revisionIdentity,
    implementationBindingIdentity: entry.binding.implementationBindingIdentity,
    completeness: "COMPLETE",
    paths: [path, observerPath],
    materialIdentities: entry.binding.materialIdentities,
    provenanceIdentity: hash("topology-dependency-provenance"),
  });
  const physicalImpact = buildAdaptivePhysicalImpact({
    catalog: scenarioCatalog,
    currentTruthIdentity,
    sourceGenerationFingerprint,
    repositoryIdentity,
    repositorySnapshotIdentity,
    workingSetIdentity: candidateWorktree.workingSetIdentity,
    dependencyClosures: [dependencyClosure],
    changedMaterials: [
      {
        path,
        materialIdentities: entry.binding.materialIdentities,
        changeIdentity: hash("topology-change"),
      },
    ],
  });
  const affectedClosure = [
    topologyOwner(path, candidatePaths[0].gitBlob),
    topologyOwner(observerPath, "1".repeat(40)),
  ];
  const parentTreeRaw = gitTreeRaw([
    { path, objectId: "f".repeat(40) },
    { path: observerPath, objectId: "1".repeat(40) },
  ]);
  const input = {
    parentHead: "a".repeat(40),
    parentTree: gitObjectSha("tree", parentTreeRaw),
    repositoryIdentity,
    repositorySnapshotIdentity,
    currentTruthIdentity,
    sourceGenerationFingerprint,
    sourceManifestIdentity: hash("topology-source-manifest"),
    scenarioCatalog,
    physicalImpact,
    candidateIdentity: hash("topology-candidate"),
    candidatePaths,
    candidateWorktree,
    affectedClosure,
  };
  input.canonicalRepository = {
    head: input.parentHead,
    tree: input.parentTree,
    repositoryIdentity: input.repositoryIdentity,
    repositorySnapshotIdentity: input.repositorySnapshotIdentity,
    currentTruthIdentity: input.currentTruthIdentity,
    sourceGenerationFingerprint: input.sourceGenerationFingerprint,
    sourceManifestIdentity: input.sourceManifestIdentity,
    candidateIdentity: input.candidateIdentity,
    candidatePaths: clone(candidatePaths),
    candidateWorktree: clone(candidateWorktree),
  };
  return { ...input, ...overrides };
}

function materializationFixture(topology, overrides = {}) {
  const candidateByPath = new Map(topology.candidatePaths.map((entry) => [entry.path, entry]));
  const parentEntries = topology.affectedClosure.map((entry) => ({
    path: entry.path,
    objectId: candidateByPath.has(entry.path)
      ? "f".repeat(40)
      : materialIdentityAsGitObject(entry.materialIdentity),
  }));
  const validationEntries = topology.affectedClosure.map((entry) => ({
    path: entry.path,
    objectId:
      candidateByPath.get(entry.path)?.gitBlob ??
      materialIdentityAsGitObject(entry.materialIdentity),
  }));
  const parentTreeRaw = gitTreeRaw(parentEntries);
  const validationTreeRaw = gitTreeRaw(validationEntries);
  const validationCommitTree = gitObjectSha("tree", validationTreeRaw);
  const commitRaw = gitCommitRaw(validationCommitTree, topology.parentHead);
  return {
    topology,
    acceptedParentHead: topology.parentHead,
    acceptedParentTree: topology.parentTree,
    repositoryIdentity: topology.repositoryIdentity,
    repositorySnapshotIdentity: topology.repositorySnapshotIdentity,
    currentTruthIdentity: topology.currentTruthIdentity,
    sourceGenerationFingerprint: topology.sourceGenerationFingerprint,
    sourceManifestIdentity: topology.sourceManifestIdentity,
    candidateIdentity: topology.candidateIdentity,
    candidatePaths: clone(topology.candidatePaths),
    canonicalRepository: clone(topology.canonicalRepository),
    validationCommit: gitObjectSha("commit", commitRaw),
    validationCommitParent: topology.parentHead,
    validationCommitTree,
    expectedValidationCommitTree: validationCommitTree,
    gitObjectEvidence: {
      commitRawBase64: commitRaw.toString("base64"),
      treeObjects: [parentTreeRaw, validationTreeRaw].map((raw) => ({
        rawBase64: raw.toString("base64"),
      })),
    },
    committedPaths: topology.candidatePaths.map(({ path, gitBlob }) => ({
      path,
      gitBlob,
    })),
    disposableWorktreeClean: true,
    extraPaths: [],
    pushAttempts: 0,
    publicationAttempted: false,
    ...overrides,
  };
}

function resealPhysicalImpact(value) {
  const body = clone(value);
  delete body.physicalImpactIdentity;
  return {
    ...body,
    physicalImpactIdentity: sha256Hex(
      `${ADAPTIVE_PHYSICAL_IMPACT_SCHEMA}\n${canonicalJson(body)}\n`,
    ),
  };
}

function materializationWithValidationEntries(topology, validationEntries, options = {}) {
  const base = materializationFixture(topology);
  const validationTreeRaw = gitTreeRaw(validationEntries);
  const validationTree = gitObjectSha("tree", validationTreeRaw);
  const commitRaw = gitCommitRaw(validationTree, options.commitParent ?? topology.parentHead, {
    secondParent: options.secondParent ?? null,
  });
  const parentTreeObject = base.gitObjectEvidence.treeObjects.find(
    ({ rawBase64 }) =>
      gitObjectSha("tree", Buffer.from(rawBase64, "base64")) === topology.parentTree,
  );
  return {
    ...base,
    validationCommit: gitObjectSha("commit", commitRaw),
    validationCommitTree: options.assertedTree ?? validationTree,
    expectedValidationCommitTree: options.expectedTree ?? validationTree,
    gitObjectEvidence: {
      commitRawBase64: commitRaw.toString("base64"),
      treeObjects: [parentTreeObject, { rawBase64: validationTreeRaw.toString("base64") }],
    },
  };
}

function runGit(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", windowsHide: true }).trim();
}

function runGitBytes(cwd, ...args) {
  return execFileSync("git", args, { cwd, windowsHide: true });
}

describe("candidate validation topology evidence", () => {
  it("publishes additive versioned schemas with permanent evidence-only boundaries", () => {
    expect(ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA).toBe("CIC_ADAPTIVE_VALIDATION_TOPOLOGY_V1");
    expect(ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA).toBe(
      "CIC_ADAPTIVE_VALIDATION_MATERIALIZATION_V1",
    );
    expect(ADAPTIVE_VALIDATION_TOPOLOGY_DISPOSITIONS).toEqual([
      "DIRTY_WORKTREE",
      "DISPOSABLE_MATERIALIZED_COMMIT",
      "BLOCKED",
    ]);

    const topology = deriveAdaptiveValidationTopology(topologyFixture());
    expect(topology).toMatchObject({
      disposition: "DIRTY_WORKTREE",
      factAuthority: "DERIVED_NON_AUTHORITATIVE",
      mutationAuthorization: false,
      publicationAuthorization: false,
      pushAuthorization: false,
      targetedPruning: "OFF",
    });
    expect(verifyAdaptiveValidationTopology(topology)).toEqual(topology);
  });

  it("is order-insensitive and forces committed-state owners into disposable materialization", () => {
    const base = topologyFixture();
    const cloneOwner = {
      ...base.affectedClosure[1],
      readsLiveWorkingTree: false,
      readsHead: true,
      readsHeadTree: true,
      readsCommittedObjects: true,
      readsHistory: true,
      createsLocalClone: true,
      expectsCleanCloneCandidate: true,
    };
    const first = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: [cloneOwner, base.affectedClosure[0]],
    });
    const reordered = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: [base.affectedClosure[0], cloneOwner],
    });

    expect(first.disposition).toBe("DISPOSABLE_MATERIALIZED_COMMIT");
    expect(reordered.topologyIdentity).toBe(first.topologyIdentity);
    expect(reordered.affectedClosureIdentity).toBe(first.affectedClosureIdentity);
  });

  it("blocks incomplete, ambiguous, duplicate, and non-current topology facts", () => {
    const base = topologyFixture();
    const incomplete = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: [{ ...base.affectedClosure[0], ownershipComplete: false }],
    });
    const ambiguous = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: [
        {
          ...base.affectedClosure[0],
          readsLiveWorkingTree: false,
        },
      ],
    });
    const duplicate = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: [base.affectedClosure[0], clone(base.affectedClosure[0])],
    });
    const stale = deriveAdaptiveValidationTopology({
      ...base,
      canonicalRepository: {
        ...base.canonicalRepository,
        sourceGenerationFingerprint: hash("stale-source-generation"),
      },
    });

    expect(incomplete).toMatchObject({
      disposition: "BLOCKED",
      reasonCodes: expect.arrayContaining(["TOPOLOGY_OWNERSHIP_INCOMPLETE"]),
    });
    expect(ambiguous).toMatchObject({
      disposition: "BLOCKED",
      reasonCodes: expect.arrayContaining(["TOPOLOGY_OWNERSHIP_AMBIGUOUS"]),
    });
    expect(duplicate).toMatchObject({
      disposition: "BLOCKED",
      reasonCodes: expect.arrayContaining(["AFFECTED_CLOSURE_MEMBER_DUPLICATE"]),
    });
    expect(stale).toMatchObject({
      disposition: "BLOCKED",
      reasonCodes: expect.arrayContaining(["CANONICAL_REPOSITORY_CURRENTNESS_MISMATCH"]),
    });
  });

  it("rejects a semantically contradictory topology even after identity resealing", () => {
    const valid = deriveAdaptiveValidationTopology(topologyFixture());
    const tampered = clone(valid);
    tampered.disposition = "DISPOSABLE_MATERIALIZED_COMMIT";
    delete tampered.topologyIdentity;
    tampered.topologyIdentity = sha256Hex(
      `${ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA}\n${canonicalJson(tampered)}\n`,
    );
    expect(() => verifyAdaptiveValidationTopology(tampered)).toThrow(
      "ADAPTIVE_VALIDATION_TOPOLOGY_INVALID",
    );
  });

  it("accepts exact validation-only materialization without granting publication authority", () => {
    const base = topologyFixture();
    const topology = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: base.affectedClosure.map((member, index) =>
        index === 1
          ? {
              ...member,
              readsLiveWorkingTree: false,
              readsHead: true,
              createsLocalClone: true,
              expectsCleanCloneCandidate: true,
            }
          : member,
      ),
    });
    const evidence = defineAdaptiveValidationMaterialization(materializationFixture(topology));

    expect(evidence).toMatchObject({
      status: "PASS",
      validationOnly: true,
      factAuthority: "DERIVED_NON_AUTHORITATIVE",
      mutationAuthorization: false,
      publicationAuthorization: false,
      pushAuthorization: false,
      targetedPruning: "OFF",
    });
    expect(verifyAdaptiveValidationMaterialization(evidence)).toEqual(evidence);
  });

  it("fails materialization closed for every governed mismatch or prohibited attempt", () => {
    const base = topologyFixture();
    const topology = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: base.affectedClosure.map((member, index) =>
        index === 1
          ? { ...member, readsLiveWorkingTree: false, readsCommittedObjects: true }
          : member,
      ),
    });
    const cases = [
      { acceptedParentHead: "f".repeat(40) },
      { acceptedParentTree: "f".repeat(40) },
      { validationCommitParent: "f".repeat(40) },
      { validationCommitTree: "f".repeat(40) },
      { candidateIdentity: hash("wrong-candidate") },
      { sourceGenerationFingerprint: hash("wrong-source") },
      {
        committedPaths: topology.candidatePaths.map(({ path }) => ({
          path,
          gitBlob: "f".repeat(40),
        })),
      },
      { committedPaths: [] },
      { extraPaths: ["tooling/cic/extra.mjs"] },
      { disposableWorktreeClean: false },
      { pushAttempts: 1 },
      { publicationAttempted: true },
      {
        canonicalRepository: {
          ...clone(topology.canonicalRepository),
          candidateIdentity: hash("wrong-canonical-candidate"),
        },
      },
    ];

    for (const changes of cases) {
      const input = materializationFixture(topology, changes);
      if (changes.committedPaths?.length === 0) {
        expect(() => defineAdaptiveValidationMaterialization(input)).toThrow(
          "ADAPTIVE_VALIDATION_MATERIALIZATION_INVALID",
        );
      } else {
        expect(defineAdaptiveValidationMaterialization(input).status).toBe("BLOCKED");
      }
    }
  });

  it("binds ownership to the complete governed physical affected closure", () => {
    const base = topologyFixture();
    const committed = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: base.affectedClosure.map((member, index) =>
        index === 1 ? { ...member, readsLiveWorkingTree: false, readsHistory: true } : member,
      ),
    });
    expect(committed.disposition).toBe("DISPOSABLE_MATERIALIZED_COMMIT");

    for (const affectedClosure of [
      [base.affectedClosure[0]],
      [base.affectedClosure[1]],
      [...base.affectedClosure, topologyOwner("unexpected-owner.mjs", "2".repeat(40))],
    ]) {
      const topology = deriveAdaptiveValidationTopology({ ...base, affectedClosure });
      expect(topology).toMatchObject({
        disposition: "BLOCKED",
        reasonCodes: expect.arrayContaining(["AFFECTED_CLOSURE_PATH_SET_MISMATCH"]),
      });
    }

    const outsidePath = "outside-candidate.mjs";
    const outsideCandidate = [
      {
        path: outsidePath,
        sha256: hash("outside-candidate"),
        gitBlob: "2".repeat(40),
      },
    ];
    const outsideWorktree = {
      ...base.candidateWorktree,
      modifiedTrackedPaths: [outsidePath],
    };
    const outside = deriveAdaptiveValidationTopology({
      ...base,
      candidatePaths: outsideCandidate,
      candidateWorktree: outsideWorktree,
      canonicalRepository: {
        ...base.canonicalRepository,
        candidatePaths: outsideCandidate,
        candidateWorktree: outsideWorktree,
      },
    });
    expect(outside.reasonCodes).toContain("CANDIDATE_OUTSIDE_GOVERNED_AFFECTED_CLOSURE");
  });

  it("fails closed for unknown, contradictory, or stale physical-impact provenance", () => {
    const base = topologyFixture();
    const unknownImpact = buildAdaptivePhysicalImpact({
      catalog: base.scenarioCatalog,
      currentTruthIdentity: base.currentTruthIdentity,
      sourceGenerationFingerprint: base.sourceGenerationFingerprint,
      repositoryIdentity: base.repositoryIdentity,
      repositorySnapshotIdentity: base.repositorySnapshotIdentity,
      workingSetIdentity: base.candidateWorktree.workingSetIdentity,
      dependencyClosures: [],
      changedMaterials: [],
    });
    const unknown = deriveAdaptiveValidationTopology({ ...base, physicalImpact: unknownImpact });
    expect(unknown).toMatchObject({
      disposition: "BLOCKED",
      reasonCodes: expect.arrayContaining(["PHYSICAL_IMPACT_UNKNOWN"]),
    });

    const contradictory = clone(base.physicalImpact);
    contradictory.provenUnaffectedScenarioIdentities = [
      ...contradictory.affectedScenarioIdentities,
    ];
    contradictory.affectedScenarioIdentities = [];
    expect(() =>
      deriveAdaptiveValidationTopology({
        ...base,
        physicalImpact: resealPhysicalImpact(contradictory),
      }),
    ).toThrow("ADAPTIVE_PHYSICAL_IMPACT_DERIVATION_MISMATCH");

    const staleCurrentTruth = hash("stale-topology-current-truth");
    const stale = deriveAdaptiveValidationTopology({
      ...base,
      currentTruthIdentity: staleCurrentTruth,
      canonicalRepository: {
        ...base.canonicalRepository,
        currentTruthIdentity: staleCurrentTruth,
      },
    });
    expect(stale.reasonCodes).toContain("PHYSICAL_IMPACT_CURRENTNESS_BINDING_MISMATCH");

    const staleSourceGeneration = hash("stale-topology-source-generation");
    const staleSource = deriveAdaptiveValidationTopology({
      ...base,
      sourceGenerationFingerprint: staleSourceGeneration,
      canonicalRepository: {
        ...base.canonicalRepository,
        sourceGenerationFingerprint: staleSourceGeneration,
      },
    });
    expect(staleSource.reasonCodes).toContain("PHYSICAL_IMPACT_CURRENTNESS_BINDING_MISMATCH");

    const staleRepositoryIdentity = hash("stale-topology-repository");
    const staleRepository = deriveAdaptiveValidationTopology({
      ...base,
      repositoryIdentity: staleRepositoryIdentity,
      canonicalRepository: {
        ...base.canonicalRepository,
        repositoryIdentity: staleRepositoryIdentity,
      },
    });
    expect(staleRepository.reasonCodes).toContain("PHYSICAL_IMPACT_CURRENTNESS_BINDING_MISMATCH");

    const driftedCatalog = buildAdaptiveScenarioCatalog({
      ownerIdentity: base.scenarioCatalog.ownerIdentity,
      catalogKey: base.scenarioCatalog.catalogKey,
      generation: base.scenarioCatalog.generation,
      predecessorCatalogGenerationIdentity:
        base.scenarioCatalog.predecessorCatalogGenerationIdentity,
      provenanceIdentity: hash("drifted-topology-catalog-provenance"),
      scenarioRevisions: base.scenarioCatalog.scenarioRevisions,
      oracles: base.scenarioCatalog.oracles,
      implementationBindings: base.scenarioCatalog.implementationBindings,
    });
    const staleCatalog = deriveAdaptiveValidationTopology({
      ...base,
      scenarioCatalog: driftedCatalog,
    });
    expect(staleCatalog.reasonCodes).toContain("PHYSICAL_IMPACT_CURRENTNESS_BINDING_MISMATCH");

    const staleWorkingSet = hash("stale-topology-working-set");
    const staleWorktree = { ...base.candidateWorktree, workingSetIdentity: staleWorkingSet };
    const staleWorking = deriveAdaptiveValidationTopology({
      ...base,
      candidateWorktree: staleWorktree,
      canonicalRepository: {
        ...base.canonicalRepository,
        candidateWorktree: staleWorktree,
      },
    });
    expect(staleWorking.reasonCodes).toContain("PHYSICAL_IMPACT_CURRENTNESS_BINDING_MISMATCH");
  });

  it("cryptographically rejects false validation commit claims", () => {
    const base = topologyFixture();
    const topology = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: base.affectedClosure.map((member, index) =>
        index === 1
          ? { ...member, readsLiveWorkingTree: false, readsCommittedObjects: true }
          : member,
      ),
    });
    const exact = materializationFixture(topology);
    expect(defineAdaptiveValidationMaterialization(exact).status).toBe("PASS");

    const arbitrary = defineAdaptiveValidationMaterialization({
      ...exact,
      validationCommit: "9".repeat(40),
    });
    expect(arbitrary.reasonCodes).toContain("VALIDATION_COMMIT_OBJECT_MISMATCH");

    const entries = [
      { path: "example-candidate.mjs", objectId: "c".repeat(40) },
      { path: "example-live-reader.mjs", objectId: "1".repeat(40) },
    ];
    const wrongParent = defineAdaptiveValidationMaterialization(
      materializationWithValidationEntries(topology, entries, {
        commitParent: "8".repeat(40),
      }),
    );
    expect(wrongParent.reasonCodes).toContain("VALIDATION_COMMIT_PARENT_OBJECT_MISMATCH");

    const multiParent = defineAdaptiveValidationMaterialization(
      materializationWithValidationEntries(topology, entries, {
        secondParent: "7".repeat(40),
      }),
    );
    expect(multiParent.reasonCodes).toContain("GIT_OBJECT_EVIDENCE_INVALID");

    const resealedWrongTree = defineAdaptiveValidationMaterialization({
      ...exact,
      validationCommitTree: "6".repeat(40),
      expectedValidationCommitTree: "6".repeat(40),
    });
    expect(resealedWrongTree.reasonCodes).toEqual(
      expect.arrayContaining([
        "VALIDATION_COMMIT_TREE_OBJECT_MISMATCH",
        "VALIDATION_TREE_OBJECT_IDENTITY_MISMATCH",
      ]),
    );
  });

  it("derives the recursive tree delta and rejects every path/blob/mode contradiction", () => {
    const base = topologyFixture();
    const topology = deriveAdaptiveValidationTopology({
      ...base,
      affectedClosure: base.affectedClosure.map((member, index) =>
        index === 1 ? { ...member, readsLiveWorkingTree: false, createsLocalClone: true } : member,
      ),
    });
    const observer = { path: "example-live-reader.mjs", objectId: "1".repeat(40) };
    const cases = [
      {
        entries: [
          { path: "example-candidate.mjs", objectId: "c".repeat(40) },
          observer,
          { path: "extra.mjs", objectId: "2".repeat(40) },
        ],
        reason: "GIT_TREE_DELTA_PATH_SET_MISMATCH",
      },
      { entries: [observer], reason: "GIT_TREE_CANDIDATE_BLOB_MISMATCH" },
      {
        entries: [{ path: "example-candidate.mjs", objectId: "e".repeat(40) }, observer],
        reason: "GIT_TREE_CANDIDATE_BLOB_MISMATCH",
      },
      {
        entries: [
          { mode: "100755", path: "example-candidate.mjs", objectId: "c".repeat(40) },
          observer,
        ],
        reason: "GIT_TREE_CANDIDATE_MODE_OR_TYPE_MISMATCH",
      },
    ];
    for (const { entries, reason } of cases) {
      const evidence = defineAdaptiveValidationMaterialization(
        materializationWithValidationEntries(topology, entries),
      );
      expect(evidence.status).toBe("BLOCKED");
      expect(evidence.reasonCodes).toContain(reason);
    }

    const exact = defineAdaptiveValidationMaterialization(materializationFixture(topology));
    expect(exact.recursiveTreeDelta).toEqual([
      {
        path: "example-candidate.mjs",
        parentMode: "100644",
        parentGitObject: "f".repeat(40),
        validationMode: "100644",
        validationGitObject: "c".repeat(40),
      },
    ]);
  });

  it("physically proves dirty parent truth and exact no-hardlink materialization truth", () => {
    const root = mkdtempSync(join(tmpdir(), "retrostage-slice3-topology-"));
    const repository = join(root, "repository");
    const dirtyObserver = join(root, "dirty-observer");
    const materializedObserver = join(root, "materialized-observer");
    try {
      runGit(root, "init", "--initial-branch=main", repository);
      runGit(repository, "config", "user.name", "RetroStage Fixture");
      runGit(repository, "config", "user.email", "fixture@invalid");
      writeFileSync(join(repository, "example-candidate.mjs"), "parent-generation\n", "utf8");
      writeFileSync(join(repository, "example-live-reader.mjs"), "local-clone-observer\n", "utf8");
      runGit(repository, "add", "--", "example-candidate.mjs", "example-live-reader.mjs");
      runGit(repository, "commit", "-m", "fixture parent");

      const parentHead = runGit(repository, "rev-parse", "HEAD");
      const parentTree = runGit(repository, "rev-parse", "HEAD^{tree}");
      const parentCandidateBlob = runGit(repository, "rev-parse", "HEAD:example-candidate.mjs");
      const observerBlob = runGit(repository, "rev-parse", "HEAD:example-live-reader.mjs");

      writeFileSync(join(repository, "example-candidate.mjs"), "candidate-generation\n", "utf8");
      const candidateSha256 = sha256Hex(
        readFileSync(join(repository, "example-candidate.mjs"), "utf8"),
      );
      const candidateBlob = runGit(repository, "hash-object", "example-candidate.mjs");
      runGit(root, "clone", "--local", "--no-hardlinks", repository, dirtyObserver);
      expect(
        readFileSync(join(dirtyObserver, "example-candidate.mjs"), "utf8").replace(/\r\n/gu, "\n"),
      ).toBe("parent-generation\n");
      expect(runGit(dirtyObserver, "rev-parse", "HEAD:example-candidate.mjs")).toBe(
        parentCandidateBlob,
      );
      expect(candidateBlob).not.toBe(parentCandidateBlob);

      const path = "example-candidate.mjs";
      const observerPath = "example-live-reader.mjs";
      const base = topologyFixture();
      const candidatePaths = [{ path, sha256: candidateSha256, gitBlob: candidateBlob }];
      const candidateWorktree = {
        workingSetIdentity: base.physicalImpact.workingSetIdentity,
        worktreeIdentity: hash("physical-worktree"),
        stagedPaths: [],
        modifiedTrackedPaths: [path],
        untrackedPaths: [],
      };
      const topologyInput = {
        parentHead,
        parentTree,
        repositoryIdentity: base.physicalImpact.repositoryIdentity,
        repositorySnapshotIdentity: base.physicalImpact.repositorySnapshotIdentity,
        currentTruthIdentity: base.physicalImpact.currentTruthIdentity,
        sourceGenerationFingerprint: base.physicalImpact.sourceGenerationFingerprint,
        sourceManifestIdentity: hash("physical-source-manifest"),
        scenarioCatalog: base.scenarioCatalog,
        physicalImpact: base.physicalImpact,
        candidateIdentity: hash("physical-candidate"),
        candidatePaths,
        candidateWorktree,
        affectedClosure: [
          topologyOwner(path, candidateBlob),
          {
            path: observerPath,
            materialIdentity: observerBlob,
            ownershipComplete: true,
            readsLiveWorkingTree: false,
            readsHead: true,
            readsHeadTree: true,
            readsCommittedObjects: true,
            readsHistory: false,
            createsLocalClone: true,
            expectsCleanCloneCandidate: true,
            materializesCommittedState: true,
          },
        ],
      };
      topologyInput.canonicalRepository = {
        head: parentHead,
        tree: parentTree,
        repositoryIdentity: topologyInput.repositoryIdentity,
        repositorySnapshotIdentity: topologyInput.repositorySnapshotIdentity,
        currentTruthIdentity: topologyInput.currentTruthIdentity,
        sourceGenerationFingerprint: topologyInput.sourceGenerationFingerprint,
        sourceManifestIdentity: topologyInput.sourceManifestIdentity,
        candidateIdentity: topologyInput.candidateIdentity,
        candidatePaths: clone(candidatePaths),
        candidateWorktree: clone(candidateWorktree),
      };
      const topology = deriveAdaptiveValidationTopology(topologyInput);
      expect(topology.disposition).toBe("DISPOSABLE_MATERIALIZED_COMMIT");

      runGit(repository, "add", "--", "example-candidate.mjs");
      runGit(repository, "commit", "-m", "validation-only materialization");
      const validationCommit = runGit(repository, "rev-parse", "HEAD");
      const validationTree = runGit(repository, "rev-parse", "HEAD^{tree}");
      expect(runGit(repository, "rev-parse", "HEAD^")).toBe(parentHead);
      expect(runGit(repository, "status", "--porcelain=v1", "--untracked-files=all")).toBe("");

      runGit(root, "clone", "--local", "--no-hardlinks", repository, materializedObserver);
      expect(
        readFileSync(join(materializedObserver, "example-candidate.mjs"), "utf8").replace(
          /\r\n/gu,
          "\n",
        ),
      ).toBe("candidate-generation\n");
      expect(runGit(materializedObserver, "rev-parse", "HEAD:example-candidate.mjs")).toBe(
        candidateBlob,
      );

      const commitRaw = runGitBytes(repository, "cat-file", "commit", validationCommit);
      const parentTreeRaw = runGitBytes(repository, "cat-file", "tree", parentTree);
      const validationTreeRaw = runGitBytes(repository, "cat-file", "tree", validationTree);

      const evidence = defineAdaptiveValidationMaterialization({
        ...materializationFixture(topology),
        validationCommit,
        validationCommitParent: parentHead,
        validationCommitTree: validationTree,
        expectedValidationCommitTree: validationTree,
        committedPaths: [{ path, gitBlob: candidateBlob }],
        gitObjectEvidence: {
          commitRawBase64: commitRaw.toString("base64"),
          treeObjects: [parentTreeRaw, validationTreeRaw].map((raw) => ({
            rawBase64: raw.toString("base64"),
          })),
        },
      });
      expect(evidence.status).toBe("PASS");
      expect(evidence.publicationAuthorization).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps the existing adaptive plan owner and mandatory wider gates compatible", () => {
    const state = fixture();
    const plan = deriveAdaptiveValidationPlan(state.input);
    const topology = deriveAdaptiveValidationTopology(topologyFixture());

    expect(verifyAdaptiveValidationPlan(plan)).toEqual(plan);
    expect(plan.targetedPruning).toBe("OFF");
    expect(plan.scheduledGateIds).toEqual(plan.mandatoryWiderGates.map(({ gateId }) => gateId));
    expect(topology.factAuthority).toBe("DERIVED_NON_AUTHORITATIVE");
  });
});
