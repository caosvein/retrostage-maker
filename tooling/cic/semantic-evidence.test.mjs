import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  buildSemanticEvidence,
  evaluateSemanticEvidence,
  inspectSemanticEvidence,
} from "./lib/semantic-evidence.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  authorityClaimIdentity,
  bindSemanticProviderRegistration,
  buildSemanticProviderProjection,
  defineSemanticProviderRegistration,
} from "./lib/semantic-provider.mjs";

const hash = (value) => sha256Hex(`semantic-evidence-test:${value}`);

function authority() {
  const body = {
    schemaVersion: "CIC_I5_AUTHORITY_CLAIM_V1",
    authorityState: "UNPROVEN",
    authorizationIdentity: hash("authorization"),
    currentTruthIdentity: hash("current-truth"),
    taskContractIdentity: hash("task-contract"),
    authorizedSemanticOwnerSet: [hash("owner")],
  };
  return { ...body, authorityClaimIdentity: authorityClaimIdentity(body) };
}

function provider() {
  return bindSemanticProviderRegistration(
    defineSemanticProviderRegistration({
      providerId: "fixture-provider",
      providerVersion: "1.0.0",
      ownerIdentity: hash("owner"),
      capabilities: ["semantic-project"],
      semanticKinds: ["project-item"],
      schemaFloor: 1,
      policyFloor: 1,
    }),
    authority(),
  );
}

function projection(overrides = {}) {
  const boundProvider = provider();
  return {
    boundProvider,
    projection: buildSemanticProviderProjection({
      provider: boundProvider,
      inputIdentity: hash("provider-input"),
      capability: "semantic-project",
      records: [
        {
          semanticKey: "project:item-a",
          semanticKind: "project-item",
          presenceState: "PRESENT",
          materialIdentity: hash("material"),
          dependencies: ["project:item-base"],
          payload: { label: "portable" },
          absenceWitness: null,
          ...overrides,
        },
      ],
    }).records[0],
  };
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

function fixture(overrides = {}) {
  const projected = projection(overrides);
  return {
    boundProvider: projected.boundProvider,
    evidence: buildSemanticEvidence({
      evidenceKind: "semantic-provider-observation",
      projection: projected.projection,
      bindings: bindings(),
      supportingEvidenceIdentities: [hash("supporting-evidence")],
    }),
  };
}

describe("CIC I5-A semantic evidence", () => {
  it("creates a versioned content-addressed observation", () => {
    const { evidence } = fixture();
    expect(evidence).toMatchObject({
      schemaVersion: "CIC_SEMANTIC_EVIDENCE_V1",
      createdAs: "OBSERVATION",
      authorityState: "UNPROVEN",
      presenceState: "PRESENT",
    });
  });

  it("does not treat a valid evidence file as admitted authority", () => {
    expect(inspectSemanticEvidence(fixture().evidence)).toMatchObject({
      disposition: "UNKNOWN",
      authorityState: "UNPROVEN",
      reasonCodes: ["EVIDENCE_AUTHORITY_UNPROVEN"],
    });
  });

  it("keeps matching caller currentFacts structurally matched but non-authoritative", () => {
    const { boundProvider, evidence } = fixture();
    expect(
      evaluateSemanticEvidence(evidence, { boundProvider, currentFacts: currentFacts() }),
    ).toMatchObject({
      disposition: "UNKNOWN",
      assessment: "CURRENTNESS_MATCH",
      authorityState: "UNPROVEN",
      reasonCodes: ["PHYSICAL_CURRENT_TRUTH_UNPROVEN"],
    });
  });

  it("rejects a self-hash mismatch as INVALID", () => {
    const { boundProvider, evidence } = fixture();
    expect(
      evaluateSemanticEvidence(
        { ...evidence, evidenceIdentity: hash("forged") },
        { boundProvider, currentFacts: currentFacts() },
      ),
    ).toMatchObject({ disposition: "INVALID" });
  });

  it("keeps UNKNOWN distinct from ABSENT_PROVEN", () => {
    const { boundProvider, evidence } = fixture({
      presenceState: "UNKNOWN",
      materialIdentity: null,
      dependencies: [],
      payload: null,
    });
    const result = evaluateSemanticEvidence(evidence, {
      boundProvider,
      currentFacts: currentFacts({ currentMaterialIdentities: [] }),
    });
    expect(result).toMatchObject({
      disposition: "UNKNOWN",
      reasonCodes: ["SEMANTIC_PRESENCE_UNKNOWN"],
    });
  });

  it("keeps same-provider ABSENT_PROVEN unproven without physical witness binding", () => {
    const boundProvider = provider();
    const projected = buildSemanticProviderProjection({
      provider: boundProvider,
      inputIdentity: hash("provider-input"),
      capability: "semantic-project",
      records: [
        {
          semanticKey: "project:missing",
          semanticKind: "project-item",
          presenceState: "ABSENT_PROVEN",
          materialIdentity: hash("absence-material"),
          dependencies: [],
          payload: null,
          absenceWitness: {
            result: "ABSENT_PROVEN",
            providerIdentity: boundProvider.providerIdentity,
            indexIdentity: hash("index"),
            queryClass: "project-item",
            scopeIdentity: hash("scope"),
            generationIdentity: hash("generation"),
          },
        },
      ],
    }).records[0];
    const evidence = buildSemanticEvidence({
      evidenceKind: "semantic-provider-observation",
      projection: projected,
      bindings: bindings(),
    });
    expect(
      evaluateSemanticEvidence(evidence, {
        boundProvider,
        currentFacts: currentFacts({
          currentMaterialIdentities: [hash("absence-material")],
          absenceWitnessExpectation: projected.absenceWitness,
        }),
      }),
    ).toMatchObject({
      disposition: "UNKNOWN",
      assessment: "ABSENCE_WITNESS_MATCH_UNPROVEN",
      authorityState: "UNPROVEN",
    });
  });

  it.each([
    ["sourceGenerationFingerprint", "changed-source", "SOURCE_GENERATION_STALE"],
    ["repositorySnapshotIdentity", "changed-snapshot", "REPOSITORY_SNAPSHOT_STALE"],
    ["taskIdentity", "changed-task", "TASK_IDENTITY_STALE"],
    ["contextGenerationIdentity", "changed-context", "CONTEXT_GENERATION_STALE"],
  ])("marks stale %s binding as STALE", (field, label, reasonCode) => {
    const { boundProvider, evidence } = fixture();
    const result = evaluateSemanticEvidence(evidence, {
      boundProvider,
      currentFacts: currentFacts({ [field]: hash(label) }),
    });
    expect(result).toMatchObject({ disposition: "STALE" });
    expect(result.reasonCodes).toContain(reasonCode);
  });

  it("fails closed when the repository view is incomplete", () => {
    const { boundProvider, evidence } = fixture();
    expect(
      evaluateSemanticEvidence(evidence, {
        boundProvider,
        currentFacts: currentFacts({ repositoryView: { complete: false, shallow: true } }),
      }),
    ).toMatchObject({ disposition: "UNKNOWN" });
  });

  it("marks current material mismatch INVALID", () => {
    const { boundProvider, evidence } = fixture();
    expect(
      evaluateSemanticEvidence(evidence, {
        boundProvider,
        currentFacts: currentFacts({ currentMaterialIdentities: [hash("different-material")] }),
      }),
    ).toMatchObject({
      disposition: "INVALID",
      reasonCodes: ["EVIDENCE_MATERIAL_MISMATCH"],
    });
  });

  it("blocks same-provider stale or different-scope absence witness replay", () => {
    const boundProvider = provider();
    const witness = {
      result: "ABSENT_PROVEN",
      providerIdentity: boundProvider.providerIdentity,
      indexIdentity: hash("index"),
      queryClass: "project-item",
      scopeIdentity: hash("old-scope"),
      generationIdentity: hash("old-generation"),
    };
    const projected = buildSemanticProviderProjection({
      provider: boundProvider,
      inputIdentity: hash("provider-input"),
      capability: "semantic-project",
      records: [
        {
          semanticKey: "project:missing-replay",
          semanticKind: "project-item",
          presenceState: "ABSENT_PROVEN",
          materialIdentity: hash("absence-material"),
          dependencies: [],
          payload: null,
          absenceWitness: witness,
        },
      ],
    }).records[0];
    const evidence = buildSemanticEvidence({
      evidenceKind: "semantic-provider-observation",
      projection: projected,
      bindings: bindings(),
    });
    const result = evaluateSemanticEvidence(evidence, {
      boundProvider,
      currentFacts: currentFacts({
        currentMaterialIdentities: [hash("absence-material")],
        absenceWitnessExpectation: {
          ...witness,
          scopeIdentity: hash("current-scope"),
          generationIdentity: hash("current-generation"),
        },
      }),
    });
    expect(result).toMatchObject({
      disposition: "UNKNOWN",
      assessment: "ABSENCE_WITNESS_REPLAY_OR_UNBOUND",
      authorityState: "UNPROVEN",
    });
  });

  it("rejects a directly constructed self-hashed oversized evidence record", () => {
    const { evidence } = fixture();
    const body = { ...evidence, observation: { text: "x".repeat(33 * 1024) } };
    delete body.authorityState;
    delete body.evidenceIdentity;
    const direct = {
      ...body,
      evidenceIdentity: sha256Hex(`CIC-SEMANTIC-EVIDENCE-V1\n${canonicalJson(body)}\n`),
      authorityState: "UNPROVEN",
    };
    expect(inspectSemanticEvidence(direct)).toMatchObject({
      disposition: "INVALID",
      authorityState: "UNPROVEN",
    });
  });

  it("rejects local or secret observation bytes", () => {
    for (const observation of [{ path: "/home/owner/repo" }, { clientSecret: "injected" }]) {
      const { projection: projected } = projection();
      expect(() =>
        buildSemanticEvidence({
          evidenceKind: "semantic-provider-observation",
          projection: { ...projected, payload: observation },
          bindings: bindings(),
        }),
      ).toThrowError(/SEMANTIC_(?:EVIDENCE|PROVIDER_PAYLOAD)_INVALID/u);
    }
  });

  it("normalizes supporting evidence order to one stable identity", () => {
    const { projection: projected } = projection();
    const input = {
      evidenceKind: "semantic-provider-observation",
      projection: projected,
      bindings: bindings(),
    };
    const first = buildSemanticEvidence({
      ...input,
      supportingEvidenceIdentities: [hash("z"), hash("a")],
    });
    const second = buildSemanticEvidence({
      ...input,
      supportingEvidenceIdentities: [hash("a"), hash("z")],
    });
    expect(first.evidenceIdentity).toBe(second.evidenceIdentity);
  });
});
