#!/usr/bin/env node
// Reports the installed runtime package version, Expo SDK compatibility and whether a native rebuild is required.
import { healthRows, latestPublished, readStack, TEMPLATE_PACKAGE } from "./health.mjs";

const stack = readStack();
if (!stack) {
  console.error(`${TEMPLATE_PACKAGE} is not installed. Run: pnpm add ${TEMPLATE_PACKAGE}`);
  process.exit(1);
}

const rows = healthRows(stack, await latestPublished());
for (const [label, value] of rows) console.log(`${label.padEnd(24)} ${value}`);
