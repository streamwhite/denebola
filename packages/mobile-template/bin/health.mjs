#!/usr/bin/env node
// Shared project health probe used by `mobile-template-doctor` and `mobile-template-update`.
// Resolves installs from the project's own node_modules so a leaked NODE_PATH cannot lie.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const TEMPLATE_PACKAGE = process.env.MOBILE_TEMPLATE_PACKAGE ?? "@your-scope/mobile-template";
export const REGISTRY = process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org";
const MANIFEST = "package.json";
const TIMEOUT_MS = 3_000;

export function installed(name, cwd = process.cwd()) {
  const file = join(cwd, "node_modules", ...name.split("/"), MANIFEST);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

export function release(version) {
  const [major, minor] = String(version ?? "").replace(/[^\d.]/g, "").split(".");
  return major && minor ? `${major}.${minor}` : "unknown";
}

export async function latestPublished(registry = REGISTRY, name = TEMPLATE_PACKAGE) {
  try {
    const url = `${registry.replace(/\/+$/, "")}/${name}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) return `unknown (not published to ${registry})`;
    return (await response.json())["dist-tags"]?.latest ?? "unknown";
  } catch {
    return "unavailable (offline or private registry)";
  }
}

// Collects the installed template plus the native stack it integrates.
export function readStack(cwd = process.cwd()) {
  const template = installed(TEMPLATE_PACKAGE, cwd);
  if (!template) return null;
  return {
    template,
    expo: installed("expo", cwd),
    react: installed("react", cwd),
    reactNative: installed("react-native", cwd),
  };
}

export function nativeDrift(stack) {
  return (
    release(stack.expo?.version) !== release(stack.template.dependencies?.expo) ||
    release(stack.reactNative?.version) !== release(stack.template.peerDependencies?.["react-native"])
  );
}

export function healthRows(stack, latest) {
  const drift = nativeDrift(stack);
  return [
    ["template installed", stack.template.version],
    ["template latest", latest],
    ["expo expected", stack.template.dependencies?.expo ?? "unknown"],
    ["expo installed", stack.expo?.version ?? "not installed"],
    ["react expected", stack.template.peerDependencies?.react ?? "unknown"],
    ["react installed", stack.react?.version ?? "not installed"],
    ["react-native expected", stack.template.peerDependencies?.["react-native"] ?? "unknown"],
    ["react-native installed", stack.reactNative?.version ?? "not installed"],
    ["native rebuild", drift ? "required: installed native stack drifts from the template" : "not required for JavaScript-only changes"],
    ["update", `pnpm update ${TEMPLATE_PACKAGE} --latest`],
  ];
}
