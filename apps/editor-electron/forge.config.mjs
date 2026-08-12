import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const releaseDirectoryUrl = "https://github.com/electron/electron/releases/download/v43.4.0";
const cacheDirectory = createHash("sha256").update(releaseDirectoryUrl).digest("hex");
const defaultCacheRoot =
  process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA ?? os.homedir(), "electron", "Cache")
    : process.platform === "darwin"
      ? path.join(os.homedir(), "Library", "Caches", "electron")
      : path.join(process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache"), "electron");

export default {
  packagerConfig: {
    asar: false,
    electronZipDir: path.join(process.env.ELECTRON_CACHE ?? defaultCacheRoot, cacheDirectory),
    executableName: "RetroStageMaker",
    ignore: [/^\/node_modules(?:\/|$)/u, /^\/out(?:\/|$)/u],
    name: "RetroStageMaker",
  },
  rebuildConfig: {},
};
