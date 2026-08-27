import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  evaluateExecutionCapabilities,
  REQUIRED_I2_CAPABILITIES,
} from "./lib/execution-capabilities.mjs";

describe("CIC-I2 canonical JSON and execution capabilities", () => {
  it("canonicalizes object keys by Unicode code point while preserving array order", () => {
    const first = canonicalJson({ z: 1, "😀": 2, a: { y: 3, x: [2, 1] } });
    const second = canonicalJson({ a: { x: [2, 1], y: 3 }, "😀": 2, z: 1 });
    expect(first).toBe('{"a":{"x":[2,1],"y":3},"z":1,"😀":2}');
    expect(second).toBe(first);
  });

  it("rejects non-JSON-safe, cyclic, sparse and non-plain values", () => {
    const cyclic = {};
    cyclic.self = cyclic;
    const sparse = [];
    sparse.length = 1;
    for (const value of [
      undefined,
      () => {},
      Symbol("x"),
      1n,
      Number.NaN,
      Infinity,
      cyclic,
      sparse,
      new Date(0),
    ]) {
      expect(() => canonicalJson(value)).toThrow(TypeError);
    }
  });

  it("passes when every required physical read capability is available", () => {
    const result = evaluateExecutionCapabilities({
      available: [...REQUIRED_I2_CAPABILITIES].reverse(),
      unknown: [],
    });
    expect(result.status).toBe("PASS");
    expect(result.available).toEqual(REQUIRED_I2_CAPABILITIES);
    expect(result.missing).toEqual([]);
    expect(result.unknown).toEqual([]);
    expect(result.capabilityFingerprint).toMatch(/^[0-9A-F]{64}$/u);
  });

  it("blocks a missing required capability deterministically", () => {
    const available = REQUIRED_I2_CAPABILITIES.filter(
      (capability) => capability !== "git.objects.read",
    );
    const first = evaluateExecutionCapabilities({ available, unknown: [] });
    const second = evaluateExecutionCapabilities({
      available: [...available].reverse(),
      unknown: [],
    });
    expect(first).toMatchObject({ status: "BLOCKED", missing: ["git.objects.read"] });
    expect(second.capabilityFingerprint).toBe(first.capabilityFingerprint);
  });

  it("blocks an UNKNOWN required capability rather than treating it as absent", () => {
    const available = REQUIRED_I2_CAPABILITIES.filter(
      (capability) => capability !== "git.index.read",
    );
    const result = evaluateExecutionCapabilities({ available, unknown: ["git.index.read"] });
    expect(result).toMatchObject({ status: "BLOCKED", missing: [], unknown: ["git.index.read"] });
  });
});
