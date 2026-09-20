import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  I9_BOUNDED_SCALE_PROFILE,
  deriveScaleProfileIdentity,
  generateBoundedScaleFixture,
  verifyBoundedScaleFixture,
} from "./lib/bounded-scale-fixture.mjs";

const SEED = "09B263CF7081E6C0C2D973BB33F2E0E7DBCFB880C93638FA2B77F38B467C19E6";
const CHANGED_SEED = "19B263CF7081E6C0C2D973BB33F2E0E7DBCFB880C93638FA2B77F38B467C19E6";

describe("CIC I9 bounded deterministic scale fixture", () => {
  it("I9-S12 generates byte-identical fixture and identity for the reviewed profile and seed", () => {
    const first = generateBoundedScaleFixture({ profile: I9_BOUNDED_SCALE_PROFILE, seed: SEED });
    const second = generateBoundedScaleFixture({ profile: I9_BOUNDED_SCALE_PROFILE, seed: SEED });
    expect(canonicalJson(second)).toBe(canonicalJson(first));
    expect(second.fixtureIdentity).toBe(first.fixtureIdentity);
    expect(second.contentSha256).toBe(first.contentSha256);
  });

  it("I9-S13 changes fixture and content identities when the seed changes", () => {
    const accepted = generateBoundedScaleFixture({
      profile: I9_BOUNDED_SCALE_PROFILE,
      seed: SEED,
    });
    const changed = generateBoundedScaleFixture({
      profile: I9_BOUNDED_SCALE_PROFILE,
      seed: CHANGED_SEED,
    });
    expect(changed.fixtureIdentity).not.toBe(accepted.fixtureIdentity);
    expect(changed.contentSha256).not.toBe(accepted.contentSha256);
  });

  it("I9-S14 changes profile identity but rejects an unreviewed generation profile", () => {
    const changedProfile = { ...I9_BOUNDED_SCALE_PROFILE, files: 127 };
    expect(deriveScaleProfileIdentity(changedProfile)).not.toBe(
      deriveScaleProfileIdentity(I9_BOUNDED_SCALE_PROFILE),
    );
    expect(() => generateBoundedScaleFixture({ profile: changedProfile, seed: SEED })).toThrow(
      expect.objectContaining({ code: "SCALE_PROFILE_INVALID" }),
    );
  });

  it("I9-S15 rejects counts, depth, and byte ceilings above the reviewed profile", () => {
    for (const changedProfile of [
      { ...I9_BOUNDED_SCALE_PROFILE, files: 129 },
      { ...I9_BOUNDED_SCALE_PROFILE, semanticEntities: 1025 },
      { ...I9_BOUNDED_SCALE_PROFILE, dependencyEdges: 2049 },
      { ...I9_BOUNDED_SCALE_PROFILE, scenarios: 257 },
      { ...I9_BOUNDED_SCALE_PROFILE, maxDepth: 9 },
      { ...I9_BOUNDED_SCALE_PROFILE, maxSerializedBytes: 8_388_609 },
    ]) {
      expect(() => deriveScaleProfileIdentity(changedProfile)).toThrow(
        expect.objectContaining({ code: "SCALE_RESOURCE_CEILING_EXCEEDED" }),
      );
    }
  });

  it("I9-S16 rejects recursive, unknown, and malformed generator inputs", () => {
    expect(() =>
      generateBoundedScaleFixture({
        profile: I9_BOUNDED_SCALE_PROFILE,
        seed: SEED,
        children: [{ children: [] }],
      }),
    ).toThrow(expect.objectContaining({ code: "SCALE_PROFILE_INVALID" }));
    expect(() =>
      generateBoundedScaleFixture({ profile: I9_BOUNDED_SCALE_PROFILE, seed: "recursive" }),
    ).toThrow(expect.objectContaining({ code: "SCALE_PROFILE_INVALID" }));
  });

  it("I9-S17 enforces exact corpus counts, layered DAG termination, and the 8 MiB ceiling", () => {
    const fixture = generateBoundedScaleFixture({
      profile: I9_BOUNDED_SCALE_PROFILE,
      seed: SEED,
    });
    const verified = verifyBoundedScaleFixture(fixture);
    expect(verified).toMatchObject({
      status: "PASS",
      counts: {
        files: 128,
        semanticEntities: 1024,
        dependencyEdges: 2048,
        scenarios: 256,
        maxDepth: 8,
      },
    });
    expect(verified.serializedBytes).toBeLessThanOrEqual(8_388_608);
    expect(
      fixture.relations.every(({ sourceDepth, targetDepth }) => targetDepth < sourceDepth),
    ).toBe(true);
  });
});
