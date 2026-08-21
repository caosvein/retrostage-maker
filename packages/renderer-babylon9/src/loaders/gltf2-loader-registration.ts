// @ts-expect-error -- Babylon 9.21.2 physically ships this exact runtime directory subpath,
// but its package metadata has no NodeNext exports mapping for the colocated index.d.ts.
import "@babylonjs/loaders/glTF/2.0";
