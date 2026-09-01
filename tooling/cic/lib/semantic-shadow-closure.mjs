import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import { verifySemanticProjectionSet } from "./semantic-projection-set.mjs";

const SCHEMA = "CIC_SEMANTIC_SHADOW_CLOSURE_WITNESS_V1";

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
    witnessIdentity: sha256Hex(`CIC-SEMANTIC-SHADOW-CLOSURE-WITNESS-V1\n${canonicalJson(body)}\n`),
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
    fixedPointTrace: [],
    findings: [finding(error?.code ?? "SEMANTIC_PROJECTION_SET_INVALID")],
  });
}

export function deriveSemanticShadowClosure(projectionSet, options = {}) {
  let normalized;
  try {
    normalized = verifySemanticProjectionSet(projectionSet);
  } catch (error) {
    return invalidWitness(error);
  }

  const recordTable = normalized.records.map((record) => ({ ...record }));
  const relationTable = normalized.dependencyEdges
    .map((edge) => ({ ...edge }))
    .sort((left, right) => compare(left.edgeIdentity, right.edgeIdentity));
  const recordsFor = (semanticKey) =>
    recordTable.filter((record) => record.semanticKey === semanticKey);
  const membership = new Set();
  const absent = new Set();
  const unknown = new Set();
  const unresolved = new Set();
  const owners = new Set();
  const providers = new Set();
  const followed = new Map();
  const findings = normalized.conflicts.map(({ semanticKey }) =>
    finding("SEMANTIC_OWNER_PROVIDER_CONFLICT", semanticKey),
  );

  const consult = (semanticKey) => {
    const candidates = recordsFor(semanticKey);
    if (candidates.length === 0) {
      unresolved.add(semanticKey);
      findings.push(finding("SEMANTIC_DEPENDENCY_UNRESOLVED", semanticKey));
      return false;
    }
    if (candidates.length !== 1) {
      findings.push(finding("SEMANTIC_OWNER_PROVIDER_CONFLICT", semanticKey));
      return false;
    }
    const record = candidates[0];
    owners.add(record.ownerIdentity);
    providers.add(record.providerIdentity);
    if (record.presenceState === "UNKNOWN") {
      unknown.add(semanticKey);
      findings.push(finding("SEMANTIC_PRESENCE_UNKNOWN", semanticKey));
      return false;
    }
    if (record.presenceState === "ABSENT_PROVEN") {
      absent.add(semanticKey);
      return false;
    }
    membership.add(semanticKey);
    return true;
  };

  for (const root of normalized.requestedRoots) consult(root);
  const maximumPasses = normalized.records.length;
  const suppliedLimit = Number.isSafeInteger(options.maxGrowthPasses)
    ? options.maxGrowthPasses
    : maximumPasses;
  const growthLimit = Math.max(0, Math.min(maximumPasses, suppliedLimit));
  const fixedPointTrace = [];

  for (let pass = 1; pass <= growthLimit; pass += 1) {
    const additions = new Set();
    for (const edge of relationTable) {
      if (!membership.has(edge.sourceSemanticKey)) continue;
      followed.set(edge.edgeIdentity, edge);
      const candidates = recordsFor(edge.targetSemanticKey);
      if (candidates.length === 1 && candidates[0].presenceState === "PRESENT") {
        if (!membership.has(edge.targetSemanticKey)) additions.add(edge.targetSemanticKey);
      } else {
        consult(edge.targetSemanticKey);
      }
    }
    fixedPointTrace.push({ pass, additions: [...additions].sort(compare) });
    for (const semanticKey of additions) consult(semanticKey);
    if (additions.size === 0) break;
  }

  const wouldAdd = new Set();
  for (const edge of relationTable) {
    if (!membership.has(edge.sourceSemanticKey)) continue;
    followed.set(edge.edgeIdentity, edge);
    const candidates = recordsFor(edge.targetSemanticKey);
    if (
      candidates.length === 1 &&
      candidates[0].presenceState === "PRESENT" &&
      !membership.has(edge.targetSemanticKey)
    ) {
      wouldAdd.add(edge.targetSemanticKey);
    } else if (candidates.length !== 1 || candidates[0].presenceState !== "PRESENT") {
      consult(edge.targetSemanticKey);
    }
  }
  fixedPointTrace.push({
    pass: "FINAL_NO_CHANGE_VERIFICATION",
    additions: [...wouldAdd].sort(compare),
  });
  if (wouldAdd.size !== 0) findings.push(finding("CLOSURE_NON_CONVERGENT"));

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
    closureMembers: [...membership].sort(compare),
    absentProven: [...absent].sort(compare),
    unknownKeys: [...unknown].sort(compare),
    unresolvedKeys: [...unresolved].sort(compare),
    ownerProviderConflicts: [
      ...new Set(normalized.conflicts.map(({ semanticKey }) => semanticKey)),
    ].sort(compare),
    consultedOwnerIdentities: [...owners].sort(compare),
    consultedProviderIdentities: [...providers].sort(compare),
    followedDependencyEdges: [...followed.values()].sort((left, right) =>
      compare(left.edgeIdentity, right.edgeIdentity),
    ),
    fixedPointTrace,
    findings: normalizedFindings,
  };
  return finish(body);
}
