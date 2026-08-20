import { Color3, MeshBuilder, Vector3 } from "@babylonjs/core";

import type { RendererGridFactory } from "./grid-port.js";

export const createBabylonGrid: RendererGridFactory = (sceneNativeHandle, lines, visual) => {
  if (
    sceneNativeHandle === null ||
    (typeof sceneNativeHandle !== "object" && typeof sceneNativeHandle !== "function")
  ) {
    throw new Error("The private Scene handle is unavailable for Grid construction.");
  }

  const mesh = MeshBuilder.CreateLineSystem(
    "retrostage-editor-grid",
    {
      lines: lines.map(({ end, start }) => [
        new Vector3(start.x, start.y, start.z),
        new Vector3(end.x, end.y, end.z),
      ]),
      updatable: false,
    },
    sceneNativeHandle as Parameters<typeof MeshBuilder.CreateLineSystem>[2],
  );
  mesh.alpha = visual.alpha;
  mesh.color = new Color3(visual.red, visual.green, visual.blue);
  mesh.isPickable = false;
  mesh.isVisible = false;

  return {
    dispose: () => mesh.dispose(),
    setVisible: (visible) => {
      mesh.isVisible = visible;
    },
  };
};
