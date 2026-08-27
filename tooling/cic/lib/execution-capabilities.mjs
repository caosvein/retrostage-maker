import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";

export const REQUIRED_I2_CAPABILITIES = Object.freeze([
  "cic.source-generation.read",
  "filesystem.repository.read",
  "git.config.read",
  "git.index.read",
  "git.local.read",
  "git.objects.read",
  "git.refs.read",
  "git.worktree.read",
]);

function stableUnique(values) {
  return [...new Set(values)].sort();
}

export function evaluateExecutionCapabilities(
  { available = [], unknown = [] },
  required = REQUIRED_I2_CAPABILITIES,
) {
  const stableRequired = stableUnique(required);
  const stableAvailable = stableUnique(available);
  const stableUnknown = stableUnique(unknown);
  const availableSet = new Set(stableAvailable);
  const unknownSet = new Set(stableUnknown);
  const missing = stableRequired.filter(
    (capability) => !availableSet.has(capability) && !unknownSet.has(capability),
  );
  const requiredUnknown = stableRequired.filter((capability) => unknownSet.has(capability));
  const witness = {
    available: stableAvailable,
    missing,
    required: stableRequired,
    unknown: stableUnknown,
  };
  return {
    ...witness,
    status: missing.length === 0 && requiredUnknown.length === 0 ? "PASS" : "BLOCKED",
    capabilityFingerprint: sha256Hex(`CIC-EXECUTION-CAPABILITIES-V1\n${canonicalJson(witness)}\n`),
  };
}
