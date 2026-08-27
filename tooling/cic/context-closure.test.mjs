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
    const result = evaluateContextClosure({
      dimensions,
      providerResults: [
        {
          state: "ABSENT_PROVEN",
          providerIdentity: witness().providerIdentity,
          absenceWitness: witness(),
          findings: [],
        },
      ],
    });
    expect(validateNegativeKnowledgeWitness(witness())).toBe(true);
    expect(result.status).toBe("COMPLETE");
  });

  it("blocks an explicit empty required-dimension floor override", () => {
    const result = evaluateContextClosure({
      dimensions: completeDimensions(),
      requiredDimensions: [],
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({ code: "REQUIRED_DIMENSION_FLOOR_VIOLATION" });
    expect(result.requiredDimensions).toEqual(REQUIRED_CONTEXT_DIMENSIONS);
  });

  it("blocks a partial required-dimension floor override", () => {
    const result = evaluateContextClosure({
      dimensions: completeDimensions(),
      requiredDimensions: REQUIRED_CONTEXT_DIMENSIONS.slice(1),
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map(({ code }) => code)).toContain("REQUIRED_DIMENSION_FLOOR_VIOLATION");
  });

  it("accepts the exact required-dimension floor", () => {
    const result = evaluateContextClosure({
      dimensions: completeDimensions(),
      requiredDimensions: REQUIRED_CONTEXT_DIMENSIONS,
    });
    expect(result.status).toBe("COMPLETE");
  });

  it("preserves the floor and additionally requires a caller-supplied dimension", () => {
    const extra = "authorized-extra-context";
    const accepted = evaluateContextClosure({
      dimensions: [
        ...completeDimensions(),
        { dimension: extra, state: "PRESENT", materialIdentities: [hash(extra)] },
      ],
      requiredDimensions: [...REQUIRED_CONTEXT_DIMENSIONS, extra],
    });
    const missingExtra = evaluateContextClosure({
      dimensions: completeDimensions(),
      requiredDimensions: [...REQUIRED_CONTEXT_DIMENSIONS, extra],
    });
    expect(accepted.status).toBe("COMPLETE");
    expect(accepted.requiredDimensions).toContain(extra);
    expect(missingExtra.findings).toContainEqual({
      code: "REQUIRED_DIMENSION_MISSING",
      dimension: extra,
    });
  });

  it("blocks a dimension witness that differs from its provider result witness", () => {
    const dimensions = completeDimensions();
    dimensions[0] = {
      dimension: dimensions[0].dimension,
      state: "ABSENT_PROVEN",
      absenceWitness: witness(),
    };
    const result = evaluateContextClosure({
      dimensions,
      providerResults: [
        {
          state: "ABSENT_PROVEN",
          providerIdentity: witness().providerIdentity,
          absenceWitness: witness({ indexIdentity: hash("other-index") }),
          findings: [],
        },
      ],
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.findings).toContainEqual({
      code: "NEGATIVE_KNOWLEDGE_UNDER_PROVEN",
      dimension: dimensions[0].dimension,
    });
  });

  it("rejects witness extras and embedded non-portable not-applicable reasons", () => {
    expect(validateNegativeKnowledgeWitness(witness({ token: "do-not-serialize" }))).toBe(false);
    for (const reason of [
      "diagnostic at /root/private",
      "diagnostic at /mnt/private",
      "Authorization: Bearer do-not-serialize",
      "client_secret=do-not-serialize",
    ]) {
      const dimensions = completeDimensions();
      dimensions[0] = {
        dimension: dimensions[0].dimension,
        state: "NOT_APPLICABLE_WITH_REASON",
        reason,
      };
      const result = evaluateContextClosure({ dimensions });
      expect(result.status).toBe("BLOCKED");
      expect(JSON.stringify(result)).not.toContain("do-not-serialize");
      expect(JSON.stringify(result)).not.toContain("/root/private");
    }
  });

  it("blocks delimiter-bypass local paths and whitespace secrets in N/A reasons", () => {
    for (const reason of [
      "failed-at-C:\\Users\\owner\\repo\\file.txt",
      "failed-/home/owner/repo/file",
      "api key = injected",
      "client secret = injected",
    ]) {
      const dimensions = completeDimensions();
      dimensions[0] = {
        dimension: dimensions[0].dimension,
        state: "NOT_APPLICABLE_WITH_REASON",
        reason,
      };
      const result = evaluateContextClosure({ dimensions });
      expect(result.status).toBe("BLOCKED");
      expect(result.findings).toContainEqual({
        code: "NOT_APPLICABLE_REASON_INVALID",
        dimension: dimensions[0].dimension,
      });
      expect(JSON.stringify(result)).not.toContain(reason);
    }
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
