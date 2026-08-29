import path from "node:path";

import { canonicalJson } from "./canonical-json.mjs";
import { observeCurrentTruth } from "./current-truth.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./context-closure.mjs";
import {
  atomicReplaceJson,
  fail,
  isIdentity,
  isPlainObject,
  pathState,
  readJson,
  requireIdentity,
  requirePlainObject,
  requirePortableId,
  reverifyStateDomain,
  semanticIdentity,
  stableUnique,
  withExclusiveLock,
  writeImmutableJson,
} from "./state-domain.mjs";

export const I4_ACTION_FLAGS = Object.freeze([
  "ACTIVATE_PACK",
  "COMMIT",
  "GENERATE_NON_ACTIVE",
  "GOVERNED_CONTENT_WRITE",
  "INVALIDATE_PACK",
  "MUTATE_SOURCES",
  "PUSH",
  "READ_INSPECT",
  "STAGE",
  "VERIFY",
]);

const ACTION_SET = new Set(I4_ACTION_FLAGS);
const HEAD_STATES = new Set(["ACTIVE", "REVOKED"]);

function requireExactKeys(value, expectedKeys, code) {
  requirePlainObject(value, "authority record");
  if (Object.keys(value).sort().join("\0") !== [...expectedKeys].sort().join("\0")) {
    fail(code);
  }
}

function locations(domain) {
  const root = domain.taskStateRoot;
  return {
    stateRoot: domain.stateRoot,
    root,
    taskContracts: path.join(root, "task-contracts"),
    decisions: path.join(root, "owner-decisions"),
    authorizations: path.join(root, "authorization", "records"),
    authorizationHeads: path.join(root, "authorization", "heads"),
    authorizationHead: path.join(root, "authorization", "head.json"),
    authorizationLock: path.join(root, "authorization", "head.lock"),
    checkpointContents: path.join(root, "checkpoints", "contents"),
    checkpointRoots: path.join(root, "checkpoints", "roots"),
    checkpointRecords: path.join(root, "checkpoints", "records"),
    checkpointHead: path.join(root, "checkpoints", "head.json"),
    checkpointLock: path.join(root, "checkpoints", "head.lock"),
    leaseRecords: path.join(root, "leases", "records"),
    leaseRegistry: path.join(root, "leases", "registry.json"),
    leaseLock: path.join(root, "leases", "registry.lock"),
    preimages: path.join(root, "preimages"),
  };
}

function normalizeScope(values, label = "scope") {
  const scope = stableUnique(values, label);
  for (const entry of scope) {
    if (
      entry.length === 0 ||
      entry.startsWith("/") ||
      entry.includes("\\") ||
      entry.split("/").some((part) => part === "" || part === "." || part === "..")
    ) {
      fail("AUTHORIZATION_SCOPE_MISMATCH");
    }
  }
  return scope;
}

function normalizeActions(values) {
  const actions = stableUnique(values, "actions");
  if (actions.some((action) => !ACTION_SET.has(action))) fail("AUTHORIZATION_ACTION_DENIED");
  return actions;
}

function normalizeOwners(values) {
  const owners = stableUnique(values, "owners");
  if (owners.length === 0) fail("AUTHORIZATION_INVALID");
  for (const owner of owners) requirePortableId(owner, "owner");
  return owners;
}

function normalizeSemanticOwners(values) {
  const owners = stableUnique(values, "semantic owners");
  if (owners.length === 0) fail("AUTHORIZATION_INVALID");
  for (const owner of owners) requirePortableId(owner, "semantic owner");
  return owners;
}

function normalizeContextIntent(value) {
  requirePlainObject(value, "task context intent");
  if (value.reviewed !== true || !Array.isArray(value.dimensions)) {
    fail("CONTEXT_PREREQUISITE_BLOCKED");
  }
  const dimensions = value.dimensions
    .map((raw) => {
      requirePlainObject(raw, "task context dimension");
      const dimension = requirePortableId(raw.dimension, "context dimension");
      if (!REQUIRED_CONTEXT_DIMENSIONS.includes(dimension)) {
        fail("CONTEXT_PREREQUISITE_BLOCKED");
      }
      if (!new Set(["PRESENT", "ABSENT_PROVEN", "NOT_APPLICABLE_WITH_REASON"]).has(raw.state)) {
        fail("CONTEXT_PREREQUISITE_BLOCKED");
      }
      const materialIdentities = stableUnique(
        raw.materialIdentities ?? [],
        "dimension material identities",
      ).map((identity) => requireIdentity(identity, "dimension material identity"));
      const normalized = { dimension, state: raw.state, materialIdentities };
      if (raw.state === "NOT_APPLICABLE_WITH_REASON") {
        if (
          typeof raw.reason !== "string" ||
          raw.reason.trim().length < 12 ||
          /^(?:n\/?a|not applicable|no provider(?: or material)? request|none required)[.! ]*$/iu.test(
            raw.reason.trim(),
          )
        ) {
          fail("CONTEXT_PREREQUISITE_BLOCKED");
        }
        normalized.reason = raw.reason.trim();
      } else if (raw.reason !== undefined) {
        fail("CONTEXT_PREREQUISITE_BLOCKED");
      }
      if (raw.state === "ABSENT_PROVEN") {
        requirePlainObject(raw.absenceWitness, "absence witness");
        normalized.absenceWitness = raw.absenceWitness;
      }
      return normalized;
    })
    .sort((left, right) => left.dimension.localeCompare(right.dimension));
  if (
    dimensions.length !== REQUIRED_CONTEXT_DIMENSIONS.length ||
    dimensions.some(
      (entry, index) => entry.dimension !== [...REQUIRED_CONTEXT_DIMENSIONS].sort()[index],
    )
  ) {
    fail("CONTEXT_PREREQUISITE_BLOCKED");
  }
  const body = { schemaVersion: "CIC_TASK_CONTEXT_INTENT_V1", reviewed: true, dimensions };
  return {
    ...body,
    contextIntentIdentity: semanticIdentity("CIC-TASK-CONTEXT-INTENT-V1", body),
  };
}

export function defineTaskContract(input) {
  requirePlainObject(input, "task contract");
  const body = {
    schemaVersion: "CIC_TASK_CONTRACT_V2",
    taskIdentity: requireIdentity(input.taskIdentity, "task identity"),
    taskName: requirePortableId(input.taskName, "task name"),
    repositoryIdentity: requireIdentity(input.repositoryIdentity, "repository identity"),
    portableWorktreeIdentity: requireIdentity(
      input.portableWorktreeIdentity,
      "portable worktree identity",
    ),
    scope: normalizeScope(input.scope),
    owners: normalizeOwners(input.owners),
    semanticOwners: normalizeSemanticOwners(input.semanticOwners),
    contextIntent: normalizeContextIntent(input.contextIntent),
  };
  return { ...body, taskContractIdentity: semanticIdentity("CIC-TASK-CONTRACT-V2", body) };
}

function verifyTaskContractRecord(record, addressedIdentity, domain) {
  const defined = defineTaskContract(record);
  const expected = {
    ...defined,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
  };
  requireExactKeys(record, Object.keys(expected), "AUTHORIZATION_INVALID");
  if (
    record.schemaVersion !== "CIC_TASK_CONTRACT_V2" ||
    record.taskContractIdentity !== addressedIdentity ||
    defined.taskContractIdentity !== addressedIdentity ||
    canonicalJson(record) !== canonicalJson(expected) ||
    record.taskIdentity !== domain.taskIdentity ||
    record.repositoryIdentity !== domain.repositoryIdentity ||
    record.portableWorktreeIdentity !== domain.portableWorktreeIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  return record;
}

export async function recordTaskContract(domainInput, candidate) {
  const defined = defineTaskContract(candidate);
  if (
    candidate.taskContractIdentity !== undefined &&
    candidate.taskContractIdentity !== defined.taskContractIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  const domain = await reverifyStateDomain({ ...domainInput, taskIdentity: defined.taskIdentity });
  if (
    domain.repositoryIdentity !== defined.repositoryIdentity ||
    domain.portableWorktreeIdentity !== defined.portableWorktreeIdentity
  ) {
    fail("STATE_STORE_BINDING_MISMATCH");
  }
  const record = {
    ...defined,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
  };
  await writeImmutableJson(
    path.join(locations(domain).taskContracts, `${defined.taskContractIdentity}.json`),
    record,
    "AUTHORIZATION_INVALID",
    domain.stateRoot,
  );
  return { record, domain };
}

function normalizeHeadExpectation(input) {
  const identity = input.expectedAuthorizationHeadIdentity ?? null;
  const currentAuthorizationIdentity = input.expectedCurrentAuthorizationIdentity ?? null;
  if (identity !== null) requireIdentity(identity, "expected authorization head identity");
  if (currentAuthorizationIdentity !== null) {
    requireIdentity(currentAuthorizationIdentity, "expected current authorization identity");
  }
  const state = input.expectedHeadState ?? null;
  if (state !== null && !HEAD_STATES.has(state)) fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  if (!Number.isSafeInteger(input.expectedHeadGeneration) || input.expectedHeadGeneration < 0) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  return {
    expectedAuthorizationHeadIdentity: identity,
    expectedHeadState: state,
    expectedHeadGeneration: input.expectedHeadGeneration,
    expectedCurrentAuthorizationIdentity: currentAuthorizationIdentity,
  };
}

export function defineOwnerDecision(input) {
  requirePlainObject(input, "owner decision");
  const decisionKind = input.decisionKind;
  if (!new Set(["AUTHORIZE", "REVOKE"]).has(decisionKind)) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  const expectation = normalizeHeadExpectation(input);
  const body = {
    schemaVersion: "CIC_OWNER_DECISION_V1",
    decisionKind,
    taskIdentity: requireIdentity(input.taskIdentity, "task identity"),
    taskContractIdentity: requireIdentity(input.taskContractIdentity, "task-contract identity"),
    repositoryIdentity: requireIdentity(input.repositoryIdentity, "repository identity"),
    portableWorktreeIdentity: requireIdentity(
      input.portableWorktreeIdentity,
      "portable worktree identity",
    ),
    portableStateDomainIdentity: requireIdentity(
      input.portableStateDomainIdentity,
      "portable state-domain identity",
    ),
    localStateStoreBindingIdentity: requireIdentity(
      input.localStateStoreBindingIdentity,
      "local state-store binding identity",
    ),
    localWorktreeBindingIdentity: requireIdentity(
      input.localWorktreeBindingIdentity,
      "local worktree binding identity",
    ),
    contextIntentIdentity: requireIdentity(input.contextIntentIdentity, "context-intent identity"),
    authorityIdentity: requireIdentity(input.authorityIdentity, "authority identity"),
    currentTruthIdentity: requireIdentity(input.currentTruthIdentity, "current-truth identity"),
    actions: normalizeActions(input.actions),
    scope: normalizeScope(input.scope),
    owners: normalizeOwners(input.owners),
    semanticOwners: normalizeSemanticOwners(input.semanticOwners),
    reasonClassification: requirePortableId(input.reasonClassification, "reason classification"),
    reviewedEvidenceIdentities: stableUnique(
      input.reviewedEvidenceIdentities,
      "reviewed evidence identities",
    ).map((identity) => requireIdentity(identity, "reviewed evidence identity")),
    ...expectation,
  };
  if (body.reviewedEvidenceIdentities.length === 0) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  if (
    (decisionKind === "REVOKE" &&
      (body.expectedHeadState !== "ACTIVE" ||
        body.expectedCurrentAuthorizationIdentity === null)) ||
    (decisionKind === "AUTHORIZE" &&
      body.expectedHeadGeneration === 0 &&
      (body.expectedAuthorizationHeadIdentity !== null ||
        body.expectedHeadState !== null ||
        body.expectedCurrentAuthorizationIdentity !== null))
  ) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  return { ...body, ownerDecisionIdentity: semanticIdentity("CIC-OWNER-DECISION-V1", body) };
}

function verifyOwnerDecisionRecord(record, addressedIdentity, domain) {
  const defined = defineOwnerDecision(record);
  requireExactKeys(record, Object.keys(defined), "AUTHORIZATION_OWNER_DECISION_INVALID");
  if (
    record.schemaVersion !== "CIC_OWNER_DECISION_V1" ||
    record.ownerDecisionIdentity !== addressedIdentity ||
    defined.ownerDecisionIdentity !== addressedIdentity ||
    canonicalJson(record) !== canonicalJson(defined) ||
    record.taskIdentity !== domain.taskIdentity ||
    record.repositoryIdentity !== domain.repositoryIdentity ||
    record.portableWorktreeIdentity !== domain.portableWorktreeIdentity ||
    record.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    record.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    record.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity
  ) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  return record;
}

export async function recordOwnerDecision(domainInput, candidate) {
  if (!isIdentity(candidate?.ownerDecisionIdentity)) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID", "reviewed decision identity must be supplied");
  }
  const defined = defineOwnerDecision(candidate);
  if (candidate.ownerDecisionIdentity !== defined.ownerDecisionIdentity) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  const domain = await reverifyStateDomain({ ...domainInput, taskIdentity: defined.taskIdentity });
  if (
    domain.portableStateDomainIdentity !== defined.portableStateDomainIdentity ||
    domain.localWorktreeBindingIdentity !== defined.localWorktreeBindingIdentity ||
    domain.localStateStoreBindingIdentity !== defined.localStateStoreBindingIdentity ||
    domain.portableWorktreeIdentity !== defined.portableWorktreeIdentity ||
    domain.repositoryIdentity !== defined.repositoryIdentity
  ) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  const taskContract = verifyTaskContractRecord(
    await readJson(
      path.join(locations(domain).taskContracts, `${defined.taskContractIdentity}.json`),
      "AUTHORIZATION_OWNER_DECISION_INVALID",
      domain.stateRoot,
    ),
    defined.taskContractIdentity,
    domain,
  );
  if (
    taskContract.taskContractIdentity !== defined.taskContractIdentity ||
    taskContract.taskIdentity !== defined.taskIdentity ||
    taskContract.contextIntent.contextIntentIdentity !== defined.contextIntentIdentity ||
    defined.semanticOwners.some((entry) => !taskContract.semanticOwners.includes(entry)) ||
    defined.scope.some((entry) => !taskContract.scope.includes(entry)) ||
    defined.owners.some((entry) => !taskContract.owners.includes(entry))
  ) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  await writeImmutableJson(
    path.join(locations(domain).decisions, `${defined.ownerDecisionIdentity}.json`),
    defined,
    "AUTHORIZATION_OWNER_DECISION_INVALID",
    domain.stateRoot,
  );
  return { record: defined, domain };
}

async function readOptionalJson(filePath, code, stateRoot) {
  const state = await pathState(filePath, stateRoot);
  if (state.state === "ABSENT_PROVEN") return null;
  if (state.state !== "PRESENT" || !state.stats.isFile() || state.stats.isSymbolicLink())
    fail(code);
  return readJson(filePath, code, stateRoot);
}

function headIdentity(body) {
  return semanticIdentity("CIC-AUTHORIZATION-HEAD-V1", body);
}

function checkpointContentIdentity(body) {
  return semanticIdentity("CIC-TASK-CHECKPOINT-CONTENT-V1", body);
}

function checkpointRecordIdentity(body) {
  return semanticIdentity("CIC-TASK-CHECKPOINT-RECORD-V1", body);
}

function leaseIdentity(body) {
  return semanticIdentity("CIC-MUTATION-LEASE-V1", body);
}

function verifyLeaseRecordIdentity(record, addressedIdentity) {
  const body = { ...record };
  delete body.leaseIdentity;
  requireExactKeys(
    record,
    [
      "schemaVersion",
      "authorizationHeadIdentity",
      "authorizationIdentity",
      "taskIdentity",
      "taskContractIdentity",
      "portableWorktreeIdentity",
      "portableStateDomainIdentity",
      "localStateStoreBindingIdentity",
      "localWorktreeBindingIdentity",
      "checkpointRecordIdentity",
      "owner",
      "scope",
      "semanticOwners",
      "leaseIdentity",
    ],
    "MUTATION_LEASE_STALE",
  );
  if (
    record.schemaVersion !== "CIC_MUTATION_LEASE_V1" ||
    record.leaseIdentity !== addressedIdentity ||
    leaseIdentity(body) !== addressedIdentity
  ) {
    fail("MUTATION_LEASE_STALE");
  }
  return record;
}

function selectorIdentity(schema, selector) {
  return selector === null ? null : semanticIdentity(schema, selector);
}

function requireGitObjectId(value, label) {
  if (typeof value !== "string" || !/^[0-9a-f]{40}$/u.test(value)) {
    fail("TASK_CHECKPOINT_STALE", `${label} must be a Git SHA-1 object identity`);
  }
  return value;
}

function currentTruthFactBody(currentTruth, authorizedPathSet, authorizedSemanticOwnerSet) {
  return {
    schemaVersion: "CIC_I4_CURRENT_TRUTH_FACT_V1",
    currentTruthIdentity: requireIdentity(
      currentTruth.currentTruthIdentity,
      "current-truth identity",
    ),
    sourceGenerationFingerprint: requireIdentity(
      currentTruth.sourceGeneration.fingerprint,
      "Source generation fingerprint",
    ),
    repositoryIdentity: requireIdentity(
      currentTruth.repository.repositoryIdentity,
      "repository identity",
    ),
    repositoryHeadCommit: requireGitObjectId(
      currentTruth.repository.head.commit,
      "repository HEAD commit",
    ),
    repositoryHeadTree: requireGitObjectId(
      currentTruth.repository.head.tree,
      "repository HEAD tree",
    ),
    repositorySnapshotIdentity: requireIdentity(
      currentTruth.repository.snapshotFingerprint,
      "repository snapshot identity",
    ),
    portableWorktreeIdentity: requireIdentity(
      currentTruth.portableWorktreeIdentity,
      "portable worktree identity",
    ),
    localWorktreeBindingIdentity: requireIdentity(
      currentTruth.localWorktreeBindingIdentity,
      "local worktree binding identity",
    ),
    portableStateDomainIdentity: requireIdentity(
      currentTruth.portableStateDomainIdentity,
      "portable state-domain identity",
    ),
    localStateStoreBindingIdentity: requireIdentity(
      currentTruth.localStateStoreBindingIdentity,
      "local state-store binding identity",
    ),
    contextGenerationIdentity: requireIdentity(
      currentTruth.context.contextGenerationIdentity,
      "context generation identity",
    ),
    taskMaterialFingerprint: requireIdentity(
      currentTruth.context.taskMaterialFingerprint,
      "task-material fingerprint",
    ),
    capabilityStatus: currentTruth.capabilities.status,
    capabilityFingerprint: requireIdentity(
      currentTruth.capabilities.fingerprint,
      "capability fingerprint",
    ),
    effectivePolicyIdentity: requireIdentity(
      currentTruth.effectivePolicy.effectivePolicyIdentity,
      "effective policy identity",
    ),
    taskContractIdentity: requireIdentity(
      currentTruth.taskContractIdentity,
      "task-contract identity",
    ),
    contextIntentIdentity: requireIdentity(
      currentTruth.contextIntentIdentity,
      "context-intent identity",
    ),
    authorizedPathSet: normalizeScope(authorizedPathSet, "authorized path set"),
    authorizedSemanticOwnerSet: normalizeSemanticOwners(authorizedSemanticOwnerSet),
  };
}

function currentTruthFactBodyFromRecord(fact) {
  if (!isPlainObject(fact) || fact.capabilityStatus !== "PASS") {
    fail("TASK_CHECKPOINT_STALE");
  }
  return {
    schemaVersion: fact.schemaVersion,
    currentTruthIdentity: requireIdentity(fact.currentTruthIdentity, "current-truth identity"),
    sourceGenerationFingerprint: requireIdentity(
      fact.sourceGenerationFingerprint,
      "Source generation fingerprint",
    ),
    repositoryIdentity: requireIdentity(fact.repositoryIdentity, "repository identity"),
    repositoryHeadCommit: requireGitObjectId(fact.repositoryHeadCommit, "repository HEAD commit"),
    repositoryHeadTree: requireGitObjectId(fact.repositoryHeadTree, "repository HEAD tree"),
    repositorySnapshotIdentity: requireIdentity(
      fact.repositorySnapshotIdentity,
      "repository snapshot identity",
    ),
    portableWorktreeIdentity: requireIdentity(
      fact.portableWorktreeIdentity,
      "portable worktree identity",
    ),
    localWorktreeBindingIdentity: requireIdentity(
      fact.localWorktreeBindingIdentity,
      "local worktree binding identity",
    ),
    portableStateDomainIdentity: requireIdentity(
      fact.portableStateDomainIdentity,
      "portable state-domain identity",
    ),
    localStateStoreBindingIdentity: requireIdentity(
      fact.localStateStoreBindingIdentity,
      "local state-store binding identity",
    ),
    contextGenerationIdentity: requireIdentity(
      fact.contextGenerationIdentity,
      "context generation identity",
    ),
    taskMaterialFingerprint: requireIdentity(
      fact.taskMaterialFingerprint,
      "task-material fingerprint",
    ),
    capabilityStatus: fact.capabilityStatus,
    capabilityFingerprint: requireIdentity(fact.capabilityFingerprint, "capability fingerprint"),
    effectivePolicyIdentity: requireIdentity(
      fact.effectivePolicyIdentity,
      "effective policy identity",
    ),
    taskContractIdentity: requireIdentity(fact.taskContractIdentity, "task-contract identity"),
    contextIntentIdentity: requireIdentity(fact.contextIntentIdentity, "context-intent identity"),
    authorizedPathSet: normalizeScope(fact.authorizedPathSet, "authorized path set"),
    authorizedSemanticOwnerSet: normalizeSemanticOwners(fact.authorizedSemanticOwnerSet),
  };
}

function defineCurrentTruthFact(currentTruth, authorizedPathSet, authorizedSemanticOwnerSet) {
  const body = currentTruthFactBody(currentTruth, authorizedPathSet, authorizedSemanticOwnerSet);
  return {
    ...body,
    currentTruthFactIdentity: semanticIdentity("CIC-I4-CURRENT-TRUTH-FACT-V1", body),
  };
}

export function verifyCurrentTruthFact(fact) {
  const body = currentTruthFactBodyFromRecord(fact);
  const expectedKeys = [...Object.keys(body), "currentTruthFactIdentity"].sort().join("\0");
  if (
    Object.keys(fact).sort().join("\0") !== expectedKeys ||
    fact.schemaVersion !== "CIC_I4_CURRENT_TRUTH_FACT_V1" ||
    fact.currentTruthFactIdentity !== semanticIdentity("CIC-I4-CURRENT-TRUTH-FACT-V1", body)
  ) {
    fail("TASK_CHECKPOINT_STALE");
  }
  return { ...body, currentTruthFactIdentity: fact.currentTruthFactIdentity };
}

function expectHead(head, decision) {
  if (head === null) {
    if (
      decision.expectedAuthorizationHeadIdentity !== null ||
      decision.expectedHeadState !== null ||
      decision.expectedHeadGeneration !== 0 ||
      decision.expectedCurrentAuthorizationIdentity !== null
    ) {
      fail("AUTHORIZATION_CAS_CONFLICT");
    }
    return;
  }
  if (
    head.authorizationHeadIdentity !== decision.expectedAuthorizationHeadIdentity ||
    head.state !== decision.expectedHeadState ||
    head.generation !== decision.expectedHeadGeneration ||
    head.currentAuthorizationIdentity !== decision.expectedCurrentAuthorizationIdentity
  ) {
    fail("AUTHORIZATION_CAS_CONFLICT");
  }
}

async function loadTaskAndDecision(domain, taskIdentity, ownerDecisionIdentity) {
  const paths = locations(domain);
  const decision = verifyOwnerDecisionRecord(
    await readJson(
      path.join(paths.decisions, `${ownerDecisionIdentity}.json`),
      "AUTHORIZATION_OWNER_DECISION_INVALID",
      paths.stateRoot,
    ),
    ownerDecisionIdentity,
    domain,
  );
  const taskContract = verifyTaskContractRecord(
    await readJson(
      path.join(paths.taskContracts, `${decision.taskContractIdentity}.json`),
      "AUTHORIZATION_INVALID",
      paths.stateRoot,
    ),
    decision.taskContractIdentity,
    domain,
  );
  if (
    taskContract.taskIdentity !== taskIdentity ||
    taskContract.taskContractIdentity !== decision.taskContractIdentity ||
    decision.taskIdentity !== taskIdentity ||
    decision.ownerDecisionIdentity !== ownerDecisionIdentity ||
    decision.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    decision.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    decision.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity
  ) {
    fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  }
  return { taskContract, decision, paths };
}

function truthRequest(input, domain, authorityIdentity) {
  return {
    ...(input.currentTruthRequest ?? {}),
    repositoryRoot: domain.repositoryRoot,
    worktreeRoot: domain.worktreeRoot,
    stateRoot: domain.stateRoot,
    repositoryIdentity: domain.repositoryIdentity,
    taskIdentity: domain.taskIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    taskContractIdentity: input.taskContractIdentity,
    authorityIdentity,
  };
}

function assertDecisionScope(taskContract, decision) {
  if (
    decision.scope.some((entry) => !taskContract.scope.includes(entry)) ||
    decision.owners.some((entry) => !taskContract.owners.includes(entry)) ||
    decision.semanticOwners.some((entry) => !taskContract.semanticOwners.includes(entry)) ||
    decision.taskContractIdentity !== taskContract.taskContractIdentity ||
    decision.contextIntentIdentity !== taskContract.contextIntent.contextIntentIdentity
  ) {
    fail("AUTHORIZATION_SCOPE_MISMATCH");
  }
}

export async function admitAuthorization(input) {
  requireIdentity(input.ownerDecisionIdentity, "owner decision identity");
  const domain = await reverifyStateDomain(input.domainInput);
  const { taskContract, decision, paths } = await loadTaskAndDecision(
    domain,
    domain.taskIdentity,
    input.ownerDecisionIdentity,
  );
  if (decision.decisionKind !== "AUTHORIZE") fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  assertDecisionScope(taskContract, decision);
  const currentTruth = await observeCurrentTruth(
    truthRequest(
      { ...input, taskContractIdentity: decision.taskContractIdentity },
      domain,
      decision.authorityIdentity,
    ),
  );
  if (currentTruth.currentTruthIdentity !== decision.currentTruthIdentity) {
    fail("AUTHORIZATION_STALE");
  }
  const admissionFact = defineCurrentTruthFact(
    currentTruth,
    decision.scope,
    decision.semanticOwners,
  );

  const checkpointContentBody = {
    schemaVersion: "CIC_TASK_CHECKPOINT_CONTENT_V1",
    taskIdentity: domain.taskIdentity,
    taskContractIdentity: decision.taskContractIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    sequence: 0,
    predecessorCheckpointContentIdentity: null,
    currentTruthIdentity: currentTruth.currentTruthIdentity,
    contextGenerationIdentity: currentTruth.context.contextGenerationIdentity,
    taskMaterialFingerprint: currentTruth.context.taskMaterialFingerprint,
    effectivePolicyIdentity: currentTruth.effectivePolicy.effectivePolicyIdentity,
    generationFactIdentity: admissionFact.currentTruthFactIdentity,
    generationFact: admissionFact,
    scope: decision.scope,
    semanticOwners: decision.semanticOwners,
  };
  const rootContentIdentity = checkpointContentIdentity(checkpointContentBody);
  const authorizationBody = {
    schemaVersion: "CIC_TASK_AUTHORIZATION_V1",
    taskIdentity: domain.taskIdentity,
    taskContractIdentity: decision.taskContractIdentity,
    repositoryIdentity: domain.repositoryIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    contextIntentIdentity: decision.contextIntentIdentity,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    authorityIdentity: decision.authorityIdentity,
    currentTruthIdentity: currentTruth.currentTruthIdentity,
    effectivePolicyIdentity: currentTruth.effectivePolicy.effectivePolicyIdentity,
    admissionFactIdentity: admissionFact.currentTruthFactIdentity,
    admissionFact,
    actions: decision.actions,
    scope: decision.scope,
    owners: decision.owners,
    semanticOwners: decision.semanticOwners,
    authorizedCheckpointRootIdentity: rootContentIdentity,
    parentAuthorizationIdentity: decision.expectedCurrentAuthorizationIdentity,
    supersedesAuthorizationIdentity: decision.expectedCurrentAuthorizationIdentity,
    predecessorAuthorizationHeadIdentity: decision.expectedAuthorizationHeadIdentity,
  };
  const authorizationIdentity = semanticIdentity("CIC-TASK-AUTHORIZATION-V1", authorizationBody);
  const newHeadBody = {
    schemaVersion: "CIC_AUTHORIZATION_HEAD_V1",
    taskIdentity: domain.taskIdentity,
    taskContractIdentity: decision.taskContractIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    generation: decision.expectedHeadGeneration + 1,
    state: "ACTIVE",
    currentAuthorizationIdentity: authorizationIdentity,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    parentHeadIdentity: decision.expectedAuthorizationHeadIdentity,
    revocationDecisionIdentity: null,
  };
  const authorizationHeadIdentity = headIdentity(newHeadBody);
  const checkpointRecordBody = {
    schemaVersion: "CIC_TASK_CHECKPOINT_RECORD_V1",
    checkpointContentIdentity: rootContentIdentity,
    authorizationHeadIdentity,
    authorizationIdentity,
    taskIdentity: domain.taskIdentity,
    taskContractIdentity: decision.taskContractIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    generationFactIdentity: admissionFact.currentTruthFactIdentity,
    semanticOwners: decision.semanticOwners,
  };
  const rootRecordIdentity = checkpointRecordIdentity(checkpointRecordBody);
  const checkpointContent = {
    ...checkpointContentBody,
    checkpointContentIdentity: rootContentIdentity,
  };
  const authorization = { ...authorizationBody, authorizationIdentity };
  const head = { ...newHeadBody, authorizationHeadIdentity };
  const rootRecord = { ...checkpointRecordBody, checkpointRecordIdentity: rootRecordIdentity };

  // F-11: the semantic content and full epoch-bound record are durable before head CAS.
  await writeImmutableJson(
    path.join(paths.checkpointContents, `${rootContentIdentity}.json`),
    checkpointContent,
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  await writeImmutableJson(
    path.join(paths.checkpointRecords, `${rootRecordIdentity}.json`),
    rootRecord,
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  await writeImmutableJson(
    path.join(paths.checkpointRoots, `${authorizationIdentity}.json`),
    rootRecord,
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  await writeImmutableJson(
    path.join(paths.authorizations, `${authorizationIdentity}.json`),
    authorization,
    "AUTHORIZATION_INVALID",
    paths.stateRoot,
  );
  await writeImmutableJson(
    path.join(paths.authorizationHeads, `${authorizationHeadIdentity}.json`),
    head,
    "AUTHORIZATION_INVALID",
    paths.stateRoot,
  );

  await withExclusiveLock(
    paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      const observedHead = await readOptionalJson(
        paths.authorizationHead,
        "AUTHORIZATION_INVALID",
        paths.stateRoot,
      );
      expectHead(observedHead, decision);
      await atomicReplaceJson(paths.authorizationHead, head, paths.stateRoot);
    },
    paths.stateRoot,
  );
  return { authorization, head, rootCheckpoint: rootRecord, checkpointContent, currentTruth };
}

async function loadCurrentHead(domain) {
  const paths = locations(domain);
  const head = await readOptionalJson(
    paths.authorizationHead,
    "AUTHORIZATION_INVALID",
    paths.stateRoot,
  );
  if (head === null || !isIdentity(head.authorizationHeadIdentity)) fail("AUTHORIZATION_INVALID");
  if (
    head.authorizationHeadIdentity !==
    headIdentity({
      schemaVersion: head.schemaVersion,
      taskIdentity: head.taskIdentity,
      taskContractIdentity: head.taskContractIdentity,
      portableWorktreeIdentity: head.portableWorktreeIdentity,
      portableStateDomainIdentity: head.portableStateDomainIdentity,
      localStateStoreBindingIdentity: head.localStateStoreBindingIdentity,
      localWorktreeBindingIdentity: head.localWorktreeBindingIdentity,
      generation: head.generation,
      state: head.state,
      currentAuthorizationIdentity: head.currentAuthorizationIdentity,
      ownerDecisionIdentity: head.ownerDecisionIdentity,
      parentHeadIdentity: head.parentHeadIdentity,
      revocationDecisionIdentity: head.revocationDecisionIdentity,
    })
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  if (
    head.taskIdentity !== domain.taskIdentity ||
    head.portableWorktreeIdentity !== domain.portableWorktreeIdentity ||
    head.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    head.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    head.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  return { head, paths };
}

async function wasSelectedInHeadLineage(paths, head, authorizationIdentity) {
  let cursor = head;
  const seen = new Set();
  while (cursor !== null && !seen.has(cursor.authorizationHeadIdentity)) {
    seen.add(cursor.authorizationHeadIdentity);
    if (cursor.currentAuthorizationIdentity === authorizationIdentity) return true;
    if (cursor.parentHeadIdentity === null) break;
    cursor = await readOptionalJson(
      path.join(paths.authorizationHeads, `${cursor.parentHeadIdentity}.json`),
      "AUTHORIZATION_INVALID",
      paths.stateRoot,
    );
  }
  return false;
}

export async function loadAuthorizationEpoch(input) {
  const domain = await reverifyStateDomain(input.domainInput);
  requireIdentity(input.authorizationIdentity, "authorization identity");
  const { head, paths } = await loadCurrentHead(domain);
  const authorization = await readOptionalJson(
    path.join(paths.authorizations, `${input.authorizationIdentity}.json`),
    "AUTHORIZATION_INVALID",
    paths.stateRoot,
  );
  if (
    authorization === null ||
    authorization.authorizationIdentity !== input.authorizationIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  const authorizationBody = { ...authorization };
  delete authorizationBody.authorizationIdentity;
  if (
    semanticIdentity("CIC-TASK-AUTHORIZATION-V1", authorizationBody) !==
    authorization.authorizationIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  const admissionFact = verifyCurrentTruthFact(authorization.admissionFact);
  if (
    authorization.admissionFactIdentity !== admissionFact.currentTruthFactIdentity ||
    admissionFact.currentTruthIdentity !== authorization.currentTruthIdentity ||
    admissionFact.repositoryIdentity !== authorization.repositoryIdentity ||
    admissionFact.taskContractIdentity !== authorization.taskContractIdentity ||
    admissionFact.contextIntentIdentity !== authorization.contextIntentIdentity ||
    admissionFact.portableWorktreeIdentity !== authorization.portableWorktreeIdentity ||
    admissionFact.localWorktreeBindingIdentity !== authorization.localWorktreeBindingIdentity ||
    admissionFact.portableStateDomainIdentity !== authorization.portableStateDomainIdentity ||
    admissionFact.localStateStoreBindingIdentity !== authorization.localStateStoreBindingIdentity ||
    admissionFact.effectivePolicyIdentity !== authorization.effectivePolicyIdentity ||
    admissionFact.authorizedPathSet.join("\0") !== authorization.scope.join("\0") ||
    admissionFact.authorizedSemanticOwnerSet.join("\0") !== authorization.semanticOwners.join("\0")
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  const loadedAuthority = await loadTaskAndDecision(
    domain,
    domain.taskIdentity,
    authorization.ownerDecisionIdentity,
  );
  if (
    loadedAuthority.taskContract.taskContractIdentity !== authorization.taskContractIdentity ||
    loadedAuthority.decision.ownerDecisionIdentity !== authorization.ownerDecisionIdentity ||
    loadedAuthority.decision.taskContractIdentity !== authorization.taskContractIdentity ||
    loadedAuthority.decision.authorityIdentity !== authorization.authorityIdentity ||
    loadedAuthority.decision.currentTruthIdentity !== authorization.currentTruthIdentity ||
    loadedAuthority.decision.actions.join("\0") !== authorization.actions.join("\0") ||
    loadedAuthority.decision.scope.join("\0") !== authorization.scope.join("\0") ||
    loadedAuthority.decision.owners.join("\0") !== authorization.owners.join("\0") ||
    loadedAuthority.decision.semanticOwners.join("\0") !== authorization.semanticOwners.join("\0")
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  if (head.currentAuthorizationIdentity !== input.authorizationIdentity) {
    if (await wasSelectedInHeadLineage(paths, head, input.authorizationIdentity)) {
      fail("AUTHORIZATION_SUPERSEDED");
    }
    fail("AUTHORIZATION_INVALID");
  }
  if (head.state === "REVOKED") fail("AUTHORIZATION_REVOKED");
  if (head.state !== "ACTIVE") fail("AUTHORIZATION_INVALID");
  if (
    authorization.taskIdentity !== domain.taskIdentity ||
    authorization.taskContractIdentity !== head.taskContractIdentity ||
    authorization.repositoryIdentity !== domain.repositoryIdentity ||
    authorization.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    authorization.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  if (
    input.expectedAuthorizationHeadIdentity !== undefined &&
    head.authorizationHeadIdentity !== input.expectedAuthorizationHeadIdentity
  ) {
    fail("AUTHORIZATION_STALE");
  }
  if (input.requiredAction !== undefined && !authorization.actions.includes(input.requiredAction)) {
    fail("AUTHORIZATION_ACTION_DENIED");
  }
  return {
    domain,
    paths,
    head,
    authorization,
    taskContract: loadedAuthority.taskContract,
    ownerDecision: loadedAuthority.decision,
    currentTruth: null,
  };
}

export async function verifyAuthorization(input) {
  const loaded = await loadAuthorizationEpoch(input);
  if (!isPlainObject(input.currentTruthRequest)) {
    fail("AUTHORIZATION_STALE", "fresh current-truth request is required");
  }
  const currentTruth = await observeCurrentTruth(
    truthRequest(
      { ...input, taskContractIdentity: loaded.authorization.taskContractIdentity },
      loaded.domain,
      loaded.authorization.authorityIdentity,
    ),
  );
  const checkpoint = await effectiveCheckpoint(loaded);
  const checkpointContent = checkpoint.content;
  if (currentTruth.currentTruthIdentity !== checkpointContent.currentTruthIdentity) {
    fail("AUTHORIZATION_STALE");
  }
  return { ...loaded, currentTruth, checkpoint, checkpointContent };
}

export async function revokeAuthorization(input) {
  const domain = await reverifyStateDomain(input.domainInput);
  const { decision, paths } = await loadTaskAndDecision(
    domain,
    domain.taskIdentity,
    input.ownerDecisionIdentity,
  );
  if (decision.decisionKind !== "REVOKE") fail("AUTHORIZATION_OWNER_DECISION_INVALID");
  const currentTruth = await observeCurrentTruth(
    truthRequest(
      { ...input, taskContractIdentity: decision.taskContractIdentity },
      domain,
      decision.authorityIdentity,
    ),
  );
  if (currentTruth.currentTruthIdentity !== decision.currentTruthIdentity)
    fail("AUTHORIZATION_STALE");
  const newHeadBody = {
    schemaVersion: "CIC_AUTHORIZATION_HEAD_V1",
    taskIdentity: domain.taskIdentity,
    taskContractIdentity: decision.taskContractIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    generation: decision.expectedHeadGeneration + 1,
    state: "REVOKED",
    currentAuthorizationIdentity: decision.expectedCurrentAuthorizationIdentity,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    parentHeadIdentity: decision.expectedAuthorizationHeadIdentity,
    revocationDecisionIdentity: decision.ownerDecisionIdentity,
  };
  const head = { ...newHeadBody, authorizationHeadIdentity: headIdentity(newHeadBody) };
  await writeImmutableJson(
    path.join(paths.authorizationHeads, `${head.authorizationHeadIdentity}.json`),
    head,
    "AUTHORIZATION_INVALID",
    paths.stateRoot,
  );
  await withExclusiveLock(
    paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      const observed = await readOptionalJson(
        paths.authorizationHead,
        "AUTHORIZATION_INVALID",
        paths.stateRoot,
      );
      expectHead(observed, decision);
      await atomicReplaceJson(paths.authorizationHead, head, paths.stateRoot);
    },
    paths.stateRoot,
  );
  return { head, currentTruth };
}

async function loadCheckpointRecord(paths, recordIdentity) {
  const record = await readJson(
    path.join(paths.checkpointRecords, `${recordIdentity}.json`),
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  const body = { ...record };
  delete body.checkpointRecordIdentity;
  if (
    record.checkpointRecordIdentity !== recordIdentity ||
    checkpointRecordIdentity(body) !== recordIdentity ||
    record.generationFactIdentity === undefined
  ) {
    fail("TASK_CHECKPOINT_STALE");
  }
  return record;
}

async function loadCheckpointContent(paths, contentIdentity) {
  const content = await readJson(
    path.join(paths.checkpointContents, `${contentIdentity}.json`),
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  const body = { ...content };
  delete body.checkpointContentIdentity;
  const generationFact = verifyCurrentTruthFact(content.generationFact);
  if (
    content.checkpointContentIdentity !== contentIdentity ||
    checkpointContentIdentity(body) !== contentIdentity ||
    content.generationFactIdentity !== generationFact.currentTruthFactIdentity ||
    content.currentTruthIdentity !== generationFact.currentTruthIdentity ||
    content.contextGenerationIdentity !== generationFact.contextGenerationIdentity ||
    content.taskMaterialFingerprint !== generationFact.taskMaterialFingerprint ||
    content.effectivePolicyIdentity !== generationFact.effectivePolicyIdentity ||
    content.taskContractIdentity !== generationFact.taskContractIdentity ||
    content.portableWorktreeIdentity !== generationFact.portableWorktreeIdentity ||
    content.portableStateDomainIdentity !== generationFact.portableStateDomainIdentity ||
    content.localWorktreeBindingIdentity !== generationFact.localWorktreeBindingIdentity ||
    content.localStateStoreBindingIdentity !== generationFact.localStateStoreBindingIdentity ||
    content.scope.join("\0") !== generationFact.authorizedPathSet.join("\0") ||
    content.semanticOwners.join("\0") !== generationFact.authorizedSemanticOwnerSet.join("\0")
  ) {
    fail("TASK_CHECKPOINT_STALE");
  }
  return content;
}

function assertCheckpointEpochBindings(record, content, authorization, head, domain) {
  if (
    !Array.isArray(record.semanticOwners) ||
    !Array.isArray(content.scope) ||
    !Array.isArray(content.semanticOwners) ||
    record.checkpointContentIdentity !== content.checkpointContentIdentity ||
    record.generationFactIdentity !== content.generationFactIdentity ||
    record.authorizationHeadIdentity !== head.authorizationHeadIdentity ||
    record.authorizationIdentity !== authorization.authorizationIdentity ||
    record.taskIdentity !== domain.taskIdentity ||
    record.taskContractIdentity !== authorization.taskContractIdentity ||
    record.portableWorktreeIdentity !== domain.portableWorktreeIdentity ||
    record.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    record.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity ||
    record.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    record.semanticOwners.join("\0") !== authorization.semanticOwners.join("\0") ||
    content.taskIdentity !== domain.taskIdentity ||
    content.taskContractIdentity !== authorization.taskContractIdentity ||
    content.portableWorktreeIdentity !== domain.portableWorktreeIdentity ||
    content.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    content.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity ||
    content.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    content.scope.join("\0") !== authorization.scope.join("\0") ||
    content.semanticOwners.join("\0") !== authorization.semanticOwners.join("\0")
  ) {
    fail("TASK_CHECKPOINT_STALE");
  }
}

export async function effectiveCheckpoint(verified) {
  const { authorization, head, paths, domain } = verified;
  const selector = await readOptionalJson(
    paths.checkpointHead,
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  if (selector !== null && selector.checkpointRecordIdentity !== null) {
    const selected = await loadCheckpointRecord(paths, selector.checkpointRecordIdentity);
    if (
      selected.authorizationHeadIdentity === head.authorizationHeadIdentity &&
      selected.authorizationIdentity === authorization.authorizationIdentity
    ) {
      const content = await loadCheckpointContent(paths, selected.checkpointContentIdentity);
      assertCheckpointEpochBindings(selected, content, authorization, head, domain);
      return {
        record: selected,
        content,
        selector,
        selectorIdentity: selectorIdentity("CIC-CHECKPOINT-SELECTOR-V1", selector),
        source: "HEAD",
      };
    }
    if (selected.authorizationHeadIdentity === head.authorizationHeadIdentity) {
      fail("TASK_CHECKPOINT_STALE");
    }
  }
  const root = await readJson(
    path.join(paths.checkpointRoots, `${authorization.authorizationIdentity}.json`),
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  const rootBody = { ...root };
  delete rootBody.checkpointRecordIdentity;
  if (
    root.checkpointRecordIdentity !== checkpointRecordIdentity(rootBody) ||
    root.authorizationHeadIdentity !== head.authorizationHeadIdentity ||
    root.authorizationIdentity !== authorization.authorizationIdentity ||
    root.taskIdentity !== domain.taskIdentity ||
    root.taskContractIdentity !== authorization.taskContractIdentity ||
    root.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    root.checkpointContentIdentity !== authorization.authorizedCheckpointRootIdentity ||
    root.generationFactIdentity !== authorization.admissionFactIdentity
  ) {
    fail("TASK_CHECKPOINT_STALE");
  }
  const rootContent = await loadCheckpointContent(paths, root.checkpointContentIdentity);
  if (rootContent.generationFactIdentity !== authorization.admissionFactIdentity) {
    fail("TASK_CHECKPOINT_STALE");
  }
  assertCheckpointEpochBindings(root, rootContent, authorization, head, domain);
  return {
    record: root,
    content: rootContent,
    selector,
    selectorIdentity: selectorIdentity("CIC-CHECKPOINT-SELECTOR-V1", selector),
    source: "AUTHORIZED_ROOT",
  };
}

function scopesOverlap(left, right) {
  return left.some((a) =>
    right.some((b) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)),
  );
}

export async function acquireMutationLease(input) {
  const outer = await verifyAuthorization({ ...input, requiredAction: "GOVERNED_CONTENT_WRITE" });
  const checkpoint = await effectiveCheckpoint(outer);
  const requestedScope = normalizeScope(input.scope);
  if (requestedScope.some((entry) => !outer.authorization.scope.includes(entry))) {
    fail("AUTHORIZATION_SCOPE_MISMATCH");
  }
  const semanticOwners = normalizeSemanticOwners(input.semanticOwners);
  if (semanticOwners.some((entry) => !outer.authorization.semanticOwners.includes(entry))) {
    fail("CONTEXT_EXPANSION_REQUIRED");
  }
  const owner = requirePortableId(input.owner, "lease owner");
  let result;
  await withExclusiveLock(
    outer.paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      await withExclusiveLock(
        outer.paths.leaseLock,
        "MUTATION_LEASE_CAS_CONFLICT",
        async () => {
          const inner = await loadCurrentHead(outer.domain);
          if (
            inner.head.authorizationHeadIdentity !== outer.head.authorizationHeadIdentity ||
            inner.head.state !== "ACTIVE" ||
            inner.head.currentAuthorizationIdentity !== outer.authorization.authorizationIdentity
          ) {
            fail("AUTHORIZATION_STALE");
          }
          const registry = await readOptionalJson(
            outer.paths.leaseRegistry,
            "MUTATION_LEASE_RECOVERY_REQUIRED",
            outer.paths.stateRoot,
          );
          const observedRegistryIdentity = selectorIdentity("CIC-LEASE-REGISTRY-V1", registry);
          if ((input.expectedRegistryIdentity ?? null) !== observedRegistryIdentity) {
            fail("MUTATION_LEASE_CAS_CONFLICT");
          }
          if (registry?.leaseIdentity !== null && registry?.leaseIdentity !== undefined) {
            const selected = verifyLeaseRecordIdentity(
              await readJson(
                path.join(outer.paths.leaseRecords, `${registry.leaseIdentity}.json`),
                "MUTATION_LEASE_RECOVERY_REQUIRED",
                outer.paths.stateRoot,
              ),
              registry.leaseIdentity,
            );
            if (
              selected.authorizationHeadIdentity === inner.head.authorizationHeadIdentity &&
              (scopesOverlap(selected.scope, requestedScope) ||
                selected.semanticOwners.some((entry) => semanticOwners.includes(entry)))
            ) {
              fail("MUTATION_LEASE_CONFLICT");
            }
          }
          const body = {
            schemaVersion: "CIC_MUTATION_LEASE_V1",
            authorizationHeadIdentity: inner.head.authorizationHeadIdentity,
            authorizationIdentity: outer.authorization.authorizationIdentity,
            taskIdentity: outer.domain.taskIdentity,
            taskContractIdentity: outer.authorization.taskContractIdentity,
            portableWorktreeIdentity: outer.domain.portableWorktreeIdentity,
            portableStateDomainIdentity: outer.domain.portableStateDomainIdentity,
            localStateStoreBindingIdentity: outer.domain.localStateStoreBindingIdentity,
            localWorktreeBindingIdentity: outer.domain.localWorktreeBindingIdentity,
            checkpointRecordIdentity: checkpoint.record.checkpointRecordIdentity,
            owner,
            scope: requestedScope,
            semanticOwners,
          };
          const lease = { ...body, leaseIdentity: leaseIdentity(body) };
          await writeImmutableJson(
            path.join(outer.paths.leaseRecords, `${lease.leaseIdentity}.json`),
            lease,
            "MUTATION_LEASE_CAS_CONFLICT",
            outer.paths.stateRoot,
          );
          const newRegistry = {
            schemaVersion: "CIC_MUTATION_LEASE_REGISTRY_V1",
            leaseIdentity: lease.leaseIdentity,
            authorizationHeadIdentity: inner.head.authorizationHeadIdentity,
          };
          await atomicReplaceJson(outer.paths.leaseRegistry, newRegistry, outer.paths.stateRoot);
          result = {
            lease,
            registry: newRegistry,
            registryIdentity: selectorIdentity("CIC-LEASE-REGISTRY-V1", newRegistry),
          };
        },
        outer.paths.stateRoot,
      );
    },
    outer.paths.stateRoot,
  );
  return result;
}

export async function verifyMutationLease(
  verified,
  expectedLeaseIdentity,
  requiredPath,
  requiredSemanticOwners = [],
) {
  requireIdentity(expectedLeaseIdentity, "lease identity");
  const registry = await readJson(
    verified.paths.leaseRegistry,
    "MUTATION_LEASE_STALE",
    verified.paths.stateRoot,
  );
  if (registry.leaseIdentity !== expectedLeaseIdentity) fail("MUTATION_LEASE_STALE");
  const lease = verifyLeaseRecordIdentity(
    await readJson(
      path.join(verified.paths.leaseRecords, `${expectedLeaseIdentity}.json`),
      "MUTATION_LEASE_STALE",
      verified.paths.stateRoot,
    ),
    expectedLeaseIdentity,
  );
  if (
    lease.leaseIdentity !== expectedLeaseIdentity ||
    lease.authorizationHeadIdentity !== verified.head.authorizationHeadIdentity ||
    lease.authorizationIdentity !== verified.authorization.authorizationIdentity ||
    lease.taskContractIdentity !== verified.authorization.taskContractIdentity ||
    lease.localWorktreeBindingIdentity !== verified.domain.localWorktreeBindingIdentity
  ) {
    fail("MUTATION_LEASE_STALE");
  }
  if (requiredPath !== undefined && !lease.scope.includes(requiredPath)) {
    fail("AUTHORIZATION_SCOPE_MISMATCH");
  }
  const semanticOwners =
    requiredSemanticOwners.length === 0 ? [] : normalizeSemanticOwners(requiredSemanticOwners);
  if (semanticOwners.some((entry) => !lease.semanticOwners.includes(entry))) {
    fail("AUTHORIZATION_SCOPE_MISMATCH");
  }
  return lease;
}

export async function releaseMutationLease(input) {
  const outer = await verifyAuthorization({ ...input, requiredAction: "GOVERNED_CONTENT_WRITE" });
  const lease = await verifyMutationLease(outer, input.leaseIdentity);
  await withExclusiveLock(
    outer.paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      await withExclusiveLock(
        outer.paths.leaseLock,
        "MUTATION_LEASE_CAS_CONFLICT",
        async () => {
          const inner = await loadCurrentHead(outer.domain);
          if (inner.head.authorizationHeadIdentity !== lease.authorizationHeadIdentity) {
            fail("MUTATION_LEASE_STALE");
          }
          const registry = await readJson(
            outer.paths.leaseRegistry,
            "MUTATION_LEASE_STALE",
            outer.paths.stateRoot,
          );
          if (registry.leaseIdentity !== lease.leaseIdentity) fail("MUTATION_LEASE_STALE");
          await atomicReplaceJson(
            outer.paths.leaseRegistry,
            {
              schemaVersion: "CIC_MUTATION_LEASE_REGISTRY_V1",
              leaseIdentity: null,
              authorizationHeadIdentity: inner.head.authorizationHeadIdentity,
            },
            outer.paths.stateRoot,
          );
        },
        outer.paths.stateRoot,
      );
    },
    outer.paths.stateRoot,
  );
  return { status: "RELEASED", leaseIdentity: lease.leaseIdentity };
}

export async function acceptSuccessorCheckpoint(input) {
  const outer = await loadAuthorizationEpoch({
    ...input,
    requiredAction: "GOVERNED_CONTENT_WRITE",
  });
  const effective = await effectiveCheckpoint(outer);
  requirePlainObject(input.movement, "checkpoint movement");
  requireIdentity(input.movement.writePreimageIdentity, "write preimage identity");
  requireIdentity(input.movement.postimageIdentity, "postimage identity");
  const changedPaths = normalizeScope(input.movement.changedPaths, "changed paths");
  const semanticOwners = normalizeSemanticOwners(input.movement.semanticOwners);
  if (semanticOwners.some((entry) => !outer.authorization.semanticOwners.includes(entry))) {
    fail("CONTEXT_EXPANSION_REQUIRED");
  }
  const lease = await verifyMutationLease(outer, input.leaseIdentity, undefined, semanticOwners);
  if (input.movement.contextExpansion === true) fail("CONTEXT_EXPANSION_REQUIRED");
  if (
    input.movement.unexplained === true ||
    changedPaths.some((entry) => !outer.authorization.scope.includes(entry))
  ) {
    fail("UNAUTHORIZED_WORKTREE_DRIFT");
  }
  const currentTruth = await observeCurrentTruth(
    truthRequest(
      { ...input, taskContractIdentity: outer.authorization.taskContractIdentity },
      outer.domain,
      outer.authorization.authorityIdentity,
    ),
  );
  const predecessorContent = effective.content;
  const generationFact = defineCurrentTruthFact(
    currentTruth,
    outer.authorization.scope,
    outer.authorization.semanticOwners,
  );
  const contentBody = {
    schemaVersion: "CIC_TASK_CHECKPOINT_CONTENT_V1",
    taskIdentity: outer.domain.taskIdentity,
    taskContractIdentity: outer.authorization.taskContractIdentity,
    portableWorktreeIdentity: outer.domain.portableWorktreeIdentity,
    portableStateDomainIdentity: outer.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: outer.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: outer.domain.localWorktreeBindingIdentity,
    sequence: predecessorContent.sequence + 1,
    predecessorCheckpointContentIdentity: predecessorContent.checkpointContentIdentity,
    currentTruthIdentity: currentTruth.currentTruthIdentity,
    contextGenerationIdentity: currentTruth.context.contextGenerationIdentity,
    taskMaterialFingerprint: currentTruth.context.taskMaterialFingerprint,
    effectivePolicyIdentity: currentTruth.effectivePolicy.effectivePolicyIdentity,
    generationFactIdentity: generationFact.currentTruthFactIdentity,
    generationFact,
    scope: outer.authorization.scope,
    semanticOwners: outer.authorization.semanticOwners,
    movement: {
      writePreimageIdentity: input.movement.writePreimageIdentity,
      postimageIdentity: input.movement.postimageIdentity,
      changedPaths,
      semanticOwners,
    },
  };
  const contentId = checkpointContentIdentity(contentBody);
  const recordBody = {
    schemaVersion: "CIC_TASK_CHECKPOINT_RECORD_V1",
    checkpointContentIdentity: contentId,
    authorizationHeadIdentity: outer.head.authorizationHeadIdentity,
    authorizationIdentity: outer.authorization.authorizationIdentity,
    taskIdentity: outer.domain.taskIdentity,
    taskContractIdentity: outer.authorization.taskContractIdentity,
    portableWorktreeIdentity: outer.domain.portableWorktreeIdentity,
    portableStateDomainIdentity: outer.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: outer.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: outer.domain.localWorktreeBindingIdentity,
    generationFactIdentity: generationFact.currentTruthFactIdentity,
    semanticOwners: outer.authorization.semanticOwners,
  };
  const recordId = checkpointRecordIdentity(recordBody);
  const content = { ...contentBody, checkpointContentIdentity: contentId };
  const record = { ...recordBody, checkpointRecordIdentity: recordId };
  await writeImmutableJson(
    path.join(outer.paths.checkpointContents, `${contentId}.json`),
    content,
    "TASK_CHECKPOINT_STALE",
    outer.paths.stateRoot,
  );
  await writeImmutableJson(
    path.join(outer.paths.checkpointRecords, `${recordId}.json`),
    record,
    "TASK_CHECKPOINT_STALE",
    outer.paths.stateRoot,
  );
  await withExclusiveLock(
    outer.paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      await withExclusiveLock(
        outer.paths.checkpointLock,
        "TASK_CHECKPOINT_STALE",
        async () => {
          const inner = await loadCurrentHead(outer.domain);
          if (inner.head.authorizationHeadIdentity !== outer.head.authorizationHeadIdentity) {
            fail("AUTHORIZATION_STALE");
          }
          const selector = await readOptionalJson(
            outer.paths.checkpointHead,
            "TASK_CHECKPOINT_STALE",
            outer.paths.stateRoot,
          );
          const observedIdentity = selectorIdentity("CIC-CHECKPOINT-SELECTOR-V1", selector);
          if (observedIdentity !== effective.selectorIdentity) fail("TASK_CHECKPOINT_STALE");
          await atomicReplaceJson(
            outer.paths.checkpointHead,
            {
              schemaVersion: "CIC_TASK_CHECKPOINT_SELECTOR_V1",
              checkpointRecordIdentity: recordId,
              authorizationHeadIdentity: inner.head.authorizationHeadIdentity,
            },
            outer.paths.stateRoot,
          );
        },
        outer.paths.stateRoot,
      );
    },
    outer.paths.stateRoot,
  );
  return { content, record, lease, currentTruth };
}

export async function inspectTaskState(domainInput) {
  const domain = await reverifyStateDomain(domainInput);
  const { head, paths } = await loadCurrentHead(domain);
  const checkpointSelector = await readOptionalJson(
    paths.checkpointHead,
    "TASK_CHECKPOINT_STALE",
    paths.stateRoot,
  );
  const leaseRegistry = await readOptionalJson(
    paths.leaseRegistry,
    "MUTATION_LEASE_RECOVERY_REQUIRED",
    paths.stateRoot,
  );
  return { domain, head, checkpointSelector, leaseRegistry };
}
