import type { RendererProjectionRevision } from "../src/index.js";
import { RendererHandleRegistry } from "../src/registry/handle-registry.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

const revision = (value: string): RendererProjectionRevision => value as RendererProjectionRevision;

function captureEpoch(registry: RendererHandleRegistry, current: RendererProjectionRevision) {
  const epoch = registry.captureRegistrationEpoch(current);
  if (epoch === null) throw new Error("Expected an active registration epoch.");
  return epoch;
}

describe("RSM-6-I4 stable handle registry", () => {
  it("preserves opaque exact stable IDs and supports one-to-many current mappings", () => {
    const registry = new RendererHandleRegistry();
    const current = revision("revision-a");
    const lower = {};
    const upper = {};
    const spacedA = {};
    const spacedB = {};

    expect(registry.activateRevision(current, 1, ["entity-a", "Entity-A", " entity-a "])).toBe(
      true,
    );
    const epoch = captureEpoch(registry, current);
    expect(Object.isFrozen(epoch)).toBe(true);
    expect(registry.registerHandle("entity-a", lower, epoch)).toBe(true);
    expect(registry.registerHandle("Entity-A", upper, epoch)).toBe(true);
    expect(registry.registerHandle(" entity-a ", spacedA, epoch)).toBe(true);
    expect(registry.registerHandle(" entity-a ", spacedB, epoch)).toBe(true);
    expect(registry.registerHandle(" entity-a ", spacedB, epoch)).toBe(true);
    expect(registry.resolveHandle(lower)).toBe("entity-a");
    expect(registry.resolveHandle(upper)).toBe("Entity-A");
    expect(registry.resolveHandle(spacedA)).toBe(" entity-a ");
    expect(registry.resolveHandle(spacedB)).toBe(" entity-a ");
    expect(registry.captureSnapshot()).toEqual({
      activeRevision: current,
      handleCount: 4,
      resourceGeneration: 1,
      sceneGeneration: 1,
      stableIdCount: 3,
      terminal: false,
    });
  });

  it("rejects conflicts, absent IDs, invalid IDs, and stale revisions atomically", () => {
    const registry = new RendererHandleRegistry();
    const current = revision("revision-current");
    const stale = revision("revision-stale");
    const handle = {};
    expect(registry.activateRevision(current, 2, ["one", "two"])).toBe(true);
    const epoch = captureEpoch(registry, current);
    expect(registry.registerHandle("one", handle, epoch)).toBe(true);
    const before = registry.captureSnapshot();

    expect(registry.registerHandle("two", handle, epoch)).toBe(false);
    expect(registry.registerHandle("missing", {}, epoch)).toBe(false);
    expect(registry.registerHandle("", {}, epoch)).toBe(false);
    expect(registry.captureRegistrationEpoch(stale)).toBe(null);
    expect(registry.resolveHandle(handle)).toBe("one");
    expect(registry.captureSnapshot()).toEqual(before);

    expect(registry.activateRevision(revision("invalid-empty"), 2, [""])).toBe(false);
    expect(registry.activateRevision(revision("invalid-duplicate"), 2, ["one", "one"])).toBe(false);
    expect(
      registry.activateRevision(
        revision("invalid-runtime-shape"),
        2,
        undefined as unknown as readonly string[],
      ),
    ).toBe(false);
    expect(registry.captureSnapshot()).toEqual(before);
    expect(registry.captureRegistrationEpoch(current)).toBe(epoch);
  });

  it("unregisters both directions idempotently without disturbing sibling handles", () => {
    const registry = new RendererHandleRegistry();
    const current = revision("revision-unregister");
    const first = {};
    const second = {};
    registry.activateRevision(current, 1, ["target"]);
    const epoch = captureEpoch(registry, current);
    registry.registerHandle("target", first, epoch);
    registry.registerHandle("target", second, epoch);

    registry.unregisterHandle(first, epoch);
    registry.unregisterHandle(first, epoch);
    expect(registry.resolveHandle(first)).toBe(null);
    expect(registry.resolveHandle(second)).toBe("target");
    expect(registry.captureSnapshot().handleCount).toBe(1);
    expect(registry.captureSnapshot().stableIdCount).toBe(1);
    registry.unregisterHandle(second, epoch);
    expect(registry.captureSnapshot().handleCount).toBe(0);
    expect(registry.captureSnapshot().stableIdCount).toBe(0);
  });

  it("increments once per new revision, preserves duplicates, and invalidates old handles", () => {
    const registry = new RendererHandleRegistry();
    const firstRevision = revision("revision-1");
    const secondRevision = revision("revision-2");
    const oldHandle = {};
    const newHandle = {};
    expect(registry.captureSnapshot().resourceGeneration).toBe(0);
    expect(registry.activateRevision(firstRevision, 4, ["target"])).toBe(true);
    const firstEpoch = captureEpoch(registry, firstRevision);
    expect(registry.registerHandle("target", oldHandle, firstEpoch)).toBe(true);
    expect(registry.activateRevision(firstRevision, 4, ["ignored-duplicate-input"])).toBe(true);
    expect(registry.captureSnapshot().resourceGeneration).toBe(1);
    expect(registry.captureRegistrationEpoch(firstRevision)).toBe(firstEpoch);
    expect(registry.resolveHandle(oldHandle)).toBe("target");

    expect(registry.activateRevision(secondRevision, 4, ["target"])).toBe(true);
    const secondEpoch = captureEpoch(registry, secondRevision);
    expect(registry.captureSnapshot().resourceGeneration).toBe(2);
    expect(registry.resolveHandle(oldHandle)).toBe(null);
    expect(registry.registerHandle("target", oldHandle, firstEpoch)).toBe(false);
    expect(registry.registerHandle("target", newHandle, secondEpoch)).toBe(true);
    expect(registry.resolveHandle(newHandle)).toBe("target");
  });

  it("rejects A1 work after A to B to A2 and protects reused handles from stale cleanup", () => {
    const registry = new RendererHandleRegistry();
    const revisionA = revision("revision-a");
    const revisionB = revision("revision-b");
    const reusedHandle = {};
    expect(registry.activateRevision(revisionA, 3, ["target"])).toBe(true);
    const epochA1 = captureEpoch(registry, revisionA);
    expect(registry.activateRevision(revisionB, 3, ["target"])).toBe(true);
    expect(registry.activateRevision(revisionA, 3, ["target"])).toBe(true);
    const epochA2 = captureEpoch(registry, revisionA);

    expect(epochA1 === epochA2).toBe(false);
    expect(registry.registerHandle("target", {}, epochA1)).toBe(false);
    expect(registry.registerHandle("target", reusedHandle, epochA2)).toBe(true);
    registry.unregisterHandle(reusedHandle, epochA1);
    expect(registry.resolveHandle(reusedHandle)).toBe("target");
    registry.unregisterHandle(reusedHandle, epochA2);
    expect(registry.resolveHandle(reusedHandle)).toBe(null);
  });

  it("rejects cross-registry and fabricated tokens and terminalizes retained authority", () => {
    const first = new RendererHandleRegistry();
    const second = new RendererHandleRegistry();
    const current = revision("shared-spelling-independent-domain");
    const firstHandle = {};
    const secondHandle = {};
    first.activateRevision(current, 1, ["target"]);
    second.activateRevision(current, 1, ["target"]);
    const firstEpoch = captureEpoch(first, current);
    const secondEpoch = captureEpoch(second, current);
    const fabricatedEpoch = Object.freeze({ ...firstEpoch });
    expect(firstEpoch).toEqual(secondEpoch);
    expect(firstEpoch === secondEpoch).toBe(false);
    expect(first.registerHandle("target", firstHandle, firstEpoch)).toBe(true);
    expect(second.registerHandle("target", secondHandle, secondEpoch)).toBe(true);
    expect(first.registerHandle("target", {}, secondEpoch)).toBe(false);
    expect(first.registerHandle("target", {}, fabricatedEpoch)).toBe(false);
    expect(first.resolveHandle(secondHandle)).toBe(null);
    expect(second.resolveHandle(firstHandle)).toBe(null);
    expect(first.captureSnapshot().sceneGeneration).toBe(1);
    expect(second.captureSnapshot().sceneGeneration).toBe(1);

    first.dispose();
    const terminal = first.captureSnapshot();
    expect(terminal).toEqual({
      activeRevision: null,
      handleCount: 0,
      resourceGeneration: 1,
      sceneGeneration: null,
      stableIdCount: 0,
      terminal: true,
    });
    expect(first.captureRegistrationEpoch(current)).toBe(null);
    expect(first.registerHandle("target", {}, firstEpoch)).toBe(false);
    first.unregisterHandle(firstHandle, firstEpoch);
    expect(first.captureSnapshot()).toEqual(terminal);
    expect(second.resolveHandle(secondHandle)).toBe("target");
  });
});
