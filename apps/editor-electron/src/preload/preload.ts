import { contextBridge } from "electron";

import type { RetroStageShell } from "../shell-api.js";

const userAgentPlatform = navigator.platform.toLowerCase();
const platform = userAgentPlatform.includes("mac")
  ? "darwin"
  : userAgentPlatform.includes("linux")
    ? "linux"
    : "win32";

const capabilities = Object.freeze({
  privilegedIpc: false,
  filesystem: false,
  projectDocuments: false,
  sceneRuntime: false,
  export: false,
} as const);

const shell: RetroStageShell = Object.freeze({
  productName: "RetroStage Maker",
  shellVersion: "0.0.0",
  platform,
  capabilities,
});

contextBridge.exposeInMainWorld("retrostageShell", shell);
