import { describe, expect, it } from "vitest";

import {
  PROOF_CLASS_CURRENTNESS_DISPOSITIONS,
  PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA,
  PROOF_CLASS_CURRENTNESS_REASON_CODES,
  PROOF_CLASS_EVIDENCE_REFERENCE_SCHEMA,
  deriveProofClassCurrentnessLedger,
  verifyProofClassCurrentnessLedger,
} from "./lib/proof-class-currentness.mjs";
import { canonicalJson } from "./lib/canonical-json.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const hash = (value) => sha256Hex(`post-i12-slice1:${value}`);
const commit = "c5ce7805eaa56b5cf90698ebec0016aa486ee3de";
const tree = "9787855a946c0560687b3a32cce572c48918a5c3";
const clone = (value) => JSON.parse(JSON.stringify(value));

function current() {
  return {
    currentTruthIdentity: hash("truth"),
    sourceGenerationFingerprint: hash("source"),
    sourceManifestIdentity: hash("manifest"),
    repositoryIdentity: hash("repository"),
    repositorySnapshotIdentity: hash("snapshot"),
    repositoryHeadCommit: commit,
    repositoryHeadTree: tree,
    worktreeIdentity: hash("worktree"),
    worktreeClean: true,
    remoteBindingIdentity: hash("remote"),
    candidateIdentity: hash("candidate"),
    materialIdentity: hash("material"),
    environmentIdentity: hash("environment"),
    toolchainIdentity: hash("toolchain"),
    mandatoryWiderGateIdentity: hash("mandatory-gates"),
  };
}

function evidence(proofClassId, overrides = {}) {
  const bindings = { ...current(), ...(overrides.bindings ?? {}) };
  return {
    schemaVersion: PROOF_CLASS_EVIDENCE_REFERENCE_SCHEMA,
    proofClassId,
    evidenceIdentity: hash(`${proofClassId}:evidence`),
    expectedEvidenceIdentity: hash(`${proofClassId}:evidence`),
    availability: "AVAILABLE",
    applicable: true,
    superseded: false,
    knownCorrectnessBlocker: false,
    proofClassCatalogIdentity: hash("proof-class-catalog"),
    requiresRemote: proofClassId === "HOSTED_CI",
    bindings,
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "bindings")),
  };
}

function baseInput() {
  return {
    targetedPruning: "OFF",
    proofClassCatalogIdentity: hash("proof-class-catalog"),
    knownProofClassIds: ["HOSTED_CI", "TARGETED_REGRESSION"],
    requiredProofClassIds: ["TARGETED_REGRESSION", "HOSTED_CI"],
    current: current(),
    evidence: [evidence("HOSTED_CI"), evidence("TARGETED_REGRESSION")],
  };
}

function reverseProperties(value) {
  if (Array.isArray(value)) return value.map(reverseProperties);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, entry]) => [key, reverseProperties(entry)]),
  );
}

function mutateEvidence(input, proofClassId, mutator) {
  const entry = input.evidence.find((candidate) => candidate.proofClassId === proofClassId);
  mutator(entry);
  return deriveProofClassCurrentnessLedger(input);
}

function recomputeLedgerIdentity(ledger) {
  const body = { ...ledger };
  delete body.ledgerIdentity;
  ledger.ledgerIdentity = sha256Hex(
    `${PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA}\n${canonicalJson(body)}\n`,
  );
  return ledger;
}

function proofClassEntry(ledger, proofClassId) {
  return ledger.proofClasses.find((entry) => entry.proofClassId === proofClassId);
}

function expectRecomputedLedgerInvalid(ledger) {
  recomputeLedgerIdentity(ledger);
  expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
    "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID",
  );
}

describe("POST-I12 Slice1 derived proof-class currentness ledger", () => {
  it("uses the versioned derived-only schema and fixed dispositions", () => {
    const ledger = deriveProofClassCurrentnessLedger(baseInput());
    expect(ledger.schemaVersion).toBe(PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA);
    expect(ledger.factAuthority).toBe("DERIVED_NON_AUTHORITATIVE");
    expect(ledger.mutationAuthorization).toBe(false);
    expect(ledger.targetedPruning).toBe("OFF");
    expect(PROOF_CLASS_CURRENTNESS_DISPOSITIONS).toEqual([
      "CURRENT_FOR_SAME_PROOF_CLASS",
      "REVALIDATION_REQUIRED",
      "INVALID_OR_UNAVAILABLE",
    ]);
  });

  it("is deterministic across property and collection ordering", () => {
    const first = deriveProofClassCurrentnessLedger(baseInput());
    const reordered = reverseProperties(baseInput());
    reordered.knownProofClassIds.reverse();
    reordered.requiredProofClassIds.reverse();
    reordered.evidence.reverse();
    const second = deriveProofClassCurrentnessLedger(reordered);
    expect(second).toEqual(first);
    expect(second.ledgerIdentity).toBe(first.ledgerIdentity);
    expect(verifyProofClassCurrentnessLedger(second)).toEqual(first);
  });

  it("reports exact evidence current only for the same required proof class", () => {
    const ledger = deriveProofClassCurrentnessLedger(baseInput());
    expect(ledger.disposition).toBe("CURRENT_FOR_SAME_PROOF_CLASS");
    expect(ledger.reasonCodes).toEqual([]);
    expect(ledger.proofClasses).toHaveLength(2);
    expect(ledger.proofClasses.every((entry) => entry.reasonCodes.length === 0)).toBe(true);
  });

  it("requires revalidation for current-truth identity drift alone", () => {
    const input = baseInput();
    input.current.currentTruthIdentity = hash("other-current-truth");
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("CURRENT_TRUTH_STALE");
    expect(ledger.disposition).toBe("REVALIDATION_REQUIRED");
  });

  it("requires revalidation for proof-class catalog drift alone", () => {
    const input = baseInput();
    input.proofClassCatalogIdentity = hash("other-proof-class-catalog");
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("PROOF_CLASS_CATALOG_STALE");
    expect(ledger.disposition).toBe("REVALIDATION_REQUIRED");
  });

  it("rejects missing or malformed evidence catalog binding", () => {
    const missing = baseInput();
    delete missing.evidence[0].proofClassCatalogIdentity;
    expect(() => deriveProofClassCurrentnessLedger(missing)).toThrow(
      "PROOF_CLASS_EVIDENCE_REFERENCE_INVALID",
    );

    const malformed = baseInput();
    malformed.evidence[0].proofClassCatalogIdentity = "NOT_AN_IDENTITY";
    expect(() => deriveProofClassCurrentnessLedger(malformed)).toThrow(
      "PROOF_CLASS_EVIDENCE_REFERENCE_INVALID",
    );
  });

  it("requires revalidation for Source-generation drift", () => {
    const ledger = mutateEvidence(baseInput(), "TARGETED_REGRESSION", (entry) => {
      entry.bindings.sourceGenerationFingerprint = hash("stale-source");
    });
    expect(ledger.reasonCodes).toContain("SOURCE_GENERATION_STALE");
    expect(ledger.disposition).toBe("REVALIDATION_REQUIRED");
  });

  it("requires revalidation for Source-manifest drift", () => {
    const ledger = mutateEvidence(baseInput(), "TARGETED_REGRESSION", (entry) => {
      entry.bindings.sourceManifestIdentity = hash("stale-manifest");
    });
    expect(ledger.reasonCodes).toContain("SOURCE_MANIFEST_STALE");
  });

  it("distinguishes repository identity and snapshot drift", () => {
    const input = baseInput();
    input.evidence[0].bindings.repositoryIdentity = hash("other-repository");
    input.evidence[1].bindings.repositorySnapshotIdentity = hash("other-snapshot");
    expect(deriveProofClassCurrentnessLedger(input).reasonCodes).toEqual(
      expect.arrayContaining(["REPOSITORY_IDENTITY_STALE", "REPOSITORY_SNAPSHOT_STALE"]),
    );
  });

  it("distinguishes repository HEAD and tree drift", () => {
    const input = baseInput();
    input.evidence[0].bindings.repositoryHeadCommit = "05e90f573a1a2ece2f5b9fc985691c6c1e8858ee";
    input.evidence[1].bindings.repositoryHeadTree = "d05b92a98e50f72e8b7eec1ac04f8e67b8982ae3";
    expect(deriveProofClassCurrentnessLedger(input).reasonCodes).toEqual(
      expect.arrayContaining(["REPOSITORY_HEAD_STALE", "REPOSITORY_TREE_STALE"]),
    );
  });

  it("fails currentness for dirty or different worktree state", () => {
    const input = baseInput();
    input.current.worktreeClean = false;
    input.evidence[0].bindings.worktreeIdentity = hash("other-worktree");
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("WORKTREE_STALE_OR_DIRTY");
  });

  it("fails remote-required evidence when the remote is unknown", () => {
    const input = baseInput();
    input.current.remoteBindingIdentity = null;
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN");
  });

  it("fails remote-required evidence when the remote binding drifts", () => {
    const ledger = mutateEvidence(baseInput(), "HOSTED_CI", (entry) => {
      entry.bindings.remoteBindingIdentity = hash("other-remote");
    });
    expect(ledger.reasonCodes).toContain("REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN");
  });

  it("requires revalidation for candidate drift", () => {
    const ledger = mutateEvidence(baseInput(), "TARGETED_REGRESSION", (entry) => {
      entry.bindings.candidateIdentity = hash("other-candidate");
    });
    expect(ledger.reasonCodes).toContain("CANDIDATE_IDENTITY_STALE");
  });

  it("requires revalidation for material drift", () => {
    const ledger = mutateEvidence(baseInput(), "TARGETED_REGRESSION", (entry) => {
      entry.bindings.materialIdentity = hash("other-material");
    });
    expect(ledger.reasonCodes).toContain("MATERIAL_IDENTITY_STALE");
  });

  it("requires revalidation for environment drift", () => {
    const ledger = mutateEvidence(baseInput(), "TARGETED_REGRESSION", (entry) => {
      entry.bindings.environmentIdentity = hash("other-environment");
    });
    expect(ledger.reasonCodes).toContain("ENVIRONMENT_IDENTITY_STALE");
  });

  it("requires revalidation for toolchain drift", () => {
    const ledger = mutateEvidence(baseInput(), "TARGETED_REGRESSION", (entry) => {
      entry.bindings.toolchainIdentity = hash("other-toolchain");
    });
    expect(ledger.reasonCodes).toContain("TOOLCHAIN_IDENTITY_STALE");
  });

  it.each(["UNAVAILABLE", "UNKNOWN"])("rejects %s evidence availability", (availability) => {
    const input = baseInput();
    input.evidence[0].availability = availability;
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.disposition).toBe("INVALID_OR_UNAVAILABLE");
    expect(ledger.reasonCodes).toContain("EVIDENCE_UNAVAILABLE");
  });

  it("rejects a hash without matching expected evidence identity", () => {
    const input = baseInput();
    input.evidence[0].expectedEvidenceIdentity = hash("different-evidence");
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("EVIDENCE_IDENTITY_STALE");
    expect(ledger.disposition).toBe("REVALIDATION_REQUIRED");
  });

  it("requires revalidation for superseded evidence", () => {
    const input = baseInput();
    input.evidence[0].superseded = true;
    expect(deriveProofClassCurrentnessLedger(input).reasonCodes).toContain("EVIDENCE_SUPERSEDED");
  });

  it("requires revalidation for a known correctness blocker", () => {
    const input = baseInput();
    input.evidence[0].knownCorrectnessBlocker = true;
    expect(deriveProofClassCurrentnessLedger(input).reasonCodes).toContain(
      "KNOWN_CORRECTNESS_BLOCKER",
    );
  });

  it("requires applicability to be proven", () => {
    const input = baseInput();
    input.evidence[0].applicable = false;
    expect(deriveProofClassCurrentnessLedger(input).reasonCodes).toContain(
      "EVIDENCE_NOT_APPLICABLE",
    );
  });

  it("reports a missing required proof class without inventing evidence", () => {
    const input = baseInput();
    input.evidence = [input.evidence[0]];
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("REQUIRED_PROOF_CLASS_MISSING");
    expect(ledger.proofClasses.find((entry) => entry.evidenceIdentity === null)).toMatchObject({
      disposition: "REVALIDATION_REQUIRED",
      availability: "UNKNOWN",
    });
  });

  it("fails closed on duplicate proof-class evidence", () => {
    const input = baseInput();
    input.evidence.push(clone(input.evidence[0]));
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.disposition).toBe("INVALID_OR_UNAVAILABLE");
    expect(ledger.reasonCodes).toContain("DUPLICATE_PROOF_CLASS");
  });

  it("fails closed on an unknown proof class", () => {
    const input = baseInput();
    input.evidence.push(evidence("UNKNOWN_CLASS"));
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.disposition).toBe("INVALID_OR_UNAVAILABLE");
    expect(ledger.reasonCodes).toContain("PROOF_CLASS_UNKNOWN");
  });

  it("fails closed when the existing targeted-pruning owner is not OFF", () => {
    const input = baseInput();
    input.targetedPruning = "ON";
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.targetedPruning).toBe("OFF");
    expect(ledger.disposition).toBe("INVALID_OR_UNAVAILABLE");
    expect(ledger.reasonCodes).toContain("TARGETED_PRUNING_POLICY_MISMATCH");
  });

  it("rejects a non-OFF ledger record even when its identity is recomputed", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.targetedPruning = "ON";
    recomputeLedgerIdentity(ledger);
    expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
      "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID",
    );
  });

  it("rejects top-level CURRENT with a stale reason after identity recomputation", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.disposition = "CURRENT_FOR_SAME_PROOF_CLASS";
    ledger.reasonCodes = ["CURRENT_TRUTH_STALE"];
    recomputeLedgerIdentity(ledger);
    expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
      "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID",
    );
  });

  it("rejects proof-class CURRENT with a stale reason after identity recomputation", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.proofClasses[0].disposition = "CURRENT_FOR_SAME_PROOF_CLASS";
    ledger.proofClasses[0].reasonCodes = ["CURRENT_TRUTH_STALE"];
    ledger.disposition = "REVALIDATION_REQUIRED";
    ledger.reasonCodes = ["CURRENT_TRUTH_STALE"];
    recomputeLedgerIdentity(ledger);
    expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
      "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID",
    );
  });

  it("rejects a proof-class stale reason hidden from the top-level ledger", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.proofClasses[0].disposition = "REVALIDATION_REQUIRED";
    ledger.proofClasses[0].reasonCodes = ["CURRENT_TRUTH_STALE"];
    recomputeLedgerIdentity(ledger);
    expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
      "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID",
    );
  });

  it("rejects an invalid reason set mapped to a non-invalid disposition", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.disposition = "REVALIDATION_REQUIRED";
    ledger.reasonCodes = ["EVIDENCE_UNAVAILABLE"];
    recomputeLedgerIdentity(ledger);
    expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
      "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID",
    );
  });

  it("rejects unavailable evidence without EVIDENCE_UNAVAILABLE", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    proofClassEntry(ledger, "HOSTED_CI").availability = "UNAVAILABLE";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects available evidence with an invented EVIDENCE_UNAVAILABLE reason", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    const entry = proofClassEntry(ledger, "HOSTED_CI");
    entry.reasonCodes = ["EVIDENCE_UNAVAILABLE"];
    entry.disposition = "INVALID_OR_UNAVAILABLE";
    ledger.reasonCodes = ["EVIDENCE_UNAVAILABLE"];
    ledger.disposition = "INVALID_OR_UNAVAILABLE";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects inapplicable evidence without EVIDENCE_NOT_APPLICABLE", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    proofClassEntry(ledger, "HOSTED_CI").applicable = false;
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects applicable evidence with an invented EVIDENCE_NOT_APPLICABLE reason", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    const entry = proofClassEntry(ledger, "HOSTED_CI");
    entry.reasonCodes = ["EVIDENCE_NOT_APPLICABLE"];
    entry.disposition = "REVALIDATION_REQUIRED";
    ledger.reasonCodes = ["EVIDENCE_NOT_APPLICABLE"];
    ledger.disposition = "REVALIDATION_REQUIRED";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects null evidence identity outside the exact missing-proof-class sentinel", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    proofClassEntry(ledger, "HOSTED_CI").evidenceIdentity = null;
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects REQUIRED_PROOF_CLASS_MISSING on evidence-backed proof classes", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    const entry = proofClassEntry(ledger, "HOSTED_CI");
    entry.reasonCodes = ["REQUIRED_PROOF_CLASS_MISSING"];
    entry.disposition = "REVALIDATION_REQUIRED";
    ledger.reasonCodes = ["REQUIRED_PROOF_CLASS_MISSING"];
    ledger.disposition = "REVALIDATION_REQUIRED";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects a remote reason for evidence that does not require remote proof", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    const entry = proofClassEntry(ledger, "TARGETED_REGRESSION");
    entry.reasonCodes = ["REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN"];
    entry.disposition = "REVALIDATION_REQUIRED";
    ledger.reasonCodes = ["REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN"];
    ledger.disposition = "REVALIDATION_REQUIRED";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects remote-required evidence that hides an unavailable current remote", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.current.remoteBindingIdentity = null;
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects a dirty current worktree without a reason on every evidence-backed class", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.current.worktreeClean = false;
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects aggregate-only reason ownership inside a proof class", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    const entry = proofClassEntry(ledger, "HOSTED_CI");
    entry.reasonCodes = ["DUPLICATE_PROOF_CLASS"];
    entry.disposition = "INVALID_OR_UNAVAILABLE";
    ledger.reasonCodes = ["DUPLICATE_PROOF_CLASS"];
    ledger.disposition = "INVALID_OR_UNAVAILABLE";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects a proof-class-owned reason that exists only at the aggregate level", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.reasonCodes = ["CURRENT_TRUTH_STALE"];
    ledger.disposition = "REVALIDATION_REQUIRED";
    expectRecomputedLedgerInvalid(ledger);
  });

  it("rejects an unknown required class when PROOF_CLASS_UNKNOWN is omitted", () => {
    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.knownProofClassIds = ["TARGETED_REGRESSION"];
    expectRecomputedLedgerInvalid(ledger);
  });

  it("continues to verify representative ledgers derived by all accepted safety paths", () => {
    const inputs = [];
    inputs.push(baseInput());

    const unavailable = baseInput();
    unavailable.evidence[0].availability = "UNAVAILABLE";
    inputs.push(unavailable);

    const inapplicable = baseInput();
    inapplicable.evidence[0].applicable = false;
    inputs.push(inapplicable);

    const missing = baseInput();
    missing.evidence = [missing.evidence[0]];
    inputs.push(missing);

    const dirty = baseInput();
    dirty.current.worktreeClean = false;
    inputs.push(dirty);

    const remoteUnknown = baseInput();
    remoteUnknown.current.remoteBindingIdentity = null;
    inputs.push(remoteUnknown);

    const pruningMismatch = baseInput();
    pruningMismatch.targetedPruning = "ON";
    inputs.push(pruningMismatch);

    const truthDrift = baseInput();
    truthDrift.current.currentTruthIdentity = hash("new-truth");
    inputs.push(truthDrift);

    const catalogDrift = baseInput();
    catalogDrift.proofClassCatalogIdentity = hash("new-catalog");
    inputs.push(catalogDrift);

    for (const input of inputs) {
      const ledger = deriveProofClassCurrentnessLedger(input);
      expect(verifyProofClassCurrentnessLedger(ledger)).toEqual(ledger);
    }
  });

  it("requires revalidation when the opaque mandatory-gate binding changes", () => {
    const input = baseInput();
    input.current.mandatoryWiderGateIdentity = hash("new-mandatory-gates");
    const ledger = deriveProofClassCurrentnessLedger(input);
    expect(ledger.reasonCodes).toContain("MANDATORY_WIDER_GATE_IDENTITY_STALE");
    expect(ledger.mandatoryWiderGateIdentity).toBe(hash("new-mandatory-gates"));
  });

  it("rejects malformed evidence shape and tampered ledger identity", () => {
    const malformed = baseInput();
    delete malformed.evidence[0].availability;
    expect(() => deriveProofClassCurrentnessLedger(malformed)).toThrow(
      "PROOF_CLASS_EVIDENCE_REFERENCE_INVALID",
    );

    const ledger = clone(deriveProofClassCurrentnessLedger(baseInput()));
    ledger.ledgerIdentity = hash("tampered-ledger");
    expect(() => verifyProofClassCurrentnessLedger(ledger)).toThrow(
      "PROOF_CLASS_CURRENTNESS_LEDGER_IDENTITY_MISMATCH",
    );
  });

  it("cannot emit gate omission promotion or mutation authority", () => {
    const input = baseInput();
    input.promote = true;
    expect(() => deriveProofClassCurrentnessLedger(input)).toThrow(
      "PROOF_CLASS_CURRENTNESS_INPUT_INVALID",
    );

    const ledger = deriveProofClassCurrentnessLedger(baseInput());
    const serialized = JSON.stringify(ledger);
    expect(serialized).not.toContain("SKIP_GATE");
    expect(serialized).not.toContain("OMIT_VALIDATION");
    expect(serialized).not.toContain("PROMOTE");
    expect(serialized).not.toContain("scheduledGateIds");
    expect(ledger.mutationAuthorization).toBe(false);
    expect(PROOF_CLASS_CURRENTNESS_REASON_CODES).toContain("TARGETED_PRUNING_POLICY_MISMATCH");
  });
});
