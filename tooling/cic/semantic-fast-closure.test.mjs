/* global structuredClone */

import { describe, expect, test } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { buildSemanticEvidence } from "./lib/semantic-evidence.mjs";
import { deriveSemanticFastClosure } from "./lib/semantic-fast-closure.mjs";
import {
  buildSemanticProjectionSet,
  verifySemanticProjectionSet,
} from "./lib/semantic-projection-set.mjs";
import {
  authorityClaimIdentity,
  bindSemanticProviderRegistration,
  buildSemanticProviderProjection,
  defineSemanticProviderRegistration,
} from "./lib/semantic-provider.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const hash = (label) => sha256Hex(`I5-B-FAST-TEST\n${label}\n`);
const bindingNames = [
  "authorityIdentity",
  "contextGenerationIdentity",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "sourceGenerationFingerprint",
  "taskContractIdentity",
  "taskIdentity",
  "taskMaterialFingerprint",
];
const bindings = Object.fromEntries(bindingNames.map((name) => [name, hash(name)]));

function provider(ownerNumber = 0, kinds = ["component"], providerBindings = bindings) {
  const ownerIdentity = hash(`owner-${ownerNumber}`);
  const raw = defineSemanticProviderRegistration({
    providerId: `provider-${ownerNumber}`,
    providerVersion: "v1",
    ownerIdentity,
    capabilities: ["semantic-closure"],
    semanticKinds: kinds,
    schemaFloor: 1,
    policyFloor: 1,
  });
  const claimBody = {
    authorizationIdentity: providerBindings.authorityIdentity,
    currentTruthIdentity: hash("current-truth"),
    taskContractIdentity: providerBindings.taskContractIdentity,
    authorizedSemanticOwnerSet: [ownerIdentity],
  };
  return bindSemanticProviderRegistration(raw, {
    schemaVersion: "CIC_I5_AUTHORITY_CLAIM_V1",
    authorityState: "UNPROVEN",
    ...claimBody,
    authorityClaimIdentity: authorityClaimIdentity(claimBody),
  });
}

function projectionRecord(definition, providerRecord) {
  const state = definition.state ?? "PRESENT";
  return {
    semanticKey: definition.key,
    semanticKind: definition.kind ?? "component",
    presenceState: state,
    materialIdentity: state === "UNKNOWN" ? null : hash(`material-${definition.key}`),
    dependencies: definition.dependencies ?? [],
    payload: state === "PRESENT" ? { marker: definition.payload ?? definition.key } : null,
    absenceWitness:
      state === "ABSENT_PROVEN"
        ? {
            result: "ABSENT_PROVEN",
            providerIdentity: providerRecord.providerIdentity,
            indexIdentity: hash(`index-${definition.key}`),
            queryClass: "semantic-key",
            scopeIdentity: hash(`scope-${definition.key}`),
            generationIdentity: hash(`generation-${definition.key}`),
          }
        : null,
  };
}

function rehashEvidence(record, changes) {
  const body = { ...structuredClone(record), ...changes };
  delete body.evidenceIdentity;
  delete body.authorityState;
  return {
    ...body,
    evidenceIdentity: sha256Hex(`CIC-SEMANTIC-EVIDENCE-V1\n${canonicalJson(body)}\n`),
    authorityState: "UNPROVEN",
  };
}

function rehashEdge(edge, changes) {
  const body = { ...structuredClone(edge), ...changes };
  delete body.edgeIdentity;
  return {
    ...body,
    edgeIdentity: sha256Hex(`CIC-SEMANTIC-DEPENDENCY-EDGE-V1\n${canonicalJson(body)}\n`),
  };
}

function rehashProjectionSet(value) {
  const body = { ...structuredClone(value) };
  delete body.projectionSetIdentity;
  return {
    ...body,
    projectionSetIdentity: sha256Hex(`CIC-SEMANTIC-PROJECTION-SET-V1\n${canonicalJson(body)}\n`),
  };
}

function fixtureInput(
  definitions,
  requestedRoots = [definitions[0].key],
  {
    withEvidence = false,
    evidenceMutator = (value) => value,
    supportingEvidenceIdentities = [],
    providerBindings = bindings,
    commonBindings = bindings,
  } = {},
) {
  const groups = new Map();
  for (const definition of definitions) {
    const owner = definition.owner ?? 0;
    const values = groups.get(owner) ?? [];
    values.push(definition);
    groups.set(owner, values);
  }
  const providers = [];
  const projectionSets = [];
  const evidence = [];
  for (const [owner, definitionsForOwner] of groups) {
    const kinds = [...new Set(definitionsForOwner.map(({ kind = "component" }) => kind))];
    const providerRecord = provider(owner, kinds, providerBindings);
    providers.push(providerRecord);
    const projectionSet = buildSemanticProviderProjection({
      provider: providerRecord,
      inputIdentity: hash(`input-${owner}`),
      capability: "semantic-closure",
      records: definitionsForOwner.map((definition) =>
        projectionRecord(definition, providerRecord),
      ),
    });
    projectionSets.push(projectionSet);
    if (withEvidence) {
      for (const projection of projectionSet.records) {
        evidence.push(
          evidenceMutator(
            buildSemanticEvidence({
              projection,
              evidenceKind: "provider-observation",
              bindings: commonBindings,
              supportingEvidenceIdentities,
            }),
          ),
        );
      }
    }
  }
  return {
    requestedRoots,
    bindings: commonBindings,
    providers,
    projectionSets,
    evidence,
  };
}

function fixture(definitions, requestedRoots = [definitions[0].key], options = {}) {
  return buildSemanticProjectionSet(fixtureInput(definitions, requestedRoots, options));
}

function codes(witness) {
  return witness.findings.map(({ code }) => code);
}

describe("CIC-I5-B semantic projection set", () => {
  test("normalizes exact schema, keys, UNPROVEN authority, and content identity", () => {
    const result = fixture([{ key: "root", payload: "private-provider-payload" }], ["root"], {
      withEvidence: true,
    });
    expect(result.schemaVersion).toBe("CIC_SEMANTIC_PROJECTION_SET_V1");
    expect(result.status).toBe("UNPROVEN");
    expect(result.authorityState).toBe("UNPROVEN");
    expect(verifySemanticProjectionSet(result)).toEqual(result);
    expect(JSON.stringify(result)).not.toContain("private-provider-payload");
    expect(Object.keys(result).sort()).toEqual(
      [
        "authorityState",
        "bindings",
        "conflicts",
        "dependencyEdges",
        "evidenceIdentities",
        "limits",
        "presencePartitions",
        "projectionSetIdentity",
        "providers",
        "records",
        "requestedRoots",
        "schemaVersion",
        "status",
      ].sort(),
    );
  });

  test("is deterministic under provider, record, root, and dependency permutations", () => {
    const first = fixture(
      [
        { key: "root", dependencies: ["beta", "alpha"] },
        { key: "alpha", owner: 1 },
        { key: "beta", owner: 2 },
      ],
      ["beta", "root"],
    );
    const second = fixture(
      [
        { key: "beta", owner: 2 },
        { key: "alpha", owner: 1 },
        { key: "root", dependencies: ["alpha", "beta"] },
      ],
      ["root", "beta"],
    );
    expect(second.projectionSetIdentity).toBe(first.projectionSetIdentity);
    expect(second).toEqual(first);
  });

  test("deep-freezes every exported structural value", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.records)).toBe(true);
    expect(Object.isFrozen(result.records[0])).toBe(true);
    expect(() => result.records.push({})).toThrow();
  });

  test("enforces finite requested-root and structural bounds", () => {
    const base = fixture([{ key: "root" }]);
    expect(() =>
      buildSemanticProjectionSet({
        requestedRoots: Array.from(
          { length: base.limits.requestedRoots + 1 },
          (_, index) => `root-${index}`,
        ),
        bindings,
        providers: [],
        projectionSets: [],
        evidence: [],
      }),
    ).toThrow(/SEMANTIC_PROJECTION_SET_INVALID/);
  });

  test("rejects malformed provider, projection, and evidence structures", () => {
    expect(() =>
      buildSemanticProjectionSet({
        requestedRoots: ["root"],
        bindings,
        providers: [{ providerIdentity: hash("fabricated") }],
        projectionSets: [],
        evidence: [],
      }),
    ).toThrow();
    expect(() =>
      buildSemanticProjectionSet({
        requestedRoots: ["root"],
        bindings,
        providers: [],
        projectionSets: [],
        evidence: [{ evidenceIdentity: hash("fabricated-evidence") }],
      }),
    ).toThrow(/SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID/);
    const result = fixture([{ key: "root" }]);
    const malformed = structuredClone(result);
    malformed.records[0].projectionIdentity = hash("tampered");
    expect(() => verifySemanticProjectionSet(malformed)).toThrow(
      /SEMANTIC_PROJECTION_SET_IDENTITY_MISMATCH/,
    );
  });

  test("rejects a self-rehashed projection set that omits an explained edge", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }]);
    const malformed = structuredClone(result);
    malformed.dependencyEdges = [];
    const body = { ...malformed };
    delete body.projectionSetIdentity;
    malformed.projectionSetIdentity = sha256Hex(
      `CIC-SEMANTIC-PROJECTION-SET-V1\n${canonicalJson(body)}\n`,
    );
    expect(() => verifySemanticProjectionSet(malformed)).toThrow(
      /SEMANTIC_PROJECTION_SET_EDGE_SET_MISMATCH/,
    );
  });

  test("keeps PRESENT, ABSENT_PROVEN, and UNKNOWN in separate partitions", () => {
    const result = fixture([
      { key: "present" },
      { key: "absent", state: "ABSENT_PROVEN" },
      { key: "unknown", state: "UNKNOWN" },
    ]);
    expect(result.presencePartitions).toEqual({
      PRESENT: ["present"],
      ABSENT_PROVEN: ["absent"],
      UNKNOWN: ["unknown"],
    });
  });

  test("binds stable explainable edge identity to source, target, projection, and evidence", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
    });
    expect(result.dependencyEdges).toHaveLength(1);
    expect(result.dependencyEdges[0]).toMatchObject({
      sourceSemanticKey: "root",
      targetSemanticKey: "leaf",
    });
    expect(result.dependencyEdges[0].originEvidenceIdentities).toHaveLength(1);
    expect(result.dependencyEdges[0].edgeIdentity).toMatch(/^[0-9A-F]{64}$/u);
  });

  test.each([
    ["provider input", { providerInputIdentity: hash("different-provider-input") }],
    ["dependency set", { dependencyIdentities: [hash("different-dependency")] }],
    ["presence", { presenceState: "UNKNOWN" }],
    ["material", { materialIdentities: [hash("different-material")] }],
    ["authority", { authorityIdentity: hash("different-authority") }],
    ["Source generation", { sourceGenerationFingerprint: hash("different-source") }],
    ["repository", { repositoryIdentity: hash("different-repository") }],
    ["repository snapshot", { repositorySnapshotIdentity: hash("different-snapshot") }],
    ["task", { taskIdentity: hash("different-task") }],
    ["task contract", { taskContractIdentity: hash("different-contract") }],
    ["context generation", { contextGenerationIdentity: hash("different-context") }],
    ["task material", { taskMaterialFingerprint: hash("different-task-material") }],
  ])("rejects self-consistent evidence with mismatched %s scope", (_label, changes) => {
    const input = fixtureInput(
      [{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }],
      ["root"],
      {
        withEvidence: true,
        evidenceMutator: (record) =>
          record.semanticKey === "root" ? rehashEvidence(record, changes) : record,
      },
    );
    expect(() => buildSemanticProjectionSet(input)).toThrow(
      /SEMANTIC_PROJECTION_SET_EVIDENCE_MISMATCH/,
    );
  });

  test.each([
    ["authorization", { ...bindings, authorityIdentity: hash("provider-authority-mismatch") }],
    [
      "task contract",
      { ...bindings, taskContractIdentity: hash("provider-task-contract-mismatch") },
    ],
  ])(
    "rejects a structurally valid provider with mismatched %s binding",
    (_label, providerBindings) => {
      expect(() =>
        buildSemanticProjectionSet(fixtureInput([{ key: "root" }], ["root"], { providerBindings })),
      ).toThrow(/SEMANTIC_PROJECTION_SET_PROVIDER_BINDING_MISMATCH/);
    },
  );

  test("rejects a self-rehashed normalized provider that diverges from common bindings", () => {
    const malformed = structuredClone(fixture([{ key: "root" }]));
    malformed.providers[0].authorizationIdentity = hash("normalized-provider-authority-mismatch");
    expect(() => verifySemanticProjectionSet(rehashProjectionSet(malformed))).toThrow(
      /SEMANTIC_PROJECTION_SET_PROVIDER_BINDING_MISMATCH/,
    );
  });

  test("rejects a self-consistent ABSENT_PROVEN evidence witness from another scope", () => {
    const input = fixtureInput([{ key: "absent", state: "ABSENT_PROVEN" }], ["absent"], {
      withEvidence: true,
      evidenceMutator: (record) =>
        rehashEvidence(record, {
          absenceWitness: {
            ...record.absenceWitness,
            scopeIdentity: hash("different-absence-scope"),
          },
        }),
    });
    expect(() => buildSemanticProjectionSet(input)).toThrow(
      /SEMANTIC_PROJECTION_SET_EVIDENCE_MISMATCH/,
    );
  });

  test("accepts exact evidence bindings while preserving structural UNPROVEN state", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
    });
    expect(result.status).toBe("UNPROVEN");
    expect(result.authorityState).toBe("UNPROVEN");
    expect(verifySemanticProjectionSet(result)).toEqual(result);
  });

  test("enriches edge identity with complete owner, provider, input, and evidence provenance", () => {
    const supportingEvidenceIdentities = [hash("supporting-b"), hash("supporting-a")];
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
      supportingEvidenceIdentities,
    });
    const record = result.records.find(({ semanticKey }) => semanticKey === "root");
    const edge = result.dependencyEdges[0];
    expect(edge).toMatchObject({
      sourceSemanticKey: "root",
      targetSemanticKey: "leaf",
      originOwnerIdentity: record.ownerIdentity,
      originProviderIdentity: record.providerIdentity,
      originProviderBindingIdentity: record.providerBindingIdentity,
      originProviderInputIdentity: record.inputIdentity,
      originProjectionIdentity: record.projectionIdentity,
      originEvidenceIdentities: record.evidenceIdentities,
      originSupportingEvidenceIdentities: [...supportingEvidenceIdentities].sort(),
    });

    const changes = [
      { sourceSemanticKey: "other-source" },
      { targetSemanticKey: "other-target" },
      { originOwnerIdentity: hash("other-owner") },
      { originProviderIdentity: hash("other-provider") },
      { originProviderBindingIdentity: hash("other-provider-binding") },
      { originProviderInputIdentity: hash("other-provider-input") },
      { originProjectionIdentity: hash("other-projection") },
      { originEvidenceIdentities: [hash("other-evidence")] },
      { originSupportingEvidenceIdentities: [hash("other-supporting-evidence")] },
    ];
    for (const change of changes) {
      expect(rehashEdge(edge, change).edgeIdentity).not.toBe(edge.edgeIdentity);
    }
  });

  test("rejects self-rehashed enriched edge provenance that records cannot reconstruct", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
      supportingEvidenceIdentities: [hash("supporting")],
    });
    const malformed = structuredClone(result);
    malformed.dependencyEdges[0] = rehashEdge(malformed.dependencyEdges[0], {
      originProviderBindingIdentity: hash("tampered-provider-binding"),
      originSupportingEvidenceIdentities: [hash("tampered-support")],
    });
    expect(() => verifySemanticProjectionSet(rehashProjectionSet(malformed))).toThrow(
      /SEMANTIC_PROJECTION_SET_EDGE_SET_MISMATCH/,
    );
  });
});

describe("CIC-I5-B FAST closure", () => {
  test("derives one PRESENT root without creating authority", () => {
    const result = deriveSemanticFastClosure(fixture([{ key: "root" }]));
    expect(result.status).toBe("COMPLETE");
    expect(result.authorityState).toBe("UNPROVEN");
    expect(result.closureMembers).toEqual(["root"]);
  });

  test("traverses an omission-sensitive deep dependency chain", () => {
    const records = Array.from({ length: 24 }, (_, index) => ({
      key: `node-${String(index).padStart(2, "0")}`,
      dependencies: index === 23 ? [] : [`node-${String(index + 1).padStart(2, "0")}`],
    }));
    const result = deriveSemanticFastClosure(fixture(records, ["node-00"]));
    expect(result.status).toBe("COMPLETE");
    expect(result.closureMembers).toHaveLength(24);
    expect(result.closureMembers).toContain("node-23");
  });

  test("traverses wide fan-out deterministically", () => {
    const leaves = Array.from({ length: 40 }, (_, index) => `leaf-${index}`);
    const result = deriveSemanticFastClosure(
      fixture([
        { key: "root", dependencies: [...leaves].reverse() },
        ...leaves.map((key) => ({ key })),
      ]),
    );
    expect(result.status).toBe("COMPLETE");
    expect(result.closureMembers).toEqual(["root", ...leaves].sort());
  });

  test("is deterministic under hostile record ordering", () => {
    const definitions = [
      { key: "root", dependencies: ["beta", "alpha"] },
      { key: "alpha" },
      { key: "beta" },
    ];
    expect(deriveSemanticFastClosure(fixture(definitions, ["root"]))).toEqual(
      deriveSemanticFastClosure(fixture([...definitions].reverse(), ["root"])),
    );
  });

  test("records ABSENT_PROVEN separately and never as a member", () => {
    const result = deriveSemanticFastClosure(
      fixture([
        { key: "root", dependencies: ["absent"] },
        { key: "absent", state: "ABSENT_PROVEN" },
      ]),
    );
    expect(result.status).toBe("COMPLETE");
    expect(result.absentProven).toEqual(["absent"]);
    expect(result.closureMembers).not.toContain("absent");
  });

  test("blocks required UNKNOWN without treating it as absent", () => {
    const result = deriveSemanticFastClosure(
      fixture([
        { key: "root", dependencies: ["unknown"] },
        { key: "unknown", state: "UNKNOWN" },
      ]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.unknownKeys).toEqual(["unknown"]);
    expect(result.absentProven).toEqual([]);
  });

  test("blocks a missing or unresolved dependency", () => {
    const result = deriveSemanticFastClosure(fixture([{ key: "root", dependencies: ["missing"] }]));
    expect(result.status).toBe("BLOCKED");
    expect(result.unresolvedKeys).toEqual(["missing"]);
  });

  test("blocks duplicate owner/provider authority for one semantic key", () => {
    const result = deriveSemanticFastClosure(
      fixture([
        { key: "root", owner: 0 },
        { key: "root", owner: 1 },
      ]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(codes(result)).toContain("SEMANTIC_OWNER_PROVIDER_CONFLICT");
  });

  test("converges on a fully PRESENT finite cycle", () => {
    const result = deriveSemanticFastClosure(
      fixture([
        { key: "alpha", dependencies: ["beta"] },
        { key: "beta", dependencies: ["alpha"] },
      ]),
    );
    expect(result.status).toBe("COMPLETE");
    expect(result.closureMembers).toEqual(["alpha", "beta"]);
  });

  test("blocks a cycle containing UNKNOWN", () => {
    const result = deriveSemanticFastClosure(
      fixture([
        { key: "alpha", dependencies: ["beta"] },
        { key: "beta", state: "UNKNOWN", dependencies: ["alpha"] },
      ]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.unknownKeys).toEqual(["beta"]);
  });

  test("consults many owners without merging their authority", () => {
    const records = Array.from({ length: 20 }, (_, index) => ({
      key: `owner-node-${index}`,
      owner: index,
    }));
    records.unshift({ key: "root", dependencies: records.map(({ key }) => key), owner: 99 });
    const result = deriveSemanticFastClosure(fixture(records));
    expect(result.status).toBe("COMPLETE");
    expect(result.consultedOwnerIdentities).toHaveLength(21);
  });

  test("is uncertainty-monotone when PRESENT input becomes UNKNOWN", () => {
    const complete = deriveSemanticFastClosure(
      fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }]),
    );
    const uncertain = deriveSemanticFastClosure(
      fixture([
        { key: "root", dependencies: ["leaf"] },
        { key: "leaf", state: "UNKNOWN" },
      ]),
    );
    expect(complete.status).toBe("COMPLETE");
    expect(uncertain.status).toBe("BLOCKED");
    expect(uncertain.closureMembers).not.toContain("leaf");
  });

  test("blocks when a caller lowers the derived operation bound", () => {
    const result = deriveSemanticFastClosure(
      fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }]),
      { maxOperations: 1 },
    );
    expect(result.status).toBe("BLOCKED");
    expect(codes(result)).toContain("CLOSURE_BOUND_EXCEEDED");
  });

  test("fails closed on malformed common input", () => {
    const result = deriveSemanticFastClosure({ schemaVersion: "fabricated" });
    expect(result.status).toBe("BLOCKED");
    expect(result.projectionSetIdentity).toBeNull();
  });

  test("preserves the complete enriched edge in the FAST traversal witness", () => {
    const projectionSet = fixture(
      [{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }],
      ["root"],
      { withEvidence: true, supportingEvidenceIdentities: [hash("fast-supporting")] },
    );
    const result = deriveSemanticFastClosure(projectionSet);
    expect(result.status).toBe("COMPLETE");
    expect(result.followedDependencyEdges).toEqual(projectionSet.dependencyEdges);
  });
});
