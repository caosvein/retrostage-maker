import { describe, expect, it } from "vitest";

import {
  CONTEXT_OBSERVATION_STATES,
  defineContextProvider,
  observeContextProviders,
  portableProviderData,
} from "./lib/context-provider.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const hash = (value) => sha256Hex(`test:${value}`);

function provider(observe, capabilities = ["repository.query"]) {
  return defineContextProvider({
    id: "physical-repository",
    version: "1.0.0",
    schemaVersion: "CIC_TEST_PROVIDER_V1",
    capabilities,
    observe,
  });
}

function request(overrides = {}) {
  return {
    requestId: "owners-query",
    providerId: "physical-repository",
    capability: "repository.query",
    inputIdentity: hash("input"),
    query: { channel: "owners", scopeIdentity: hash("scope") },
    ...overrides,
  };
}

describe("CIC-I3 context provider", () => {
  it("preserves PRESENT, ABSENT_PROVEN and UNKNOWN as distinct states", async () => {
    const states = CONTEXT_OBSERVATION_STATES;
    for (const state of states) {
      const result = await observeContextProviders({
        providers: [
          provider(async () => ({
            state,
            materialIdentity: hash(state),
            data: { state },
            absenceWitness:
              state === "ABSENT_PROVEN"
                ? {
                    result: "ABSENT_PROVEN",
                    providerIdentity: hash("provider"),
                    indexIdentity: hash("index"),
                    queryClass: "owners",
                    scopeIdentity: hash("scope"),
                    generationIdentity: hash("generation"),
                  }
                : undefined,
            reasonCode: state === "UNKNOWN" ? "INDEX_UNAVAILABLE" : undefined,
          })),
        ],
        requests: [request()],
      });
      expect(result.results[0].state).toBe(state);
      expect(result.status).toBe(state === "UNKNOWN" ? "BLOCKED" : "PASS");
      expect(JSON.stringify(result)).not.toContain("INDEX_UNAVAILABLE");
    }
  });

  it("turns provider exceptions into a sanitized deterministic UNKNOWN", async () => {
    const observe = async () => {
      throw new Error("password=hunter2 at C:\\Users\\private\\fixture");
    };
    const first = await observeContextProviders({
      providers: [provider(observe)],
      requests: [request()],
    });
    const second = await observeContextProviders({
      providers: [provider(observe)],
      requests: [request()],
    });
    expect(first).toEqual(second);
    expect(first.results[0]).toMatchObject({
      state: "UNKNOWN",
      findings: [{ code: "PROVIDER_OBSERVATION_FAILED", requestId: "owners-query" }],
    });
    expect(JSON.stringify(first)).not.toMatch(/hunter2|Users|private\\fixture/u);
  });

  it("blocks a missing provider and a missing provider capability", async () => {
    const missingProvider = await observeContextProviders({ providers: [], requests: [request()] });
    const missingCapability = await observeContextProviders({
      providers: [provider(async () => ({}), ["different.capability"])],
      requests: [request()],
    });
    expect(missingProvider.results[0]).toMatchObject({
      state: "UNKNOWN",
      findings: [{ code: "REQUIRED_PROVIDER_MISSING", requestId: "owners-query" }],
    });
    expect(missingCapability.results[0]).toMatchObject({
      state: "UNKNOWN",
      findings: [{ code: "REQUIRED_PROVIDER_CAPABILITY_MISSING", requestId: "owners-query" }],
    });
  });

  it("sorts provider requests and results deterministically", async () => {
    const fixture = provider(async ({ requestId }) => ({
      state: "PRESENT",
      materialIdentity: hash(requestId),
      data: { requestId },
    }));
    const requests = [request({ requestId: "z-query" }), request({ requestId: "a-query" })];
    const first = await observeContextProviders({ providers: [fixture], requests });
    const second = await observeContextProviders({
      providers: [fixture],
      requests: [...requests].reverse(),
    });
    expect(first).toEqual(second);
    expect(first.results.map(({ requestId }) => requestId)).toEqual(["a-query", "z-query"]);
  });

  it("excludes secret-like data and machine-local absolute paths", async () => {
    const result = await observeContextProviders({
      providers: [
        provider(async () => ({
          state: "PRESENT",
          materialIdentity: hash("safe-result"),
          data: {
            token: "do-not-serialize",
            nested: { location: "C:\\Users\\owner\\private.txt" },
            header: "Bearer do-not-serialize-either",
            safe: "repository-relative/value",
          },
        })),
      ],
      requests: [request({ query: { password: "input-secret", root: "/home/owner/repo" } })],
    });
    const text = JSON.stringify(result);
    expect(text).not.toMatch(/do-not-serialize|input-secret|Users|home\/owner/u);
    expect(result.results[0].excluded).toEqual({ localPathValues: 2, secretValues: 3 });
    expect(result.results[0].data.safe).toBe("repository-relative/value");
  });

  it("fails closed on malformed provider results", async () => {
    const result = await observeContextProviders({
      providers: [provider(async () => ({ state: "PRESENT", data: {} }))],
      requests: [request()],
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.results[0]).toMatchObject({
      state: "UNKNOWN",
      findings: [{ code: "PROVIDER_RESULT_INVALID", requestId: "owners-query" }],
    });
  });

  it("blocks duplicate provider or request identities", async () => {
    const fixture = provider(async () => ({
      state: "PRESENT",
      materialIdentity: hash("result"),
      data: {},
    }));
    const result = await observeContextProviders({
      providers: [fixture, fixture],
      requests: [request(), request()],
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("CONTEXT_IDENTITY_COLLISION");
  });

  it("rejects provider metadata that resembles a local path or secret assignment", () => {
    for (const id of ["C:/private/git", "token=do-not-transport"]) {
      expect(() =>
        defineContextProvider({
          id,
          version: "1.0.0",
          schemaVersion: "CIC_TEST_PROVIDER_V1",
          capabilities: ["repository.query"],
          observe: async () => ({ state: "UNKNOWN" }),
        }),
      ).toThrow(TypeError);
    }
  });

  it("provides a standalone portable-data boundary", () => {
    const result = portableProviderData({
      credential: "private",
      path: "D:\\machine\\specific",
      retained: ["stable", 1, true],
    });
    expect(result).toEqual({
      data: { path: "[LOCAL_PATH_EXCLUDED]", retained: ["stable", 1, true] },
      excluded: { localPathValues: 1, secretValues: 1 },
    });
  });
});
