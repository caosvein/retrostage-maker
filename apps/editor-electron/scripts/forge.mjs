import { api } from "@electron-forge/core";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";

const timeoutMilliseconds = 120_000;
const applicationRoot = path.resolve(import.meta.dirname, "..");

function fileInventory(root) {
  const result = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) {
        const bytes = readFileSync(absolute);
        result.push({
          path: path.relative(root, absolute).replaceAll("\\", "/"),
          bytes: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex").toUpperCase(),
        });
      }
    }
  };
  walk(root);
  return result.sort((left, right) => left.path.localeCompare(right.path, "en"));
}

function verifyPackage(outputPath) {
  const directRoot = path.join(applicationRoot, ".vite");
  const packagedApplicationRoot = path.join(outputPath, "resources", "app");
  const packagedBuildRoot = path.join(packagedApplicationRoot, ".vite");
  const direct = fileInventory(directRoot);
  const packaged = fileInventory(packagedBuildRoot);
  if (JSON.stringify(direct) !== JSON.stringify(packaged)) {
    throw new Error("RSM5_PACKAGED_BUILD_IDENTITY_MISMATCH");
  }
  if (existsSync(path.join(packagedApplicationRoot, "node_modules"))) {
    throw new Error("RSM5_PACKAGED_NODE_MODULES_PRESENT");
  }
  const electronLicenseFiles = ["LICENSE", "LICENSES.chromium.html"];
  for (const filename of electronLicenseFiles) {
    if (!existsSync(path.join(outputPath, filename))) {
      throw new Error(`RSM5_PACKAGED_LICENSE_MISSING:${filename}`);
    }
  }
  return {
    outputPath,
    buildFiles: direct.length,
    buildByteIdentity: true,
    packagedNodeModulesAbsent: true,
    electronLicenseFiles,
  };
}

const timeout = setTimeout(() => {
  process.stderr.write(`RSM5_FORGE_TIMEOUT:${timeoutMilliseconds}\n`);
  process.exit(1);
}, timeoutMilliseconds);

try {
  const startedAt = new Date().toISOString();
  const startedMilliseconds = Date.now();
  process.stdout.write(`${JSON.stringify({ event: "forge-package-start", startedAt })}\n`);
  await api.package({ dir: applicationRoot });
  const outputPath = path.join(
    applicationRoot,
    "out",
    `RetroStageMaker-${process.platform}-${process.arch}`,
  );
  if (!existsSync(outputPath)) throw new Error("RSM5_FORGE_OUTPUT_MISSING");
  const verification = [verifyPackage(outputPath)];
  process.stdout.write(
    `${JSON.stringify({
      event: "forge-package-complete",
      durationMilliseconds: Date.now() - startedMilliseconds,
      completedAt: new Date().toISOString(),
      verification,
    })}\n`,
  );
} finally {
  clearTimeout(timeout);
}
