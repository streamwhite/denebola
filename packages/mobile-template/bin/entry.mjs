// True when this module is the process entry point, even when it is reached through a
// package-manager symlink (pnpm links node_modules/<pkg> to node_modules/.pnpm/<pkg>).
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

function realpathSafe(path) {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

export function isEntryPoint(moduleUrl, argvPath = process.argv[1]) {
  if (!argvPath) return false;
  return moduleUrl === pathToFileURL(realpathSafe(argvPath)).href;
}
