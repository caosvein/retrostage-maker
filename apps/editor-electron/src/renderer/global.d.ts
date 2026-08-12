import type { RetroStageShell } from "../shell-api.js";

declare global {
  interface Window {
    readonly retrostageShell: RetroStageShell;
  }
}

export {};
