const status = document.querySelector<HTMLParagraphElement>("#status");

if (status === null) throw new Error("secure-shell-status-target-missing");

const { platform, shellVersion } = window.retrostageShell;
status.textContent = `Secure shell ${shellVersion} ready on ${platform}.`;
