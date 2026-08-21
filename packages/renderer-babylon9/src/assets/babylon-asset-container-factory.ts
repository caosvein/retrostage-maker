import { SceneLoader } from "@babylonjs/core";

import "../loaders/gltf2-loader-registration.js";
import type {
  RendererAssetContainerFactory,
  RendererAssetContainerPort,
  RendererAssetInstancePort,
  RendererValidatedAssetSource,
} from "./asset-port.js";

interface BabylonNodeShape {
  dispose(): void;
  getDescendants?(directDescendantsOnly?: boolean): readonly object[];
  getTotalVertices?(): number;
}

interface BabylonTextureShape {
  getSize(): { readonly height: number; readonly width: number };
}

interface BabylonInstantiatedEntriesShape {
  readonly animationGroups?: readonly { dispose(): void }[];
  readonly rootNodes: readonly BabylonNodeShape[];
  readonly skeletons?: readonly { dispose(): void }[];
}

interface BabylonAssetContainerShape {
  readonly meshes: readonly object[];
  readonly textures: readonly BabylonTextureShape[];
  dispose(): void;
  instantiateModelsToScene(): BabylonInstantiatedEntriesShape;
}

export type RendererBabylonAssetLoader = (
  sceneNativeHandle: unknown,
  source: RendererValidatedAssetSource,
) => Promise<unknown>;

const loadWithBabylonSceneLoader: RendererBabylonAssetLoader = async (sceneNativeHandle, source) =>
  SceneLoader.LoadAssetContainerAsync(
    "",
    source.bytes,
    sceneNativeHandle as Parameters<typeof SceneLoader.LoadAssetContainerAsync>[2],
    undefined,
    source.format === "glb-2.0" ? ".glb" : ".gltf",
  );

function isBabylonAssetContainer(value: unknown): value is BabylonAssetContainerShape {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<BabylonAssetContainerShape>;
  return (
    Array.isArray(candidate.meshes) &&
    Array.isArray(candidate.textures) &&
    typeof candidate.dispose === "function" &&
    typeof candidate.instantiateModelsToScene === "function"
  );
}

function uniqueNativeHandles(entries: BabylonInstantiatedEntriesShape): readonly object[] {
  const handles = new Set<object>();
  for (const root of entries.rootNodes) {
    if (typeof root === "object" && root !== null) handles.add(root);
    for (const descendant of root.getDescendants?.(false) ?? []) {
      if (typeof descendant === "object" && descendant !== null) handles.add(descendant);
    }
  }
  return Object.freeze([...handles]);
}

function disposeEntries(entries: BabylonInstantiatedEntriesShape): void {
  let firstCause: unknown;
  for (const resource of [
    ...entries.rootNodes,
    ...(entries.animationGroups ?? []),
    ...(entries.skeletons ?? []),
  ]) {
    try {
      resource.dispose();
    } catch (cause) {
      firstCause ??= cause;
    }
  }
  if (firstCause instanceof Error) throw firstCause;
  if (firstCause !== undefined) {
    throw new Error("A native asset-instance resource could not be disposed.", {
      cause: firstCause,
    });
  }
}

function textureEstimate(textures: readonly BabylonTextureShape[]): number {
  const unique = new Set(textures);
  let total = 0;
  for (const texture of unique) {
    let size: { readonly height: number; readonly width: number };
    try {
      size = texture.getSize();
    } catch {
      continue;
    }
    const width = Number.isFinite(size.width) ? Math.max(0, Math.trunc(size.width)) : 0;
    const height = Number.isFinite(size.height) ? Math.max(0, Math.trunc(size.height)) : 0;
    const addition = width * height * 4;
    total = Number.isSafeInteger(total + addition) ? total + addition : Number.MAX_SAFE_INTEGER;
  }
  return total;
}

function wrapContainer(container: BabylonAssetContainerShape): RendererAssetContainerPort {
  return {
    loadedMeshCount: container.meshes.length,
    textureRgba8EquivalentBytes: textureEstimate(container.textures),
    dispose: () => {
      container.dispose();
    },
    instantiate: (): RendererAssetInstancePort => {
      const entries = container.instantiateModelsToScene();
      const nativeHandles = uniqueNativeHandles(entries);
      return {
        meshCount: nativeHandles.filter(
          (handle) => typeof (handle as BabylonNodeShape).getTotalVertices === "function",
        ).length,
        nativeHandles,
        dispose: () => {
          disposeEntries(entries);
        },
      };
    },
  };
}

export function createBabylonAssetContainerFactory(
  loader: RendererBabylonAssetLoader = loadWithBabylonSceneLoader,
): RendererAssetContainerFactory {
  return async (sceneNativeHandle, source) => {
    const candidate = await loader(sceneNativeHandle, source);
    if (!isBabylonAssetContainer(candidate)) {
      throw new Error("The Babylon loader returned an invalid AssetContainer.");
    }
    return wrapContainer(candidate);
  };
}

export const createBabylonAssetContainer = createBabylonAssetContainerFactory();
