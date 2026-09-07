import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  COMMIT_AUTHORIZATION_SCHEMA,
  HOSTED_CI_EVIDENCE_SCHEMA,
  INDEPENDENT_REVIEW_SCHEMA,
  PACKAGE_MANIFEST_SCHEMA,
  PUBLICATION_SNAPSHOT_VERIFICATION_SCHEMA,
  PUSH_AUTHORIZATION_SCHEMA,
  SOURCE_PROMOTION_AUTHORIZATION_SCHEMA,
  createHostedCiEvidence,
  createHostedCiHistory,
  definePackageManifest,
  evaluatePublicationStates,
  publicationFileInventoryIdentity,
  verifyHostedCiEvidence,
  verifyPackageManifest,
  verifyPublicationSnapshot,
} from "./lib/publication-gates.mjs";

const HASH_A = "A".repeat(64);
const HASH_B = "B".repeat(64);
const HASH_C = "C".repeat(64);
const HASH_D = "D".repeat(64);
const HASH_E = "E".repeat(64);
const HASH_F = "F".repeat(64);
const HASH_1 = "1".repeat(64);
const HASH_2 = "2".repeat(64);
const HASH_3 = "3".repeat(64);
const GIT_A = "a".repeat(40);
const GIT_B = "b".repeat(40);
const GIT_C = "c".repeat(40);
const GIT_D = "d".repeat(40);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectCode(callback, code) {
  try {
    callback();
  } catch (error) {
    expect(error).toMatchObject({ code });
    return;
  }
  throw new Error(`expected ${code}`);
}

function externalArtifact(schemaVersion, body) {
  return {
    schemaVersion,
    ...body,
    artifactIdentity: sha256Hex(`${schemaVersion}\n${canonicalJson(body)}\n`),
  };
}

function candidateFiles() {
  return [
    {
      path: "tooling/cic/lib/publication-gates.mjs",
      bytes: 1200,
      sha256: HASH_A,
      gitBlob: GIT_A,
      mode: "100644",
    },
    {
      path: "tooling/cic/publication-gates.test.mjs",
      bytes: 2400,
      sha256: HASH_B,
      gitBlob: GIT_B,
      mode: "100644",
    },
  ];
}

function hostedInput(overrides = {}) {
  return {
    provider: "GITHUB_ACTIONS",
    repository: "retrostage/retrostage-maker",
    headSha: GIT_C,
    workflow: {
      identity: HASH_C,
      path: ".github/workflows/ci.yml",
    },
    event: "push",
    ref: "refs/heads/main",
    runId: "34092415407",
    attempt: 1,
    jobId: "101650000001",
    status: "COMPLETED",
    conclusion: "SUCCESS",
    retainedEvidence: {
      required: true,
      identity: HASH_D,
    },
    ...overrides,
  };
}

function hostedRequirements(evidence) {
  return {
    provider: evidence.provider,
    repository: evidence.repository,
    headSha: evidence.headSha,
    workflow: clone(evidence.workflow),
    event: evidence.event,
    ref: evidence.ref,
    runId: evidence.runId,
    attempt: evidence.attempt,
    jobId: evidence.jobId,
    status: evidence.status,
    conclusion: evidence.conclusion,
    retainedEvidence: clone(evidence.retainedEvidence),
    evidenceIdentity: evidence.evidenceIdentity,
  };
}

function snapshotFixture() {
  const hostedCi = createHostedCiEvidence(hostedInput());
  const files = candidateFiles();
  return {
    requirements: {
      candidateIdentity: HASH_E,
      validatedSnapshotIdentity: HASH_F,
      files: clone(files),
      stagedTree: GIT_B,
      commitSha: GIT_C,
      commitTree: GIT_B,
      commitParent: GIT_A,
      remoteRef: "refs/heads/main",
      hostedCi: hostedRequirements(hostedCi),
    },
    reviewedCandidate: {
      candidateIdentity: HASH_E,
      validatedSnapshotIdentity: HASH_F,
      reviewIdentity: HASH_1,
      files: clone(files).reverse(),
    },
    validatedSnapshot: {
      candidateIdentity: HASH_E,
      snapshotIdentity: HASH_F,
      files: clone(files),
    },
    staged: {
      candidateIdentity: HASH_E,
      tree: GIT_B,
      files: clone(files),
    },
    commit: {
      candidateIdentity: HASH_E,
      sha: GIT_C,
      tree: GIT_B,
      parent: GIT_A,
      files: clone(files),
    },
    remote: {
      ref: "refs/heads/main",
      sha: GIT_C,
    },
    hostedCi,
  };
}

function stateFixture() {
  const hostedCi = createHostedCiEvidence(hostedInput());
  const commitAuthorization = externalArtifact(COMMIT_AUTHORIZATION_SCHEMA, {
    candidateIdentity: HASH_E,
    decision: "AUTHORIZED",
    current: true,
  });
  const pushAuthorization = externalArtifact(PUSH_AUTHORIZATION_SCHEMA, {
    commitSha: GIT_C,
    decision: "AUTHORIZED",
    current: true,
  });
  const independentReview = externalArtifact(INDEPENDENT_REVIEW_SCHEMA, {
    candidateIdentity: HASH_E,
    commitSha: GIT_C,
    hostedEvidenceIdentity: hostedCi.evidenceIdentity,
    decision: "ACCEPTED",
    current: true,
  });
  const sourcePromotionAuthorization = externalArtifact(SOURCE_PROMOTION_AUTHORIZATION_SCHEMA, {
    reviewIdentity: independentReview.artifactIdentity,
    sourceGeneration: HASH_2,
    decision: "AUTHORIZED",
    current: true,
  });
  return {
    sourceGeneration: HASH_2,
    authorityExpectations: {
      commitAuthorizationIdentity: commitAuthorization.artifactIdentity,
      pushAuthorizationIdentity: pushAuthorization.artifactIdentity,
      hostedCiEvidenceIdentity: hostedCi.evidenceIdentity,
      independentReviewIdentity: independentReview.artifactIdentity,
      sourcePromotionAuthorizationIdentity: sourcePromotionAuthorization.artifactIdentity,
    },
    implementation: {
      candidateIdentity: HASH_E,
      evidenceIdentity: HASH_3,
    },
    commitAuthorization,
    commit: {
      candidateIdentity: HASH_E,
      sha: GIT_C,
      tree: GIT_B,
    },
    pushAuthorization,
    remote: {
      ref: "refs/heads/main",
      sha: GIT_C,
    },
    hostedCi,
    independentReview,
    sourcePromotionAuthorization,
    commandResults: [],
    narrative: null,
  };
}

function emptyStateFixture() {
  const fixture = stateFixture();
  fixture.authorityExpectations = {
    commitAuthorizationIdentity: null,
    pushAuthorizationIdentity: null,
    hostedCiEvidenceIdentity: null,
    independentReviewIdentity: null,
    sourcePromotionAuthorizationIdentity: null,
  };
  fixture.implementation = null;
  fixture.commitAuthorization = null;
  fixture.commit = null;
  fixture.pushAuthorization = null;
  fixture.remote = null;
  fixture.hostedCi = null;
  fixture.independentReview = null;
  fixture.sourcePromotionAuthorization = null;
  return fixture;
}

function packageFixture() {
  const declarations = [
    {
      path: "review-files/candidate.mjs",
      role: "CANDIDATE_POSTIMAGE",
      bytes: 1200,
      sha256: HASH_A,
      classification: "REQUIRED",
    },
    {
      path: "evidence/notes.md",
      role: "ADVISORY_NOTES",
      bytes: 400,
      sha256: HASH_B,
      classification: "OPTIONAL",
    },
  ];
  const manifest = definePackageManifest({
    manifestPath: "REVIEW-MANIFEST.json",
    packageRole: "REVIEW_BUNDLE",
    exactInventory: true,
    companions: declarations,
  });
  const observed = declarations.map(({ classification: _classification, ...entry }) => entry);
  return { manifest, observed };
}

describe("publication state separation", () => {
  it("keeps IMPLEMENTED distinct from COMMIT AUTHORIZED", () => {
    const fixture = emptyStateFixture();
    fixture.implementation = {
      candidateIdentity: HASH_E,
      evidenceIdentity: HASH_3,
    };
    const result = evaluatePublicationStates(fixture);
    expect(result.states.IMPLEMENTED).toBe("SATISFIED");
    expect(result.states.COMMIT_AUTHORIZED).toBe("BLOCKED");
  });

  it("keeps COMMITTED distinct from PUSH AUTHORIZED", () => {
    const fixture = emptyStateFixture();
    fixture.implementation = {
      candidateIdentity: HASH_E,
      evidenceIdentity: HASH_3,
    };
    fixture.commit = {
      candidateIdentity: HASH_E,
      sha: GIT_C,
      tree: GIT_B,
    };
    const result = evaluatePublicationStates(fixture);
    expect(result.states.COMMITTED).toBe("SATISFIED");
    expect(result.states.PUSH_AUTHORIZED).toBe("BLOCKED");
  });

  it("keeps PUSHED distinct from HOSTED CI ACCEPTED", () => {
    const fixture = emptyStateFixture();
    fixture.implementation = {
      candidateIdentity: HASH_E,
      evidenceIdentity: HASH_3,
    };
    fixture.commit = {
      candidateIdentity: HASH_E,
      sha: GIT_C,
      tree: GIT_B,
    };
    fixture.remote = { ref: "refs/heads/main", sha: GIT_C };
    const result = evaluatePublicationStates(fixture);
    expect(result.states.PUSHED).toBe("SATISFIED");
    expect(result.states.HOSTED_CI_ACCEPTED).toBe("BLOCKED");
  });

  it("keeps HOSTED CI ACCEPTED distinct from REVIEW ACCEPTED", () => {
    const fixture = stateFixture();
    fixture.independentReview = null;
    fixture.sourcePromotionAuthorization = null;
    fixture.authorityExpectations.independentReviewIdentity = null;
    fixture.authorityExpectations.sourcePromotionAuthorizationIdentity = null;
    const result = evaluatePublicationStates(fixture);
    expect(result.states.HOSTED_CI_ACCEPTED).toBe("SATISFIED");
    expect(result.states.REVIEW_ACCEPTED).toBe("BLOCKED");
  });

  it("keeps REVIEW ACCEPTED distinct from SOURCE PROMOTION AUTHORIZED", () => {
    const fixture = stateFixture();
    fixture.sourcePromotionAuthorization = null;
    fixture.authorityExpectations.sourcePromotionAuthorizationIdentity = null;
    const result = evaluatePublicationStates(fixture);
    expect(result.states.REVIEW_ACCEPTED).toBe("SATISFIED");
    expect(result.states.SOURCE_PROMOTION_AUTHORIZED).toBe("BLOCKED");
  });

  it("does not treat command success or narrative as authority", () => {
    const fixture = emptyStateFixture();
    fixture.commandResults = [
      { command: "git commit", success: true },
      { command: "git push origin main", success: true },
    ];
    fixture.narrative =
      "Everything is green, independently accepted, and Source promotion is authorized.";
    const result = evaluatePublicationStates(fixture);
    expect(Object.values(result.states)).toEqual([
      "BLOCKED",
      "BLOCKED",
      "BLOCKED",
      "BLOCKED",
      "BLOCKED",
      "BLOCKED",
      "BLOCKED",
      "BLOCKED",
    ]);
    expect(result.ignoredAdvisoryMetadata).toEqual({
      commandResultCount: 2,
      narrativePresent: true,
    });
  });

  it("does not accept a self-sealed owner artifact without its external expected identity", () => {
    const fixture = stateFixture();
    fixture.authorityExpectations.sourcePromotionAuthorizationIdentity = null;
    const result = evaluatePublicationStates(fixture);
    expect(result.states.REVIEW_ACCEPTED).toBe("SATISFIED");
    expect(result.states.SOURCE_PROMOTION_AUTHORIZED).toBe("BLOCKED");
  });

  it("accepts only the exact externally expected durable owner authorization", () => {
    const result = evaluatePublicationStates(stateFixture());
    expect(Object.values(result.states)).toEqual([
      "SATISFIED",
      "SATISFIED",
      "SATISFIED",
      "SATISFIED",
      "SATISFIED",
      "SATISFIED",
      "SATISFIED",
      "SATISFIED",
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.states)).toBe(true);
  });

  it("is deterministic for equivalent reordered input objects", () => {
    const first = stateFixture();
    const second = clone(first);
    second.commandResults = [...second.commandResults].reverse();
    expect(evaluatePublicationStates(first).evaluationIdentity).toBe(
      evaluatePublicationStates(second).evaluationIdentity,
    );
  });
});

describe("H-89 publication snapshot binding", () => {
  it("verifies the exact reviewed-to-hosted publication chain", () => {
    const fixture = snapshotFixture();
    const result = verifyPublicationSnapshot(fixture);
    expect(result).toMatchObject({
      schemaVersion: PUBLICATION_SNAPSHOT_VERIFICATION_SCHEMA,
      disposition: "VERIFIED",
      candidateIdentity: HASH_E,
      commitSha: GIT_C,
      stagedTree: GIT_B,
      hostedCiEvidenceIdentity: fixture.hostedCi.evidenceIdentity,
      authority: "EVIDENCE_ONLY",
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("rejects a staged tree mismatch with the exact public error", () => {
    const fixture = snapshotFixture();
    fixture.staged.tree = GIT_D;
    expectCode(() => verifyPublicationSnapshot(fixture), "PUBLICATION_SNAPSHOT_MISMATCH");
  });

  it("rejects a commit tree mismatch with the exact public error", () => {
    const fixture = snapshotFixture();
    fixture.commit.tree = GIT_D;
    expectCode(() => verifyPublicationSnapshot(fixture), "PUBLICATION_SNAPSHOT_MISMATCH");
  });

  it("rejects a remote ref or SHA mismatch with the exact public error", () => {
    const wrongRef = snapshotFixture();
    wrongRef.remote.ref = "refs/heads/other";
    expectCode(() => verifyPublicationSnapshot(wrongRef), "PUBLICATION_SNAPSHOT_MISMATCH");
    const wrongSha = snapshotFixture();
    wrongSha.remote.sha = GIT_D;
    expectCode(() => verifyPublicationSnapshot(wrongSha), "PUBLICATION_SNAPSHOT_MISMATCH");
  });

  it("rejects green hosted CI for the wrong commit SHA", () => {
    const fixture = snapshotFixture();
    fixture.hostedCi = createHostedCiEvidence(hostedInput({ headSha: GIT_D }));
    fixture.requirements.hostedCi = hostedRequirements(fixture.hostedCi);
    expect(fixture.hostedCi.conclusion).toBe("SUCCESS");
    expectCode(() => verifyPublicationSnapshot(fixture), "PUBLICATION_SNAPSHOT_MISMATCH");
  });

  it("rejects a reviewed file/blob inventory mismatch", () => {
    const fixture = snapshotFixture();
    fixture.reviewedCandidate.files[0].bytes += 1;
    expectCode(() => verifyPublicationSnapshot(fixture), "PUBLICATION_SNAPSHOT_MISMATCH");
  });

  it("rejects validated snapshot and candidate identity drift", () => {
    const snapshotDrift = snapshotFixture();
    snapshotDrift.validatedSnapshot.snapshotIdentity = HASH_3;
    expectCode(() => verifyPublicationSnapshot(snapshotDrift), "PUBLICATION_SNAPSHOT_MISMATCH");
    const candidateDrift = snapshotFixture();
    candidateDrift.commit.candidateIdentity = HASH_3;
    expectCode(() => verifyPublicationSnapshot(candidateDrift), "PUBLICATION_SNAPSHOT_MISMATCH");
  });

  it("derives an order-insensitive exact file inventory identity", () => {
    const files = candidateFiles();
    expect(publicationFileInventoryIdentity(files)).toBe(
      publicationFileInventoryIdentity([...files].reverse()),
    );
  });
});

describe("H-98 hosted CI evidence binding", () => {
  it("verifies every exact hosted CI field", () => {
    const evidence = createHostedCiEvidence(hostedInput());
    expect(evidence.schemaVersion).toBe(HOSTED_CI_EVIDENCE_SCHEMA);
    expect(verifyHostedCiEvidence(evidence, hostedRequirements(evidence))).toMatchObject({
      disposition: "VERIFIED",
      evidenceIdentity: evidence.evidenceIdentity,
      attempt: 1,
      conclusion: "SUCCESS",
    });
  });

  for (const [label, overrides] of [
    ["provider", { provider: "OTHER_PROVIDER" }],
    ["repository", { repository: "retrostage/other" }],
    ["head SHA", { headSha: GIT_D }],
    ["event", { event: "workflow_dispatch" }],
    ["ref", { ref: "refs/heads/other" }],
    ["run ID", { runId: "999" }],
    ["attempt", { attempt: 2 }],
    ["job ID", { jobId: "999" }],
    ["status/conclusion", { conclusion: "FAILURE" }],
    [
      "workflow",
      {
        workflow: {
          identity: HASH_2,
          path: ".github/workflows/other.yml",
        },
      },
    ],
    ["retained evidence identity", { retainedEvidence: { required: true, identity: HASH_2 } }],
  ]) {
    it(`rejects wrong ${label}`, () => {
      const expectedEvidence = createHostedCiEvidence(hostedInput());
      const wrongEvidence = createHostedCiEvidence(hostedInput(overrides));
      expectCode(
        () => verifyHostedCiEvidence(wrongEvidence, hostedRequirements(expectedEvidence)),
        "HOSTED_CI_EVIDENCE_MISMATCH",
      );
    });
  }

  it("does not let attempt 2 satisfy an attempt 1 gate", () => {
    const firstAttempt = createHostedCiEvidence(hostedInput());
    const secondAttempt = createHostedCiEvidence(hostedInput({ attempt: 2 }));
    expectCode(
      () => verifyHostedCiEvidence(secondAttempt, hostedRequirements(firstAttempt)),
      "HOSTED_CI_EVIDENCE_MISMATCH",
    );
  });

  it("retains historical failure separately from later success", () => {
    const failed = createHostedCiEvidence(
      hostedInput({
        runId: "34057353655",
        headSha: GIT_B,
        conclusion: "FAILURE",
        retainedEvidence: { required: true, identity: HASH_1 },
      }),
    );
    const succeeded = createHostedCiEvidence(hostedInput());
    const history = createHostedCiHistory([succeeded, failed]);
    expect(history.records).toHaveLength(2);
    expect(history.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evidenceIdentity: failed.evidenceIdentity,
          conclusion: "FAILURE",
        }),
        expect.objectContaining({
          evidenceIdentity: succeeded.evidenceIdentity,
          conclusion: "SUCCESS",
        }),
      ]),
    );
    expect(failed.evidenceIdentity).not.toBe(succeeded.evidenceIdentity);
    expect(Object.isFrozen(history.records)).toBe(true);
  });
});

describe("H-95 exact non-circular package manifest", () => {
  it("verifies exact required and optional companion facts", () => {
    const { manifest, observed } = packageFixture();
    const result = verifyPackageManifest(manifest, observed);
    expect(result).toMatchObject({
      disposition: "VERIFIED",
      manifestIdentity: manifest.manifestIdentity,
      exactInventory: true,
      declaredCompanionCount: 2,
      observedCompanionCount: 2,
      authority: "EVIDENCE_ONLY",
    });
  });

  it("fails closed when a required companion is missing", () => {
    const { manifest, observed } = packageFixture();
    expectCode(
      () => verifyPackageManifest(manifest, observed.slice(1)),
      "PACKAGE_MANIFEST_REQUIRED_COMPANION_MISSING",
    );
  });

  it("allows a declared optional companion to be absent", () => {
    const { manifest, observed } = packageFixture();
    const result = verifyPackageManifest(manifest, observed.slice(0, 1));
    expect(result.disposition).toBe("VERIFIED");
    expect(result.observedCompanionCount).toBe(1);
  });

  it("rejects an unexpected companion under exact-inventory mode", () => {
    const { manifest, observed } = packageFixture();
    observed.push({
      path: "unexpected.txt",
      role: "UNEXPECTED_EVIDENCE",
      bytes: 1,
      sha256: HASH_C,
    });
    expectCode(
      () => verifyPackageManifest(manifest, observed),
      "PACKAGE_MANIFEST_UNEXPECTED_COMPANION",
    );
  });

  it("rejects duplicate or ambiguous companion path/role declarations", () => {
    const duplicatePath = packageFixture();
    const input = {
      manifestPath: duplicatePath.manifest.manifestPath,
      packageRole: duplicatePath.manifest.packageRole,
      exactInventory: true,
      companions: [
        clone(duplicatePath.manifest.companions[0]),
        {
          ...clone(duplicatePath.manifest.companions[1]),
          path: duplicatePath.manifest.companions[0].path,
        },
      ],
    };
    expectCode(() => definePackageManifest(input), "PACKAGE_MANIFEST_AMBIGUOUS_COMPANION");
  });

  it("rejects duplicate observed companions", () => {
    const { manifest, observed } = packageFixture();
    observed.push(clone(observed[0]));
    expectCode(
      () => verifyPackageManifest(manifest, observed),
      "PACKAGE_MANIFEST_AMBIGUOUS_COMPANION",
    );
  });

  it("rejects wrong bytes or content hash", () => {
    const wrongBytes = packageFixture();
    wrongBytes.observed[0].bytes += 1;
    expectCode(
      () => verifyPackageManifest(wrongBytes.manifest, wrongBytes.observed),
      "PACKAGE_MANIFEST_MISMATCH",
    );
    const wrongHash = packageFixture();
    wrongHash.observed[0].sha256 = HASH_C;
    expectCode(
      () => verifyPackageManifest(wrongHash.manifest, wrongHash.observed),
      "PACKAGE_MANIFEST_MISMATCH",
    );
  });

  it("rejects a wrong companion role", () => {
    const { manifest, observed } = packageFixture();
    observed[0].role = "OTHER_ROLE";
    expectCode(() => verifyPackageManifest(manifest, observed), "PACKAGE_MANIFEST_MISMATCH");
  });

  for (const path of ["../escape.txt", "C:/escape.txt", "folder\\file.txt", "./file.txt"]) {
    it(`rejects non-portable or escaping path ${path}`, () => {
      const { manifest } = packageFixture();
      const input = {
        manifestPath: manifest.manifestPath,
        packageRole: manifest.packageRole,
        exactInventory: true,
        companions: [
          {
            ...clone(manifest.companions[0]),
            path,
          },
        ],
      };
      expectCode(() => definePackageManifest(input), "PACKAGE_MANIFEST_INVALID");
    });
  }

  it("rejects self-authoritative or circular manifest declarations", () => {
    const { manifest } = packageFixture();
    const selfPath = {
      manifestPath: manifest.manifestPath,
      packageRole: manifest.packageRole,
      exactInventory: true,
      companions: [
        {
          path: manifest.manifestPath,
          role: "CANDIDATE_POSTIMAGE",
          bytes: 1,
          sha256: HASH_A,
          classification: "REQUIRED",
        },
      ],
    };
    expectCode(() => definePackageManifest(selfPath), "PACKAGE_MANIFEST_CIRCULAR");
    expectCode(
      () =>
        definePackageManifest({
          ...selfPath,
          packageRole: "PUBLICATION_AUTHORITY",
          companions: packageFixture().manifest.companions.map(clone),
        }),
      "PACKAGE_MANIFEST_CIRCULAR",
    );
  });

  it("derives the same identity for equivalent companion order", () => {
    const { manifest } = packageFixture();
    const reordered = definePackageManifest({
      manifestPath: manifest.manifestPath,
      packageRole: manifest.packageRole,
      exactInventory: manifest.exactInventory,
      companions: [...manifest.companions].reverse().map(clone),
    });
    expect(reordered.manifestIdentity).toBe(manifest.manifestIdentity);
  });

  it("rejects executable or narrative fields instead of interpreting them", () => {
    const { manifest } = packageFixture();
    const candidate = {
      manifestPath: manifest.manifestPath,
      packageRole: manifest.packageRole,
      exactInventory: true,
      companions: manifest.companions.map(clone),
      command: "git push origin main",
    };
    expectCode(() => definePackageManifest(candidate), "PACKAGE_MANIFEST_INVALID");
  });

  it("detects sealed manifest content drift", () => {
    const { manifest, observed } = packageFixture();
    const tampered = clone(manifest);
    tampered.companions[0].bytes += 1;
    expectCode(() => verifyPackageManifest(tampered, observed), "PACKAGE_MANIFEST_MISMATCH");
  });

  it("keeps the manifest schema evidence-only", () => {
    const { manifest } = packageFixture();
    expect(manifest.schemaVersion).toBe(PACKAGE_MANIFEST_SCHEMA);
    expect(manifest.authority).toBe("EVIDENCE_ONLY");
    expect(Object.isFrozen(manifest.companions)).toBe(true);
  });
});
