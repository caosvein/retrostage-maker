import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import { verifySemanticProjectionSet } from "./semantic-projection-set.mjs";

const SCHEMA = "CIC_SEMANTIC_FAST_CLOSURE_WITNESS_V1";

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function finding(code, semanticKey = null) {
  return { code, semanticKey };
}

function finish(body) {
  return deepFreeze({
    ...body,
    witnessIdentity: sha256Hex(`CIC-SEMANTIC-FAST-CLOSURE-WITNESS-V1\n${canonicalJson(body)}\n`),
  });
}

function invalidWitness(error) {
  return finish({
    schemaVersion: SCHEMA,
    status: "BLOCKED",
    authorityState: "UNPROVEN",
    projectionSetIdentity: null,
    requestedRoots: [],
    closureMembers: [],
    absentProven: [],
    unknownKeys: [],
    unresolvedKeys: [],
    ownerProviderConflicts: [],
    consultedOwnerIdentities: [],
    consultedProviderIdentities: [],
    followedDependencyEdges: [],
    traversalTrace: [],
    findings: [finding(error?.code ?? "SEMANTIC_PROJECTION_SET_INVALID")],
  });
}

export function deriveSemanticFastClosure(projectionSet, options = {}) {
  let normalized;
  try {
    normalized = verifySemanticProjectionSet(projectionSet);
  } catch (error) {
    return invalidWitness(error);
  }

  const recordsByKey = new Map();
  for (const record of normalized.records) {
    const records = recordsByKey.get(record.semanticKey) ?? [];
    records.push(record);
    recordsByKey.set(record.semanticKey, records);
  }
  const edgesBySource = new Map();
  for (const edge of normalized.dependencyEdges) {
    const edges = edgesBySource.get(edge.sourceSemanticKey) ?? [];
    edges.push(edge);
    edgesBySource.set(edge.sourceSemanticKey, edges);
  }
  for (const edges of edgesBySource.values()) {
    edges.sort((left, right) => compare(left.edgeIdentity, right.edgeIdentity));
  }

  const queue = [...normalized.requestedRoots].sort(compare);
  const queued = new Set(queue);
  const visited = new Set();
  const members = new Set();
  const absent = new Set();
  const unknown = new Set();
  const unresolved = new Set();
  const owners = new Set();
  const providers = new Set();
  const followedEdges = [];
  const trace = [];
  const findings = normalized.conflicts.map(({ semanticKey }) =>
    finding("SEMANTIC_OWNER_PROVIDER_CONFLICT", semanticKey),
  );
  const hardOperationLimit =
    normalized.records.length +
    normalized.dependencyEdges.length +
    normalized.requestedRoots.length +
    1;
  const requestedLimit = Number.isSafeInteger(options.maxOperations)
    ? options.maxOperations
    : hardOperationLimit;
  const operationLimit = Math.max(0, Math.min(hardOperationLimit, requestedLimit));
  let operations = 0;

  while (queue.length !== 0) {
    if (operations >= operationLimit) {
      findings.push(finding("CLOSURE_BOUND_EXCEEDED"));
      break;
    }
    const semanticKey = queue.shift();
    queued.delete(semanticKey);
    operations += 1;
    if (visited.has(semanticKey)) continue;
    visited.add(semanticKey);
    const candidates = recordsByKey.get(semanticKey) ?? [];
    trace.push({ sequence: trace.length, semanticKey, candidateCount: candidates.length });
    if (candidates.length === 0) {
      unresolved.add(semanticKey);
      findings.push(finding("SEMANTIC_DEPENDENCY_UNRESOLVED", semanticKey));
      continue;
    }
    if (candidates.length !== 1) {
      findings.push(finding("SEMANTIC_OWNER_PROVIDER_CONFLICT", semanticKey));
      continue;
    }
    const record = candidates[0];
    owners.add(record.ownerIdentity);
    providers.add(record.providerIdentity);
    if (record.presenceState === "UNKNOWN") {
      unknown.add(semanticKey);
      findings.push(finding("SEMANTIC_PRESENCE_UNKNOWN", semanticKey));
      continue;
    }
    if (record.presenceState === "ABSENT_PROVEN") {
      absent.add(semanticKey);
      continue;
    }
    members.add(semanticKey);
    for (const edge of edgesBySource.get(semanticKey) ?? []) {
      operations += 1;
      if (operations > operationLimit) {
        findings.push(finding("CLOSURE_BOUND_EXCEEDED"));
        break;
      }
      followedEdges.push(edge);
      if (!visited.has(edge.targetSemanticKey) && !queued.has(edge.targetSemanticKey)) {
        queue.push(edge.targetSemanticKey);
        queue.sort(compare);
        queued.add(edge.targetSemanticKey);
      }
    }
    if (findings.some(({ code }) => code === "CLOSURE_BOUND_EXCEEDED")) break;
  }

  const normalizedFindings = [
    ...new Map(
      findings
        .sort((left, right) =>
          compare(
            `${left.code}\0${left.semanticKey ?? ""}`,
            `${right.code}\0${right.semanticKey ?? ""}`,
          ),
        )
        .map((item) => [`${item.code}\0${item.semanticKey ?? ""}`, item]),
    ).values(),
  ];
  const body = {
    schemaVersion: SCHEMA,
    status: normalizedFindings.length === 0 ? "COMPLETE" : "BLOCKED",
    authorityState: "UNPROVEN",
    projectionSetIdentity: normalized.projectionSetIdentity,
    requestedRoots: [...normalized.requestedRoots],
    closureMembers: [...members].sort(compare),
    absentProven: [...absent].sort(compare),
    unknownKeys: [...unknown].sort(compare),
    unresolvedKeys: [...unresolved].sort(compare),
    ownerProviderConflicts: [
      ...new Set(normalized.conflicts.map(({ semanticKey }) => semanticKey)),
    ].sort(compare),
    consultedOwnerIdentities: [...owners].sort(compare),
    consultedProviderIdentities: [...providers].sort(compare),
    followedDependencyEdges: [
      ...new Map(followedEdges.map((edge) => [edge.edgeIdentity, edge])).values(),
    ].sort((left, right) => compare(left.edgeIdentity, right.edgeIdentity)),
    traversalTrace: trace,
    findings: normalizedFindings,
  };
  return finish(body);
}
