/* global URL, structuredClone */

import { readFile } from "node:fs/promises";

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
import { deriveSemanticShadowClosure } from "./lib/semantic-shadow-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const hash = (label) => sha256Hex(`I5-B-SHADOW-TEST\n${label}\n`);
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

describe("CIC-I5-B projection set from SHADOW owner", () => {
  test("directly verifies exact common schema and structural UNPROVEN state", () => {
    const result = fixture([{ key: "root" }]);
    expect(verifySemanticProjectionSet(result)).toEqual(result);
    expect(result.schemaVersion).toBe("CIC_SEMANTIC_PROJECTION_SET_V1");
    expect(result.authorityState).toBe("UNPROVEN");
    expect(result.status).toBe("UNPROVEN");
  });

  test("directly proves deterministic common identity under permutations", () => {
    const first = fixture(
      [
        { key: "root", dependencies: ["zeta", "alpha"] },
        { key: "alpha", owner: 1 },
        { key: "zeta", owner: 2 },
      ],
      ["zeta", "root"],
    );
    const second = fixture(
      [
        { key: "zeta", owner: 2 },
        { key: "alpha", owner: 1 },
        { key: "root", dependencies: ["alpha", "zeta"] },
      ],
      ["root", "zeta"],
    );
    expect(second.projectionSetIdentity).toBe(first.projectionSetIdentity);
  });

  test("directly proves freeze, finite bounds, and no provider payload exposure", () => {
    const result = fixture([{ key: "root", payload: "opaque-provider-value" }], ["root"], {
      withEvidence: true,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.dependencyEdges)).toBe(true);
    expect(JSON.stringify(result)).not.toContain("opaque-provider-value");
    expect(result.records.length).toBeLessThanOrEqual(result.limits.records);
  });

  test("directly rejects malformed self-hashed-looking common input", () => {
    const result = fixture([{ key: "root" }]);
    const malformed = structuredClone(result);
    malformed.authorityState = "CURRENT";
    expect(() => verifySemanticProjectionSet(malformed)).toThrow(/SEMANTIC_PROJECTION_SET_INVALID/);
  });

  test("directly distinguishes UNKNOWN from provider-bound ABSENT_PROVEN", () => {
    const result = fixture([
      { key: "root" },
      { key: "unknown", state: "UNKNOWN" },
      { key: "absent", state: "ABSENT_PROVEN" },
    ]);
    expect(result.presencePartitions.UNKNOWN).toEqual(["unknown"]);
    expect(result.presencePartitions.ABSENT_PROVEN).toEqual(["absent"]);
  });

  test("directly preserves deterministic edge origin and evidence identities", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
    });
    expect(result.dependencyEdges[0]).toMatchObject({
      sourceSemanticKey: "root",
      targetSemanticKey: "leaf",
      originEvidenceIdentities: [
        result.records.find(({ semanticKey }) => semanticKey === "root").evidenceIdentities[0],
      ],
    });
  });

  test.each([
    ["provider input", { providerInputIdentity: hash("shadow-provider-input-mismatch") }],
    ["dependency evidence", { dependencyIdentities: [hash("shadow-dependency-mismatch")] }],
    ["presence", { presenceState: "UNKNOWN" }],
    ["material", { materialIdentities: [hash("shadow-material-mismatch")] }],
    ["Source generation", { sourceGenerationFingerprint: hash("shadow-source-mismatch") }],
    [
      "repository snapshot",
      { repositorySnapshotIdentity: hash("shadow-repository-snapshot-mismatch") },
    ],
    ["task context", { contextGenerationIdentity: hash("shadow-context-mismatch") }],
    ["task material", { taskMaterialFingerprint: hash("shadow-task-material-mismatch") }],
  ])(
    "directly rejects structurally self-consistent evidence with mismatched %s",
    (_label, changes) => {
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
    },
  );

  test("directly rejects replayed ABSENT_PROVEN evidence with a changed witness", () => {
    const input = fixtureInput([{ key: "absent", state: "ABSENT_PROVEN" }], ["absent"], {
      withEvidence: true,
      evidenceMutator: (record) =>
        rehashEvidence(record, {
          absenceWitness: {
            ...record.absenceWitness,
            generationIdentity: hash("shadow-absence-generation-mismatch"),
          },
        }),
    });
    expect(() => buildSemanticProjectionSet(input)).toThrow(
      /SEMANTIC_PROJECTION_SET_EVIDENCE_MISMATCH/,
    );
  });

  test("directly rejects provider authority and task-contract divergence from common bindings", () => {
    for (const providerBindings of [
      { ...bindings, authorityIdentity: hash("shadow-provider-authority-mismatch") },
      { ...bindings, taskContractIdentity: hash("shadow-provider-contract-mismatch") },
    ]) {
      expect(() =>
        buildSemanticProjectionSet(fixtureInput([{ key: "root" }], ["root"], { providerBindings })),
      ).toThrow(/SEMANTIC_PROJECTION_SET_PROVIDER_BINDING_MISMATCH/);
    }
  });

  test("directly accepts exact structural evidence without creating currentness or authority", () => {
    const result = fixture([{ key: "root" }], ["root"], { withEvidence: true });
    expect(verifySemanticProjectionSet(result)).toEqual(result);
    expect(result.status).toBe("UNPROVEN");
    expect(result.authorityState).toBe("UNPROVEN");
    expect(JSON.stringify(result)).not.toContain("observation");
  });

  test("directly binds complete enriched edge provenance and its identity", () => {
    const supportingEvidenceIdentities = [hash("shadow-support-b"), hash("shadow-support-a")];
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
      supportingEvidenceIdentities,
    });
    const record = result.records.find(({ semanticKey }) => semanticKey === "root");
    const edge = result.dependencyEdges[0];
    expect(edge).toMatchObject({
      originOwnerIdentity: record.ownerIdentity,
      originProviderIdentity: record.providerIdentity,
      originProviderBindingIdentity: record.providerBindingIdentity,
      originProviderInputIdentity: record.inputIdentity,
      originProjectionIdentity: record.projectionIdentity,
      originEvidenceIdentities: record.evidenceIdentities,
      originSupportingEvidenceIdentities: [...supportingEvidenceIdentities].sort(),
    });
    expect(
      rehashEdge(edge, { originOwnerIdentity: hash("shadow-other-owner") }).edgeIdentity,
    ).not.toBe(edge.edgeIdentity);
    expect(
      rehashEdge(edge, { originEvidenceIdentities: [hash("shadow-other-evidence")] }).edgeIdentity,
    ).not.toBe(edge.edgeIdentity);
  });

  test("directly rejects self-rehashed edge owner and direct-evidence provenance tampering", () => {
    const result = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }], ["root"], {
      withEvidence: true,
    });
    const malformed = structuredClone(result);
    malformed.dependencyEdges[0] = rehashEdge(malformed.dependencyEdges[0], {
      originOwnerIdentity: hash("shadow-tampered-owner"),
      originEvidenceIdentities: [hash("shadow-tampered-direct-evidence")],
    });
    expect(() => verifySemanticProjectionSet(rehashProjectionSet(malformed))).toThrow(
      /SEMANTIC_PROJECTION_SET_EDGE_SET_MISMATCH/,
    );
  });
});

describe("CIC-I5-B SHADOW closure", () => {
  test("derives one PRESENT root using an independent UNPROVEN witness", () => {
    const result = deriveSemanticShadowClosure(fixture([{ key: "root" }]));
    expect(result.status).toBe("COMPLETE");
    expect(result.authorityState).toBe("UNPROVEN");
    expect(result.closureMembers).toEqual(["root"]);
  });

  test("uses monotone multi-pass scans for an omission-sensitive deep chain", () => {
    const records = Array.from({ length: 18 }, (_, index) => ({
      key: `node-${String(index).padStart(2, "0")}`,
      dependencies: index === 17 ? [] : [`node-${String(index + 1).padStart(2, "0")}`],
    }));
    const result = deriveSemanticShadowClosure(fixture(records, ["node-00"]));
    expect(result.status).toBe("COMPLETE");
    expect(result.closureMembers).toHaveLength(18);
    expect(result.closureMembers).toContain("node-17");
    expect(result.fixedPointTrace.length).toBeGreaterThan(2);
  });

  test("derives wide fan-out in reverse hostile relation order", () => {
    const leaves = Array.from(
      { length: 40 },
      (_, index) => `leaf-${String(index).padStart(2, "0")}`,
    );
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "root", dependencies: [...leaves].reverse() },
        ...leaves.map((key) => ({ key })),
      ]),
    );
    expect(result.status).toBe("COMPLETE");
    expect(result.closureMembers).toEqual(["root", ...leaves].sort());
  });

  test("is deterministic under hostile record permutations", () => {
    const definitions = [
      { key: "root", dependencies: ["beta", "alpha"] },
      { key: "alpha" },
      { key: "beta" },
    ];
    expect(deriveSemanticShadowClosure(fixture(definitions, ["root"]))).toEqual(
      deriveSemanticShadowClosure(fixture([...definitions].reverse(), ["root"])),
    );
  });

  test("records ABSENT_PROVEN separately and never as membership", () => {
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "root", dependencies: ["absent"] },
        { key: "absent", state: "ABSENT_PROVEN" },
      ]),
    );
    expect(result.status).toBe("COMPLETE");
    expect(result.absentProven).toEqual(["absent"]);
    expect(result.closureMembers).not.toContain("absent");
  });

  test("blocks a required UNKNOWN and preserves it outside ABSENT_PROVEN", () => {
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "root", dependencies: ["unknown"] },
        { key: "unknown", state: "UNKNOWN" },
      ]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.unknownKeys).toEqual(["unknown"]);
    expect(result.absentProven).toEqual([]);
  });

  test("blocks an unresolved target", () => {
    const result = deriveSemanticShadowClosure(
      fixture([{ key: "root", dependencies: ["missing"] }]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.unresolvedKeys).toEqual(["missing"]);
  });

  test("blocks owner/provider conflict", () => {
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "root", owner: 0 },
        { key: "root", owner: 1 },
      ]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(codes(result)).toContain("SEMANTIC_OWNER_PROVIDER_CONFLICT");
  });

  test("converges on an authoritative-structure finite PRESENT cycle", () => {
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "alpha", dependencies: ["beta"] },
        { key: "beta", dependencies: ["alpha"] },
      ]),
    );
    expect(result.status).toBe("COMPLETE");
    expect(result.closureMembers).toEqual(["alpha", "beta"]);
  });

  test("blocks a cycle containing UNKNOWN", () => {
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "alpha", dependencies: ["beta"] },
        { key: "beta", state: "UNKNOWN", dependencies: ["alpha"] },
      ]),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.unknownKeys).toEqual(["beta"]);
  });

  test("consults a many-owner projection without collapsing ownership", () => {
    const records = Array.from({ length: 20 }, (_, index) => ({
      key: `owner-node-${index}`,
      owner: index,
    }));
    records.unshift({ key: "root", dependencies: records.map(({ key }) => key), owner: 99 });
    const result = deriveSemanticShadowClosure(fixture(records));
    expect(result.status).toBe("COMPLETE");
    expect(result.consultedOwnerIdentities).toHaveLength(21);
  });

  test("is uncertainty-monotone when a dependency changes from PRESENT to UNKNOWN", () => {
    const complete = deriveSemanticShadowClosure(
      fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }]),
    );
    const uncertain = deriveSemanticShadowClosure(
      fixture([
        { key: "root", dependencies: ["leaf"] },
        { key: "leaf", state: "UNKNOWN" },
      ]),
    );
    expect(complete.status).toBe("COMPLETE");
    expect(uncertain.status).toBe("BLOCKED");
    expect(uncertain.closureMembers).not.toContain("leaf");
  });

  test("uses at most N growth passes plus a final complete no-change scan", () => {
    const projectionSet = fixture([
      { key: "root", dependencies: ["middle"] },
      { key: "middle", dependencies: ["leaf"] },
      { key: "leaf" },
    ]);
    const result = deriveSemanticShadowClosure(projectionSet);
    expect(result.status).toBe("COMPLETE");
    expect(result.fixedPointTrace.at(-1)).toEqual({
      pass: "FINAL_NO_CHANGE_VERIFICATION",
      additions: [],
    });
    expect(result.fixedPointTrace.length).toBeLessThanOrEqual(projectionSet.records.length + 1);
  });

  test("blocks non-convergence when a lowered bound leaves growth for final scan", () => {
    const result = deriveSemanticShadowClosure(
      fixture([
        { key: "root", dependencies: ["middle"] },
        { key: "middle", dependencies: ["leaf"] },
        { key: "leaf" },
      ]),
      { maxGrowthPasses: 0 },
    );
    expect(result.status).toBe("BLOCKED");
    expect(codes(result)).toContain("CLOSURE_NON_CONVERGENT");
  });

  test("fails closed on malformed structural input", () => {
    const result = deriveSemanticShadowClosure({ schemaVersion: "fabricated" });
    expect(result.status).toBe("BLOCKED");
    expect(result.projectionSetIdentity).toBeNull();
  });

  test("preserves the complete enriched edge in the SHADOW traversal witness", () => {
    const projectionSet = fixture(
      [{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }],
      ["root"],
      { withEvidence: true, supportingEvidenceIdentities: [hash("shadow-supporting")] },
    );
    const result = deriveSemanticShadowClosure(projectionSet);
    expect(result.status).toBe("COMPLETE");
    expect(result.followedDependencyEdges).toEqual(projectionSet.dependencyEdges);
  });
});

describe("CIC-I5-B FAST and SHADOW independence", () => {
  test("has no cross-import, mode switch, or additional shared decision helper", async () => {
    const fastSource = await readFile(
      new URL("./lib/semantic-fast-closure.mjs", import.meta.url),
      "utf8",
    );
    const shadowSource = await readFile(
      new URL("./lib/semantic-shadow-closure.mjs", import.meta.url),
      "utf8",
    );
    expect(fastSource).not.toContain("semantic-shadow-closure");
    expect(shadowSource).not.toContain("semantic-fast-closure");
    expect(fastSource).not.toMatch(/mode\s*[:=]/u);
    expect(shadowSource).not.toMatch(/mode\s*[:=]/u);
    expect(fastSource).toContain('from "./semantic-projection-set.mjs"');
    expect(shadowSource).toContain('from "./semantic-projection-set.mjs"');
  });

  test("uses independent witness schemas and identities without creating agreement authority", () => {
    const projectionSet = fixture([{ key: "root", dependencies: ["leaf"] }, { key: "leaf" }]);
    const fast = deriveSemanticFastClosure(projectionSet);
    const shadow = deriveSemanticShadowClosure(projectionSet);
    expect(fast.schemaVersion).toBe("CIC_SEMANTIC_FAST_CLOSURE_WITNESS_V1");
    expect(shadow.schemaVersion).toBe("CIC_SEMANTIC_SHADOW_CLOSURE_WITNESS_V1");
    expect(fast.witnessIdentity).not.toBe(shadow.witnessIdentity);
    expect(fast.authorityState).toBe("UNPROVEN");
    expect(shadow.authorityState).toBe("UNPROVEN");
  });
});
