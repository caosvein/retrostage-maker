import { describe, expect, it } from "vitest";

import {
  CONTEXT_DIMENSION_STATES,
  evaluateContextClosure,
  REQUIRED_CONTEXT_DIMENSIONS,
  validateNegativeKnowledgeWitness,
} from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const hash = (value) => sha256Hex(`test:${value}`);

function completeDimensions() {
  return REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
    dimension,
    state: "PRESENT",
    materialIdentities: [hash(dimension)],
  }));
}

function witness(overrides = {}) {
  return {
    result: "ABSENT_PROVEN",
    providerIdentity: hash("provider"),
    indexIdentity: hash("index"),
    queryClass: "ipc-command-registry",
    scopeIdentity: hash("scope"),
    generationIdentity: hash("generation"),
    ...overrides,
  };
}

describe("CIC-I3 context closure", () => {
  it("freezes the exact closure dimension state vocabulary", () => {
    expect(CONTEXT_DIMENSION_STATES).toEqual([
      "PRESENT",
      "ABSENT_PROVEN",
      "UNKNOWN",
      "NOT_APPLICABLE_WITH_REASON",
    ]);
  });

  it("reports COMPLETE only when every required dimension is covered", () => {
    const result = evaluateContextClosure({ dimensions: completeDimensions() });
    expect(result.status).toBe("COMPLETE");
    expect(result.findings).toEqual([]);
    expect(result.dimensions).toHaveLength(REQUIRED_CONTEXT_DIMENSIONS.length);
  });

  it("blocks a missing required dimension", () => {
    const result = evaluateContextClosure({ dimensions: completeDimensions().slice(1) });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({
      code: "REQUIRED_DIMENSION_MISSING",
      dimension: REQUIRED_CONTEXT_DIMENSIONS[0],
    });
  });

  it("never accepts UNKNOWN as proven absence", () => {
    const dimensions = completeDimensions();
    dimensions[0] = { dimension: dimensions[0].dimension, state: "UNKNOWN" };
    const result = evaluateContextClosure({ dimensions });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({
      code: "REQUIRED_DIMENSION_UNKNOWN",
      dimension: dimensions[0].dimension,
    });
  });

  it("accepts only a bounded exact negative-knowledge witness", () => {
    const dimensions = completeDimensions();
    dimensions[0] = {
      dimension: dimensions[0].dimension,
      state: "ABSENT_PROVEN",
      absenceWitness: witness(),
    };
    const result = evaluateContextClosure({ dimensions });
    expect(validateNegativeKnowledgeWitness(witness())).toBe(true);
    expect(result.status).toBe("COMPLETE");
  });

  it("blocks unbounded or unresolved absence", () => {
    expect(validateNegativeKnowledgeWitness(witness({ scopeIdentity: null }))).toBe(false);
    const dimensions = completeDimensions();
    dimensions[0] = {
      dimension: dimensions[0].dimension,
      state: "ABSENT_PROVEN",
      absenceWitness: witness({ indexIdentity: "unknown" }),
    };
    const result = evaluateContextClosure({ dimensions });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({
      code: "NEGATIVE_KNOWLEDGE_UNDER_PROVEN",
      dimension: dimensions[0].dimension,
    });
  });

  it("permits bypass only as NOT_APPLICABLE_WITH_REASON with a nonempty safe reason", () => {
    const valid = completeDimensions();
    valid[0] = {
      dimension: valid[0].dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      reason: "The bounded task changes no persisted data.",
    };
    const accepted = evaluateContextClosure({ dimensions: valid });
    expect(accepted.status).toBe("COMPLETE");
    expect(accepted.dimensions[0].reasonIdentity).toMatch(/^[0-9A-F]{64}$/u);

    for (const reason of ["", "   ", "token=do-not-transport", "C:\\Users\\owner\\note"]) {
      const invalid = completeDimensions();
      invalid[0] = {
        dimension: invalid[0].dimension,
        state: "NOT_APPLICABLE_WITH_REASON",
        reason,
      };
      expect(evaluateContextClosure({ dimensions: invalid }).status).toBe("BLOCKED");
    }
  });

  it("blocks missing material identity and I1/I2 prerequisite failure", () => {
    const dimensions = completeDimensions();
    dimensions[0] = {
      dimension: dimensions[0].dimension,
      state: "PRESENT",
      materialIdentities: [],
    };
    const result = evaluateContextClosure({ dimensions, prerequisiteStatus: "BLOCKED" });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toEqual(
      expect.arrayContaining(["I1_I2_PREREQUISITE_BLOCKED", "REQUIRED_MATERIAL_MISSING"]),
    );
  });

  it("blocks UNKNOWN and failed provider outcomes", () => {
    const result = evaluateContextClosure({
      dimensions: completeDimensions(),
      providerResults: [{ state: "UNKNOWN", findings: [{ code: "PROVIDER_OBSERVATION_FAILED" }] }],
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toEqual(
      expect.arrayContaining(["PROVIDER_RESULT_UNKNOWN", "PROVIDER_OBSERVATION_FAILED"]),
    );
  });

  it("is byte-order deterministic and blocks duplicate dimension identity", () => {
    const dimensions = completeDimensions();
    const first = evaluateContextClosure({ dimensions });
    const second = evaluateContextClosure({ dimensions: [...dimensions].reverse() });
    expect(first).toEqual(second);

    const duplicate = evaluateContextClosure({ dimensions: [...dimensions, dimensions[0]] });
    expect(duplicate.status).toBe("BLOCKED");
    expect(duplicate.findings.map(({ code }) => code)).toContain("CONTEXT_IDENTITY_COLLISION");
  });
});
