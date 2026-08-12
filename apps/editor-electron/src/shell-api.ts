export type RetroStageShell = Readonly<{
  productName: "RetroStage Maker";
  shellVersion: "0.0.0";
  platform: "win32" | "darwin" | "linux";
  capabilities: Readonly<{
    privilegedIpc: false;
    filesystem: false;
    projectDocuments: false;
    sceneRuntime: false;
    export: false;
  }>;
}>;
