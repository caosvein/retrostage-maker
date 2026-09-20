import { Buffer } from "node:buffer";

import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import { semanticIdentity } from "./state-domain.mjs";

const FIXTURE_SCHEMA = "CIC_BOUNDED_SCALE_FIXTURE_V1";
const PROFILE_SCHEMA = "CIC_SCALE_PROFILE_V1";
const GENERATOR_ID = "CIC_SHA256_COUNTER_GENERATOR_V1";
const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const PROFILE_KEYS = Object.freeze([
  "dependencyEdges",
  "files",
  "generatorId",
  "maxDepth",
  "maxLocatorBytes",
  "maxSerializedBytes",
  "profileId",
  "scenarios",
  "schemaVersion",
  "semanticEntities",
  "version",
]);
const FIXTURE_KEYS = Object.freeze([
  "contentSha256",
  "counts",
  "files",
  "fixtureIdentity",
  "generatorId",
  "profile",
  "profileIdentity",
  "relations",
  "scenarios",
  "schemaVersion",
  "seed",
  "semanticEntities",
]);

export const I9_BOUNDED_SCALE_PROFILE = Object.freeze({
  schemaVersion: PROFILE_SCHEMA,
  profileId: "CIC_I9_LATE_ROADMAP_V1",
  version: 1,
  generatorId: GENERATOR_ID,
  files: 128,
  semanticEntities: 1024,
  dependencyEdges: 2048,
  scenarios: 256,
  maxDepth: 8,
  maxSerializedBytes: 8_388_608,
  maxLocatorBytes: 1024,
});

function scaleError(code) {
  return Object.assign(new Error(code), { code });
}

function fail(code) {
  throw scaleError(code);
}

function exactKeys(value, expected, code = "SCALE_PROFILE_INVALID") {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).sort().join("\0") !== [...expected].sort().join("\0")
  ) {
    fail(code);
  }
}

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function normalizeProfile(profile) {
  exactKeys(profile, PROFILE_KEYS);
  if (
    profile.schemaVersion !== PROFILE_SCHEMA ||
    profile.generatorId !== GENERATOR_ID ||
    typeof profile.profileId !== "string" ||
    !/^[A-Z0-9_]{1,64}$/u.test(profile.profileId) ||
    !positiveInteger(profile.version) ||
    !positiveInteger(profile.files) ||
    !positiveInteger(profile.semanticEntities) ||
    !positiveInteger(profile.dependencyEdges) ||
    !positiveInteger(profile.scenarios) ||
    !positiveInteger(profile.maxDepth) ||
    !positiveInteger(profile.maxSerializedBytes) ||
    !positiveInteger(profile.maxLocatorBytes)
  ) {
    fail("SCALE_PROFILE_INVALID");
  }
  if (
    profile.files > I9_BOUNDED_SCALE_PROFILE.files ||
    profile.semanticEntities > I9_BOUNDED_SCALE_PROFILE.semanticEntities ||
    profile.dependencyEdges > I9_BOUNDED_SCALE_PROFILE.dependencyEdges ||
    profile.scenarios > I9_BOUNDED_SCALE_PROFILE.scenarios ||
    profile.maxDepth > I9_BOUNDED_SCALE_PROFILE.maxDepth ||
    profile.maxSerializedBytes > I9_BOUNDED_SCALE_PROFILE.maxSerializedBytes ||
    profile.maxLocatorBytes > I9_BOUNDED_SCALE_PROFILE.maxLocatorBytes
  ) {
    fail("SCALE_RESOURCE_CEILING_EXCEEDED");
  }
  return { ...profile };
}

export function deriveScaleProfileIdentity(profile) {
  return semanticIdentity("CIC-I9-SCALE-PROFILE-V1", normalizeProfile(profile));
}

function counterIdentity(profileIdentity, seed, kind, counter) {
  return sha256Hex(`${GENERATOR_ID}\n${profileIdentity}\n${seed}\n${kind}\n${counter}\n`);
}

function locatorFor(index, maximumBytes) {
  const locator = `synthetic/files/file-${String(index).padStart(3, "0")}.ctx`;
  if (Buffer.byteLength(locator, "utf8") > maximumBytes) {
    fail("SCALE_RESOURCE_CEILING_EXCEEDED");
  }
  return locator;
}

function buildFixture(profile, seed) {
  const profileIdentity = deriveScaleProfileIdentity(profile);
  const files = [];
  const semanticEntities = [];
  const relations = [];
  const scenarios = [];

  for (let index = 0; index < profile.files; index += 1) {
    files.push({
      fileIdentity: counterIdentity(profileIdentity, seed, "FILE", index),
      locator: locatorFor(index, profile.maxLocatorBytes),
    });
  }
  for (let index = 0; index < profile.semanticEntities; index += 1) {
    semanticEntities.push({
      entityIdentity: counterIdentity(profileIdentity, seed, "ENTITY", index),
      fileIdentity: files[index % files.length].fileIdentity,
      depth: index % profile.maxDepth,
    });
  }
  const entitiesPerLayer = Math.floor(profile.semanticEntities / profile.maxDepth);
  if (entitiesPerLayer < 1) fail("SCALE_PROFILE_INVALID");
  for (let index = 0; index < profile.dependencyEdges; index += 1) {
    const sourceDepth = 1 + (index % (profile.maxDepth - 1));
    const targetDepth =
      Number.parseInt(counterIdentity(profileIdentity, seed, "EDGE-DEPTH", index).slice(0, 8), 16) %
      sourceDepth;
    const sourceSlot = Math.floor(index / (profile.maxDepth - 1)) % entitiesPerLayer;
    const targetSlot =
      Number.parseInt(
        counterIdentity(profileIdentity, seed, "EDGE-TARGET", index).slice(0, 8),
        16,
      ) % entitiesPerLayer;
    const source = semanticEntities[sourceSlot * profile.maxDepth + sourceDepth];
    const target = semanticEntities[targetSlot * profile.maxDepth + targetDepth];
    relations.push({
      relationIdentity: counterIdentity(profileIdentity, seed, "RELATION", index),
      sourceEntityIdentity: source.entityIdentity,
      targetEntityIdentity: target.entityIdentity,
      sourceDepth,
      targetDepth,
    });
  }
  for (let index = 0; index < profile.scenarios; index += 1) {
    scenarios.push({
      scenarioIdentity: counterIdentity(profileIdentity, seed, "SCENARIO", index),
      fileIdentity: files[index % files.length].fileIdentity,
      entityIdentity: semanticEntities[(index * 4) % semanticEntities.length].entityIdentity,
      oracleIdentity: counterIdentity(profileIdentity, seed, "ORACLE", index),
    });
  }
  const content = { files, semanticEntities, relations, scenarios };
  const contentSha256 = sha256Hex(`${canonicalJson(content)}\n`);
  const body = {
    schemaVersion: FIXTURE_SCHEMA,
    generatorId: GENERATOR_ID,
    profile,
    profileIdentity,
    seed,
    counts: {
      files: files.length,
      semanticEntities: semanticEntities.length,
      dependencyEdges: relations.length,
      scenarios: scenarios.length,
      maxDepth: Math.max(...semanticEntities.map(({ depth }) => depth)) + 1,
    },
    ...content,
    contentSha256,
  };
  return {
    ...body,
    fixtureIdentity: semanticIdentity("CIC-I9-BOUNDED-SCALE-FIXTURE-V1", body),
  };
}

function assertFrozenProfile(profile) {
  if (canonicalJson(profile) !== canonicalJson(I9_BOUNDED_SCALE_PROFILE)) {
    fail("SCALE_PROFILE_INVALID");
  }
}

function assertSeed(seed) {
  if (typeof seed !== "string" || !IDENTITY_PATTERN.test(seed)) {
    fail("SCALE_PROFILE_INVALID");
  }
}

export function generateBoundedScaleFixture(input) {
  exactKeys(input, ["profile", "seed"]);
  const profile = normalizeProfile(input.profile);
  assertFrozenProfile(profile);
  assertSeed(input.seed);
  const fixture = buildFixture(profile, input.seed);
  const serializedBytes = Buffer.byteLength(`${canonicalJson(fixture)}\n`, "utf8");
  if (serializedBytes > profile.maxSerializedBytes) {
    fail("SCALE_RESOURCE_CEILING_EXCEEDED");
  }
  return fixture;
}

export function verifyBoundedScaleFixture(fixture) {
  exactKeys(fixture, FIXTURE_KEYS, "SCALE_FIXTURE_INVALID");
  assertSeed(fixture.seed);
  const expected = buildFixture(normalizeProfile(fixture.profile), fixture.seed);
  assertFrozenProfile(expected.profile);
  if (canonicalJson(fixture) !== canonicalJson(expected)) {
    fail("SCALE_FIXTURE_INVALID");
  }
  if (
    new Set(fixture.files.map(({ fileIdentity }) => fileIdentity)).size !== fixture.files.length ||
    new Set(fixture.semanticEntities.map(({ entityIdentity }) => entityIdentity)).size !==
      fixture.semanticEntities.length ||
    new Set(fixture.relations.map(({ relationIdentity }) => relationIdentity)).size !==
      fixture.relations.length ||
    new Set(fixture.scenarios.map(({ scenarioIdentity }) => scenarioIdentity)).size !==
      fixture.scenarios.length ||
    fixture.relations.some(({ sourceDepth, targetDepth }) => targetDepth >= sourceDepth)
  ) {
    fail("SCALE_FIXTURE_INVALID");
  }
  const serializedBytes = Buffer.byteLength(`${canonicalJson(fixture)}\n`, "utf8");
  if (serializedBytes > fixture.profile.maxSerializedBytes) {
    fail("SCALE_RESOURCE_CEILING_EXCEEDED");
  }
  return {
    schemaVersion: "CIC_BOUNDED_SCALE_VERIFICATION_V1",
    status: "PASS",
    profileIdentity: fixture.profileIdentity,
    fixtureIdentity: fixture.fixtureIdentity,
    contentSha256: fixture.contentSha256,
    counts: fixture.counts,
    serializedBytes,
  };
}
