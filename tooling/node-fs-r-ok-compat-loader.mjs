const wrapperSource = [
  'export * from "node:fs";',
  'import fs, { constants } from "node:fs";',
  "export default fs;",
  "export const R_OK = constants.R_OK;",
].join("\n");

const wrapperUrl = `data:text/javascript,${encodeURIComponent(wrapperSource)}`;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "node:fs" && context.parentURL !== wrapperUrl) {
    return { shortCircuit: true, url: wrapperUrl };
  }

  return nextResolve(specifier, context);
}
