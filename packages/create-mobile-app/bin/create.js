#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE_PACKAGE = process.env.MOBILE_TEMPLATE_PACKAGE ?? "@your-scope/mobile-template";
const PLACEHOLDER_NAME = "{{name}}";
const PLACEHOLDER_PACKAGE = "{{packageName}}";
const SOURCE_DIR = path.resolve(__dirname, "../template");
const USAGE = "Usage: create-mobile-app <directory>";

const target = process.argv[2];
if (!target || target === "--help" || target === "-h") {
  console.log(USAGE);
  process.exit(target ? 0 : 1);
}

const dest = path.resolve(process.cwd(), target);
const name = toPackageName(path.basename(dest));
if (!name) {
  console.error(`Cannot derive a project name from: ${target}`);
  process.exit(1);
}
if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
  console.error(`Directory not empty: ${dest}`);
  process.exit(1);
}

function toPackageName(value) {
  return value.replace(/[^a-z0-9-]/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function write(source, out) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(out, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      write(from, to);
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    const content = fs.readFileSync(from, "utf8").replaceAll(PLACEHOLDER_NAME, name).replaceAll(PLACEHOLDER_PACKAGE, TEMPLATE_PACKAGE);
    fs.writeFileSync(to, content);
  }
}

fs.mkdirSync(dest, { recursive: true });
write(SOURCE_DIR, dest);
console.log(`Created ${name} in ${dest}`);
console.log(`Next: cd ${target} && pnpm install && pnpm dev`);

