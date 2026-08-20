import type { RendererCameraProjection } from "../src/index.js";
import { RendererCameraController } from "../src/camera/camera-controller.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

const requested: RendererCameraProjection = {
  alphaRadians: 0.4,
  betaRadians: 0.9,
  farClip: 400,
  nearClip: 0.2,
  radius: 14,
  target: { x: 2, y: 3, z: 4 },
  verticalFieldOfViewRadians: 0.7,
};

describe("RSM-6-I3 pure Camera controller", () => {
  it("applies one update per request and keeps suspended state private until reapply", () => {
    const updates: RendererCameraProjection[] = [];
    const controller = new RendererCameraController(() => ({
      dispose: () => undefined,
      setProjection: (projection) => updates.push(structuredClone(projection)),
    }));
    controller.initialize({});
    const initialCount = updates.length;
    expect(controller.setProjection(requested, true)).toBe(true);
    expect(updates.length).toBe(initialCount + 1);
    const suspended = { ...requested, radius: 18 };
    expect(controller.setProjection(suspended, false)).toBe(true);
    expect(updates.length).toBe(initialCount + 1);
    expect(controller.currentProjection()).toEqual(suspended);
    controller.reapply();
    expect(updates.at(-1)).toEqual(suspended);
  });

  it("owns no DOM control listeners and never mutates caller semantic input", () => {
    const input = structuredClone(requested);
    const controller = new RendererCameraController(() => ({
      dispose: () => undefined,
      setProjection: () => undefined,
    }));
    controller.initialize({});
    expect(controller.setProjection(input, true)).toBe(true);
    expect(input).toEqual(requested);
    expect("attachControl" in controller).toBe(false);
    expect("addEventListener" in controller).toBe(false);
    controller.dispose();
  });
});
