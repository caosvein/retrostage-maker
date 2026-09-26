import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

import { canonicalJson } from "./canonical-json.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";
import { verifySemanticClosureWitness } from "./semantic-closure.mjs";

export const ADAPTIVE_SCENARIO_REVISION_SCHEMA = "CIC_ADAPTIVE_SCENARIO_REVISION_V1";
export const ADAPTIVE_ORACLE_SCHEMA = "CIC_ADAPTIVE_ORACLE_V1";
export const ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA = "CIC_ADAPTIVE_IMPLEMENTATION_BINDING_V1";
export const ADAPTIVE_SCENARIO_CATALOG_SCHEMA = "CIC_ADAPTIVE_SCENARIO_CATALOG_V1";
export const ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA =
  "CIC_ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_V1";
export const ADAPTIVE_PHYSICAL_IMPACT_SCHEMA = "CIC_ADAPTIVE_PHYSICAL_IMPACT_V1";
export const ADAPTIVE_SEMANTIC_IMPACT_SCHEMA = "CIC_ADAPTIVE_SEMANTIC_IMPACT_V1";
export const ADAPTIVE_RISK_ASSESSMENT_SCHEMA = "CIC_ADAPTIVE_RISK_ASSESSMENT_V1";
export const ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA = "CIC_ADAPTIVE_CAPABILITY_SNAPSHOT_V1";
export const ADAPTIVE_REUSE_WITNESS_SCHEMA = "CIC_ADAPTIVE_REUSE_WITNESS_V1";
export const ADAPTIVE_VALIDATION_PLAN_SCHEMA = "CIC_ADAPTIVE_VALIDATION_PLAN_V1";
export const ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA = "CIC_ADAPTIVE_VALIDATION_TOPOLOGY_V1";
export const ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA =
  "CIC_ADAPTIVE_VALIDATION_MATERIALIZATION_V1";
export const ADAPTIVE_VALIDATION_DISPOSITIONS = Object.freeze(["READY", "BLOCKED"]);
export const ADAPTIVE_VALIDATION_TOPOLOGY_DISPOSITIONS = Object.freeze([
  "DIRTY_WORKTREE",
  "DISPOSABLE_MATERIALIZED_COMMIT",
  "BLOCKED",
]);
export const ADAPTIVE_RISK_CLASSES = Object.freeze(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const TARGETED_PRUNING_POLICY = "OFF";

const IDENTITY = /^[0-9A-F]{64}$/u;
const CONTENT_IDENTITY = /^(?:[0-9a-f]{40}|[0-9A-F]{64})$/u;
const PORTABLE = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,127}$/u;
const SEMANTIC_KEY = /^[a-z0-9][a-z0-9._:/@+-]{0,127}$/u;
const ORACLE_CHANGE_KINDS = new Set([
  "INITIAL_REVIEWED_EXPECTATION",
  "REVIEWED_SEMANTIC_SUPERSESSION",
]);
const RISK_RANK = Object.freeze({ LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 });

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
}

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function plain(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, keys, code) {
  if (!plain(value)) fail(code);
  const actual = Object.keys(value).sort(compare);
  const expected = [...keys].sort(compare);
  if (canonicalJson(actual) !== canonicalJson(expected)) fail(code);
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const entry of Object.values(value)) deepFreeze(entry);
  }
  return value;
}

function identity(value, code) {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function contentIdentity(value, code) {
  if (typeof value !== "string" || !CONTENT_IDENTITY.test(value)) fail(code);
  return value;
}

function nullableIdentity(value, code) {
  return value === null ? null : identity(value, code);
}

function portable(value, code) {
  if (typeof value !== "string" || !PORTABLE.test(value)) fail(code);
  return value;
}

function normalizedSemanticKey(value, code) {
  if (typeof value !== "string" || !SEMANTIC_KEY.test(value)) fail(code);
  return value;
}

function positiveInteger(value, code) {
  if (!Number.isSafeInteger(value) || value < 1) fail(code);
  return value;
}

function boolean(value, code) {
  if (typeof value !== "boolean") fail(code);
  return value;
}

function stableUnique(values, normalize, code, { nonempty = false } = {}) {
  if (!Array.isArray(values) || (nonempty && values.length === 0)) fail(code);
  const normalized = values.map((value) => normalize(value, code)).sort(compare);
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function identities(values, code, options) {
  return stableUnique(values, identity, code, options);
}

function portableIds(values, code, options) {
  return stableUnique(values, portable, code, options);
}

function repositoryPaths(values, code, { nonempty = false } = {}) {
  return stableUnique(
    values,
    (value) => {
      try {
        return normalizeRepoRelativePath(value);
      } catch {
        fail(code);
      }
    },
    code,
    { nonempty },
  );
}

function recordIdentity(schema, body) {
  return sha256Hex(`${schema}\n${canonicalJson(body)}\n`);
}

function scenarioIdentity(ownerIdentity, semanticKey) {
  return recordIdentity("CIC_ADAPTIVE_SCENARIO_IDENTITY_V1", {
    ownerIdentity,
    semanticKey,
  });
}

function normalizePredecessor(value, keyField, identityField, code) {
  const predecessorKey = value[keyField] === null ? null : portable(value[keyField], code);
  const predecessorIdentity = nullableIdentity(value[identityField], code);
  if ((predecessorKey === null) !== (predecessorIdentity === null)) fail(code);
  return { predecessorKey, predecessorIdentity };
}

function normalizeScenarioRevisionBody(value) {
  const code = "ADAPTIVE_SCENARIO_REVISION_INVALID";
  const ownerIdentity = identity(value.ownerIdentity, code);
  const semanticKey = normalizedSemanticKey(value.semanticKey, code);
  const stableIdentity = scenarioIdentity(ownerIdentity, semanticKey);
  if (
    value.scenarioIdentity !== undefined &&
    identity(value.scenarioIdentity, code) !== stableIdentity
  ) {
    fail("ADAPTIVE_SCENARIO_IDENTITY_MISMATCH");
  }
  const predecessor = normalizePredecessor(
    value,
    "predecessorRevisionId",
    "predecessorRevisionIdentity",
    code,
  );
  const riskClass = value.riskClass;
  if (!ADAPTIVE_RISK_CLASSES.includes(riskClass)) fail(code);
  return {
    schemaVersion: ADAPTIVE_SCENARIO_REVISION_SCHEMA,
    scenarioIdentity: stableIdentity,
    ownerIdentity,
    semanticKey,
    revisionId: portable(value.revisionId, code),
    version: positiveInteger(value.version, code),
    generation: positiveInteger(value.generation, code),
    predecessorRevisionId: predecessor.predecessorKey,
    predecessorRevisionIdentity: predecessor.predecessorIdentity,
    provenanceIdentity: identity(value.provenanceIdentity, code),
    semanticIntentIdentity: identity(value.semanticIntentIdentity, code),
    semanticKind: portable(value.semanticKind, code),
    semanticSelectors: stableUnique(value.semanticSelectors, normalizedSemanticKey, code, {
      nonempty: true,
    }),
    required: boolean(value.required, code),
    requiredCapabilities: portableIds(value.requiredCapabilities, code),
    semanticRelationIdentities: identities(value.semanticRelationIdentities, code),
    riskClass,
  };
}

export function defineAdaptiveScenarioRevision(input) {
  exactKeys(
    input,
    [
      "generation",
      "ownerIdentity",
      "predecessorRevisionId",
      "predecessorRevisionIdentity",
      "provenanceIdentity",
      "required",
      "requiredCapabilities",
      "revisionId",
      "riskClass",
      "semanticIntentIdentity",
      "semanticKey",
      "semanticKind",
      "semanticSelectors",
      "semanticRelationIdentities",
      "version",
    ],
    "ADAPTIVE_SCENARIO_REVISION_INVALID",
  );
  const body = normalizeScenarioRevisionBody(input);
  return deepFreeze({
    ...body,
    revisionIdentity: recordIdentity(ADAPTIVE_SCENARIO_REVISION_SCHEMA, body),
  });
}

export function verifyAdaptiveScenarioRevision(record) {
  exactKeys(
    record,
    [
      "generation",
      "ownerIdentity",
      "predecessorRevisionId",
      "predecessorRevisionIdentity",
      "provenanceIdentity",
      "required",
      "requiredCapabilities",
      "revisionId",
      "revisionIdentity",
      "riskClass",
      "scenarioIdentity",
      "schemaVersion",
      "semanticIntentIdentity",
      "semanticKey",
      "semanticKind",
      "semanticSelectors",
      "semanticRelationIdentities",
      "version",
    ],
    "ADAPTIVE_SCENARIO_REVISION_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_SCENARIO_REVISION_SCHEMA) {
    fail("ADAPTIVE_SCENARIO_REVISION_INVALID");
  }
  const body = normalizeScenarioRevisionBody(record);
  const computed = recordIdentity(ADAPTIVE_SCENARIO_REVISION_SCHEMA, body);
  if (identity(record.revisionIdentity, "ADAPTIVE_SCENARIO_REVISION_INVALID") !== computed) {
    fail("ADAPTIVE_SCENARIO_REVISION_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, revisionIdentity: computed });
}

export function supersedeAdaptiveScenarioRevision(previousRecord, input) {
  const previous = verifyAdaptiveScenarioRevision(previousRecord);
  exactKeys(
    input,
    [
      "generation",
      "provenanceIdentity",
      "required",
      "requiredCapabilities",
      "revisionId",
      "riskClass",
      "semanticIntentIdentity",
      "semanticKind",
      "semanticSelectors",
      "semanticRelationIdentities",
    ],
    "ADAPTIVE_SCENARIO_SUPERSESSION_INVALID",
  );
  if (
    positiveInteger(input.generation, "ADAPTIVE_SCENARIO_SUPERSESSION_INVALID") <=
    previous.generation
  ) {
    fail("ADAPTIVE_SCENARIO_SUPERSESSION_INVALID");
  }
  return defineAdaptiveScenarioRevision({
    ...input,
    ownerIdentity: previous.ownerIdentity,
    semanticKey: previous.semanticKey,
    version: previous.version + 1,
    predecessorRevisionId: previous.revisionId,
    predecessorRevisionIdentity: previous.revisionIdentity,
  });
}

function oracleLineageIdentity(ownerIdentity, scenario, oracleKey) {
  return recordIdentity("CIC_ADAPTIVE_ORACLE_LINEAGE_IDENTITY_V1", {
    oracleKey,
    ownerIdentity,
    scenarioIdentity: scenario,
  });
}

function normalizeOracleBody(value) {
  const code = "ADAPTIVE_ORACLE_INVALID";
  const ownerIdentity = identity(value.ownerIdentity, code);
  const scenario = identity(value.scenarioIdentity, code);
  const oracleKey = normalizedSemanticKey(value.oracleKey, code);
  const lineageIdentity = oracleLineageIdentity(ownerIdentity, scenario, oracleKey);
  if (
    value.oracleLineageIdentity !== undefined &&
    identity(value.oracleLineageIdentity, code) !== lineageIdentity
  ) {
    fail("ADAPTIVE_ORACLE_LINEAGE_IDENTITY_MISMATCH");
  }
  const predecessor = normalizePredecessor(
    value,
    "predecessorOracleRevisionId",
    "predecessorOracleIdentity",
    code,
  );
  const version = positiveInteger(value.version, code);
  if (!ORACLE_CHANGE_KINDS.has(value.changeKind)) fail("ADAPTIVE_ORACLE_AUTO_GREEN_FORBIDDEN");
  if (
    (version === 1 &&
      (value.changeKind !== "INITIAL_REVIEWED_EXPECTATION" ||
        predecessor.predecessorKey !== null)) ||
    (version > 1 &&
      (value.changeKind !== "REVIEWED_SEMANTIC_SUPERSESSION" ||
        predecessor.predecessorKey === null))
  ) {
    fail("ADAPTIVE_ORACLE_SUPERSESSION_INVALID");
  }
  return {
    schemaVersion: ADAPTIVE_ORACLE_SCHEMA,
    oracleLineageIdentity: lineageIdentity,
    scenarioIdentity: scenario,
    ownerIdentity,
    oracleKey,
    oracleRevisionId: portable(value.oracleRevisionId, code),
    version,
    generation: positiveInteger(value.generation, code),
    predecessorOracleRevisionId: predecessor.predecessorKey,
    predecessorOracleIdentity: predecessor.predecessorIdentity,
    expectationIdentity: identity(value.expectationIdentity, code),
    provenanceIdentity: identity(value.provenanceIdentity, code),
    reviewIdentity: identity(value.reviewIdentity, code),
    changeIdentity: identity(value.changeIdentity, code),
    changeKind: value.changeKind,
  };
}

export function defineAdaptiveOracle(input) {
  exactKeys(
    input,
    [
      "changeIdentity",
      "changeKind",
      "expectationIdentity",
      "generation",
      "oracleKey",
      "oracleRevisionId",
      "ownerIdentity",
      "predecessorOracleIdentity",
      "predecessorOracleRevisionId",
      "provenanceIdentity",
      "reviewIdentity",
      "scenarioIdentity",
      "version",
    ],
    "ADAPTIVE_ORACLE_INVALID",
  );
  const body = normalizeOracleBody(input);
  return deepFreeze({
    ...body,
    oracleIdentity: recordIdentity(ADAPTIVE_ORACLE_SCHEMA, body),
  });
}

export function verifyAdaptiveOracle(record) {
  exactKeys(
    record,
    [
      "changeIdentity",
      "changeKind",
      "expectationIdentity",
      "generation",
      "oracleIdentity",
      "oracleKey",
      "oracleLineageIdentity",
      "oracleRevisionId",
      "ownerIdentity",
      "predecessorOracleIdentity",
      "predecessorOracleRevisionId",
      "provenanceIdentity",
      "reviewIdentity",
      "scenarioIdentity",
      "schemaVersion",
      "version",
    ],
    "ADAPTIVE_ORACLE_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_ORACLE_SCHEMA) fail("ADAPTIVE_ORACLE_INVALID");
  const body = normalizeOracleBody(record);
  const computed = recordIdentity(ADAPTIVE_ORACLE_SCHEMA, body);
  if (identity(record.oracleIdentity, "ADAPTIVE_ORACLE_INVALID") !== computed) {
    fail("ADAPTIVE_ORACLE_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, oracleIdentity: computed });
}

export function supersedeAdaptiveOracle(previousRecord, input) {
  const previous = verifyAdaptiveOracle(previousRecord);
  exactKeys(
    input,
    [
      "changeIdentity",
      "expectationIdentity",
      "generation",
      "oracleRevisionId",
      "provenanceIdentity",
      "reviewIdentity",
    ],
    "ADAPTIVE_ORACLE_SUPERSESSION_INVALID",
  );
  if (
    positiveInteger(input.generation, "ADAPTIVE_ORACLE_SUPERSESSION_INVALID") <= previous.generation
  ) {
    fail("ADAPTIVE_ORACLE_SUPERSESSION_INVALID");
  }
  return defineAdaptiveOracle({
    ...input,
    scenarioIdentity: previous.scenarioIdentity,
    ownerIdentity: previous.ownerIdentity,
    oracleKey: previous.oracleKey,
    version: previous.version + 1,
    predecessorOracleRevisionId: previous.oracleRevisionId,
    predecessorOracleIdentity: previous.oracleIdentity,
    changeKind: "REVIEWED_SEMANTIC_SUPERSESSION",
  });
}

function normalizeImplementationBindingBody(value) {
  const code = "ADAPTIVE_IMPLEMENTATION_BINDING_INVALID";
  const implementationPaths = repositoryPaths(value.implementationPaths, code);
  const testFiles = repositoryPaths(value.testFiles, code);
  if (implementationPaths.length === 0 && testFiles.length === 0) fail(code);
  if (!Array.isArray(value.validationActions) || value.validationActions.length === 0) fail(code);
  const validationActions = value.validationActions
    .map((entry) => {
      exactKeys(entry, ["actionIdentity", "commandIdentity"], code);
      return {
        actionIdentity: identity(entry.actionIdentity, code),
        commandIdentity: identity(entry.commandIdentity, code),
      };
    })
    .sort((left, right) => compare(left.actionIdentity, right.actionIdentity));
  if (
    new Set(validationActions.map(({ actionIdentity }) => actionIdentity)).size !==
    validationActions.length
  ) {
    fail(code);
  }
  return {
    schemaVersion: ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA,
    scenarioIdentity: identity(value.scenarioIdentity, code),
    scenarioRevisionIdentity: identity(value.scenarioRevisionIdentity, code),
    bindingVersion: positiveInteger(value.bindingVersion, code),
    generation: positiveInteger(value.generation, code),
    provenanceIdentity: identity(value.provenanceIdentity, code),
    implementationPaths,
    testFiles,
    validationActions,
    materialIdentities: identities(value.materialIdentities, code, { nonempty: true }),
  };
}

export function defineAdaptiveImplementationBinding(input) {
  exactKeys(
    input,
    [
      "bindingVersion",
      "generation",
      "implementationPaths",
      "materialIdentities",
      "provenanceIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
      "testFiles",
      "validationActions",
    ],
    "ADAPTIVE_IMPLEMENTATION_BINDING_INVALID",
  );
  const body = normalizeImplementationBindingBody(input);
  return deepFreeze({
    ...body,
    implementationBindingIdentity: recordIdentity(ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA, body),
  });
}

export function verifyAdaptiveImplementationBinding(record) {
  exactKeys(
    record,
    [
      "bindingVersion",
      "generation",
      "implementationBindingIdentity",
      "implementationPaths",
      "materialIdentities",
      "provenanceIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
      "schemaVersion",
      "testFiles",
      "validationActions",
    ],
    "ADAPTIVE_IMPLEMENTATION_BINDING_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA) {
    fail("ADAPTIVE_IMPLEMENTATION_BINDING_INVALID");
  }
  const body = normalizeImplementationBindingBody(record);
  const computed = recordIdentity(ADAPTIVE_IMPLEMENTATION_BINDING_SCHEMA, body);
  if (
    identity(record.implementationBindingIdentity, "ADAPTIVE_IMPLEMENTATION_BINDING_INVALID") !==
    computed
  ) {
    fail("ADAPTIVE_IMPLEMENTATION_BINDING_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, implementationBindingIdentity: computed });
}

function detectCycle(records, idField, predecessorField, code) {
  const byId = new Map(records.map((record) => [record[idField], record]));
  const states = new Map();
  function visit(record) {
    const state = states.get(record[idField]);
    if (state === "VISITING") fail(code);
    if (state === "VISITED") return;
    states.set(record[idField], "VISITING");
    const predecessorId = record[predecessorField];
    if (predecessorId !== null) visit(byId.get(predecessorId));
    states.set(record[idField], "VISITED");
  }
  for (const record of records) visit(record);
}

function activeLineageRecord(
  records,
  {
    idField,
    identityField,
    predecessorField,
    predecessorIdentityField,
    duplicateCode,
    missingCode,
    forkCode,
    cycleCode,
    ambiguousCode,
    versionCode,
  },
) {
  const ids = records.map((record) => record[idField]);
  const recordIdentities = records.map((record) => record[identityField]);
  if (new Set(ids).size !== ids.length || new Set(recordIdentities).size !== records.length) {
    fail(duplicateCode);
  }
  const byId = new Map(records.map((record) => [record[idField], record]));
  for (const record of records) {
    if (record[predecessorField] !== null && !byId.has(record[predecessorField])) fail(missingCode);
  }
  detectCycle(records, idField, predecessorField, cycleCode);
  const childCount = new Map(records.map((record) => [record[idField], 0]));
  for (const record of records) {
    if (record[predecessorField] !== null) {
      childCount.set(record[predecessorField], childCount.get(record[predecessorField]) + 1);
    }
  }
  if ([...childCount.values()].some((count) => count > 1)) fail(forkCode);
  const roots = records.filter((record) => record[predecessorField] === null);
  const leaves = records.filter((record) => childCount.get(record[idField]) === 0);
  if (roots.length !== 1 || leaves.length !== 1) fail(ambiguousCode);
  if (roots[0].version !== 1) fail(versionCode);
  for (const record of records) {
    if (record[predecessorField] === null) {
      if (record[predecessorIdentityField] !== null) fail(versionCode);
      continue;
    }
    const predecessor = byId.get(record[predecessorField]);
    if (
      record[predecessorIdentityField] !== predecessor[identityField] ||
      record.version !== predecessor.version + 1 ||
      record.generation <= predecessor.generation
    ) {
      fail(versionCode);
    }
  }
  return leaves[0];
}

function normalizeCatalogParts({ scenarioRevisions, oracles, implementationBindings }, generation) {
  if (
    !Array.isArray(scenarioRevisions) ||
    scenarioRevisions.length === 0 ||
    !Array.isArray(oracles) ||
    oracles.length === 0 ||
    !Array.isArray(implementationBindings) ||
    implementationBindings.length === 0
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_INVALID");
  }
  const revisions = scenarioRevisions
    .map(verifyAdaptiveScenarioRevision)
    .sort((left, right) =>
      compare(
        `${left.scenarioIdentity}:${String(left.version).padStart(12, "0")}`,
        `${right.scenarioIdentity}:${String(right.version).padStart(12, "0")}`,
      ),
    );
  const normalizedOracles = oracles
    .map(verifyAdaptiveOracle)
    .sort((left, right) =>
      compare(
        `${left.scenarioIdentity}:${String(left.version).padStart(12, "0")}`,
        `${right.scenarioIdentity}:${String(right.version).padStart(12, "0")}`,
      ),
    );
  const bindings = implementationBindings
    .map(verifyAdaptiveImplementationBinding)
    .sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (
    [...revisions, ...normalizedOracles, ...bindings].some(
      (record) => record.generation > generation,
    )
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_GENERATION_INVALID");
  }

  const revisionsByScenario = new Map();
  for (const revision of revisions) {
    const values = revisionsByScenario.get(revision.scenarioIdentity) ?? [];
    values.push(revision);
    revisionsByScenario.set(revision.scenarioIdentity, values);
  }
  const activeRevisions = [];
  for (const values of revisionsByScenario.values()) {
    if (
      new Set(values.map(({ ownerIdentity }) => ownerIdentity)).size !== 1 ||
      new Set(values.map(({ semanticKey }) => semanticKey)).size !== 1
    ) {
      fail("ADAPTIVE_SCENARIO_IDENTITY_AMBIGUOUS");
    }
    activeRevisions.push(
      activeLineageRecord(values, {
        idField: "revisionId",
        identityField: "revisionIdentity",
        predecessorField: "predecessorRevisionId",
        predecessorIdentityField: "predecessorRevisionIdentity",
        duplicateCode: "ADAPTIVE_SCENARIO_LINEAGE_DUPLICATE",
        missingCode: "ADAPTIVE_SCENARIO_LINEAGE_PREDECESSOR_MISSING",
        forkCode: "ADAPTIVE_SCENARIO_LINEAGE_FORKED",
        cycleCode: "ADAPTIVE_SCENARIO_LINEAGE_CYCLIC",
        ambiguousCode: "ADAPTIVE_SCENARIO_LINEAGE_AMBIGUOUS",
        versionCode: "ADAPTIVE_SCENARIO_LINEAGE_VERSION_INVALID",
      }),
    );
  }
  activeRevisions.sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  const activeScenarioIds = new Set(activeRevisions.map(({ scenarioIdentity: value }) => value));

  const oraclesByScenario = new Map();
  for (const oracle of normalizedOracles) {
    if (!activeScenarioIds.has(oracle.scenarioIdentity)) fail("ADAPTIVE_ORACLE_SCENARIO_UNKNOWN");
    const values = oraclesByScenario.get(oracle.scenarioIdentity) ?? [];
    values.push(oracle);
    oraclesByScenario.set(oracle.scenarioIdentity, values);
  }
  const activeOracles = [];
  for (const revision of activeRevisions) {
    const values = oraclesByScenario.get(revision.scenarioIdentity) ?? [];
    if (values.length === 0) fail("ADAPTIVE_ORACLE_LINEAGE_MISSING");
    if (
      new Set(values.map(({ ownerIdentity }) => ownerIdentity)).size !== 1 ||
      new Set(values.map(({ oracleKey }) => oracleKey)).size !== 1 ||
      values.some(({ ownerIdentity }) => ownerIdentity !== revision.ownerIdentity)
    ) {
      fail("ADAPTIVE_ORACLE_IDENTITY_AMBIGUOUS");
    }
    activeOracles.push(
      activeLineageRecord(values, {
        idField: "oracleRevisionId",
        identityField: "oracleIdentity",
        predecessorField: "predecessorOracleRevisionId",
        predecessorIdentityField: "predecessorOracleIdentity",
        duplicateCode: "ADAPTIVE_ORACLE_LINEAGE_DUPLICATE",
        missingCode: "ADAPTIVE_ORACLE_LINEAGE_PREDECESSOR_MISSING",
        forkCode: "ADAPTIVE_ORACLE_LINEAGE_FORKED",
        cycleCode: "ADAPTIVE_ORACLE_LINEAGE_CYCLIC",
        ambiguousCode: "ADAPTIVE_ORACLE_LINEAGE_AMBIGUOUS",
        versionCode: "ADAPTIVE_ORACLE_LINEAGE_VERSION_INVALID",
      }),
    );
  }
  activeOracles.sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));

  if (new Set(bindings.map(({ scenarioIdentity: value }) => value)).size !== bindings.length) {
    fail("ADAPTIVE_IMPLEMENTATION_BINDING_AMBIGUOUS");
  }
  if (bindings.length !== activeRevisions.length) fail("ADAPTIVE_IMPLEMENTATION_BINDING_MISSING");
  for (const revision of activeRevisions) {
    const binding = bindings.find(
      ({ scenarioIdentity: value }) => value === revision.scenarioIdentity,
    );
    if (!binding || binding.scenarioRevisionIdentity !== revision.revisionIdentity) {
      fail("ADAPTIVE_IMPLEMENTATION_BINDING_REVISION_MISMATCH");
    }
  }
  return { revisions, normalizedOracles, bindings, activeRevisions, activeOracles };
}

function normalizeCatalogBody(value) {
  const code = "ADAPTIVE_SCENARIO_CATALOG_INVALID";
  const ownerIdentity = identity(value.ownerIdentity, code);
  const catalogKey = normalizedSemanticKey(value.catalogKey, code);
  const generation = positiveInteger(value.generation, code);
  const stableCatalogIdentity = recordIdentity("CIC_ADAPTIVE_SCENARIO_CATALOG_IDENTITY_V1", {
    catalogKey,
    ownerIdentity,
  });
  if (
    value.catalogIdentity !== undefined &&
    identity(value.catalogIdentity, code) !== stableCatalogIdentity
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_IDENTITY_MISMATCH");
  }
  const predecessorCatalogGenerationIdentity = nullableIdentity(
    value.predecessorCatalogGenerationIdentity,
    code,
  );
  if (
    (generation === 1 && predecessorCatalogGenerationIdentity !== null) ||
    (generation > 1 && predecessorCatalogGenerationIdentity === null)
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_GENERATION_INVALID");
  }
  const parts = normalizeCatalogParts(value, generation);
  return {
    schemaVersion: ADAPTIVE_SCENARIO_CATALOG_SCHEMA,
    catalogIdentity: stableCatalogIdentity,
    catalogKey,
    ownerIdentity,
    generation,
    predecessorCatalogGenerationIdentity,
    provenanceIdentity: identity(value.provenanceIdentity, code),
    scenarioRevisions: parts.revisions,
    oracles: parts.normalizedOracles,
    implementationBindings: parts.bindings,
    activeScenarioRevisionIdentities: parts.activeRevisions.map(
      ({ revisionIdentity }) => revisionIdentity,
    ),
    activeOracleIdentities: parts.activeOracles.map(({ oracleIdentity }) => oracleIdentity),
    authorityState: "UNPROVEN",
    mutationAuthorization: false,
  };
}

export function buildAdaptiveScenarioCatalog(input) {
  exactKeys(
    input,
    [
      "catalogKey",
      "generation",
      "implementationBindings",
      "oracles",
      "ownerIdentity",
      "predecessorCatalogGenerationIdentity",
      "provenanceIdentity",
      "scenarioRevisions",
    ],
    "ADAPTIVE_SCENARIO_CATALOG_INVALID",
  );
  const body = normalizeCatalogBody(input);
  return deepFreeze({
    ...body,
    catalogGenerationIdentity: recordIdentity(ADAPTIVE_SCENARIO_CATALOG_SCHEMA, body),
  });
}

export function verifyAdaptiveScenarioCatalog(record) {
  exactKeys(
    record,
    [
      "activeOracleIdentities",
      "activeScenarioRevisionIdentities",
      "authorityState",
      "catalogGenerationIdentity",
      "catalogIdentity",
      "catalogKey",
      "generation",
      "implementationBindings",
      "mutationAuthorization",
      "oracles",
      "ownerIdentity",
      "predecessorCatalogGenerationIdentity",
      "provenanceIdentity",
      "scenarioRevisions",
      "schemaVersion",
    ],
    "ADAPTIVE_SCENARIO_CATALOG_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_SCENARIO_CATALOG_SCHEMA ||
    record.authorityState !== "UNPROVEN" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_INVALID");
  }
  const body = normalizeCatalogBody(record);
  if (
    canonicalJson(record.activeScenarioRevisionIdentities) !==
      canonicalJson(body.activeScenarioRevisionIdentities) ||
    canonicalJson(record.activeOracleIdentities) !== canonicalJson(body.activeOracleIdentities)
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_ACTIVE_SET_MISMATCH");
  }
  const computed = recordIdentity(ADAPTIVE_SCENARIO_CATALOG_SCHEMA, body);
  if (
    identity(record.catalogGenerationIdentity, "ADAPTIVE_SCENARIO_CATALOG_INVALID") !== computed
  ) {
    fail("ADAPTIVE_SCENARIO_CATALOG_GENERATION_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, catalogGenerationIdentity: computed });
}

function normalizeChangedMaterials(value, code) {
  if (!Array.isArray(value)) fail(code);
  const normalized = value.map((entry) => {
    exactKeys(entry, ["changeIdentity", "materialIdentities", "path"], code);
    let relativePath;
    try {
      relativePath = normalizeRepoRelativePath(entry.path);
    } catch {
      fail(code);
    }
    return {
      path: relativePath,
      materialIdentities: identities(entry.materialIdentities, code, { nonempty: true }),
      changeIdentity: identity(entry.changeIdentity, code),
    };
  });
  normalized.sort((left, right) => compare(left.path, right.path));
  if (new Set(normalized.map(({ path }) => path)).size !== normalized.length) fail(code);
  return normalized;
}

function normalizePhysicalDependencyClosureBody(value) {
  const code = "ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_INVALID";
  if (!["COMPLETE", "INCOMPLETE"].includes(value.completeness)) fail(code);
  return {
    schemaVersion: ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA,
    scenarioIdentity: identity(value.scenarioIdentity, code),
    scenarioRevisionIdentity: identity(value.scenarioRevisionIdentity, code),
    implementationBindingIdentity: identity(value.implementationBindingIdentity, code),
    completeness: value.completeness,
    paths: repositoryPaths(value.paths, code),
    materialIdentities: identities(value.materialIdentities, code, { nonempty: true }),
    provenanceIdentity: identity(value.provenanceIdentity, code),
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
  };
}

export function defineAdaptivePhysicalDependencyClosure(input) {
  exactKeys(
    input,
    [
      "completeness",
      "implementationBindingIdentity",
      "materialIdentities",
      "paths",
      "provenanceIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
    ],
    "ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_INVALID",
  );
  const body = normalizePhysicalDependencyClosureBody(input);
  return deepFreeze({
    ...body,
    physicalDependencyClosureIdentity: recordIdentity(
      ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA,
      body,
    ),
  });
}

export function verifyAdaptivePhysicalDependencyClosure(record) {
  exactKeys(
    record,
    [
      "completeness",
      "factAuthority",
      "implementationBindingIdentity",
      "materialIdentities",
      "mutationAuthorization",
      "paths",
      "physicalDependencyClosureIdentity",
      "provenanceIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
      "schemaVersion",
    ],
    "ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA ||
    record.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_INVALID");
  }
  const body = normalizePhysicalDependencyClosureBody(record);
  const computed = recordIdentity(ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_SCHEMA, body);
  if (
    identity(
      record.physicalDependencyClosureIdentity,
      "ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_INVALID",
    ) !== computed
  ) {
    fail("ADAPTIVE_PHYSICAL_DEPENDENCY_CLOSURE_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, physicalDependencyClosureIdentity: computed });
}

function normalizeScenarioPartitions(value, code) {
  const affectedScenarioIdentities = identities(value.affectedScenarioIdentities, code);
  const provenUnaffectedScenarioIdentities = identities(
    value.provenUnaffectedScenarioIdentities,
    code,
  );
  const unknownScenarioIdentities = identities(value.unknownScenarioIdentities, code);
  const combined = [
    ...affectedScenarioIdentities,
    ...provenUnaffectedScenarioIdentities,
    ...unknownScenarioIdentities,
  ];
  if (new Set(combined).size !== combined.length) fail(code);
  return {
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
  };
}

function normalizePhysicalImpactBody(value) {
  const code = "ADAPTIVE_PHYSICAL_IMPACT_INVALID";
  const partitions = normalizeScenarioPartitions(value, code);
  if (!Array.isArray(value.dependencyClosures)) fail(code);
  const dependencyClosures = value.dependencyClosures
    .map(verifyAdaptivePhysicalDependencyClosure)
    .sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (
    new Set(dependencyClosures.map(({ scenarioIdentity }) => scenarioIdentity)).size !==
    dependencyClosures.length
  ) {
    fail(code);
  }
  const physicalDependencySetIdentity = recordIdentity("CIC_ADAPTIVE_PHYSICAL_DEPENDENCY_SET_V1", {
    dependencyClosures,
  });
  if (identity(value.physicalDependencySetIdentity, code) !== physicalDependencySetIdentity) {
    fail("ADAPTIVE_PHYSICAL_DEPENDENCY_SET_IDENTITY_MISMATCH");
  }
  return {
    schemaVersion: ADAPTIVE_PHYSICAL_IMPACT_SCHEMA,
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    workingSetIdentity: identity(value.workingSetIdentity, code),
    catalogGenerationIdentity: identity(value.catalogGenerationIdentity, code),
    physicalDependencySetIdentity,
    changedMaterials: normalizeChangedMaterials(value.changedMaterials, code),
    dependencyClosures,
    ...partitions,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
  };
}

function derivePhysicalImpactPartitions(catalog, dependencyClosures, changedMaterials) {
  const active = catalogActiveRecords(catalog);
  const activeIds = new Set(active.map(({ revision }) => revision.scenarioIdentity));
  if (dependencyClosures.some(({ scenarioIdentity }) => !activeIds.has(scenarioIdentity))) {
    fail("ADAPTIVE_PHYSICAL_DEPENDENCY_SCENARIO_UNKNOWN");
  }
  const affectedScenarioIdentities = [];
  const provenUnaffectedScenarioIdentities = [];
  const unknownScenarioIdentities = [];
  for (const { revision, binding } of active) {
    const dependency = dependencyClosures.find(
      ({ scenarioIdentity }) => scenarioIdentity === revision.scenarioIdentity,
    );
    if (dependency === undefined) {
      unknownScenarioIdentities.push(revision.scenarioIdentity);
      continue;
    }
    if (
      dependency.scenarioRevisionIdentity !== revision.revisionIdentity ||
      dependency.implementationBindingIdentity !== binding.implementationBindingIdentity ||
      canonicalJson(dependency.materialIdentities) !== canonicalJson(binding.materialIdentities)
    ) {
      fail("ADAPTIVE_PHYSICAL_DEPENDENCY_BINDING_MISMATCH");
    }
    const requiredPaths = [...new Set([...binding.implementationPaths, ...binding.testFiles])].sort(
      compare,
    );
    const complete =
      dependency.completeness === "COMPLETE" &&
      requiredPaths.every((path) => dependency.paths.includes(path));
    if (!complete) {
      unknownScenarioIdentities.push(revision.scenarioIdentity);
      continue;
    }
    const dependencyMaterials = new Set(dependency.materialIdentities);
    const affected = changedMaterials.some(
      (change) =>
        dependency.paths.includes(change.path) ||
        change.materialIdentities.some((material) => dependencyMaterials.has(material)),
    );
    (affected ? affectedScenarioIdentities : provenUnaffectedScenarioIdentities).push(
      revision.scenarioIdentity,
    );
  }
  return {
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
  };
}

function assertPhysicalImpactDerivation(catalog, impact) {
  const expected = derivePhysicalImpactPartitions(
    catalog,
    impact.dependencyClosures,
    impact.changedMaterials,
  );
  if (
    canonicalJson(expected.affectedScenarioIdentities) !==
      canonicalJson(impact.affectedScenarioIdentities) ||
    canonicalJson(expected.provenUnaffectedScenarioIdentities) !==
      canonicalJson(impact.provenUnaffectedScenarioIdentities) ||
    canonicalJson(expected.unknownScenarioIdentities) !==
      canonicalJson(impact.unknownScenarioIdentities)
  ) {
    fail("ADAPTIVE_PHYSICAL_IMPACT_DERIVATION_MISMATCH");
  }
}

export function buildAdaptivePhysicalImpact(input) {
  exactKeys(
    input,
    [
      "catalog",
      "changedMaterials",
      "currentTruthIdentity",
      "dependencyClosures",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "sourceGenerationFingerprint",
      "workingSetIdentity",
    ],
    "ADAPTIVE_PHYSICAL_IMPACT_INVALID",
  );
  const catalog = verifyAdaptiveScenarioCatalog(input.catalog);
  if (!Array.isArray(input.dependencyClosures)) fail("ADAPTIVE_PHYSICAL_IMPACT_INVALID");
  const dependencyClosures = input.dependencyClosures
    .map(verifyAdaptivePhysicalDependencyClosure)
    .sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (
    new Set(dependencyClosures.map(({ scenarioIdentity }) => scenarioIdentity)).size !==
    dependencyClosures.length
  ) {
    fail("ADAPTIVE_PHYSICAL_IMPACT_INVALID");
  }
  const changedMaterials = normalizeChangedMaterials(
    input.changedMaterials,
    "ADAPTIVE_PHYSICAL_IMPACT_INVALID",
  );
  const {
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
  } = derivePhysicalImpactPartitions(catalog, dependencyClosures, changedMaterials);
  const physicalDependencySetIdentity = recordIdentity("CIC_ADAPTIVE_PHYSICAL_DEPENDENCY_SET_V1", {
    dependencyClosures,
  });
  const body = normalizePhysicalImpactBody({
    schemaVersion: ADAPTIVE_PHYSICAL_IMPACT_SCHEMA,
    currentTruthIdentity: input.currentTruthIdentity,
    sourceGenerationFingerprint: input.sourceGenerationFingerprint,
    repositoryIdentity: input.repositoryIdentity,
    repositorySnapshotIdentity: input.repositorySnapshotIdentity,
    workingSetIdentity: input.workingSetIdentity,
    catalogGenerationIdentity: catalog.catalogGenerationIdentity,
    physicalDependencySetIdentity,
    changedMaterials,
    dependencyClosures,
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
  });
  return deepFreeze({
    ...body,
    physicalImpactIdentity: recordIdentity(ADAPTIVE_PHYSICAL_IMPACT_SCHEMA, body),
  });
}

export function verifyAdaptivePhysicalImpact(record) {
  exactKeys(
    record,
    [
      "affectedScenarioIdentities",
      "catalogGenerationIdentity",
      "changedMaterials",
      "currentTruthIdentity",
      "dependencyClosures",
      "factAuthority",
      "mutationAuthorization",
      "physicalDependencySetIdentity",
      "physicalImpactIdentity",
      "provenUnaffectedScenarioIdentities",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "schemaVersion",
      "sourceGenerationFingerprint",
      "unknownScenarioIdentities",
      "workingSetIdentity",
    ],
    "ADAPTIVE_PHYSICAL_IMPACT_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_PHYSICAL_IMPACT_SCHEMA ||
    record.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_PHYSICAL_IMPACT_INVALID");
  }
  const body = normalizePhysicalImpactBody(record);
  const computed = recordIdentity(ADAPTIVE_PHYSICAL_IMPACT_SCHEMA, body);
  if (identity(record.physicalImpactIdentity, "ADAPTIVE_PHYSICAL_IMPACT_INVALID") !== computed) {
    fail("ADAPTIVE_PHYSICAL_IMPACT_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, physicalImpactIdentity: computed });
}

function normalizeSemanticImpactBody(value) {
  const code = "ADAPTIVE_SEMANTIC_IMPACT_INVALID";
  const partitions = normalizeScenarioPartitions(value, code);
  if (!Array.isArray(value.selectorBindings)) fail(code);
  const selectorBindings = value.selectorBindings
    .map((entry) => {
      exactKeys(entry, ["scenarioIdentity", "scenarioRevisionIdentity", "semanticSelectors"], code);
      return {
        scenarioIdentity: identity(entry.scenarioIdentity, code),
        scenarioRevisionIdentity: identity(entry.scenarioRevisionIdentity, code),
        semanticSelectors: stableUnique(entry.semanticSelectors, normalizedSemanticKey, code, {
          nonempty: true,
        }),
      };
    })
    .sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (
    new Set(selectorBindings.map(({ scenarioIdentity }) => scenarioIdentity)).size !==
    selectorBindings.length
  ) {
    fail(code);
  }
  const semanticClosureProjectionIdentity = recordIdentity(
    "CIC_ADAPTIVE_SEMANTIC_CLOSURE_PROJECTION_V1",
    {
      closureWitnessIdentity: value.closureWitnessIdentity,
      selectorBindings,
    },
  );
  if (
    identity(value.semanticClosureProjectionIdentity, code) !== semanticClosureProjectionIdentity
  ) {
    fail("ADAPTIVE_SEMANTIC_CLOSURE_PROJECTION_IDENTITY_MISMATCH");
  }
  return {
    schemaVersion: ADAPTIVE_SEMANTIC_IMPACT_SCHEMA,
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    contextGenerationIdentity: identity(value.contextGenerationIdentity, code),
    taskMaterialFingerprint: identity(value.taskMaterialFingerprint, code),
    closureWitnessIdentity: identity(value.closureWitnessIdentity, code),
    catalogGenerationIdentity: identity(value.catalogGenerationIdentity, code),
    semanticClosureProjectionIdentity,
    selectorBindings,
    ...partitions,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
  };
}

function deriveSemanticImpactPartitions(catalog, closure) {
  const selectorBindings = catalogActiveRecords(catalog).map(({ revision }) => ({
    scenarioIdentity: revision.scenarioIdentity,
    scenarioRevisionIdentity: revision.revisionIdentity,
    semanticSelectors: revision.semanticSelectors,
  }));
  const affectedKeys = new Set([...closure.requestedRoots, ...closure.closureMembers]);
  const provenAbsentKeys = new Set(closure.absentProven);
  const affectedScenarioIdentities = [];
  const provenUnaffectedScenarioIdentities = [];
  const unknownScenarioIdentities = [];
  for (const binding of selectorBindings) {
    if (binding.semanticSelectors.some((selector) => affectedKeys.has(selector))) {
      affectedScenarioIdentities.push(binding.scenarioIdentity);
    } else if (binding.semanticSelectors.every((selector) => provenAbsentKeys.has(selector))) {
      provenUnaffectedScenarioIdentities.push(binding.scenarioIdentity);
    } else {
      unknownScenarioIdentities.push(binding.scenarioIdentity);
    }
  }
  return {
    selectorBindings,
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
  };
}

function assertSemanticImpactDerivation(catalog, closure, impact) {
  const expected = deriveSemanticImpactPartitions(catalog, closure);
  if (
    canonicalJson(expected.selectorBindings) !== canonicalJson(impact.selectorBindings) ||
    canonicalJson(expected.affectedScenarioIdentities) !==
      canonicalJson(impact.affectedScenarioIdentities) ||
    canonicalJson(expected.provenUnaffectedScenarioIdentities) !==
      canonicalJson(impact.provenUnaffectedScenarioIdentities) ||
    canonicalJson(expected.unknownScenarioIdentities) !==
      canonicalJson(impact.unknownScenarioIdentities)
  ) {
    fail("ADAPTIVE_SEMANTIC_IMPACT_DERIVATION_MISMATCH");
  }
}

export function buildAdaptiveSemanticImpact(input) {
  exactKeys(input, ["catalog", "semanticClosureWitness"], "ADAPTIVE_SEMANTIC_IMPACT_INVALID");
  const catalog = verifyAdaptiveScenarioCatalog(input.catalog);
  let closure;
  try {
    closure = verifySemanticClosureWitness(input.semanticClosureWitness);
  } catch {
    fail("ADAPTIVE_SEMANTIC_CLOSURE_WITNESS_INVALID");
  }
  const {
    selectorBindings,
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
  } = deriveSemanticImpactPartitions(catalog, closure);
  const semanticClosureProjectionIdentity = recordIdentity(
    "CIC_ADAPTIVE_SEMANTIC_CLOSURE_PROJECTION_V1",
    { closureWitnessIdentity: closure.closureWitnessIdentity, selectorBindings },
  );
  const body = normalizeSemanticImpactBody({
    schemaVersion: ADAPTIVE_SEMANTIC_IMPACT_SCHEMA,
    currentTruthIdentity: closure.currentTruthIdentity,
    sourceGenerationFingerprint: closure.sourceGenerationFingerprint,
    contextGenerationIdentity: closure.contextGenerationIdentity,
    taskMaterialFingerprint: closure.taskMaterialFingerprint,
    closureWitnessIdentity: closure.closureWitnessIdentity,
    catalogGenerationIdentity: catalog.catalogGenerationIdentity,
    semanticClosureProjectionIdentity,
    selectorBindings,
    affectedScenarioIdentities,
    provenUnaffectedScenarioIdentities,
    unknownScenarioIdentities,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
  });
  return deepFreeze({
    ...body,
    semanticImpactIdentity: recordIdentity(ADAPTIVE_SEMANTIC_IMPACT_SCHEMA, body),
  });
}

export function verifyAdaptiveSemanticImpact(record) {
  exactKeys(
    record,
    [
      "affectedScenarioIdentities",
      "catalogGenerationIdentity",
      "closureWitnessIdentity",
      "contextGenerationIdentity",
      "currentTruthIdentity",
      "factAuthority",
      "mutationAuthorization",
      "provenUnaffectedScenarioIdentities",
      "schemaVersion",
      "selectorBindings",
      "semanticClosureProjectionIdentity",
      "semanticImpactIdentity",
      "sourceGenerationFingerprint",
      "taskMaterialFingerprint",
      "unknownScenarioIdentities",
    ],
    "ADAPTIVE_SEMANTIC_IMPACT_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_SEMANTIC_IMPACT_SCHEMA ||
    record.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_SEMANTIC_IMPACT_INVALID");
  }
  const body = normalizeSemanticImpactBody(record);
  const computed = recordIdentity(ADAPTIVE_SEMANTIC_IMPACT_SCHEMA, body);
  if (identity(record.semanticImpactIdentity, "ADAPTIVE_SEMANTIC_IMPACT_INVALID") !== computed) {
    fail("ADAPTIVE_SEMANTIC_IMPACT_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, semanticImpactIdentity: computed });
}

function normalizeRiskBody(value) {
  const code = "ADAPTIVE_RISK_ASSESSMENT_INVALID";
  if (!ADAPTIVE_RISK_CLASSES.includes(value.classification)) fail(code);
  return {
    schemaVersion: ADAPTIVE_RISK_ASSESSMENT_SCHEMA,
    taskIdentity: identity(value.taskIdentity, code),
    catalogGenerationIdentity: identity(value.catalogGenerationIdentity, code),
    physicalImpactIdentity: identity(value.physicalImpactIdentity, code),
    semanticImpactIdentity: identity(value.semanticImpactIdentity, code),
    assessmentVersion: positiveInteger(value.assessmentVersion, code),
    classification: value.classification,
    riskFactorIdentities: identities(value.riskFactorIdentities, code),
    changedImplementationScenarioIdentities: identities(
      value.changedImplementationScenarioIdentities,
      code,
    ),
    changedOracleScenarioIdentities: identities(value.changedOracleScenarioIdentities, code),
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    mutationAuthorization: false,
  };
}

export function defineAdaptiveRiskAssessment(input) {
  exactKeys(
    input,
    [
      "assessmentVersion",
      "catalogGenerationIdentity",
      "changedImplementationScenarioIdentities",
      "changedOracleScenarioIdentities",
      "classification",
      "physicalImpactIdentity",
      "riskFactorIdentities",
      "semanticImpactIdentity",
      "taskIdentity",
    ],
    "ADAPTIVE_RISK_ASSESSMENT_INVALID",
  );
  const body = normalizeRiskBody(input);
  return deepFreeze({
    ...body,
    riskIdentity: recordIdentity(ADAPTIVE_RISK_ASSESSMENT_SCHEMA, body),
  });
}

export function verifyAdaptiveRiskAssessment(record) {
  exactKeys(
    record,
    [
      "assessmentVersion",
      "catalogGenerationIdentity",
      "changedImplementationScenarioIdentities",
      "changedOracleScenarioIdentities",
      "classification",
      "factAuthority",
      "mutationAuthorization",
      "physicalImpactIdentity",
      "riskFactorIdentities",
      "riskIdentity",
      "schemaVersion",
      "semanticImpactIdentity",
      "taskIdentity",
    ],
    "ADAPTIVE_RISK_ASSESSMENT_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_RISK_ASSESSMENT_SCHEMA ||
    record.factAuthority !== "NON_AUTHORITATIVE_INPUT" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_RISK_ASSESSMENT_INVALID");
  }
  const body = normalizeRiskBody(record);
  const computed = recordIdentity(ADAPTIVE_RISK_ASSESSMENT_SCHEMA, body);
  if (identity(record.riskIdentity, "ADAPTIVE_RISK_ASSESSMENT_INVALID") !== computed) {
    fail("ADAPTIVE_RISK_ASSESSMENT_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, riskIdentity: computed });
}

function normalizeCapabilityBody(value) {
  const code = "ADAPTIVE_CAPABILITY_SNAPSHOT_INVALID";
  const availableCapabilities = portableIds(value.availableCapabilities, code);
  const unknownCapabilities = portableIds(value.unknownCapabilities, code);
  if (unknownCapabilities.some((capability) => availableCapabilities.includes(capability)))
    fail(code);
  return {
    schemaVersion: ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA,
    environmentIdentity: identity(value.environmentIdentity, code),
    availableCapabilities,
    unknownCapabilities,
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    mutationAuthorization: false,
  };
}

export function defineAdaptiveCapabilitySnapshot(input) {
  exactKeys(
    input,
    ["availableCapabilities", "environmentIdentity", "unknownCapabilities"],
    "ADAPTIVE_CAPABILITY_SNAPSHOT_INVALID",
  );
  const body = normalizeCapabilityBody(input);
  return deepFreeze({
    ...body,
    capabilityIdentity: recordIdentity(ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA, body),
  });
}

export function verifyAdaptiveCapabilitySnapshot(record) {
  exactKeys(
    record,
    [
      "availableCapabilities",
      "capabilityIdentity",
      "environmentIdentity",
      "factAuthority",
      "mutationAuthorization",
      "schemaVersion",
      "unknownCapabilities",
    ],
    "ADAPTIVE_CAPABILITY_SNAPSHOT_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA ||
    record.factAuthority !== "NON_AUTHORITATIVE_INPUT" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_CAPABILITY_SNAPSHOT_INVALID");
  }
  const body = normalizeCapabilityBody(record);
  const computed = recordIdentity(ADAPTIVE_CAPABILITY_SNAPSHOT_SCHEMA, body);
  if (identity(record.capabilityIdentity, "ADAPTIVE_CAPABILITY_SNAPSHOT_INVALID") !== computed) {
    fail("ADAPTIVE_CAPABILITY_SNAPSHOT_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, capabilityIdentity: computed });
}

function normalizeReuseWitnessBody(value) {
  const code = "ADAPTIVE_REUSE_WITNESS_INVALID";
  if (value.disposition !== "PRIOR_PASS_CANDIDATE") fail(code);
  return {
    schemaVersion: ADAPTIVE_REUSE_WITNESS_SCHEMA,
    scenarioIdentity: identity(value.scenarioIdentity, code),
    scenarioRevisionIdentity: identity(value.scenarioRevisionIdentity, code),
    oracleIdentity: identity(value.oracleIdentity, code),
    implementationBindingIdentity: identity(value.implementationBindingIdentity, code),
    materialIdentities: identities(value.materialIdentities, code, { nonempty: true }),
    evidenceIdentity: identity(value.evidenceIdentity, code),
    catalogGenerationIdentity: identity(value.catalogGenerationIdentity, code),
    physicalImpactIdentity: identity(value.physicalImpactIdentity, code),
    physicalDependencySetIdentity: identity(value.physicalDependencySetIdentity, code),
    semanticImpactIdentity: identity(value.semanticImpactIdentity, code),
    semanticClosureProjectionIdentity: identity(value.semanticClosureProjectionIdentity, code),
    closureWitnessIdentity: identity(value.closureWitnessIdentity, code),
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    workingSetIdentity: identity(value.workingSetIdentity, code),
    contextGenerationIdentity: identity(value.contextGenerationIdentity, code),
    contextClosureIdentity: identity(value.contextClosureIdentity, code),
    taskMaterialFingerprint: identity(value.taskMaterialFingerprint, code),
    disposition: "PRIOR_PASS_CANDIDATE",
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    mutationAuthorization: false,
  };
}

export function defineAdaptiveReuseWitness(input) {
  exactKeys(
    input,
    [
      "catalogGenerationIdentity",
      "closureWitnessIdentity",
      "contextClosureIdentity",
      "contextGenerationIdentity",
      "currentTruthIdentity",
      "disposition",
      "evidenceIdentity",
      "physicalImpactIdentity",
      "physicalDependencySetIdentity",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
      "oracleIdentity",
      "implementationBindingIdentity",
      "materialIdentities",
      "semanticImpactIdentity",
      "semanticClosureProjectionIdentity",
      "sourceGenerationFingerprint",
      "sourceManifestIdentity",
      "taskMaterialFingerprint",
      "workingSetIdentity",
    ],
    "ADAPTIVE_REUSE_WITNESS_INVALID",
  );
  const body = normalizeReuseWitnessBody(input);
  return deepFreeze({
    ...body,
    impactWitnessIdentity: recordIdentity(ADAPTIVE_REUSE_WITNESS_SCHEMA, body),
  });
}

export function verifyAdaptiveReuseWitness(record) {
  exactKeys(
    record,
    [
      "catalogGenerationIdentity",
      "closureWitnessIdentity",
      "contextClosureIdentity",
      "contextGenerationIdentity",
      "currentTruthIdentity",
      "disposition",
      "evidenceIdentity",
      "factAuthority",
      "impactWitnessIdentity",
      "mutationAuthorization",
      "physicalImpactIdentity",
      "physicalDependencySetIdentity",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
      "oracleIdentity",
      "implementationBindingIdentity",
      "materialIdentities",
      "schemaVersion",
      "semanticImpactIdentity",
      "semanticClosureProjectionIdentity",
      "sourceGenerationFingerprint",
      "sourceManifestIdentity",
      "taskMaterialFingerprint",
      "workingSetIdentity",
    ],
    "ADAPTIVE_REUSE_WITNESS_INVALID",
  );
  if (
    record.schemaVersion !== ADAPTIVE_REUSE_WITNESS_SCHEMA ||
    record.factAuthority !== "NON_AUTHORITATIVE_INPUT" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_REUSE_WITNESS_INVALID");
  }
  const body = normalizeReuseWitnessBody(record);
  const computed = recordIdentity(ADAPTIVE_REUSE_WITNESS_SCHEMA, body);
  if (identity(record.impactWitnessIdentity, "ADAPTIVE_REUSE_WITNESS_INVALID") !== computed) {
    fail("ADAPTIVE_REUSE_WITNESS_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, impactWitnessIdentity: computed });
}

function normalizeGate(value) {
  const code = "ADAPTIVE_MANDATORY_GATE_INVALID";
  exactKeys(value, ["commandIdentity", "gateId", "required", "requiredCapabilities"], code);
  if (value.required !== true) fail(code);
  return {
    gateId: portable(value.gateId, code),
    required: true,
    commandIdentity: identity(value.commandIdentity, code),
    requiredCapabilities: portableIds(value.requiredCapabilities, code),
  };
}

function normalizeGates(value) {
  if (!Array.isArray(value) || value.length === 0) fail("ADAPTIVE_MANDATORY_GATES_INVALID");
  const gates = value.map(normalizeGate).sort((left, right) => compare(left.gateId, right.gateId));
  if (new Set(gates.map(({ gateId }) => gateId)).size !== gates.length) {
    fail("ADAPTIVE_MANDATORY_GATES_INVALID");
  }
  return gates;
}

function catalogActiveRecords(catalog) {
  const activeRevisionSet = new Set(catalog.activeScenarioRevisionIdentities);
  const activeOracleSet = new Set(catalog.activeOracleIdentities);
  return catalog.scenarioRevisions
    .filter(({ revisionIdentity }) => activeRevisionSet.has(revisionIdentity))
    .map((revision) => ({
      revision,
      oracle: catalog.oracles.find(
        ({ scenarioIdentity: value, oracleIdentity }) =>
          value === revision.scenarioIdentity && activeOracleSet.has(oracleIdentity),
      ),
      binding: catalog.implementationBindings.find(
        ({ scenarioIdentity: value }) => value === revision.scenarioIdentity,
      ),
    }))
    .sort((left, right) =>
      compare(left.revision.scenarioIdentity, right.revision.scenarioIdentity),
    );
}

function validateImpactCoverage(impact, activeScenarioIds, prefix, reasons) {
  const classified = new Set([
    ...impact.affectedScenarioIdentities,
    ...impact.provenUnaffectedScenarioIdentities,
    ...impact.unknownScenarioIdentities,
  ]);
  if ([...classified].some((value) => !activeScenarioIds.has(value))) {
    fail(`ADAPTIVE_${prefix}_IMPACT_SCENARIO_UNKNOWN`);
  }
  if (classified.size !== activeScenarioIds.size)
    reasons.push(`${prefix}_IMPACT_COVERAGE_INCOMPLETE`);
  if (impact.unknownScenarioIdentities.length !== 0) reasons.push(`${prefix}_IMPACT_UNKNOWN`);
}

function normalizePlanBindings(value) {
  const code = "ADAPTIVE_PLAN_BINDINGS_INVALID";
  exactKeys(
    value,
    [
      "contextClosureIdentity",
      "sourceAnchorIdentities",
      "sourceManifestIdentity",
      "workingSetIdentity",
    ],
    code,
  );
  return {
    contextClosureIdentity: identity(value.contextClosureIdentity, code),
    sourceAnchorIdentities: identities(value.sourceAnchorIdentities, code, { nonempty: true }),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    workingSetIdentity: identity(value.workingSetIdentity, code),
  };
}

function matchingReuseBindings(witness, bindings) {
  return [
    [witness.catalogGenerationIdentity, bindings.catalogGenerationIdentity],
    [witness.physicalImpactIdentity, bindings.physicalImpactIdentity],
    [witness.physicalDependencySetIdentity, bindings.physicalDependencySetIdentity],
    [witness.semanticImpactIdentity, bindings.semanticImpactIdentity],
    [witness.semanticClosureProjectionIdentity, bindings.semanticClosureProjectionIdentity],
    [witness.closureWitnessIdentity, bindings.closureWitnessIdentity],
    [witness.currentTruthIdentity, bindings.currentTruthIdentity],
    [witness.sourceGenerationFingerprint, bindings.sourceGenerationFingerprint],
    [witness.sourceManifestIdentity, bindings.sourceManifestIdentity],
    [witness.repositoryIdentity, bindings.repositoryIdentity],
    [witness.repositorySnapshotIdentity, bindings.repositorySnapshotIdentity],
    [witness.workingSetIdentity, bindings.workingSetIdentity],
    [witness.contextGenerationIdentity, bindings.contextGenerationIdentity],
    [witness.contextClosureIdentity, bindings.contextClosureIdentity],
    [witness.taskMaterialFingerprint, bindings.taskMaterialFingerprint],
  ].every(([left, right]) => left === right);
}

function reasonCodes(values) {
  return [...new Set(values)].sort(compare);
}

function normalizeScenarioExecutionBindings(value) {
  const code = "ADAPTIVE_SCENARIO_EXECUTION_BINDINGS_INVALID";
  if (!Array.isArray(value)) fail(code);
  const normalized = value.map((entry) => {
    exactKeys(
      entry,
      [
        "implementationBindingIdentity",
        "materialIdentities",
        "oracleIdentity",
        "requiredCapabilities",
        "scenarioIdentity",
        "scenarioRevisionIdentity",
        "testFiles",
        "validationActions",
      ],
      code,
    );
    return {
      scenarioIdentity: identity(entry.scenarioIdentity, code),
      scenarioRevisionIdentity: identity(entry.scenarioRevisionIdentity, code),
      oracleIdentity: identity(entry.oracleIdentity, code),
      implementationBindingIdentity: identity(entry.implementationBindingIdentity, code),
      validationActions: (() => {
        if (!Array.isArray(entry.validationActions) || entry.validationActions.length === 0) {
          fail(code);
        }
        const actions = entry.validationActions
          .map((action) => {
            exactKeys(action, ["actionIdentity", "commandIdentity"], code);
            return {
              actionIdentity: identity(action.actionIdentity, code),
              commandIdentity: identity(action.commandIdentity, code),
            };
          })
          .sort((left, right) => compare(left.actionIdentity, right.actionIdentity));
        if (new Set(actions.map(({ actionIdentity }) => actionIdentity)).size !== actions.length) {
          fail(code);
        }
        return actions;
      })(),
      materialIdentities: identities(entry.materialIdentities, code, { nonempty: true }),
      testFiles: repositoryPaths(entry.testFiles, code),
      requiredCapabilities: portableIds(entry.requiredCapabilities, code),
    };
  });
  normalized.sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (new Set(normalized.map(({ scenarioIdentity: value }) => value)).size !== normalized.length) {
    fail(code);
  }
  return normalized;
}

function normalizeReusedEvidence(value) {
  const code = "ADAPTIVE_REUSED_SCENARIO_EVIDENCE_INVALID";
  if (!Array.isArray(value)) fail(code);
  const normalized = value.map((entry) => {
    exactKeys(
      entry,
      [
        "closureWitnessIdentity",
        "disposition",
        "evidenceIdentity",
        "impactWitnessIdentity",
        "implementationBindingIdentity",
        "materialIdentities",
        "oracleIdentity",
        "scenarioIdentity",
        "scenarioRevisionIdentity",
      ],
      code,
    );
    if (entry.disposition !== "PROVEN_UNAFFECTED") fail(code);
    return {
      scenarioIdentity: identity(entry.scenarioIdentity, code),
      evidenceIdentity: identity(entry.evidenceIdentity, code),
      impactWitnessIdentity: identity(entry.impactWitnessIdentity, code),
      closureWitnessIdentity: identity(entry.closureWitnessIdentity, code),
      scenarioRevisionIdentity: identity(entry.scenarioRevisionIdentity, code),
      oracleIdentity: identity(entry.oracleIdentity, code),
      implementationBindingIdentity: identity(entry.implementationBindingIdentity, code),
      materialIdentities: identities(entry.materialIdentities, code, { nonempty: true }),
      disposition: "PROVEN_UNAFFECTED",
    };
  });
  normalized.sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (new Set(normalized.map(({ scenarioIdentity: value }) => value)).size !== normalized.length) {
    fail(code);
  }
  return normalized;
}

function normalizeIndependentReview(value) {
  const code = "ADAPTIVE_INDEPENDENT_REVIEW_REQUIREMENT_INVALID";
  exactKeys(value, ["reviewIdentity", "scenarioIdentities", "state"], code);
  if (!["NOT_REQUIRED", "REQUIRED"].includes(value.state)) fail(code);
  const reviewIdentity = nullableIdentity(value.reviewIdentity, code);
  const scenarioIdentities = identities(value.scenarioIdentities, code);
  if (
    (value.state === "NOT_REQUIRED" &&
      (reviewIdentity !== null || scenarioIdentities.length !== 0)) ||
    (value.state === "REQUIRED" && scenarioIdentities.length === 0)
  ) {
    fail(code);
  }
  return { state: value.state, scenarioIdentities, reviewIdentity };
}

function normalizePlanBody(value) {
  const code = "ADAPTIVE_VALIDATION_PLAN_INVALID";
  if (!ADAPTIVE_VALIDATION_DISPOSITIONS.includes(value.disposition)) fail(code);
  if (value.targetedPruning !== TARGETED_PRUNING_POLICY) fail(code);
  if (
    value.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    value.mutationAuthorization !== false
  ) {
    fail(code);
  }
  if (!ADAPTIVE_RISK_CLASSES.includes(value.riskClass)) fail(code);
  const mandatoryWiderGates = normalizeGates(value.mandatoryWiderGates);
  const scheduledGateIds = portableIds(value.scheduledGateIds, code, { nonempty: true });
  if (
    canonicalJson(scheduledGateIds) !==
    canonicalJson(mandatoryWiderGates.map(({ gateId }) => gateId))
  ) {
    fail("ADAPTIVE_MANDATORY_GATE_OMITTED");
  }
  const requiredScenarioIdentities = identities(value.requiredScenarioIdentities, code);
  const scheduledScenarioIdentities = identities(value.scheduledScenarioIdentities, code);
  const targetedScenarioIdentities = identities(value.targetedScenarioIdentities, code);
  const reusedScenarioEvidence = normalizeReusedEvidence(value.reusedScenarioEvidence);
  const reusedIds = reusedScenarioEvidence.map(({ scenarioIdentity: entry }) => entry);
  if (
    requiredScenarioIdentities.some((entry) => !scheduledScenarioIdentities.includes(entry)) ||
    reusedIds.some((entry) => !requiredScenarioIdentities.includes(entry)) ||
    reusedIds.some((entry) => !scheduledScenarioIdentities.includes(entry)) ||
    targetedScenarioIdentities.some((entry) => !scheduledScenarioIdentities.includes(entry)) ||
    targetedScenarioIdentities.some((entry) => reusedIds.includes(entry))
  ) {
    fail("ADAPTIVE_REQUIRED_SCENARIO_COVERAGE_INVALID");
  }
  if (
    reusedScenarioEvidence.some(
      ({ closureWitnessIdentity }) =>
        closureWitnessIdentity !== value.semanticClosureWitnessIdentity,
    )
  ) {
    fail("ADAPTIVE_REUSE_CURRENTNESS_BINDING_MISMATCH");
  }
  const scenarioExecutionBindings = normalizeScenarioExecutionBindings(
    value.scenarioExecutionBindings,
  );
  if (
    canonicalJson(scenarioExecutionBindings.map(({ scenarioIdentity: entry }) => entry)) !==
    canonicalJson(scheduledScenarioIdentities)
  ) {
    fail("ADAPTIVE_SCENARIO_EXECUTION_BINDINGS_INVALID");
  }
  if (
    reusedScenarioEvidence.some((reuse) => {
      const binding = scenarioExecutionBindings.find(
        ({ scenarioIdentity }) => scenarioIdentity === reuse.scenarioIdentity,
      );
      return (
        binding === undefined ||
        binding.scenarioRevisionIdentity !== reuse.scenarioRevisionIdentity ||
        binding.oracleIdentity !== reuse.oracleIdentity ||
        binding.implementationBindingIdentity !== reuse.implementationBindingIdentity ||
        canonicalJson(binding.materialIdentities) !== canonicalJson(reuse.materialIdentities)
      );
    })
  ) {
    fail("ADAPTIVE_REUSE_EXECUTION_BINDING_MISMATCH");
  }
  const normalizedReasons = portableIds(value.reasonCodes, code);
  if ((value.disposition === "READY") !== (normalizedReasons.length === 0)) fail(code);
  const requiredCapabilities = portableIds(value.requiredCapabilities, code);
  const missingCapabilities = portableIds(value.missingCapabilities, code);
  const unknownRequiredCapabilities = portableIds(value.unknownRequiredCapabilities, code);
  if (
    missingCapabilities.some((entry) => !requiredCapabilities.includes(entry)) ||
    unknownRequiredCapabilities.some((entry) => !requiredCapabilities.includes(entry)) ||
    missingCapabilities.some((entry) => unknownRequiredCapabilities.includes(entry))
  ) {
    fail(code);
  }
  return {
    schemaVersion: ADAPTIVE_VALIDATION_PLAN_SCHEMA,
    disposition: value.disposition,
    reasonCodes: normalizedReasons,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    targetedPruning: TARGETED_PRUNING_POLICY,
    authorizationIdentity: identity(value.authorizationIdentity, code),
    taskIdentity: identity(value.taskIdentity, code),
    taskContractIdentity: identity(value.taskContractIdentity, code),
    taskMaterialFingerprint: identity(value.taskMaterialFingerprint, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    sourceAnchorIdentities: identities(value.sourceAnchorIdentities, code, { nonempty: true }),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    workingSetIdentity: identity(value.workingSetIdentity, code),
    repositoryHeadCommit: contentIdentity(value.repositoryHeadCommit, code),
    repositoryHeadTree: contentIdentity(value.repositoryHeadTree, code),
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    contextGenerationIdentity: identity(value.contextGenerationIdentity, code),
    contextClosureIdentity: identity(value.contextClosureIdentity, code),
    semanticClosureWitnessIdentity: identity(value.semanticClosureWitnessIdentity, code),
    catalogIdentity: identity(value.catalogIdentity, code),
    catalogGenerationIdentity: identity(value.catalogGenerationIdentity, code),
    physicalImpactIdentity: identity(value.physicalImpactIdentity, code),
    semanticImpactIdentity: identity(value.semanticImpactIdentity, code),
    riskIdentity: identity(value.riskIdentity, code),
    riskClass: value.riskClass,
    capabilityIdentity: identity(value.capabilityIdentity, code),
    environmentIdentity: identity(value.environmentIdentity, code),
    requiredCapabilities,
    missingCapabilities,
    unknownRequiredCapabilities,
    requiredScenarioIdentities,
    scheduledScenarioIdentities,
    targetedScenarioIdentities,
    reusedScenarioEvidence,
    scenarioExecutionBindings,
    mandatoryWiderGates,
    scheduledGateIds,
    independentReviewRequirement: normalizeIndependentReview(value.independentReviewRequirement),
  };
}

function assertPlanInputBindings({
  bindings,
  catalog,
  closure,
  physicalImpact,
  semanticImpact,
  risk,
}) {
  const matching =
    physicalImpact.catalogGenerationIdentity === catalog.catalogGenerationIdentity &&
    semanticImpact.catalogGenerationIdentity === catalog.catalogGenerationIdentity &&
    risk.catalogGenerationIdentity === catalog.catalogGenerationIdentity &&
    physicalImpact.currentTruthIdentity === closure.currentTruthIdentity &&
    semanticImpact.currentTruthIdentity === closure.currentTruthIdentity &&
    physicalImpact.sourceGenerationFingerprint === closure.sourceGenerationFingerprint &&
    semanticImpact.sourceGenerationFingerprint === closure.sourceGenerationFingerprint &&
    physicalImpact.repositoryIdentity === closure.repositoryIdentity &&
    physicalImpact.repositorySnapshotIdentity === closure.repositorySnapshotIdentity &&
    physicalImpact.workingSetIdentity === bindings.workingSetIdentity &&
    semanticImpact.contextGenerationIdentity === closure.contextGenerationIdentity &&
    semanticImpact.taskMaterialFingerprint === closure.taskMaterialFingerprint &&
    semanticImpact.closureWitnessIdentity === closure.closureWitnessIdentity &&
    risk.taskIdentity === closure.taskIdentity &&
    risk.physicalImpactIdentity === physicalImpact.physicalImpactIdentity &&
    risk.semanticImpactIdentity === semanticImpact.semanticImpactIdentity;
  if (!matching) fail("ADAPTIVE_PLAN_CURRENTNESS_BINDING_MISMATCH");
}

export function deriveAdaptiveValidationPlan(input) {
  exactKeys(
    input,
    [
      "bindings",
      "capabilitySnapshot",
      "catalog",
      "independentReviewIdentity",
      "mandatoryWiderGates",
      "physicalImpact",
      "reuseWitnesses",
      "riskAssessment",
      "semanticClosureWitness",
      "semanticImpact",
      "targetedScenarioIdentities",
    ],
    "ADAPTIVE_VALIDATION_PLAN_INPUT_INVALID",
  );
  const bindings = normalizePlanBindings(input.bindings);
  const catalog = verifyAdaptiveScenarioCatalog(input.catalog);
  let closure;
  try {
    closure = verifySemanticClosureWitness(input.semanticClosureWitness);
  } catch {
    fail("ADAPTIVE_SEMANTIC_CLOSURE_WITNESS_INVALID");
  }
  const physicalImpact = verifyAdaptivePhysicalImpact(input.physicalImpact);
  const semanticImpact = verifyAdaptiveSemanticImpact(input.semanticImpact);
  const risk = verifyAdaptiveRiskAssessment(input.riskAssessment);
  const capability = verifyAdaptiveCapabilitySnapshot(input.capabilitySnapshot);
  const gates = normalizeGates(input.mandatoryWiderGates);
  const targeted = identities(
    input.targetedScenarioIdentities,
    "ADAPTIVE_TARGETED_SCENARIOS_INVALID",
  );
  const independentReviewIdentity = nullableIdentity(
    input.independentReviewIdentity,
    "ADAPTIVE_INDEPENDENT_REVIEW_INVALID",
  );
  if (!Array.isArray(input.reuseWitnesses)) fail("ADAPTIVE_REUSE_WITNESSES_INVALID");
  const reuseWitnesses = input.reuseWitnesses
    .map(verifyAdaptiveReuseWitness)
    .sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  if (
    new Set(reuseWitnesses.map(({ scenarioIdentity: value }) => value)).size !==
    reuseWitnesses.length
  ) {
    fail("ADAPTIVE_REUSE_WITNESSES_INVALID");
  }
  assertPlanInputBindings({ bindings, catalog, closure, physicalImpact, semanticImpact, risk });
  assertPhysicalImpactDerivation(catalog, physicalImpact);
  assertSemanticImpactDerivation(catalog, closure, semanticImpact);
  const authorizedOwners = new Set(closure.authorizedSemanticOwnerSet);
  if (
    !authorizedOwners.has(catalog.ownerIdentity) ||
    catalog.scenarioRevisions.some(({ ownerIdentity }) => !authorizedOwners.has(ownerIdentity)) ||
    catalog.oracles.some(({ ownerIdentity }) => !authorizedOwners.has(ownerIdentity))
  ) {
    fail("ADAPTIVE_SCENARIO_OWNER_UNAUTHORIZED");
  }

  const active = catalogActiveRecords(catalog);
  const activeIds = new Set(active.map(({ revision }) => revision.scenarioIdentity));
  if (targeted.some((value) => !activeIds.has(value))) fail("ADAPTIVE_TARGETED_SCENARIO_UNKNOWN");
  for (const witness of reuseWitnesses) {
    if (!activeIds.has(witness.scenarioIdentity)) fail("ADAPTIVE_REUSE_SCENARIO_UNKNOWN");
  }
  const reasons = [];
  validateImpactCoverage(physicalImpact, activeIds, "PHYSICAL", reasons);
  validateImpactCoverage(semanticImpact, activeIds, "SEMANTIC", reasons);

  const required = active
    .filter(({ revision }) => revision.required)
    .map(({ revision }) => revision.scenarioIdentity);
  const impacted = new Set([
    ...physicalImpact.affectedScenarioIdentities,
    ...physicalImpact.unknownScenarioIdentities,
    ...semanticImpact.affectedScenarioIdentities,
    ...semanticImpact.unknownScenarioIdentities,
  ]);
  const currentBindings = {
    catalogGenerationIdentity: catalog.catalogGenerationIdentity,
    physicalImpactIdentity: physicalImpact.physicalImpactIdentity,
    physicalDependencySetIdentity: physicalImpact.physicalDependencySetIdentity,
    semanticImpactIdentity: semanticImpact.semanticImpactIdentity,
    semanticClosureProjectionIdentity: semanticImpact.semanticClosureProjectionIdentity,
    closureWitnessIdentity: closure.closureWitnessIdentity,
    currentTruthIdentity: closure.currentTruthIdentity,
    sourceGenerationFingerprint: closure.sourceGenerationFingerprint,
    sourceManifestIdentity: bindings.sourceManifestIdentity,
    repositoryIdentity: closure.repositoryIdentity,
    repositorySnapshotIdentity: closure.repositorySnapshotIdentity,
    workingSetIdentity: bindings.workingSetIdentity,
    contextGenerationIdentity: closure.contextGenerationIdentity,
    contextClosureIdentity: bindings.contextClosureIdentity,
    taskMaterialFingerprint: closure.taskMaterialFingerprint,
  };
  const safeReuse = [];
  for (const witness of reuseWitnesses) {
    const physicallyUnaffected = physicalImpact.provenUnaffectedScenarioIdentities.includes(
      witness.scenarioIdentity,
    );
    const semanticallyUnaffected = semanticImpact.provenUnaffectedScenarioIdentities.includes(
      witness.scenarioIdentity,
    );
    const activeRecord = active.find(
      ({ revision }) => revision.scenarioIdentity === witness.scenarioIdentity,
    );
    const unchangedExecutionBinding =
      activeRecord !== undefined &&
      witness.scenarioRevisionIdentity === activeRecord.revision.revisionIdentity &&
      witness.oracleIdentity === activeRecord.oracle.oracleIdentity &&
      witness.implementationBindingIdentity ===
        activeRecord.binding.implementationBindingIdentity &&
      canonicalJson(witness.materialIdentities) ===
        canonicalJson(activeRecord.binding.materialIdentities);
    const eligible =
      required.includes(witness.scenarioIdentity) &&
      !targeted.includes(witness.scenarioIdentity) &&
      !impacted.has(witness.scenarioIdentity) &&
      physicallyUnaffected &&
      semanticallyUnaffected &&
      unchangedExecutionBinding &&
      witness.closureWitnessIdentity === closure.closureWitnessIdentity &&
      matchingReuseBindings(witness, currentBindings);
    if (!eligible) {
      reasons.push("UNSAFE_UNAFFECTED_REUSE_REJECTED");
      continue;
    }
    safeReuse.push({
      scenarioIdentity: witness.scenarioIdentity,
      evidenceIdentity: witness.evidenceIdentity,
      impactWitnessIdentity: witness.impactWitnessIdentity,
      closureWitnessIdentity: closure.closureWitnessIdentity,
      scenarioRevisionIdentity: witness.scenarioRevisionIdentity,
      oracleIdentity: witness.oracleIdentity,
      implementationBindingIdentity: witness.implementationBindingIdentity,
      materialIdentities: witness.materialIdentities,
      disposition: "PROVEN_UNAFFECTED",
    });
  }
  safeReuse.sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  const scheduled = [...new Set([...required, ...targeted, ...impacted])].sort(compare);

  const requiredCapabilities = [
    ...active
      .filter(
        ({ revision }) =>
          required.includes(revision.scenarioIdentity) ||
          scheduled.includes(revision.scenarioIdentity),
      )
      .flatMap(({ revision }) => revision.requiredCapabilities),
    ...gates.flatMap(({ requiredCapabilities: values }) => values),
  ];
  const normalizedRequiredCapabilities = [...new Set(requiredCapabilities)].sort(compare);
  const available = new Set(capability.availableCapabilities);
  const unknown = new Set(capability.unknownCapabilities);
  const missingCapabilities = normalizedRequiredCapabilities.filter(
    (entry) => !available.has(entry) && !unknown.has(entry),
  );
  const unknownRequiredCapabilities = normalizedRequiredCapabilities.filter((entry) =>
    unknown.has(entry),
  );
  if (missingCapabilities.length !== 0) reasons.push("REQUIRED_CAPABILITY_UNAVAILABLE");
  if (unknownRequiredCapabilities.length !== 0) reasons.push("REQUIRED_CAPABILITY_UNKNOWN");

  const changedImplementation = new Set(risk.changedImplementationScenarioIdentities);
  const changedScenarioIds = new Set([
    ...changedImplementation,
    ...risk.changedOracleScenarioIdentities,
  ]);
  const cochanged = risk.changedOracleScenarioIdentities
    .filter((entry) => changedImplementation.has(entry))
    .sort(compare);
  if (
    [...changedImplementation, ...risk.changedOracleScenarioIdentities].some(
      (entry) => !activeIds.has(entry),
    )
  ) {
    fail("ADAPTIVE_RISK_SCENARIO_UNKNOWN");
  }
  if ([...changedScenarioIds].some((entry) => !impacted.has(entry))) {
    reasons.push("CHANGE_IMPACT_CONTRADICTION");
  }
  const scenarioRisk = active
    .filter(({ revision }) =>
      [
        impacted.has(revision.scenarioIdentity),
        targeted.includes(revision.scenarioIdentity),
        changedScenarioIds.has(revision.scenarioIdentity),
      ].some(Boolean),
    )
    .reduce(
      (highest, { revision }) =>
        RISK_RANK[revision.riskClass] > RISK_RANK[highest] ? revision.riskClass : highest,
      "LOW",
    );
  const riskClass =
    RISK_RANK[risk.classification] >= RISK_RANK[scenarioRisk] ? risk.classification : scenarioRisk;
  if (RISK_RANK[risk.classification] < RISK_RANK[scenarioRisk])
    reasons.push("RISK_UNDERCLASSIFIED");
  const highRiskCochange = RISK_RANK[riskClass] >= RISK_RANK.HIGH && cochanged.length !== 0;
  const independentReviewRequirement = highRiskCochange
    ? {
        state: "REQUIRED",
        scenarioIdentities: cochanged,
        reviewIdentity: independentReviewIdentity,
      }
    : { state: "NOT_REQUIRED", scenarioIdentities: [], reviewIdentity: null };
  if (highRiskCochange) {
    reasons.push("HIGH_RISK_IMPLEMENTATION_ORACLE_COCHANGE_REVIEW_REQUIRED");
  }

  const scenarioExecutionBindings = active
    .filter(({ revision }) => scheduled.includes(revision.scenarioIdentity))
    .map(({ revision, oracle, binding }) => ({
      scenarioIdentity: revision.scenarioIdentity,
      scenarioRevisionIdentity: revision.revisionIdentity,
      oracleIdentity: oracle.oracleIdentity,
      implementationBindingIdentity: binding.implementationBindingIdentity,
      validationActions: binding.validationActions,
      materialIdentities: binding.materialIdentities,
      testFiles: binding.testFiles,
      requiredCapabilities: revision.requiredCapabilities,
    }));
  const normalizedReasons = reasonCodes(reasons);
  const body = normalizePlanBody({
    schemaVersion: ADAPTIVE_VALIDATION_PLAN_SCHEMA,
    disposition: normalizedReasons.length === 0 ? "READY" : "BLOCKED",
    reasonCodes: normalizedReasons,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    targetedPruning: TARGETED_PRUNING_POLICY,
    authorizationIdentity: closure.authorizationIdentity,
    taskIdentity: closure.taskIdentity,
    taskContractIdentity: closure.taskContractIdentity,
    taskMaterialFingerprint: closure.taskMaterialFingerprint,
    sourceGenerationFingerprint: closure.sourceGenerationFingerprint,
    sourceManifestIdentity: bindings.sourceManifestIdentity,
    sourceAnchorIdentities: bindings.sourceAnchorIdentities,
    repositoryIdentity: closure.repositoryIdentity,
    repositorySnapshotIdentity: closure.repositorySnapshotIdentity,
    workingSetIdentity: bindings.workingSetIdentity,
    repositoryHeadCommit: closure.repositoryHeadCommit,
    repositoryHeadTree: closure.repositoryHeadTree,
    currentTruthIdentity: closure.currentTruthIdentity,
    contextGenerationIdentity: closure.contextGenerationIdentity,
    contextClosureIdentity: bindings.contextClosureIdentity,
    semanticClosureWitnessIdentity: closure.closureWitnessIdentity,
    catalogIdentity: catalog.catalogIdentity,
    catalogGenerationIdentity: catalog.catalogGenerationIdentity,
    physicalImpactIdentity: physicalImpact.physicalImpactIdentity,
    semanticImpactIdentity: semanticImpact.semanticImpactIdentity,
    riskIdentity: risk.riskIdentity,
    riskClass,
    capabilityIdentity: capability.capabilityIdentity,
    environmentIdentity: capability.environmentIdentity,
    requiredCapabilities: normalizedRequiredCapabilities,
    missingCapabilities,
    unknownRequiredCapabilities,
    requiredScenarioIdentities: required,
    scheduledScenarioIdentities: scheduled,
    targetedScenarioIdentities: targeted,
    reusedScenarioEvidence: safeReuse,
    scenarioExecutionBindings,
    mandatoryWiderGates: gates,
    scheduledGateIds: gates.map(({ gateId }) => gateId),
    independentReviewRequirement,
  });
  return deepFreeze({
    ...body,
    planIdentity: recordIdentity(ADAPTIVE_VALIDATION_PLAN_SCHEMA, body),
  });
}

export function verifyAdaptiveValidationPlan(record) {
  exactKeys(
    record,
    [
      "authorizationIdentity",
      "capabilityIdentity",
      "catalogGenerationIdentity",
      "catalogIdentity",
      "contextClosureIdentity",
      "contextGenerationIdentity",
      "currentTruthIdentity",
      "disposition",
      "environmentIdentity",
      "factAuthority",
      "independentReviewRequirement",
      "mandatoryWiderGates",
      "missingCapabilities",
      "mutationAuthorization",
      "physicalImpactIdentity",
      "planIdentity",
      "reasonCodes",
      "repositoryHeadCommit",
      "repositoryHeadTree",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "workingSetIdentity",
      "requiredCapabilities",
      "requiredScenarioIdentities",
      "reusedScenarioEvidence",
      "riskClass",
      "riskIdentity",
      "scenarioExecutionBindings",
      "scheduledGateIds",
      "scheduledScenarioIdentities",
      "schemaVersion",
      "semanticClosureWitnessIdentity",
      "semanticImpactIdentity",
      "sourceAnchorIdentities",
      "sourceGenerationFingerprint",
      "sourceManifestIdentity",
      "targetedPruning",
      "targetedScenarioIdentities",
      "taskContractIdentity",
      "taskIdentity",
      "taskMaterialFingerprint",
      "unknownRequiredCapabilities",
    ],
    "ADAPTIVE_VALIDATION_PLAN_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_PLAN_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_PLAN_INVALID");
  }
  const body = normalizePlanBody(record);
  const computed = recordIdentity(ADAPTIVE_VALIDATION_PLAN_SCHEMA, body);
  if (identity(record.planIdentity, "ADAPTIVE_VALIDATION_PLAN_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_PLAN_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, planIdentity: computed });
}

const TOPOLOGY_FACT_KEYS = Object.freeze([
  "affectedClosure",
  "candidateIdentity",
  "candidatePaths",
  "candidateWorktree",
  "canonicalRepository",
  "currentTruthIdentity",
  "parentHead",
  "parentTree",
  "physicalImpact",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "scenarioCatalog",
  "sourceGenerationFingerprint",
  "sourceManifestIdentity",
]);

const TOPOLOGY_RECORD_KEYS = Object.freeze([
  ...TOPOLOGY_FACT_KEYS,
  "affectedClosureIdentity",
  "catalogGenerationIdentity",
  "candidatePathSetIdentity",
  "canonicalRepositoryObservationIdentity",
  "disposition",
  "expectedAffectedPathSetIdentity",
  "factAuthority",
  "mutationAuthorization",
  "publicationAuthorization",
  "physicalDependencySetIdentity",
  "physicalImpactIdentity",
  "pushAuthorization",
  "reasonCodes",
  "schemaVersion",
  "targetedPruning",
  "topologyIdentity",
]);

const MATERIALIZATION_FACT_KEYS = Object.freeze([
  "acceptedParentHead",
  "acceptedParentTree",
  "candidateIdentity",
  "candidatePaths",
  "canonicalRepository",
  "committedPaths",
  "currentTruthIdentity",
  "disposableWorktreeClean",
  "expectedValidationCommitTree",
  "extraPaths",
  "gitObjectEvidence",
  "publicationAttempted",
  "pushAttempts",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "sourceGenerationFingerprint",
  "sourceManifestIdentity",
  "topology",
  "validationCommit",
  "validationCommitParent",
  "validationCommitTree",
]);

const MATERIALIZATION_RECORD_KEYS = Object.freeze([
  ...MATERIALIZATION_FACT_KEYS,
  "factAuthority",
  "gitObjectAttestationIdentity",
  "materializationIdentity",
  "mutationAuthorization",
  "publicationAuthorization",
  "pushAuthorization",
  "reasonCodes",
  "recursiveTreeDelta",
  "schemaVersion",
  "status",
  "targetedPruning",
  "validationOnly",
]);

function nonnegativeInteger(value, code) {
  if (!Number.isSafeInteger(value) || value < 0) fail(code);
  return value;
}

function normalizedCandidatePaths(value, code) {
  if (!Array.isArray(value) || value.length === 0) fail(code);
  return value
    .map((entry) => {
      exactKeys(entry, ["gitBlob", "path", "sha256"], code);
      let path;
      try {
        path = normalizeRepoRelativePath(entry.path);
      } catch {
        fail(code);
      }
      return {
        path,
        sha256: identity(entry.sha256, code),
        gitBlob: contentIdentity(entry.gitBlob, code),
      };
    })
    .sort(
      (left, right) =>
        compare(left.path, right.path) ||
        compare(left.sha256, right.sha256) ||
        compare(left.gitBlob, right.gitBlob),
    );
}

function normalizedCommittedPaths(value, code) {
  if (!Array.isArray(value) || value.length === 0) fail(code);
  return value
    .map((entry) => {
      exactKeys(entry, ["gitBlob", "path"], code);
      let path;
      try {
        path = normalizeRepoRelativePath(entry.path);
      } catch {
        fail(code);
      }
      return { path, gitBlob: contentIdentity(entry.gitBlob, code) };
    })
    .sort((left, right) => compare(left.path, right.path) || compare(left.gitBlob, right.gitBlob));
}

function normalizedCandidateWorktree(value, code) {
  exactKeys(
    value,
    [
      "modifiedTrackedPaths",
      "stagedPaths",
      "untrackedPaths",
      "workingSetIdentity",
      "worktreeIdentity",
    ],
    code,
  );
  return {
    workingSetIdentity: identity(value.workingSetIdentity, code),
    worktreeIdentity: identity(value.worktreeIdentity, code),
    stagedPaths: repositoryPaths(value.stagedPaths, code),
    modifiedTrackedPaths: repositoryPaths(value.modifiedTrackedPaths, code),
    untrackedPaths: repositoryPaths(value.untrackedPaths, code),
  };
}

function normalizedClosure(value, code) {
  if (!Array.isArray(value) || value.length === 0) fail(code);
  return value
    .map((entry) => {
      exactKeys(
        entry,
        [
          "createsLocalClone",
          "expectsCleanCloneCandidate",
          "materialIdentity",
          "materializesCommittedState",
          "ownershipComplete",
          "path",
          "readsCommittedObjects",
          "readsHead",
          "readsHeadTree",
          "readsHistory",
          "readsLiveWorkingTree",
        ],
        code,
      );
      let path;
      try {
        path = normalizeRepoRelativePath(entry.path);
      } catch {
        fail(code);
      }
      return {
        path,
        materialIdentity: contentIdentity(entry.materialIdentity, code),
        ownershipComplete: boolean(entry.ownershipComplete, code),
        readsLiveWorkingTree: boolean(entry.readsLiveWorkingTree, code),
        readsHead: boolean(entry.readsHead, code),
        readsHeadTree: boolean(entry.readsHeadTree, code),
        readsCommittedObjects: boolean(entry.readsCommittedObjects, code),
        readsHistory: boolean(entry.readsHistory, code),
        createsLocalClone: boolean(entry.createsLocalClone, code),
        expectsCleanCloneCandidate: boolean(entry.expectsCleanCloneCandidate, code),
        materializesCommittedState: boolean(entry.materializesCommittedState, code),
      };
    })
    .sort(
      (left, right) =>
        compare(left.path, right.path) || compare(left.materialIdentity, right.materialIdentity),
    );
}

function normalizedCanonicalRepository(value, code) {
  exactKeys(
    value,
    [
      "candidateIdentity",
      "candidatePaths",
      "candidateWorktree",
      "currentTruthIdentity",
      "head",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "sourceGenerationFingerprint",
      "sourceManifestIdentity",
      "tree",
    ],
    code,
  );
  return {
    head: contentIdentity(value.head, code),
    tree: contentIdentity(value.tree, code),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    candidateIdentity: identity(value.candidateIdentity, code),
    candidatePaths: normalizedCandidatePaths(value.candidatePaths, code),
    candidateWorktree: normalizedCandidateWorktree(value.candidateWorktree, code),
  };
}

function expectedAffectedPaths(physicalImpact) {
  const affected = new Set(physicalImpact.affectedScenarioIdentities);
  return [
    ...new Set(
      physicalImpact.dependencyClosures
        .filter(({ scenarioIdentity }) => affected.has(scenarioIdentity))
        .flatMap(({ paths }) => paths),
    ),
  ].sort(compare);
}

function normalizedTopologyFacts(value) {
  const code = "ADAPTIVE_VALIDATION_TOPOLOGY_INVALID";
  exactKeys(value, TOPOLOGY_FACT_KEYS, code);
  const scenarioCatalog = verifyAdaptiveScenarioCatalog(value.scenarioCatalog);
  const physicalImpact = verifyAdaptivePhysicalImpact(value.physicalImpact);
  assertPhysicalImpactDerivation(scenarioCatalog, physicalImpact);
  return {
    parentHead: contentIdentity(value.parentHead, code),
    parentTree: contentIdentity(value.parentTree, code),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    scenarioCatalog,
    physicalImpact,
    candidateIdentity: identity(value.candidateIdentity, code),
    candidatePaths: normalizedCandidatePaths(value.candidatePaths, code),
    candidateWorktree: normalizedCandidateWorktree(value.candidateWorktree, code),
    affectedClosure: normalizedClosure(value.affectedClosure, code),
    canonicalRepository: normalizedCanonicalRepository(value.canonicalRepository, code),
  };
}

function hasDuplicatePaths(entries) {
  return new Set(entries.map(({ path }) => path)).size !== entries.length;
}

function topologyReasonCodes(facts) {
  const reasons = new Set();
  if (hasDuplicatePaths(facts.candidatePaths)) {
    reasons.add("CANDIDATE_PATH_FACT_DUPLICATE");
  }
  if (hasDuplicatePaths(facts.affectedClosure)) {
    reasons.add("AFFECTED_CLOSURE_MEMBER_DUPLICATE");
  }
  for (const member of facts.affectedClosure) {
    if (!member.ownershipComplete) reasons.add("TOPOLOGY_OWNERSHIP_INCOMPLETE");
    const hasPhysicalOwner =
      member.readsLiveWorkingTree ||
      member.readsHead ||
      member.readsHeadTree ||
      member.readsCommittedObjects ||
      member.readsHistory ||
      member.createsLocalClone ||
      member.expectsCleanCloneCandidate ||
      member.materializesCommittedState;
    if (!hasPhysicalOwner) reasons.add("TOPOLOGY_OWNERSHIP_AMBIGUOUS");
  }

  const expectedPaths = expectedAffectedPaths(facts.physicalImpact);
  const observedPaths = facts.affectedClosure.map(({ path }) => path).sort(compare);
  if (canonicalJson(observedPaths) !== canonicalJson(expectedPaths)) {
    reasons.add("AFFECTED_CLOSURE_PATH_SET_MISMATCH");
  }
  const expectedPathSet = new Set(expectedPaths);
  if (facts.candidatePaths.some(({ path }) => !expectedPathSet.has(path))) {
    reasons.add("CANDIDATE_OUTSIDE_GOVERNED_AFFECTED_CLOSURE");
  }
  if (facts.physicalImpact.unknownScenarioIdentities.length > 0) {
    reasons.add("PHYSICAL_IMPACT_UNKNOWN");
  }
  if (
    facts.physicalImpact.catalogGenerationIdentity !==
      facts.scenarioCatalog.catalogGenerationIdentity ||
    facts.physicalImpact.currentTruthIdentity !== facts.currentTruthIdentity ||
    facts.physicalImpact.sourceGenerationFingerprint !== facts.sourceGenerationFingerprint ||
    facts.physicalImpact.repositoryIdentity !== facts.repositoryIdentity ||
    facts.physicalImpact.repositorySnapshotIdentity !== facts.repositorySnapshotIdentity ||
    facts.physicalImpact.workingSetIdentity !== facts.candidateWorktree.workingSetIdentity
  ) {
    reasons.add("PHYSICAL_IMPACT_CURRENTNESS_BINDING_MISMATCH");
  }

  const worktreePaths = [
    ...facts.candidateWorktree.stagedPaths,
    ...facts.candidateWorktree.modifiedTrackedPaths,
    ...facts.candidateWorktree.untrackedPaths,
  ].sort(compare);
  const candidatePaths = facts.candidatePaths.map(({ path }) => path).sort(compare);
  if (
    new Set(worktreePaths).size !== worktreePaths.length ||
    canonicalJson(worktreePaths) !== canonicalJson(candidatePaths)
  ) {
    reasons.add("CANDIDATE_WORKTREE_PATH_SET_MISMATCH");
  }

  const canonical = facts.canonicalRepository;
  if (
    canonical.head !== facts.parentHead ||
    canonical.tree !== facts.parentTree ||
    canonical.repositoryIdentity !== facts.repositoryIdentity ||
    canonical.repositorySnapshotIdentity !== facts.repositorySnapshotIdentity ||
    canonical.currentTruthIdentity !== facts.currentTruthIdentity ||
    canonical.sourceGenerationFingerprint !== facts.sourceGenerationFingerprint ||
    canonical.sourceManifestIdentity !== facts.sourceManifestIdentity ||
    canonical.candidateIdentity !== facts.candidateIdentity ||
    canonicalJson(canonical.candidatePaths) !== canonicalJson(facts.candidatePaths) ||
    canonicalJson(canonical.candidateWorktree) !== canonicalJson(facts.candidateWorktree)
  ) {
    reasons.add("CANONICAL_REPOSITORY_CURRENTNESS_MISMATCH");
  }
  return [...reasons].sort(compare);
}

function ownsCommittedTopology(member) {
  return (
    member.readsHead ||
    member.readsHeadTree ||
    member.readsCommittedObjects ||
    member.readsHistory ||
    member.createsLocalClone ||
    member.expectsCleanCloneCandidate ||
    member.materializesCommittedState
  );
}

function topologyBody(value) {
  const facts = normalizedTopologyFacts(value);
  const reasonCodes = topologyReasonCodes(facts);
  const disposition =
    reasonCodes.length > 0
      ? "BLOCKED"
      : facts.affectedClosure.some(ownsCommittedTopology)
        ? "DISPOSABLE_MATERIALIZED_COMMIT"
        : "DIRTY_WORKTREE";
  return {
    schemaVersion: ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA,
    disposition,
    reasonCodes,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    publicationAuthorization: false,
    pushAuthorization: false,
    targetedPruning: TARGETED_PRUNING_POLICY,
    ...facts,
    candidatePathSetIdentity: recordIdentity(
      "CIC_ADAPTIVE_VALIDATION_CANDIDATE_PATH_SET_V1",
      facts.candidatePaths,
    ),
    affectedClosureIdentity: recordIdentity(
      "CIC_ADAPTIVE_VALIDATION_AFFECTED_CLOSURE_V1",
      facts.affectedClosure,
    ),
    catalogGenerationIdentity: facts.scenarioCatalog.catalogGenerationIdentity,
    physicalImpactIdentity: facts.physicalImpact.physicalImpactIdentity,
    physicalDependencySetIdentity: facts.physicalImpact.physicalDependencySetIdentity,
    expectedAffectedPathSetIdentity: recordIdentity(
      "CIC_ADAPTIVE_VALIDATION_EXPECTED_AFFECTED_PATH_SET_V1",
      expectedAffectedPaths(facts.physicalImpact),
    ),
    canonicalRepositoryObservationIdentity: recordIdentity(
      "CIC_ADAPTIVE_VALIDATION_CANONICAL_REPOSITORY_OBSERVATION_V1",
      facts.canonicalRepository,
    ),
  };
}

export function deriveAdaptiveValidationTopology(input) {
  const body = topologyBody(input);
  return deepFreeze({
    ...body,
    topologyIdentity: recordIdentity(ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA, body),
  });
}

export function verifyAdaptiveValidationTopology(record) {
  const code = "ADAPTIVE_VALIDATION_TOPOLOGY_INVALID";
  exactKeys(record, TOPOLOGY_RECORD_KEYS, code);
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA) fail(code);
  const facts = Object.fromEntries(TOPOLOGY_FACT_KEYS.map((key) => [key, record[key]]));
  const body = topologyBody(facts);
  const suppliedBody = { ...record };
  delete suppliedBody.topologyIdentity;
  if (canonicalJson(suppliedBody) !== canonicalJson(body)) fail(code);
  const computed = recordIdentity(ADAPTIVE_VALIDATION_TOPOLOGY_SCHEMA, body);
  if (identity(record.topologyIdentity, code) !== computed) {
    fail("ADAPTIVE_VALIDATION_TOPOLOGY_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, topologyIdentity: computed });
}

function base64Bytes(value, code) {
  if (typeof value !== "string" || value.length === 0) fail(code);
  const bytes = Buffer.from(value, "base64");
  if (bytes.byteLength === 0 || bytes.toString("base64") !== value) fail(code);
  return bytes;
}

function gitObjectIdentity(type, bytes) {
  return createHash("sha1")
    .update(`${type} ${bytes.byteLength}\0`, "utf8")
    .update(bytes)
    .digest("hex");
}

function normalizedGitObjectEvidence(value, code) {
  exactKeys(value, ["commitRawBase64", "treeObjects"], code);
  const commitRaw = base64Bytes(value.commitRawBase64, code);
  if (!Array.isArray(value.treeObjects) || value.treeObjects.length < 2) fail(code);
  const treeObjects = value.treeObjects
    .map((entry) => {
      exactKeys(entry, ["rawBase64"], code);
      const raw = base64Bytes(entry.rawBase64, code);
      return { rawBase64: raw.toString("base64"), objectId: gitObjectIdentity("tree", raw) };
    })
    .sort((left, right) => compare(left.objectId, right.objectId));
  if (new Set(treeObjects.map(({ objectId }) => objectId)).size !== treeObjects.length) fail(code);
  return {
    commitRawBase64: commitRaw.toString("base64"),
    treeObjects: treeObjects.map(({ rawBase64 }) => ({ rawBase64 })),
  };
}

function parseCommitObject(raw) {
  const text = raw.toString("utf8");
  const headerEnd = text.indexOf("\n\n");
  if (headerEnd < 0) throw new TypeError("GIT_COMMIT_OBJECT_MALFORMED");
  const headers = text.slice(0, headerEnd).split("\n");
  const trees = headers.filter((line) => line.startsWith("tree ")).map((line) => line.slice(5));
  const parents = headers.filter((line) => line.startsWith("parent ")).map((line) => line.slice(7));
  if (
    trees.length !== 1 ||
    parents.length !== 1 ||
    !/^[0-9a-f]{40}$/u.test(trees[0]) ||
    !/^[0-9a-f]{40}$/u.test(parents[0])
  ) {
    throw new TypeError("GIT_COMMIT_OBJECT_MALFORMED");
  }
  return { tree: trees[0], parent: parents[0] };
}

function treeSortKey(entry) {
  return Buffer.from(`${entry.name}${entry.mode === "40000" ? "/" : ""}`, "utf8");
}

function parseTreeObject(raw) {
  const entries = [];
  let offset = 0;
  while (offset < raw.byteLength) {
    const space = raw.indexOf(0x20, offset);
    const nul = raw.indexOf(0, space + 1);
    if (space <= offset || nul <= space + 1 || nul + 21 > raw.byteLength) {
      throw new TypeError("GIT_TREE_OBJECT_MALFORMED");
    }
    const mode = raw.subarray(offset, space).toString("ascii");
    const nameBytes = raw.subarray(space + 1, nul);
    const name = nameBytes.toString("utf8");
    if (
      !["100644", "100755", "120000", "160000", "40000"].includes(mode) ||
      name.length === 0 ||
      name === "." ||
      name === ".." ||
      name.includes("/") ||
      Buffer.from(name, "utf8").compare(nameBytes) !== 0
    ) {
      throw new TypeError("GIT_TREE_OBJECT_MALFORMED");
    }
    entries.push({
      mode,
      name,
      objectId: raw.subarray(nul + 1, nul + 21).toString("hex"),
    });
    offset = nul + 21;
  }
  for (let index = 1; index < entries.length; index += 1) {
    if (Buffer.compare(treeSortKey(entries[index - 1]), treeSortKey(entries[index])) >= 0) {
      throw new TypeError("GIT_TREE_OBJECT_ORDER_INVALID");
    }
  }
  return entries;
}

function recursiveGitTreeDelta(parentTree, validationTree, treeMap) {
  const reasons = new Set();
  const delta = [];
  const visit = (parentId, validationId, prefix) => {
    if (parentId === validationId) return;
    const parent = treeMap.get(parentId);
    const validation = treeMap.get(validationId);
    if (parent === undefined || validation === undefined) {
      reasons.add("GIT_TREE_OBJECT_EVIDENCE_INCOMPLETE");
      return;
    }
    const parentEntries = new Map(parent.map((entry) => [entry.name, entry]));
    const validationEntries = new Map(validation.map((entry) => [entry.name, entry]));
    const names = [...new Set([...parentEntries.keys(), ...validationEntries.keys()])].sort(
      compare,
    );
    for (const name of names) {
      const before = parentEntries.get(name) ?? null;
      const after = validationEntries.get(name) ?? null;
      if (before?.mode === "40000" && after?.mode === "40000") {
        visit(before.objectId, after.objectId, `${prefix}${name}/`);
        continue;
      }
      if (before?.objectId === after?.objectId && before?.mode === after?.mode) continue;
      const path = `${prefix}${name}`;
      if (before?.mode === "40000" || after?.mode === "40000") {
        reasons.add("GIT_TREE_PATH_TYPE_MISMATCH");
      }
      if (before !== null && after !== null && before.mode !== after.mode) {
        reasons.add("GIT_TREE_PATH_MODE_MISMATCH");
      }
      delta.push({
        path,
        parentMode: before?.mode ?? null,
        parentGitObject: before?.objectId ?? null,
        validationMode: after?.mode ?? null,
        validationGitObject: after?.objectId ?? null,
      });
    }
  };
  visit(parentTree, validationTree, "");
  delta.sort((left, right) => compare(left.path, right.path));
  return { delta, reasonCodes: [...reasons].sort(compare) };
}

function attestGitObjectMaterialization(facts) {
  const reasons = new Set();
  let recursiveTreeDelta = [];
  try {
    const commitRaw = Buffer.from(facts.gitObjectEvidence.commitRawBase64, "base64");
    const computedCommit = gitObjectIdentity("commit", commitRaw);
    const commit = parseCommitObject(commitRaw);
    if (computedCommit !== facts.validationCommit) reasons.add("VALIDATION_COMMIT_OBJECT_MISMATCH");
    if (commit.parent !== facts.acceptedParentHead)
      reasons.add("VALIDATION_COMMIT_PARENT_OBJECT_MISMATCH");
    if (commit.tree !== facts.validationCommitTree)
      reasons.add("VALIDATION_COMMIT_TREE_OBJECT_MISMATCH");

    const treeMap = new Map();
    for (const { rawBase64 } of facts.gitObjectEvidence.treeObjects) {
      const raw = Buffer.from(rawBase64, "base64");
      const objectId = gitObjectIdentity("tree", raw);
      treeMap.set(objectId, parseTreeObject(raw));
    }
    if (!treeMap.has(facts.acceptedParentTree)) reasons.add("PARENT_TREE_OBJECT_IDENTITY_MISMATCH");
    if (!treeMap.has(facts.validationCommitTree)) {
      reasons.add("VALIDATION_TREE_OBJECT_IDENTITY_MISMATCH");
    }
    const treeResult = recursiveGitTreeDelta(
      facts.acceptedParentTree,
      facts.validationCommitTree,
      treeMap,
    );
    recursiveTreeDelta = treeResult.delta;
    for (const reason of treeResult.reasonCodes) reasons.add(reason);

    const candidatePaths = facts.candidatePaths.map(({ path }) => path).sort(compare);
    const deltaPaths = recursiveTreeDelta.map(({ path }) => path).sort(compare);
    if (canonicalJson(deltaPaths) !== canonicalJson(candidatePaths)) {
      reasons.add("GIT_TREE_DELTA_PATH_SET_MISMATCH");
    }
    const candidateByPath = new Map(facts.candidatePaths.map((entry) => [entry.path, entry]));
    for (const entry of recursiveTreeDelta) {
      const candidate = candidateByPath.get(entry.path);
      if (candidate === undefined) continue;
      if (entry.validationGitObject !== candidate.gitBlob) {
        reasons.add("GIT_TREE_CANDIDATE_BLOB_MISMATCH");
      }
      if (
        entry.validationMode === null ||
        entry.validationMode === "40000" ||
        entry.validationMode === "160000" ||
        (entry.parentMode !== null && entry.parentMode !== entry.validationMode)
      ) {
        reasons.add("GIT_TREE_CANDIDATE_MODE_OR_TYPE_MISMATCH");
      }
    }
  } catch {
    reasons.add("GIT_OBJECT_EVIDENCE_INVALID");
  }
  const attestation = {
    commitObjectIdentity: facts.validationCommit,
    parentTreeIdentity: facts.acceptedParentTree,
    validationTreeIdentity: facts.validationCommitTree,
    recursiveTreeDelta,
    evidenceIdentity: recordIdentity(
      "CIC_ADAPTIVE_VALIDATION_GIT_OBJECT_EVIDENCE_V1",
      facts.gitObjectEvidence,
    ),
  };
  return {
    reasonCodes: [...reasons].sort(compare),
    recursiveTreeDelta,
    gitObjectAttestationIdentity: recordIdentity(
      "CIC_ADAPTIVE_VALIDATION_GIT_OBJECT_ATTESTATION_V1",
      attestation,
    ),
  };
}

function normalizedMaterializationFacts(value) {
  const code = "ADAPTIVE_VALIDATION_MATERIALIZATION_INVALID";
  exactKeys(value, MATERIALIZATION_FACT_KEYS, code);
  return {
    topology: verifyAdaptiveValidationTopology(value.topology),
    acceptedParentHead: contentIdentity(value.acceptedParentHead, code),
    acceptedParentTree: contentIdentity(value.acceptedParentTree, code),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    candidateIdentity: identity(value.candidateIdentity, code),
    candidatePaths: normalizedCandidatePaths(value.candidatePaths, code),
    canonicalRepository: normalizedCanonicalRepository(value.canonicalRepository, code),
    validationCommit: contentIdentity(value.validationCommit, code),
    validationCommitParent: contentIdentity(value.validationCommitParent, code),
    validationCommitTree: contentIdentity(value.validationCommitTree, code),
    expectedValidationCommitTree: contentIdentity(value.expectedValidationCommitTree, code),
    gitObjectEvidence: normalizedGitObjectEvidence(value.gitObjectEvidence, code),
    committedPaths: normalizedCommittedPaths(value.committedPaths, code),
    disposableWorktreeClean: boolean(value.disposableWorktreeClean, code),
    extraPaths: repositoryPaths(value.extraPaths, code),
    pushAttempts: nonnegativeInteger(value.pushAttempts, code),
    publicationAttempted: boolean(value.publicationAttempted, code),
  };
}

function materializationReasonCodes(facts, attestation) {
  const reasons = new Set();
  for (const reason of attestation.reasonCodes) reasons.add(reason);
  const topology = facts.topology;
  if (topology.disposition !== "DISPOSABLE_MATERIALIZED_COMMIT") {
    reasons.add("DISPOSABLE_TOPOLOGY_NOT_REQUIRED");
  }
  if (
    facts.acceptedParentHead !== topology.parentHead ||
    facts.validationCommitParent !== topology.parentHead
  ) {
    reasons.add("VALIDATION_PARENT_MISMATCH");
  }
  if (facts.acceptedParentTree !== topology.parentTree) {
    reasons.add("VALIDATION_PARENT_TREE_MISMATCH");
  }
  if (
    facts.repositoryIdentity !== topology.repositoryIdentity ||
    facts.repositorySnapshotIdentity !== topology.repositorySnapshotIdentity ||
    facts.currentTruthIdentity !== topology.currentTruthIdentity
  ) {
    reasons.add("REPOSITORY_BINDING_MISMATCH");
  }
  if (
    facts.sourceGenerationFingerprint !== topology.sourceGenerationFingerprint ||
    facts.sourceManifestIdentity !== topology.sourceManifestIdentity
  ) {
    reasons.add("SOURCE_BINDING_MISMATCH");
  }
  if (
    facts.candidateIdentity !== topology.candidateIdentity ||
    canonicalJson(facts.candidatePaths) !== canonicalJson(topology.candidatePaths)
  ) {
    reasons.add("CANDIDATE_BINDING_MISMATCH");
  }
  if (canonicalJson(facts.canonicalRepository) !== canonicalJson(topology.canonicalRepository)) {
    reasons.add("CANONICAL_REPOSITORY_CURRENTNESS_MISMATCH");
  }
  if (facts.validationCommit === facts.validationCommitParent) {
    reasons.add("VALIDATION_COMMIT_NOT_MATERIALIZED");
  }
  if (facts.validationCommitTree !== facts.expectedValidationCommitTree) {
    reasons.add("VALIDATION_COMMIT_TREE_MISMATCH");
  }
  const candidateBlobs = topology.candidatePaths
    .map(({ path, gitBlob }) => ({ path, gitBlob }))
    .sort((left, right) => compare(left.path, right.path));
  if (canonicalJson(facts.committedPaths) !== canonicalJson(candidateBlobs)) {
    reasons.add("COMMITTED_CANDIDATE_PATH_OR_BLOB_MISMATCH");
  }
  if (!facts.disposableWorktreeClean) reasons.add("DISPOSABLE_WORKTREE_DIRTY");
  if (facts.extraPaths.length > 0) reasons.add("EXTRA_COMMITTED_PATH");
  if (facts.pushAttempts > 0) reasons.add("PUSH_ATTEMPTED");
  if (facts.publicationAttempted) reasons.add("PUBLICATION_ATTEMPTED");
  return [...reasons].sort(compare);
}

function materializationBody(value) {
  const facts = normalizedMaterializationFacts(value);
  const attestation = attestGitObjectMaterialization(facts);
  const reasonCodes = materializationReasonCodes(facts, attestation);
  return {
    schemaVersion: ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA,
    status: reasonCodes.length === 0 ? "PASS" : "BLOCKED",
    reasonCodes,
    validationOnly: true,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    publicationAuthorization: false,
    pushAuthorization: false,
    targetedPruning: TARGETED_PRUNING_POLICY,
    ...facts,
    recursiveTreeDelta: attestation.recursiveTreeDelta,
    gitObjectAttestationIdentity: attestation.gitObjectAttestationIdentity,
  };
}

export function defineAdaptiveValidationMaterialization(input) {
  const body = materializationBody(input);
  return deepFreeze({
    ...body,
    materializationIdentity: recordIdentity(ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA, body),
  });
}

export function verifyAdaptiveValidationMaterialization(record) {
  const code = "ADAPTIVE_VALIDATION_MATERIALIZATION_INVALID";
  exactKeys(record, MATERIALIZATION_RECORD_KEYS, code);
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA) fail(code);
  const facts = Object.fromEntries(MATERIALIZATION_FACT_KEYS.map((key) => [key, record[key]]));
  const body = materializationBody(facts);
  const suppliedBody = { ...record };
  delete suppliedBody.materializationIdentity;
  if (canonicalJson(suppliedBody) !== canonicalJson(body)) fail(code);
  const computed = recordIdentity(ADAPTIVE_VALIDATION_MATERIALIZATION_SCHEMA, body);
  if (identity(record.materializationIdentity, code) !== computed) {
    fail("ADAPTIVE_VALIDATION_MATERIALIZATION_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, materializationIdentity: computed });
}
