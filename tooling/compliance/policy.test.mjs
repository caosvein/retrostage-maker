import { describe, expect, it } from "vitest";

import {
  HOST_SENSITIVE_ARTIFACTS,
  OWNER_EXCEPTIONS,
  PLATFORM_NEUTRAL_ARTIFACTS,
  artifactComparisonDisposition,
  classifyArtifactPath,
  classifyLicenseIdentity,
  complianceComparisonPolicy,
  createArtifactProvenanceFields,
  escapeHtml,
  normalizeSafeSourceUrl,
  renderNoticesHtml,
  selectSafeNoticeSource,
  validateActionReference,
  validateArtifactProvenance,
  vulnerabilityDisposition,
} from "./policy.mjs";

const approvedActions = new Map([["actions/checkout", "3d3c42e5aac5ba805825da76410c181273ba90b1"]]);

describe("RSM-3-I3 compliance policy", () => {
  it("rejects a prohibited license", () => {
    expect(
      classifyLicenseIdentity({ name: "x", version: "1.0.0", license: "GPL-3.0" }).prohibited,
    ).toBe(true);
  });

  it("blocks an unapproved manual-review license", () => {
    expect(
      classifyLicenseIdentity({ name: "x", version: "1.0.0", license: "MPL-2.0" }).classification,
    ).toBe("UNAPPROVED_MANUAL_REVIEW");
  });

  it("accepts only the exact argparse owner exception", () => {
    expect(
      classifyLicenseIdentity({ name: "argparse", version: "2.0.1", license: "Python-2.0" })
        .classification,
    ).toBe("OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE");
  });

  it("accepts only the exact minimatch owner exception", () => {
    expect(
      classifyLicenseIdentity({ name: "minimatch", version: "10.2.6", license: "BlueOak-1.0.0" })
        .classification,
    ).toBe("OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE");
  });

  it("locks owner exceptions to the exact fourteen Windows/x64 identities", () => {
    expect([...OWNER_EXCEPTIONS.keys()]).toEqual([
      "argparse@2.0.1",
      "caniuse-lite@1.0.30001809",
      "chownr@3.0.0",
      "lightningcss@1.33.0",
      "lightningcss-win32-x64-msvc@1.33.0",
      "minimatch@10.2.6",
      "minipass@7.1.3",
      "minipass-flush@1.0.7",
      "spdx-exceptions@2.5.0",
      "spdx-license-ids@3.0.23",
      "tar@7.5.22",
      "type-fest@0.13.1",
      "type-fest@1.4.0",
      "yallist@5.0.0",
    ]);
  });

  it("does not pre-approve non-current-platform Lightning CSS identities", () => {
    for (const name of [
      "lightningcss-android-arm64",
      "lightningcss-darwin-arm64",
      "lightningcss-darwin-x64",
      "lightningcss-freebsd-x64",
      "lightningcss-linux-arm64-gnu",
      "lightningcss-linux-arm64-musl",
      "lightningcss-linux-arm-gnueabihf",
      "lightningcss-linux-x64-gnu",
      "lightningcss-linux-x64-musl",
      "lightningcss-win32-arm64-msvc",
    ]) {
      expect(classifyLicenseIdentity({ name, version: "1.33.0", license: "MPL-2.0" })).toEqual({
        classification: "UNAPPROVED_MANUAL_REVIEW",
        manualReviewRequired: true,
        ownerExactException: false,
        prohibited: false,
      });
    }
  });

  it("does not transfer an approved license to another identity", () => {
    expect(
      classifyLicenseIdentity({ name: "other", version: "10.2.6", license: "BlueOak-1.0.0" })
        .classification,
    ).toBe("UNAPPROVED_MANUAL_REVIEW");
  });

  it("escapes untrusted notice text", () => {
    expect(escapeHtml('<script data-x="1">&</script>')).toBe(
      "&lt;script data-x=&quot;1&quot;&gt;&amp;&lt;/script&gt;",
    );
  });

  it("orders notice entries deterministically", () => {
    const entry = (name) => ({
      name,
      version: "1.0.0",
      license: "MIT",
      classification: "AUTOMATICALLY_ADMISSIBLE",
      distributionScope: "DEVELOPMENT / BOOTSTRAP TOOLING ONLY",
      specialObligation: "Preserve license text.",
      author: "Example Author",
      safeSourceUrl: "https://example.com/source",
      licenseFiles: [],
      noticeFiles: [],
    });
    const html = renderNoticesHtml([entry("zeta"), entry("alpha")]);
    expect(html.indexOf("alpha 1.0.0")).toBeLessThan(html.indexOf("zeta 1.0.0"));
  });

  it("classifies native and WASM fixtures deterministically", () => {
    expect([classifyArtifactPath("x/addon.node"), classifyArtifactPath("x/module.wasm")]).toEqual([
      "NATIVE_BINARY",
      "WASM",
    ]);
  });

  it("rejects a mutable GitHub Action ref", () => {
    expect(validateActionReference("actions/checkout@v7", approvedActions).valid).toBe(false);
  });

  it("accepts the reviewed full 40-hex Action ref", () => {
    expect(
      validateActionReference(
        "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
        approvedActions,
      ).valid,
    ).toBe(true);
  });

  it("blocks high and critical vulnerabilities", () => {
    expect([
      vulnerabilityDisposition("high").blocking,
      vulnerabilityDisposition("critical").blocking,
    ]).toEqual([true, true]);
  });

  it("keeps a low vulnerability visible but non-blocking", () => {
    expect(vulnerabilityDisposition("low")).toEqual({
      blocking: false,
      state: "OPEN_NON_BLOCKING",
    });
  });

  it("selects full baseline comparison for win32/x64", () => {
    const policy = complianceComparisonPolicy("win32", "x64");
    expect(policy.fullBaselineByteComparison).toBe(true);
    expect(policy.byteComparedArtifacts).toEqual([
      ...PLATFORM_NEUTRAL_ARTIFACTS,
      ...HOST_SENSITIVE_ARTIFACTS,
    ]);
  });

  it("selects current-host validation for linux/x64", () => {
    const policy = complianceComparisonPolicy("linux", "x64");
    expect(policy.fullBaselineByteComparison).toBe(false);
    expect(policy.hostSensitiveCurrentHostValidation).toBe(true);
    expect(policy.byteComparedArtifacts).toEqual(PLATFORM_NEUTRAL_ARTIFACTS);
  });

  it("declares the exact host-sensitive artifact list", () => {
    expect(HOST_SENSITIVE_ARTIFACTS).toEqual([
      "dependency-inventory.json",
      "license-review.json",
      "THIRD_PARTY_NOTICES.html",
      "native-binary-inventory.json",
      "wasm-module-inventory.json",
      "security-findings.json",
    ]);
  });

  it("declares the exact platform-neutral artifact list", () => {
    expect(PLATFORM_NEUTRAL_ARTIFACTS).toEqual(["bom.cdx.json", "README.md"]);
  });

  it("tolerates a host-sensitive byte mismatch only on a non-baseline host", () => {
    expect(
      artifactComparisonDisposition({
        artifactName: "native-binary-inventory.json",
        platform: "linux",
        architecture: "x64",
        matches: false,
      }),
    ).toEqual({
      byteCompared: false,
      blocking: false,
      result: "HOST_SENSITIVE_DEFERRED",
    });
  });

  it("blocks a host-sensitive byte mismatch on the baseline host", () => {
    expect(
      artifactComparisonDisposition({
        artifactName: "native-binary-inventory.json",
        platform: "win32",
        architecture: "x64",
        matches: false,
      }).blocking,
    ).toBe(true);
  });

  it("blocks a platform-neutral byte mismatch on every host", () => {
    for (const [platform, architecture] of [
      ["win32", "x64"],
      ["linux", "x64"],
    ]) {
      expect(
        artifactComparisonDisposition({
          artifactName: "bom.cdx.json",
          platform,
          architecture,
          matches: false,
        }).blocking,
      ).toBe(true);
    }
  });

  it("renders a safe source-link fallback when standalone notice text is absent", () => {
    const html = renderNoticesHtml([
      {
        name: "fallback-package",
        version: "1.0.0",
        license: "MIT",
        author: "Upstream Holder",
        safeSourceUrl: "https://example.com/source",
        classification: "AUTOMATICALLY_ADMISSIBLE",
        distributionScope: "DEVELOPMENT / BOOTSTRAP TOOLING ONLY",
        specialObligation: "Preserve license material.",
        licenseFiles: [],
        noticeFiles: [],
      },
    ]);
    expect(html).toContain("approved bootstrap notice-reference strategy");
    expect(html).toContain('href="https://example.com/source"');
  });

  it("normalizes git+https source URLs", () => {
    expect(normalizeSafeSourceUrl("git+https://github.com/example/project.git")).toBe(
      "https://github.com/example/project.git",
    );
  });

  it("normalizes GitHub git protocol source URLs", () => {
    expect(normalizeSafeSourceUrl("git://github.com/example/project.git")).toBe(
      "https://github.com/example/project.git",
    );
  });

  it("normalizes npm GitHub shorthand source identities", () => {
    expect(normalizeSafeSourceUrl("kevva/compare-version")).toBe(
      "https://github.com/kevva/compare-version",
    );
  });

  it("rejects unsafe source URL schemes", () => {
    for (const value of [
      "javascript:alert(1)",
      "data:text/plain,x",
      "file:///tmp/x",
      "ssh://git@example.com/x",
      "git+ssh://git@example.com/x",
    ]) {
      expect(normalizeSafeSourceUrl(value)).toBe("");
    }
  });

  it("falls back from an unsafe repository to a safe homepage", () => {
    expect(
      selectSafeNoticeSource({
        repository: "git+ssh://git@example.com/x",
        homepage: "https://example.com/project",
      }),
    ).toBe("https://example.com/project");
  });

  it("blocks a notice with neither text nor a safe source URL", () => {
    expect(() =>
      renderNoticesHtml([
        {
          name: "blocked-package",
          version: "1.0.0",
          license: "MIT",
          author: "",
          safeSourceUrl: "file:///tmp/unsafe",
          classification: "AUTOMATICALLY_ADMISSIBLE",
          distributionScope: "DEVELOPMENT / BOOTSTRAP TOOLING ONLY",
          specialObligation: "Preserve license material.",
          licenseFiles: [],
          noticeFiles: [],
        },
      ]),
    ).toThrow("NOTICE_PROVENANCE_BLOCKER");
  });

  it("HTML-escapes stated author and safe URL attribute text", () => {
    const html = renderNoticesHtml([
      {
        name: "escaped-package",
        version: "1.0.0",
        license: "MIT",
        author: '<Holder & "Co">',
        safeSourceUrl: "https://example.com/source?a=1&b=2",
        classification: "AUTOMATICALLY_ADMISSIBLE",
        distributionScope: "DEVELOPMENT / BOOTSTRAP TOOLING ONLY",
        specialObligation: "Preserve license material.",
        licenseFiles: [],
        noticeFiles: [],
      },
    ]);
    expect(html).toContain("&lt;Holder &amp; &quot;Co&quot;&gt;");
    expect(html).toContain('href="https://example.com/source?a=1&amp;b=2"');
  });

  it("creates complete truthful .node provenance with unknown exact ABI", () => {
    const fields = createArtifactProvenanceFields({
      name: "native-addon",
      version: "1.2.3",
      artifactType: ".node",
      repository: "git+https://github.com/example/native-addon.git",
      noticeSourceUrl: "https://github.com/example/native-addon",
      licenseNoticeLocations: ["node_modules/native-addon/LICENSE"],
    });
    expect(validateArtifactProvenance(fields)).toEqual([]);
    expect(fields.abiRuntimeRequirements).toContain(
      "EXACT N-API OR NODE ABI LEVEL NOT ESTABLISHED",
    );
  });

  it("creates complete standalone .exe provenance", () => {
    const fields = createArtifactProvenanceFields({
      name: "native-tool",
      version: "2.0.0",
      artifactType: ".exe",
      repository: "https://example.com/native-tool",
      noticeSourceUrl: "https://example.com/native-tool",
      licenseNoticeLocations: ["node_modules/native-tool/LICENSE"],
    });
    expect(validateArtifactProvenance(fields)).toEqual([]);
    expect(fields.abiRuntimeRequirements).toBe(
      "STANDALONE_PLATFORM_EXECUTABLE / NODE ABI NOT APPLICABLE",
    );
  });

  it("does not retain an unsafe native source repository", () => {
    const fields = createArtifactProvenanceFields({
      name: "native-tool",
      version: "2.0.0",
      artifactType: ".exe",
      repository: "javascript:alert(1)",
      noticeSourceUrl: "https://example.com/native-tool",
      licenseNoticeLocations: [],
    });
    expect(fields.sourceRepository).toBe("");
    expect(fields.sourceCodeAvailability).toBe("PACKAGE_METADATA_ONLY");
    expect(validateArtifactProvenance(fields)).toEqual([]);
  });

  it("never assigns native artifacts a product-packaged role", () => {
    const fields = createArtifactProvenanceFields({
      name: "native-tool",
      version: "2.0.0",
      artifactType: ".node",
      repository: "https://example.com/native-tool",
      noticeSourceUrl: "https://example.com/native-tool",
      licenseNoticeLocations: ["node_modules/native-tool/LICENSE"],
    });
    expect(fields.packagedRole).toBe("DEVELOPMENT_BUILD_TOOL_ONLY / NOT EDITOR_OR_PLAYER_PACKAGED");
  });

  it("records a non-empty lock-aware native replacement procedure", () => {
    const fields = createArtifactProvenanceFields({
      name: "native-tool",
      version: "2.0.0",
      artifactType: ".node",
      repository: "https://example.com/native-tool",
      noticeSourceUrl: "https://example.com/native-tool",
      licenseNoticeLocations: ["node_modules/native-tool/LICENSE"],
    });
    expect(fields.replacementRemovalProcedure).toContain("pnpm-lock.yaml");
    expect(fields.replacementRemovalProcedure).toContain("Do not delete");
  });
});
