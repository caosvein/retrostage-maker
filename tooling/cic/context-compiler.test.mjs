import { describe, expect, it } from "vitest";
import { TextEncoder } from "node:util";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  CIC_I3_PREP1_REQUIREMENTS,
  DEFAULT_CONTEXT_TIER_POLICY,
  compileContext,
  computeTaskMaterialFingerprint,
  serializeContextCompilation,
} from "./lib/context-compiler.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { contextProviderResultIdentity } from "./lib/context-provider.mjs";
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

function generationWitnessForRequest(currentRequest, taskMaterialFingerprint, overrides = {}) {
  return generationWitness({
    authorityIdentity: currentRequest.authority.identity,
    sourceGenerationFingerprint: currentRequest.prerequisites.sourceGeneration.fingerprint,
    repositoryIdentity: currentRequest.prerequisites.repository.repositoryIdentity,
    repositorySnapshotIdentity: currentRequest.prerequisites.repository.snapshotFingerprint,
    capabilityFingerprint: currentRequest.prerequisites.capabilities.capabilityFingerprint,
    taskMaterialFingerprint,
    ...overrides,
  });
}

function providerResult(inputIdentity, overrides = {}) {
  const body = {
    requestId: "context-query",
    providerId: "test-provider",
    providerIdentity: hash("provider"),
    capability: "repository.query",
    inputIdentity,
    requestIdentity: hash("provider-request"),
    state: "PRESENT",
    materialIdentity: PROVIDER_MATERIAL_IDENTITY,
    data: { source: "bounded-provider" },
    absenceWitness: null,
    excluded: { localPathValues: 0, secretValues: 0 },
    findings: [],
    ...overrides,
  };
  return { ...body, resultIdentity: contextProviderResultIdentity(body) };
}

function providerObservation(
  inputIdentity,
  results = [providerResult(inputIdentity)],
  overrides = {},
) {
  const { movement = "STABLE", ...observationOverrides } = overrides;
  const semantic = { movement, results, findings: [] };
  return {
    schemaVersion: "CIC_CONTEXT_PROVIDER_OBSERVATION_V1",
    status: "PASS",
    ...semantic,
    observationFingerprint: sha256Hex(
      `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(semantic)}\n`,
    ),
    ...observationOverrides,
  };
}

function stableOptions(overrides = {}) {
  return {
    observeGeneration: async (_phase, context) =>
      generationWitnessForRequest(context.request, context.taskMaterialFingerprint),
    observeProviders: async ({ inputIdentity }) => providerObservation(inputIdentity),
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
        observeGeneration: async (phase, context) => {
          phases.push(phase);
          return generationWitnessForRequest(context.request, context.taskMaterialFingerprint);
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

  it("blocks a provider observation with missing movement", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) => {
          const observation = providerObservation(inputIdentity);
          delete observation.movement;
          return observation;
        },
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("PROVIDER_OBSERVATION_BLOCKED");
  });

  it("blocks a provider observation with invalid identity-bound movement", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) =>
          providerObservation(inputIdentity, undefined, { movement: "INVALID_MOVEMENT" }),
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("PROVIDER_OBSERVATION_BLOCKED");
  });

  it("blocks provider movement tampering without fingerprint recomputation", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) => ({
          ...providerObservation(inputIdentity),
          movement: "REPEATED_MOVEMENT",
        }),
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("PROVIDER_OBSERVATION_BLOCKED");
    expect(result.findings.map(({ code }) => code)).not.toContain("WORKSPACE_NOT_QUIESCENT");
  });

  it("blocks valid identity-bound provider REPEATED_MOVEMENT as not quiescent", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) =>
          providerObservation(inputIdentity, undefined, { movement: "REPEATED_MOVEMENT" }),
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("WORKSPACE_NOT_QUIESCENT");
    expect(result.findings.map(({ code }) => code)).not.toContain("PROVIDER_OBSERVATION_BLOCKED");
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

  it("escalates delimiter-bypass path and whitespace-secret material out of Tier1", async () => {
    const materials = [
      {
        id: "delimiter-path",
        path: "fixtures/delimiter-path.txt",
        content: "failed-at-C:\\Users\\owner\\repo\\file.txt",
      },
      {
        id: "whitespace-secret",
        path: "fixtures/whitespace-secret.txt",
        content: "api key = injected",
      },
    ];
    const result = await compileContext(request({ materials }), stableOptions());
    expect(result.status).toBe("VERIFIED");
    expect(result.tiers.tier1).toEqual([]);
    expect(result.tiers.tier2).toHaveLength(2);
    expect(JSON.stringify(result)).not.toMatch(/Users|api key|injected/u);
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

  it("accepts a later coherent Source generation instead of pinning the historical fingerprint", async () => {
    const laterSourceFingerprint = hash("later-source-generation");
    const currentRequest = request({
      prerequisites: prerequisites({
        sourceGeneration: { status: "PASS", fingerprint: laterSourceFingerprint },
      }),
    });
    const result = await compileContext(currentRequest, stableOptions());
    expect(result.status).toBe("VERIFIED");
    expect(result.tiers.tier0.sourceGenerationFingerprint).toBe(laterSourceFingerprint);
  });

  it("accepts a coherent expanded capability fingerprint with required capabilities still PASS", async () => {
    const expandedCapabilityFingerprint = hash("expanded-capabilities");
    const currentRequest = request({
      prerequisites: prerequisites({
        capabilities: {
          status: "PASS",
          requiredStatus: "PASS",
          capabilityFingerprint: expandedCapabilityFingerprint,
        },
      }),
    });
    const result = await compileContext(currentRequest, stableOptions());
    expect(result.status).toBe("VERIFIED");
    expect(result.tiers.tier0.capabilityFingerprint).toBe(expandedCapabilityFingerprint);
  });

  it("independently blocks a forged provider resultIdentity even with a recomputed outer fingerprint", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) => {
          const forged = {
            ...providerResult(inputIdentity),
            resultIdentity: hash("forged-provider-result"),
          };
          return providerObservation(inputIdentity, [forged]);
        },
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain(
      "PROVIDER_RESULT_REVERIFICATION_FAILED",
    );
  });

  it("blocks a provider result bound to another task or generation", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async () => {
          const stale = providerResult(hash("stale-provider-input"));
          return providerObservation(stale.inputIdentity, [stale]);
        },
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("PROVIDER_INPUT_BINDING_MISMATCH");
  });

  it("blocks duplicate provider request or result identities", async () => {
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) => {
          const duplicate = providerResult(inputIdentity);
          return providerObservation(inputIdentity, [duplicate, duplicate]);
        },
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("CONTEXT_IDENTITY_COLLISION");
  });

  it("does not serialize malicious data from a handcrafted provider result", async () => {
    const injected = "Authorization: Bearer provider-secret";
    const result = await compileContext(
      request(),
      stableOptions({
        observeProviders: async ({ inputIdentity }) =>
          providerObservation(inputIdentity, [
            providerResult(inputIdentity, { data: { injected } }),
          ]),
      }),
    );
    expect(result.status).toBe("BLOCKED");
    expect(serializeContextCompilation(result)).not.toContain("provider-secret");
  });

  it("blocks a Tier2 repository pointer that differs from the physical material path", async () => {
    const result = await compileContext(
      request({
        materials: [
          {
            id: "pointer-mismatch",
            path: "docs/physical.txt",
            content: "pointer-bound material",
            forceTier2: true,
            pointer: { kind: "REPOSITORY_PATH", path: "docs/different.txt" },
          },
        ],
      }),
      stableOptions(),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({
      code: "TIER2_POINTER_MISMATCH",
      material: "pointer-mismatch",
    });
  });

  it("blocks an arbitrary task-material fingerprint even when both generation reads repeat it", async () => {
    const result = await compileContext(request(), {
      observeGeneration: async (_phase, context) =>
        generationWitnessForRequest(context.request, hash("arbitrary-task-material")),
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("TASK_MATERIAL_FINGERPRINT_MISMATCH");
  });

  it("computes distinct fingerprints for materially different task inputs", () => {
    const first = request();
    const second = request({
      materials: [{ ...request().materials[0], content: "materially different\n" }],
    });
    expect(computeTaskMaterialFingerprint(first)).not.toBe(computeTaskMaterialFingerprint(second));
  });

  it("blocks an explicit required-dimension floor reduction at compiler entry", async () => {
    const result = await compileContext(request({ requiredDimensions: [] }), stableOptions());
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("REQUIRED_DIMENSION_FLOOR_VIOLATION");
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
      observeGeneration: async (_phase, context) =>
        generationWitnessForRequest(context.request, context.taskMaterialFingerprint),
      observeProviders: async ({ inputIdentity }) => providerObservation(inputIdentity),
      readMaterials: async () => {
        throw new Error("unavailable at C:\\private");
      },
    });
    expect(noObserver.findings.map(({ code }) => code)).toContain("GENERATION_OBSERVER_MISSING");
    expect(failedRead.findings.map(({ code }) => code)).toContain("REQUIRED_MATERIAL_READ_FAILED");
    expect(JSON.stringify(failedRead)).not.toContain("C:\\private");
  });

  it("does not trust caller-serialized provider assertions without a live observer seam", async () => {
    const currentRequest = request();
    const result = await compileContext(
      { ...currentRequest, providerObservation: providerObservation(hash("caller-input")) },
      {
        observeGeneration: async (_phase, context) =>
          generationWitnessForRequest(context.request, context.taskMaterialFingerprint),
      },
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("PROVIDER_OBSERVER_MISSING");
  });
});
