import { describe, expect, it } from "vitest";

import { sha256Hex } from "./lib/identity.mjs";
import {
  authorityClaimIdentity,
  bindSemanticProviderRegistration,
  buildSemanticProviderProjection,
  defineSemanticProviderRegistration,
} from "./lib/semantic-provider.mjs";

const hash = (value) => sha256Hex(`semantic-provider-test:${value}`);

function ownerRegistration() {
  return defineSemanticProviderRegistration({
    providerId: "fixture-provider",
    providerVersion: "1.0.0",
    ownerIdentity: hash("owner"),
    capabilities: ["semantic-project"],
    semanticKinds: ["project-item"],
    schemaFloor: 1,
    policyFloor: 1,
  });
}

function authority(owners = [hash("owner")]) {
  const body = {
    schemaVersion: "CIC_I5_AUTHORITY_CLAIM_V1",
    authorityState: "UNPROVEN",
    authorizationIdentity: hash("authorization"),
    currentTruthIdentity: hash("current-truth"),
    taskContractIdentity: hash("task-contract"),
    authorizedSemanticOwnerSet: owners,
  };
  return { ...body, authorityClaimIdentity: authorityClaimIdentity(body) };
}

function bound() {
  return bindSemanticProviderRegistration(ownerRegistration(), authority());
}

function present(overrides = {}) {
  return {
    semanticKey: "project:item-a",
    semanticKind: "project-item",
    presenceState: "PRESENT",
    materialIdentity: hash("material"),
    dependencies: [],
    payload: { label: "portable-value" },
    absenceWitness: null,
    ...overrides,
  };
}

describe("CIC I5-A semantic provider", () => {
  it("keeps raw provider registration structurally unadmitted", () => {
    const registration = ownerRegistration();
    expect(registration.registrationState).toBe("RAW_UNADMITTED");
    expect(registration).not.toHaveProperty("providerBindingIdentity");
  });

  it("rejects executable provider callbacks", () => {
    expect(() =>
      defineSemanticProviderRegistration({
        ...ownerRegistration(),
        observe() {},
      }),
    ).toThrowError(/SEMANTIC_PROVIDER_REGISTRATION_INVALID/u);
  });

  it("blocks structural binding when the owner is outside the claimed set", () => {
    expect(() =>
      bindSemanticProviderRegistration(ownerRegistration(), authority([hash("other-owner")])),
    ).toThrowError(/SEMANTIC_OWNER_UNAUTHORIZED/u);
  });

  it("rejects a forged authority context identity", () => {
    expect(() =>
      bindSemanticProviderRegistration(ownerRegistration(), {
        ...authority(),
        authorityClaimIdentity: hash("forged"),
      }),
    ).toThrowError(/SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN/u);
  });

  it("keeps a self-consistent fabricated authority claim UNPROVEN", () => {
    expect(bound()).toMatchObject({
      registrationState: "STRUCTURALLY_BOUND_UNPROVEN",
      authorityState: "UNPROVEN",
      ownerIdentity: hash("owner"),
      authorizationIdentity: hash("authorization"),
    });
  });

  it("returns explicit UNKNOWN for a missing provider capability", () => {
    const result = buildSemanticProviderProjection({
      provider: bound(),
      inputIdentity: hash("input"),
      capability: "missing-capability",
      records: [],
    });
    expect(result).toMatchObject({
      status: "UNKNOWN",
    });
    expect(result.findings).toContain("REQUIRED_PROVIDER_CAPABILITY_MISSING");
  });

  it("rejects malformed provider results", () => {
    expect(() =>
      buildSemanticProviderProjection({
        provider: bound(),
        inputIdentity: hash("input"),
        capability: "semantic-project",
        records: [{ ...present(), materialIdentity: null }],
      }),
    ).toThrowError(/SEMANTIC_PROVIDER_RESULT_INVALID/u);
  });

  it("rejects a provider identity mismatch", () => {
    expect(() =>
      buildSemanticProviderProjection({
        provider: { ...bound(), providerIdentity: hash("forged-provider") },
        inputIdentity: hash("input"),
        capability: "semantic-project",
        records: [present()],
      }),
    ).toThrowError(/SEMANTIC_PROVIDER_IDENTITY_MISMATCH/u);
  });

  it("rejects ABSENT_PROVEN without an exact provider-bound witness", () => {
    expect(() =>
      buildSemanticProviderProjection({
        provider: bound(),
        inputIdentity: hash("input"),
        capability: "semantic-project",
        records: [
          present({
            presenceState: "ABSENT_PROVEN",
            payload: null,
            absenceWitness: {
              result: "ABSENT_PROVEN",
              providerIdentity: hash("other-provider"),
              indexIdentity: hash("index"),
              queryClass: "project-item",
              scopeIdentity: hash("scope"),
              generationIdentity: hash("generation"),
            },
          }),
        ],
      }),
    ).toThrowError(/SEMANTIC_ABSENCE_WITNESS_INVALID/u);
  });

  it("preserves UNKNOWN rather than converting it to absence", () => {
    const result = buildSemanticProviderProjection({
      provider: bound(),
      inputIdentity: hash("input"),
      capability: "semantic-project",
      records: [
        present({
          presenceState: "UNKNOWN",
          materialIdentity: null,
          payload: null,
        }),
      ],
    });
    expect(result.status).toBe("UNKNOWN");
    expect(result.records[0].presenceState).toBe("UNKNOWN");
  });

  it("rejects local, secret, cyclic, and over-bound payloads", () => {
    for (const payload of [
      { root: "C:\\Users\\owner\\repo" },
      { apiKey: "secret" },
      { text: "x".repeat(33 * 1024) },
    ]) {
      expect(() =>
        buildSemanticProviderProjection({
          provider: bound(),
          inputIdentity: hash("input"),
          capability: "semantic-project",
          records: [present({ payload })],
        }),
      ).toThrow();
    }
    const cyclic = {};
    cyclic.self = cyclic;
    expect(() =>
      buildSemanticProviderProjection({
        provider: bound(),
        inputIdentity: hash("input"),
        capability: "semantic-project",
        records: [present({ payload: cyclic })],
      }),
    ).toThrow();
  });

  it("normalizes input order to an identical projection identity", () => {
    const provider = bound();
    const records = [present(), present({ semanticKey: "project:item-b" })];
    const first = buildSemanticProviderProjection({
      provider,
      inputIdentity: hash("input"),
      capability: "semantic-project",
      records,
    });
    const second = buildSemanticProviderProjection({
      provider,
      inputIdentity: hash("input"),
      capability: "semantic-project",
      records: [...records].reverse(),
    });
    expect(first.projectionSetIdentity).toBe(second.projectionSetIdentity);
    expect(first.records).toEqual(second.records);
  });

  it("produces portable identity independent of excluded local roots", () => {
    const provider = bound();
    const build = () =>
      buildSemanticProviderProjection({
        provider,
        inputIdentity: hash("input"),
        capability: "semantic-project",
        records: [present()],
      });
    expect(build().projectionSetIdentity).toBe(build().projectionSetIdentity);
    expect(JSON.stringify(build())).not.toMatch(/[A-Z]:\\|\/home\//u);
  });
});
