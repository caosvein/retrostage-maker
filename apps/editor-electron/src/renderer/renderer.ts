import { createViewportView } from "./viewport-view.js";

const root = document.querySelector<HTMLElement>("#retrostage-viewport-root");
const status = document.querySelector<HTMLParagraphElement>("#status");

if (root === null || status === null) throw new Error("secure-shell-viewport-target-missing");

const { platform, shellVersion } = window.retrostageShell;
status.textContent = `Secure shell ${shellVersion} ready on ${platform}.`;

const viewport = await createViewportView(root);
window.addEventListener("beforeunload", () => void viewport.dispose(), { once: true });
