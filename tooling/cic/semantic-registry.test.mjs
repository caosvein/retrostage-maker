import { describe, expect, it } from "vitest";

import { buildSemanticEvidence } from "./lib/semantic-evidence.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  authorityClaimIdentity,
  bindSemanticProviderRegistration,
  buildSemanticProviderProjection,
  defineSemanticProviderRegistration,
} from "./lib/semantic-provider.mjs";
import {
  bindSemanticOwnerRegistration,
  buildSemanticRegistry,
  defineSemanticOwnerRegistration,
} from "./lib/semantic-registry.mjs";

const hash = (value) => sha256Hex(`semantic-registry-test:${value}`);

function rawOwner(ownerId = "owner-a", semanticKinds = ["project-item"], floors = {}) {
  return defineSemanticOwnerRegistration({
    ownerId,
    semanticKinds,
    schemaFloor: floors.schemaFloor ?? 1,
    policyFloor: floors.policyFloor ?? 1,
  });
}

function authority(ownerIdentities) {
  const body = {
    schemaVersion: "CIC_I5_AUTHORITY_CLAIM_V1",
    authorityState: "UNPROVEN",
    authorizationIdentity: hash("authorization"),
    currentTruthIdentity: hash("current-truth"),
    taskContractIdentity: hash("task-contract"),
    authorizedSemanticOwnerSet: ownerIdentities,
  };
  return { ...body, authorityClaimIdentity: authorityClaimIdentity(body) };
}

function foundation({ secondOwner = false, floors = {} } = {}) {
  const rawA = rawOwner("owner-a", ["project-item"], floors);
  const rawB = secondOwner ? rawOwner("owner-b", ["project-item"], floors) : null;
  const authorityClaim = authority([rawA.ownerIdentity, rawB?.ownerIdentity].filter(Boolean));
  const ownerA = bindSemanticOwnerRegistration(rawA, authorityClaim);
  const owners = [ownerA];
  if (rawB !== null) owners.push(bindSemanticOwnerRegistration(rawB, authorityClaim));
  const provider = bindSemanticProviderRegistration(
    defineSemanticProviderRegistration({
      providerId: "provider-a",
      providerVersion: "1.0.0",
      ownerIdentity: ownerA.ownerIdentity,
      capabilities: ["semantic-project"],
      semanticKinds: ["project-item"],
      schemaFloor: floors.schemaFloor ?? 1,
      policyFloor: floors.policyFloor ?? 1,
    }),
    authorityClaim,
  );
  return { authorityClaim, ownerA, owners, provider };
}

function bindings() {
  return {
    authorityIdentity: hash("authorization"),
    sourceGenerationFingerprint: hash("source"),
    repositoryIdentity: hash("repository"),
    repositorySnapshotIdentity: hash("snapshot"),
    taskIdentity: hash("task"),
    taskContractIdentity: hash("task-contract"),
    contextGenerationIdentity: hash("context"),
    taskMaterialFingerprint: hash("task-material"),
  };
}

function currentFacts(overrides = {}) {
  return {
    schemaVersion: "CIC_I5_SEMANTIC_CURRENT_FACTS_V1",
    ...bindings(),
    providerInputIdentity: hash("provider-input"),
    currentMaterialIdentities: [hash("material")],
    absenceWitnessExpectation: null,
    repositoryView: { complete: true, shallow: false },
    ...overrides,
  };
}

function evidenceItem(provider, overrides = {}) {
  const record = buildSemanticProviderProjection({
    provider,
    inputIdentity: hash("provider-input"),
    capability: "semantic-project",
    records: [
      {
        semanticKey: "project:item-a",
        semanticKind: "project-item",
        presenceState: "PRESENT",
        materialIdentity: hash("material"),
        dependencies: [],
        payload: { label: "portable" },
        absenceWitness: null,
        ...overrides,
      },
    ],
  }).records[0];
  return {
    record: buildSemanticEvidence({
      evidenceKind: "semantic-provider-observation",
      projection: record,
      bindings: bindings(),
    }),
    currentFacts: currentFacts(),
  };
}

function registry(input = {}) {
  const fixture = foundation();
  return buildSemanticRegistry({
    authorityClaim: fixture.authorityClaim,
    owners: fixture.owners,
    providers: [fixture.provider],
    evidence: [evidenceItem(fixture.provider)],
    ...input,
  });
}

describe("CIC I5-A semantic registry", () => {
  it("keeps raw semantic owner registration structurally unadmitted", () => {
    expect(rawOwner()).toMatchObject({ registrationState: "RAW_UNADMITTED" });
    expect(rawOwner()).not.toHaveProperty("ownerBindingIdentity");
  });

  it("blocks owner binding outside the claimed semantic-owner set", () => {
    const raw = rawOwner();
    expect(() =>
      bindSemanticOwnerRegistration(raw, authority([hash("caller-owner")])),
    ).toThrowError(/SEMANTIC_OWNER_UNAUTHORIZED/u);
  });

  it("builds a deterministic registry that remains authority-unproven", () => {
    const result = registry();
    expect(result).toMatchObject({
      schemaVersion: "CIC_SEMANTIC_REGISTRY_V1",
      status: "UNPROVEN_BLOCKED",
    });
    expect(result.entries).toEqual([]);
    expect(result.assessments).toHaveLength(1);
    expect(result.findings.map(({ code }) => code)).toContain(
      "PHYSICAL_AUTHORITY_INTEGRATION_REQUIRED",
    );
  });

  it("blocks duplicate semantic ownership without last-writer-wins", () => {
    const fixture = foundation({ secondOwner: true });
    const result = buildSemanticRegistry({
      authorityClaim: fixture.authorityClaim,
      owners: fixture.owners,
      providers: [fixture.provider],
      evidence: [evidenceItem(fixture.provider)],
    });
    expect(result.status).toBe("UNPROVEN_BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("SEMANTIC_OWNER_CONFLICT");
  });

  it("blocks an unknown provider owner", () => {
    const fixture = foundation();
    const result = buildSemanticRegistry({
      authorityClaim: fixture.authorityClaim,
      owners: [],
      providers: [fixture.provider],
      evidence: [],
    });
    expect(result.status).toBe("UNPROVEN_BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("SEMANTIC_PROVIDER_OWNER_UNKNOWN");
  });

  it("rejects filename-implied ownership metadata", () => {
    expect(() =>
      defineSemanticOwnerRegistration({
        ownerId: "owner-a",
        semanticKinds: ["project-item"],
        schemaFloor: 1,
        policyFloor: 1,
        filename: "project-owner.json",
      }),
    ).toThrowError(/SEMANTIC_OWNER_REGISTRATION_INVALID/u);
  });

  it("blocks unversioned and lower-floor records", () => {
    const fixture = foundation({ floors: { schemaFloor: 1, policyFloor: 1 } });
    const lower = buildSemanticRegistry({
      authorityClaim: fixture.authorityClaim,
      owners: fixture.owners,
      providers: [fixture.provider],
      evidence: [],
      requiredSchemaFloor: 2,
      requiredPolicyFloor: 2,
    });
    expect(lower.status).toBe("UNPROVEN_BLOCKED");
    expect(lower.findings.map(({ code }) => code)).toContain("SEMANTIC_REGISTRY_FLOOR_VIOLATION");
    expect(() =>
      buildSemanticRegistry({
        authorityClaim: fixture.authorityClaim,
        owners: [{ ...fixture.ownerA, schemaVersion: undefined }],
        providers: [],
        evidence: [],
      }),
    ).not.toThrow();
  });

  it("blocks evidence that exists without current admission", () => {
    const fixture = foundation();
    const item = evidenceItem(fixture.provider);
    const result = buildSemanticRegistry({
      authorityClaim: fixture.authorityClaim,
      owners: fixture.owners,
      providers: [],
      evidence: [item],
    });
    expect(result.status).toBe("UNPROVEN_BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("SEMANTIC_EVIDENCE_UNKNOWN");
  });

  it("blocks stale Source, repository, task, and context evidence", () => {
    const fixture = foundation();
    for (const current of [
      currentFacts({ sourceGenerationFingerprint: hash("changed-source") }),
      currentFacts({ repositorySnapshotIdentity: hash("changed-snapshot") }),
      currentFacts({ taskIdentity: hash("changed-task") }),
      currentFacts({ contextGenerationIdentity: hash("changed-context") }),
    ]) {
      const item = evidenceItem(fixture.provider);
      const result = buildSemanticRegistry({
        authorityClaim: fixture.authorityClaim,
        owners: fixture.owners,
        providers: [fixture.provider],
        evidence: [{ ...item, currentFacts: current }],
      });
      expect(result.status).toBe("UNPROVEN_BLOCKED");
      expect(result.findings.map(({ code }) => code)).toContain("SEMANTIC_EVIDENCE_STALE");
    }
  });

  it("blocks material mismatch instead of admitting stale content", () => {
    const fixture = foundation();
    const item = evidenceItem(fixture.provider);
    const result = buildSemanticRegistry({
      authorityClaim: fixture.authorityClaim,
      owners: fixture.owners,
      providers: [fixture.provider],
      evidence: [
        {
          ...item,
          currentFacts: currentFacts({ currentMaterialIdentities: [hash("different")] }),
        },
      ],
    });
    expect(result.findings.map(({ code }) => code)).toContain("SEMANTIC_EVIDENCE_INVALID");
  });

  it("blocks UNKNOWN evidence rather than treating it as absence", () => {
    const fixture = foundation();
    const result = buildSemanticRegistry({
      authorityClaim: fixture.authorityClaim,
      owners: fixture.owners,
      providers: [fixture.provider],
      evidence: [
        evidenceItem(fixture.provider, {
          presenceState: "UNKNOWN",
          materialIdentity: null,
          payload: null,
        }),
      ],
    });
    expect(result.status).toBe("UNPROVEN_BLOCKED");
    expect(result.entries).toEqual([]);
    expect(result.findings.map(({ code }) => code)).toContain("SEMANTIC_EVIDENCE_UNKNOWN");
  });

  it("normalizes owner/provider/evidence ordering to one identity", () => {
    const first = foundation();
    const secondProvider = bindSemanticProviderRegistration(
      defineSemanticProviderRegistration({
        providerId: "provider-b",
        providerVersion: "1.0.0",
        ownerIdentity: first.ownerA.ownerIdentity,
        capabilities: ["semantic-project"],
        semanticKinds: ["project-item"],
        schemaFloor: 1,
        policyFloor: 1,
      }),
      first.authorityClaim,
    );
    const items = [
      evidenceItem(first.provider),
      evidenceItem(secondProvider, { semanticKey: "project:item-b" }),
    ];
    const build = (providers, evidence) =>
      buildSemanticRegistry({
        authorityClaim: first.authorityClaim,
        owners: first.owners,
        providers,
        evidence,
      });
    expect(build([first.provider, secondProvider], items).registryIdentity).toBe(
      build([secondProvider, first.provider], [...items].reverse()).registryIdentity,
    );
  });

  it("keeps registry output portable across local-root variation", () => {
    const first = registry();
    const second = registry();
    expect(first.registryIdentity).toBe(second.registryIdentity);
    expect(JSON.stringify(first)).not.toMatch(/[A-Z]:\\|\/home\//u);
  });
});
