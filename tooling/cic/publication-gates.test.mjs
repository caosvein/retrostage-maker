import { describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  COMMIT_AUTHORIZATION_SCHEMA,
  EVIDENCE_BUNDLE_PROFILE_SCHEMA,
  EVIDENCE_ENTRY_SCHEMA,
  HOSTED_CI_EVIDENCE_SCHEMA,
  INDEPENDENT_REVIEW_SCHEMA,
  INVOCATION_LEDGER_SCHEMA,
  INVOCATION_RECORD_SCHEMA,
  PACKAGE_MANIFEST_SCHEMA,
  PUBLICATION_SNAPSHOT_VERIFICATION_SCHEMA,
  PUSH_AUTHORIZATION_SCHEMA,
  SOURCE_PROMOTION_AUTHORIZATION_SCHEMA,
  createEvidenceEntry,
  createHostedCiEvidence,
  createHostedCiHistory,
  createInvocationLedger,
  createInvocationRecord,
  defineEvidenceBundleProfile,
  definePackageManifest,
  evaluatePublicationStates,
  extendInvocationLedger,
  publicationFileInventoryIdentity,
  verifyEvidenceBundleProfile,
  verifyHostedCiEvidence,
  verifyInvocationLedgerExtension,
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

function evidenceEntryInput(overrides = {}) {
  return {
    entryId: "candidate-postimage",
    role: "CANDIDATE_POSTIMAGE",
    proofClass: "EXACT_CODE",
    payloadKind: "EVIDENCE",
    payload: { bytes: 1200, sha256: HASH_A },
    locator: {
      scheme: "BUNDLE_PATH",
      value: "candidate/postimage.mjs",
      identity: HASH_B,
    },
    availability: { disposition: "AVAILABLE", observedIdentity: HASH_A },
    relationships: { parents: [], companions: [], references: [] },
    bindings: {
      candidateIdentity: HASH_E,
      sourceGeneration: HASH_1,
      sourceManifestIdentity: HASH_2,
      repositorySnapshotIdentity: HASH_3,
      head: GIT_C,
      tree: GIT_B,
      environmentIdentity: HASH_C,
      commandIdentity: null,
    },
    currentness: { disposition: "CURRENT", reasonCodes: [] },
    retentionClass: "STANDARD",
    disposition: "EMBEDDED",
    ...overrides,
  };
}

function evidenceBundleFixture() {
  const embedded = createEvidenceEntry(evidenceEntryInput());
  const referenced = createEvidenceEntry(
    evidenceEntryInput({
      entryId: "hosted-run",
      role: "HOSTED_CI_RUN",
      proofClass: "HOSTED_VALIDATION",
      payload: { bytes: 400, sha256: HASH_D },
      locator: {
        scheme: "GOVERNED_REFERENCE",
        value: "github/actions/runs/123",
        identity: HASH_F,
      },
      availability: { disposition: "AVAILABLE", observedIdentity: HASH_D },
      relationships: { parents: [], companions: ["candidate-postimage"], references: [] },
      retentionClass: "CLOSURE_CRITICAL",
      disposition: "REFERENCED",
    }),
  );
  const duplicatePayloadReference = createEvidenceEntry(
    evidenceEntryInput({
      entryId: "hosted-job",
      role: "HOSTED_CI_JOB",
      proofClass: "HOSTED_VALIDATION",
      payload: { bytes: 400, sha256: HASH_D },
      locator: {
        scheme: "GOVERNED_REFERENCE",
        value: "github/actions/jobs/456",
        identity: HASH_C,
      },
      availability: { disposition: "AVAILABLE", observedIdentity: HASH_D },
      relationships: { parents: ["hosted-run"], companions: [], references: [] },
      retentionClass: "CLOSURE_CRITICAL",
      disposition: "REFERENCED",
    }),
  );
  const profile = defineEvidenceBundleProfile({
    manifestPath: "09_REVIEW-FILE-MANIFEST.tsv",
    archivePath: "11_REVIEW-BUNDLE.zip",
    entries: [duplicatePayloadReference, embedded, referenced],
    archiveBytes: 2400,
    looseEvidenceBytes: 2000,
  });
  const observations = profile.entries.map((entry) => ({
    entryId: entry.entryId,
    payload: clone(entry.payload),
    locator: clone(entry.locator),
    availability: clone(entry.availability),
  }));
  return { embedded, referenced, duplicatePayloadReference, profile, observations };
}

function invocationInput(overrides = {}) {
  return {
    taskId: "POST-I12-SLICE2",
    attempt: 1,
    proofClass: "TARGETED_VALIDATION",
    commandIdentity: HASH_A,
    argumentsIdentity: HASH_B,
    cwdIdentity: HASH_C,
    toolchainIdentity: HASH_D,
    environmentIdentity: HASH_1,
    candidateIdentity: HASH_E,
    evidenceIdentity: HASH_2,
    startedAt: "2026-09-26T09:00:00Z",
    endedAt: "2026-09-26T09:01:00Z",
    exitCode: 0,
    result: "PASS",
    firstFailureIdentity: null,
    disposition: "EXECUTED",
    reusedInvocationIdentity: null,
    ...overrides,
  };
}

function resealInvocationLedger(ledger, overrides = {}) {
  const value = { ...clone(ledger), ...overrides };
  const { schemaVersion, ...body } = value;
  delete body.ledgerIdentity;
  return {
    schemaVersion,
    ...body,
    ledgerIdentity: sha256Hex(`${schemaVersion}\n${canonicalJson(body)}\n`),
  };
}

function claimInvocationLedgerExtension(rootLedger, parentLedgerIdentity) {
  return resealInvocationLedger(rootLedger, {
    lineage: { kind: "EXTENSION", parentLedgerIdentity },
  });
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

describe("POST-I12 Slice2 non-circular evidence profile", () => {
  it("creates stable content-addressed evidence records with permanent safety markers", () => {
    const first = createEvidenceEntry(
      evidenceEntryInput({
        relationships: {
          parents: ["parent-b", "parent-a"],
          companions: ["companion-b", "companion-a"],
          references: ["reference-b", "reference-a"],
        },
      }),
    );
    const second = createEvidenceEntry(
      evidenceEntryInput({
        relationships: {
          parents: ["parent-a", "parent-b"],
          companions: ["companion-a", "companion-b"],
          references: ["reference-a", "reference-b"],
        },
      }),
    );
    expect(first.schemaVersion).toBe(EVIDENCE_ENTRY_SCHEMA);
    expect(first.evidenceIdentity).toBe(second.evidenceIdentity);
    expect(first).toMatchObject({
      authority: "EVIDENCE_ONLY",
      mutationAuthorization: false,
      targetedPruning: "OFF",
    });
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("verifies exact reconstruction and keeps archive, unique-payload, and loose metrics distinct", () => {
    const { profile, observations } = evidenceBundleFixture();
    const result = verifyEvidenceBundleProfile(profile, observations);
    expect(profile.schemaVersion).toBe(EVIDENCE_BUNDLE_PROFILE_SCHEMA);
    expect(profile.metrics).toEqual({
      archiveInclusiveBytes: 2400,
      uniquePayloadBytes: 1600,
      looseEvidenceBytes: 2000,
    });
    expect(result).toMatchObject({
      disposition: "VERIFIED",
      profileIdentity: profile.profileIdentity,
      entryCount: 3,
      authority: "EVIDENCE_ONLY",
      mutationAuthorization: false,
      targetedPruning: "OFF",
    });
  });

  it("derives the same bundle identity for equivalent reordered entries", () => {
    const fixture = evidenceBundleFixture();
    const reordered = defineEvidenceBundleProfile({
      manifestPath: fixture.profile.manifestPath,
      archivePath: fixture.profile.archivePath,
      entries: [...fixture.profile.entries].reverse().map(clone),
      archiveBytes: fixture.profile.metrics.archiveInclusiveBytes,
      looseEvidenceBytes: fixture.profile.metrics.looseEvidenceBytes,
    });
    expect(reordered.profileIdentity).toBe(fixture.profile.profileIdentity);
  });

  it("fails closed when a required payload observation is missing", () => {
    const { profile, observations } = evidenceBundleFixture();
    expectCode(
      () => verifyEvidenceBundleProfile(profile, observations.slice(1)),
      "EVIDENCE_BUNDLE_PAYLOAD_MISSING",
    );
  });

  it("fails closed on a wrong observed payload SHA-256", () => {
    const { profile, observations } = evidenceBundleFixture();
    observations[0].payload.sha256 = HASH_F;
    observations[0].availability.observedIdentity = HASH_F;
    expectCode(
      () => verifyEvidenceBundleProfile(profile, observations),
      "EVIDENCE_BUNDLE_PAYLOAD_HASH_MISMATCH",
    );
  });

  it("fails closed on wrong observed payload bytes", () => {
    const { profile, observations } = evidenceBundleFixture();
    observations[0].payload.bytes += 1;
    expectCode(
      () => verifyEvidenceBundleProfile(profile, observations),
      "EVIDENCE_BUNDLE_PAYLOAD_BYTES_MISMATCH",
    );
  });

  it("fails closed on governed locator drift", () => {
    const { profile, observations } = evidenceBundleFixture();
    observations[0].locator.value = "candidate/drifted.mjs";
    expectCode(
      () => verifyEvidenceBundleProfile(profile, observations),
      "EVIDENCE_BUNDLE_LOCATOR_DRIFT",
    );
  });

  it("fails closed when a referenced payload is unavailable", () => {
    const { profile, observations } = evidenceBundleFixture();
    const referenced = observations.find((entry) => entry.entryId === "hosted-run");
    referenced.availability = { disposition: "UNAVAILABLE", observedIdentity: null };
    expectCode(
      () => verifyEvidenceBundleProfile(profile, observations),
      "EVIDENCE_BUNDLE_REFERENCE_UNAVAILABLE",
    );
  });

  it("rejects relationship cycles", () => {
    const first = createEvidenceEntry(
      evidenceEntryInput({
        entryId: "cycle-a",
        locator: { scheme: "BUNDLE_PATH", value: "evidence/a.json", identity: HASH_A },
        relationships: { parents: [], companions: ["cycle-b"], references: [] },
      }),
    );
    const second = createEvidenceEntry(
      evidenceEntryInput({
        entryId: "cycle-b",
        locator: { scheme: "BUNDLE_PATH", value: "evidence/b.json", identity: HASH_B },
        relationships: { parents: [], companions: ["cycle-a"], references: [] },
      }),
    );
    expectCode(
      () =>
        defineEvidenceBundleProfile({
          manifestPath: "manifest.tsv",
          archivePath: "bundle.zip",
          entries: [first, second],
          archiveBytes: 1,
          looseEvidenceBytes: 1,
        }),
      "EVIDENCE_BUNDLE_CYCLE",
    );
  });

  it("rejects duplicate or ambiguous payload entries", () => {
    const entry = createEvidenceEntry(evidenceEntryInput());
    expectCode(
      () =>
        defineEvidenceBundleProfile({
          manifestPath: "manifest.tsv",
          archivePath: "bundle.zip",
          entries: [entry, clone(entry)],
          archiveBytes: 1,
          looseEvidenceBytes: 1,
        }),
      "EVIDENCE_BUNDLE_AMBIGUOUS_ENTRY",
    );
  });

  it("rejects manifest self-entry", () => {
    const entry = createEvidenceEntry(
      evidenceEntryInput({
        locator: { scheme: "BUNDLE_PATH", value: "manifest.tsv", identity: HASH_A },
      }),
    );
    expectCode(
      () =>
        defineEvidenceBundleProfile({
          manifestPath: "manifest.tsv",
          archivePath: "bundle.zip",
          entries: [entry],
          archiveBytes: 1,
          looseEvidenceBytes: 1,
        }),
      "EVIDENCE_BUNDLE_MANIFEST_SELF_ENTRY",
    );
  });

  it("rejects archive self-entry", () => {
    const entry = createEvidenceEntry(
      evidenceEntryInput({
        locator: { scheme: "BUNDLE_PATH", value: "bundle.zip", identity: HASH_A },
      }),
    );
    expectCode(
      () =>
        defineEvidenceBundleProfile({
          manifestPath: "manifest.tsv",
          archivePath: "bundle.zip",
          entries: [entry],
          archiveBytes: 1,
          looseEvidenceBytes: 1,
        }),
      "EVIDENCE_BUNDLE_ARCHIVE_SELF_ENTRY",
    );
  });

  it("rejects recursively embedded parent archives", () => {
    const entry = createEvidenceEntry(
      evidenceEntryInput({
        payloadKind: "ARCHIVE",
        locator: { scheme: "BUNDLE_PATH", value: "parent.zip", identity: HASH_A },
      }),
    );
    expectCode(
      () =>
        defineEvidenceBundleProfile({
          manifestPath: "manifest.tsv",
          archivePath: "bundle.zip",
          entries: [entry],
          archiveBytes: 1,
          looseEvidenceBytes: 1,
        }),
      "EVIDENCE_BUNDLE_RECURSIVE_ARCHIVE",
    );
  });

  it("rejects executable or narrative authority injection", () => {
    const input = evidenceEntryInput();
    input.command = "git push origin main";
    expectCode(() => createEvidenceEntry(input), "EVIDENCE_ENTRY_INVALID");
  });
});

describe("POST-I12 Slice2 invocation ledger", () => {
  it("creates deterministic evidence-only invocation records without reading ambient time", () => {
    const first = createInvocationRecord(invocationInput());
    const second = createInvocationRecord(clone(invocationInput()));
    expect(first.schemaVersion).toBe(INVOCATION_RECORD_SCHEMA);
    expect(first.invocationIdentity).toBe(second.invocationIdentity);
    expect(first).toMatchObject({
      authority: "EVIDENCE_ONLY",
      mutationAuthorization: false,
      targetedPruning: "OFF",
      disposition: "EXECUTED",
    });
  });

  it("derives durable EXECUTED and REUSED counts from distinct rows", () => {
    const executed = createInvocationRecord(invocationInput());
    const reused = createInvocationRecord(
      invocationInput({
        attempt: 2,
        startedAt: "2026-09-26T10:00:00Z",
        endedAt: "2026-09-26T10:00:01Z",
        exitCode: null,
        result: "REUSED",
        disposition: "REUSED",
        reusedInvocationIdentity: executed.invocationIdentity,
      }),
    );
    const first = createInvocationLedger([executed, reused]);
    const second = createInvocationLedger([reused, executed]);
    expect(first.schemaVersion).toBe(INVOCATION_LEDGER_SCHEMA);
    expect(first.ledgerIdentity).toBe(second.ledgerIdentity);
    expect(first.metrics).toMatchObject({
      invocationCount: 2,
      executedCount: 1,
      reusedCount: 1,
      failedCount: 0,
    });
    expect(first.appendOnly).toBe(true);
    expect(first.lineage).toEqual({ kind: "ROOT", parentLedgerIdentity: null });
  });

  it("rejects duplicate invocation identities", () => {
    const record = createInvocationRecord(invocationInput());
    expectCode(
      () => createInvocationLedger([record, clone(record)]),
      "INVOCATION_LEDGER_DUPLICATE_IDENTITY",
    );
  });

  it("rejects ambiguous invocation rows for the same task, proof class, and attempt", () => {
    const first = createInvocationRecord(invocationInput());
    const second = createInvocationRecord(invocationInput({ endedAt: "2026-09-26T09:02:00Z" }));
    expectCode(() => createInvocationLedger([first, second]), "INVOCATION_LEDGER_AMBIGUOUS_ROW");
  });

  it("rejects a later success that erases first-failure lineage", () => {
    const failed = createInvocationRecord(
      invocationInput({
        exitCode: 1,
        result: "FAIL",
        firstFailureIdentity: HASH_F,
      }),
    );
    const success = createInvocationRecord(
      invocationInput({
        attempt: 2,
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    expectCode(
      () => createInvocationLedger([failed, success]),
      "INVOCATION_LEDGER_FIRST_FAILURE_LINEAGE_MISMATCH",
    );
  });

  it("preserves the first failure when a later execution succeeds", () => {
    const failed = createInvocationRecord(
      invocationInput({
        exitCode: 1,
        result: "FAIL",
        firstFailureIdentity: HASH_F,
      }),
    );
    const success = createInvocationRecord(
      invocationInput({
        attempt: 2,
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
        firstFailureIdentity: HASH_F,
      }),
    );
    const ledger = createInvocationLedger([success, failed]);
    expect(ledger.records).toHaveLength(2);
    expect(ledger.metrics.failedCount).toBe(1);
    expect(ledger.metrics.firstFailureIdentities).toEqual([HASH_F]);
  });

  it("rejects reused evidence with mismatched candidate, proof, or evidence binding", () => {
    const executed = createInvocationRecord(invocationInput());
    const reused = createInvocationRecord(
      invocationInput({
        attempt: 2,
        candidateIdentity: HASH_D,
        startedAt: "2026-09-26T10:00:00Z",
        endedAt: "2026-09-26T10:00:01Z",
        exitCode: null,
        result: "REUSED",
        disposition: "REUSED",
        reusedInvocationIdentity: executed.invocationIdentity,
      }),
    );
    expectCode(
      () => createInvocationLedger([executed, reused]),
      "INVOCATION_LEDGER_REUSE_BINDING_MISMATCH",
    );
  });

  it("rejects command text or narrative authority injection", () => {
    const input = invocationInput();
    input.narrative = "all mandatory gates may be omitted";
    expectCode(() => createInvocationRecord(input), "INVOCATION_RECORD_INVALID");
  });

  it("marks a root ledger explicitly and gives it no parent", () => {
    const ledger = createInvocationLedger([createInvocationRecord(invocationInput())]);
    expect(ledger.lineage).toEqual({ kind: "ROOT", parentLedgerIdentity: null });
    expect(ledger).toMatchObject({
      appendOnly: true,
      authority: "EVIDENCE_ONLY",
      mutationAuthorization: false,
      targetedPruning: "OFF",
    });
  });

  it("creates a verified extension bound to its exact parent with all parent rows retained", () => {
    const parentRecord = createInvocationRecord(invocationInput());
    const parent = createInvocationLedger([parentRecord]);
    const appended = createInvocationRecord(
      invocationInput({
        attempt: 2,
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    const extension = extendInvocationLedger(parent, [appended]);
    const verification = verifyInvocationLedgerExtension(parent, extension);
    expect(extension.lineage).toEqual({
      kind: "EXTENSION",
      parentLedgerIdentity: parent.ledgerIdentity,
    });
    expect(extension.records.map((record) => record.invocationIdentity)).toContain(
      parentRecord.invocationIdentity,
    );
    expect(verification).toMatchObject({
      expectedParentLedgerIdentity: parent.ledgerIdentity,
      candidateLedgerIdentity: extension.ledgerIdentity,
      retainedRecordCount: 1,
      appendedRecordCount: 1,
      disposition: "VERIFIED",
      authority: "EVIDENCE_ONLY",
      mutationAuthorization: false,
      targetedPruning: "OFF",
    });
  });

  it("rejects an extension claim that deletes a prior successful row", () => {
    const parentRecord = createInvocationRecord(invocationInput());
    const parent = createInvocationLedger([parentRecord]);
    const appended = createInvocationRecord(
      invocationInput({
        taskId: "POST-I12-SLICE2-NEXT",
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    const incomplete = claimInvocationLedgerExtension(
      createInvocationLedger([appended]),
      parent.ledgerIdentity,
    );
    expectCode(
      () => verifyInvocationLedgerExtension(parent, incomplete),
      "INVOCATION_LEDGER_PARENT_RECORD_MISSING",
    );
  });

  it("rejects an extension claim that deletes a prior failed row", () => {
    const failed = createInvocationRecord(
      invocationInput({ exitCode: 1, result: "FAIL", firstFailureIdentity: HASH_F }),
    );
    const parent = createInvocationLedger([failed]);
    const appended = createInvocationRecord(
      invocationInput({
        taskId: "POST-I12-SLICE2-NEXT",
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    const incomplete = claimInvocationLedgerExtension(
      createInvocationLedger([appended]),
      parent.ledgerIdentity,
    );
    expectCode(
      () => verifyInvocationLedgerExtension(parent, incomplete),
      "INVOCATION_LEDGER_PARENT_RECORD_MISSING",
    );
  });

  it("rejects replacement of a parent row even when the replacement ledger is resealed", () => {
    const original = createInvocationRecord(invocationInput());
    const parent = createInvocationLedger([original]);
    const replacement = createInvocationRecord(
      invocationInput({ endedAt: "2026-09-26T09:01:01Z" }),
    );
    const appended = createInvocationRecord(
      invocationInput({
        taskId: "POST-I12-SLICE2-NEXT",
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    const rewritten = claimInvocationLedgerExtension(
      createInvocationLedger([replacement, appended]),
      parent.ledgerIdentity,
    );
    expectCode(
      () => verifyInvocationLedgerExtension(parent, rewritten),
      "INVOCATION_LEDGER_PARENT_RECORD_MISSING",
    );
  });

  it("rejects an extension bound to a different parent ledger", () => {
    const parent = createInvocationLedger([createInvocationRecord(invocationInput())]);
    const otherParent = createInvocationLedger([
      createInvocationRecord(invocationInput({ taskId: "POST-I12-SLICE2-OTHER" })),
    ]);
    const appended = createInvocationRecord(
      invocationInput({
        taskId: "POST-I12-SLICE2-NEXT",
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    const extension = extendInvocationLedger(otherParent, [appended]);
    expectCode(
      () => verifyInvocationLedgerExtension(parent, extension),
      "INVOCATION_LEDGER_PARENT_MISMATCH",
    );
  });

  it("rejects an unrelated root as proof of expected-parent continuation", () => {
    const parent = createInvocationLedger([createInvocationRecord(invocationInput())]);
    const unrelatedRoot = createInvocationLedger([
      createInvocationRecord(invocationInput({ taskId: "POST-I12-SLICE2-OTHER" })),
    ]);
    expectCode(
      () => verifyInvocationLedgerExtension(parent, unrelatedRoot),
      "INVOCATION_LEDGER_NOT_EXTENSION",
    );
  });

  it("retains the parent's first-failure identity through a later successful extension", () => {
    const failed = createInvocationRecord(
      invocationInput({ exitCode: 1, result: "FAIL", firstFailureIdentity: HASH_F }),
    );
    const parent = createInvocationLedger([failed]);
    const success = createInvocationRecord(
      invocationInput({
        attempt: 2,
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
        firstFailureIdentity: HASH_F,
      }),
    );
    const extension = extendInvocationLedger(parent, [success]);
    expect(extension.metrics.firstFailureIdentities).toEqual([HASH_F]);
    expect(extension.metrics.failedCount).toBe(1);
    expect(verifyInvocationLedgerExtension(parent, extension).disposition).toBe("VERIFIED");
  });

  it("derives cumulative metrics from parent and appended rows", () => {
    const executed = createInvocationRecord(invocationInput());
    const parent = createInvocationLedger([executed]);
    const reused = createInvocationRecord(
      invocationInput({
        attempt: 2,
        startedAt: "2026-09-26T10:00:00Z",
        endedAt: "2026-09-26T10:00:01Z",
        exitCode: null,
        result: "REUSED",
        disposition: "REUSED",
        reusedInvocationIdentity: executed.invocationIdentity,
      }),
    );
    const extension = extendInvocationLedger(parent, [reused]);
    expect(extension.metrics).toEqual({
      invocationCount: 2,
      executedCount: 1,
      reusedCount: 1,
      failedCount: 0,
      firstFailureIdentities: [],
    });
  });

  it("rejects duplicate invocation identity across parent and appended rows", () => {
    const record = createInvocationRecord(invocationInput());
    const parent = createInvocationLedger([record]);
    expectCode(
      () => extendInvocationLedger(parent, [clone(record)]),
      "INVOCATION_LEDGER_DUPLICATE_IDENTITY",
    );
  });

  it("rejects a task, proof, and attempt collision across parent and appended rows", () => {
    const parent = createInvocationLedger([createInvocationRecord(invocationInput())]);
    const collision = createInvocationRecord(invocationInput({ endedAt: "2026-09-26T09:01:01Z" }));
    expectCode(
      () => extendInvocationLedger(parent, [collision]),
      "INVOCATION_LEDGER_AMBIGUOUS_ROW",
    );
  });

  it("derives the same extension identity for equivalent reordered appended rows", () => {
    const parent = createInvocationLedger([createInvocationRecord(invocationInput())]);
    const second = createInvocationRecord(
      invocationInput({
        taskId: "POST-I12-SLICE2-B",
        startedAt: "2026-09-26T09:02:00Z",
        endedAt: "2026-09-26T09:03:00Z",
      }),
    );
    const third = createInvocationRecord(
      invocationInput({
        taskId: "POST-I12-SLICE2-C",
        startedAt: "2026-09-26T09:04:00Z",
        endedAt: "2026-09-26T09:05:00Z",
      }),
    );
    const firstOrder = extendInvocationLedger(parent, [second, third]);
    const secondOrder = extendInvocationLedger(parent, [third, second]);
    expect(firstOrder.ledgerIdentity).toBe(secondOrder.ledgerIdentity);
    expect(firstOrder.records).toEqual(secondOrder.records);
  });
});
