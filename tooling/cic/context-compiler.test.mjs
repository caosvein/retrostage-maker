import { describe, expect, it } from "vitest";
import { TextEncoder } from "node:util";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  CIC_I3_PREP1_REQUIREMENTS,
  DEFAULT_CONTEXT_TIER_POLICY,
  compileContext,
  serializeContextCompilation,
} from "./lib/context-compiler.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const hash = (value) => sha256Hex(`test:${value}`);
const PROVIDER_MATERIAL_IDENTITY = hash("provider-material");

function prerequisites(overrides = {}) {
  return {
    sourceGeneration: {
      status: "PASS",
      fingerprint: CIC_I3_PREP1_REQUIREMENTS.sourceGenerationFingerprint,
    },
    repository: {
      status: "PASS",
      repositoryIdentity: CIC_I3_PREP1_REQUIREMENTS.repositoryIdentity,
      snapshotFingerprint: hash("snapshot"),
      view: { complete: true, shallow: false },
    },
    capabilities: {
      status: "PASS",
      requiredStatus: "PASS",
      capabilityFingerprint: CIC_I3_PREP1_REQUIREMENTS.capabilityFingerprint,
    },
    ...overrides,
  };
}

function dimensions() {
  return REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
    dimension,
    state: "PRESENT",
    materialIdentities: [PROVIDER_MATERIAL_IDENTITY],
  }));
}

function request(overrides = {}) {
  return {
    authority: { identity: hash("authority") },
    task: { identity: hash("task") },
    prerequisites: prerequisites(),
    dimensions: dimensions(),
    materials: [
      {
        id: "task-seed",
        path: "tooling/cic/context-compiler.test.mjs",
        content: "bounded task material\n",
        generationIdentity: hash("material-generation"),
      },
    ],
    ...overrides,
  };
}

function generationWitness(overrides = {}) {
  return {
    authorityIdentity: hash("authority"),
    sourceGenerationFingerprint: CIC_I3_PREP1_REQUIREMENTS.sourceGenerationFingerprint,
    repositoryIdentity: CIC_I3_PREP1_REQUIREMENTS.repositoryIdentity,
    repositorySnapshotIdentity: hash("snapshot"),
    capabilityFingerprint: CIC_I3_PREP1_REQUIREMENTS.capabilityFingerprint,
    taskMaterialFingerprint: hash("task-material"),
    movement: "STABLE",
    ...overrides,
  };
}

function providerObservation(overrides = {}) {
  const result = {
    requestId: "context-query",
    providerId: "test-provider",
    providerIdentity: hash("provider"),
    state: "PRESENT",
    materialIdentity: PROVIDER_MATERIAL_IDENTITY,
    resultIdentity: hash("provider-result"),
  };
  const semantic = { results: [result], findings: [] };
  return {
    schemaVersion: "CIC_CONTEXT_PROVIDER_OBSERVATION_V1",
    status: "PASS",
    ...semantic,
    observationFingerprint: sha256Hex(
      `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(semantic)}\n`,
    ),
    ...overrides,
  };
}

function stableOptions(overrides = {}) {
  return {
    observeGeneration: async () => generationWitness(),
    observeProviders: async () => providerObservation(),
    ...overrides,
  };
}

describe("CIC-I3 context compiler", () => {
  it("keeps Tier0 bounded and Tier2 escalation explicit by default", () => {
    expect(DEFAULT_CONTEXT_TIER_POLICY).toEqual({
      tier0MaxBytes: 4096,
      tier1MaxMaterialBytes: 64 * 1024,
      allowTier2: true,
    });
  });

  it("creates a verified non-active candidate after equal GEN_START and GEN_END", async () => {
    const phases = [];
    const result = await compileContext(
      request(),
      stableOptions({
        observeGeneration: async (phase) => {
          phases.push(phase);
          return generationWitness();
        },
      }),
    );
    expect(phases).toEqual(["GEN_START", "GEN_END"]);
    expect(result).toMatchObject({
      schemaVersion: "CIC_CONTEXT_COMPILATION_V1",
      status: "VERIFIED",
      active: false,
      lifecycle: "VERIFIED_NON_ACTIVE",
      generation: { coherent: true },
      closure: { status: "COMPLETE" },
    });
    expect(result.contextGenerationIdentity).toMatch(/^[0-9A-F]{64}$/u);
    expect(result.tiers.tier1[0].content).toBe("bounded task material\n");
  });

  it("produces byte-identical output for repeated equivalent input", async () => {
    const first = await compileContext(request(), stableOptions());
    const second = await compileContext(
      request({
        dimensions: [...dimensions()].reverse(),
        materials: [...request().materials].reverse(),
      }),
      stableOptions(),
    );
    expect(serializeContextCompilation(first)).toBe(serializeContextCompilation(second));
    expect(serializeContextCompilation(first).endsWith("\n")).toBe(true);
    expect(serializeContextCompilation(first)).not.toContain("\r\n");
  });

  it("blocks start/end material drift as CONTEXT_GENERATION_RACE", async () => {
    let calls = 0;
    const result = await compileContext(request(), {
      observeGeneration: async () => {
        calls += 1;
        return generationWitness({ taskMaterialFingerprint: hash(`task-material-${calls}`) });
      },
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.generation.coherent).toBe(false);
    expect(result.findings.map(({ code }) => code)).toContain("CONTEXT_GENERATION_RACE");
  });

  it("blocks a stable generation witness that does not bind the supplied I1/I2 facts", async () => {
    const result = await compileContext(request(), {
      observeGeneration: async () =>
        generationWitness({ repositorySnapshotIdentity: hash("different-snapshot") }),
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("GENERATION_WITNESS_MISMATCH");
  });

  it("blocks explicit repeated movement as WORKSPACE_NOT_QUIESCENT", async () => {
    const result = await compileContext(request(), {
      observeGeneration: async () => generationWitness({ movement: "REPEATED_MOVEMENT" }),
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("WORKSPACE_NOT_QUIESCENT");
  });

  it("escalates oversized Tier1 text to a Tier2 path/hash pointer without truncation", async () => {
    const content = "0123456789abcdefghijklmnopqrstuvwxyz\n";
    const result = await compileContext(
      request({
        tierPolicy: { tier1MaxMaterialBytes: 8 },
        materials: [{ id: "large-source", path: "docs/large.txt", content }],
      }),
      stableOptions(),
    );
    expect(result.status).toBe("VERIFIED");
    expect(result.tiers.tier1).toEqual([]);
    expect(result.tiers.tier2).toEqual([
      expect.objectContaining({
        id: "large-source",
        bytes: new TextEncoder().encode(content).byteLength,
        sha256: sha256Hex(content),
        embedded: false,
        pointer: { kind: "REPOSITORY_PATH", path: "docs/large.txt" },
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain(content);
  });

  it("blocks oversized Tier1 material when no governed Tier2 pointer is available", async () => {
    const result = await compileContext(
      request({
        tierPolicy: { tier1MaxMaterialBytes: 2 },
        materials: [{ id: "large-without-pointer", content: "large" }],
      }),
      stableOptions(),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({
      code: "TIER1_MATERIAL_OVERSIZED",
      material: "large-without-pointer",
    });
  });

  it("represents binary and secret-like material as pointer/hash-first Tier2 data", async () => {
    const materials = [
      {
        id: "binary",
        content: new Uint8Array([0, 1, 2, 3]),
        pointer: { kind: "GOVERNED", identity: hash("binary-pointer"), locator: "evidence:bin" },
      },
      {
        id: "secret-bearing",
        path: "fixtures/secret.txt",
        content: "token=must-not-be-serialized",
      },
    ];
    const result = await compileContext(request({ materials }), stableOptions());
    expect(result.status).toBe("VERIFIED");
    expect(result.tiers.tier1).toEqual([]);
    expect(result.tiers.tier2).toHaveLength(2);
    expect(JSON.stringify(result)).not.toContain("must-not-be-serialized");
  });

  it("keeps machine-local paths inside material bytes out of portable output", async () => {
    const result = await compileContext(
      request({
        materials: [
          {
            id: "local-path-bearing",
            path: "fixtures/local-path.txt",
            content: "location=C:\\Users\\owner\\fixture\n",
          },
        ],
      }),
      stableOptions(),
    );
    expect(result.status).toBe("VERIFIED");
    expect(result.tiers.tier1).toEqual([]);
    expect(result.tiers.tier2).toHaveLength(1);
    expect(JSON.stringify(result)).not.toMatch(/C:\\Users|owner\\fixture/u);
  });

  it("blocks case/Unicode-equivalent material identity collisions", async () => {
    const result = await compileContext(
      request({
        materials: [
          { id: "Owner", path: "docs/a.txt", content: "a" },
          { id: "owner", path: "docs/b.txt", content: "b" },
        ],
      }),
      stableOptions(),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("CONTEXT_IDENTITY_COLLISION");
  });

  it("blocks mixed material generations", async () => {
    const result = await compileContext(
      request({
        materials: [
          { id: "first", content: "a", generationIdentity: hash("generation-a") },
          { id: "second", content: "b", generationIdentity: hash("generation-b") },
        ],
      }),
      stableOptions(),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("CONTEXT_GENERATION_RACE");
  });

  it("blocks stale, incomplete or capability-failed I1/I2 prerequisites", async () => {
    const cases = [
      prerequisites({ sourceGeneration: { status: "BLOCKED", fingerprint: null } }),
      prerequisites({
        repository: {
          status: "PASS",
          repositoryIdentity: CIC_I3_PREP1_REQUIREMENTS.repositoryIdentity,
          snapshotFingerprint: hash("snapshot"),
          view: { complete: false, shallow: true },
        },
      }),
      prerequisites({
        capabilities: {
          status: "BLOCKED",
          requiredStatus: "BLOCKED",
          capabilityFingerprint: hash("wrong-capabilities"),
        },
      }),
    ];
    for (const prerequisite of cases) {
      const result = await compileContext(
        request({ prerequisites: prerequisite }),
        stableOptions(),
      );
      expect(result.status).toBe("BLOCKED");
      expect(result.closure.status).toBe("BLOCKED");
    }
  });

  it("keeps Git-relative paths and excludes local paths, timestamps and display labels", async () => {
    const result = await compileContext(
      request({
        materials: [
          {
            id: "portable",
            path: ".\\docs\\sources\\SOURCE-MANIFEST.tsv",
            content: "portable\n",
          },
        ],
        ignoredDisplayLabel: "C:\\Users\\owner\\workspace at 2030-01-01T00:00:00Z",
      }),
      stableOptions(),
    );
    const output = serializeContextCompilation(result);
    expect(result.tiers.tier1[0].path).toBe("docs/sources/SOURCE-MANIFEST.tsv");
    expect(output).not.toMatch(/C:\\Users|2030-01-01|ignoredDisplayLabel/u);
  });

  it("blocks when the generation observer or material reader is unavailable", async () => {
    const noObserver = await compileContext(request());
    const failedRead = await compileContext(request(), {
      observeGeneration: async () => generationWitness(),
      observeProviders: async () => providerObservation(),
      readMaterials: async () => {
        throw new Error("unavailable at C:\\private");
      },
    });
    expect(noObserver.findings.map(({ code }) => code)).toContain("GENERATION_OBSERVER_MISSING");
    expect(failedRead.findings.map(({ code }) => code)).toContain("REQUIRED_MATERIAL_READ_FAILED");
    expect(JSON.stringify(failedRead)).not.toContain("C:\\private");
  });

  it("does not trust caller-serialized provider assertions without a live observer seam", async () => {
    const result = await compileContext(request({ providerObservation: providerObservation() }), {
      observeGeneration: async () => generationWitness(),
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("PROVIDER_OBSERVER_MISSING");
  });
});
