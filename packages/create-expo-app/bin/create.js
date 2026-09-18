#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const target = process.argv[2];
if (!target) {
  console.error("Usage: create-your-expo-app <directory>");
  process.exit(1);
}

const source = path.resolve(__dirname, "../../../");
const destination = path.resolve(process.cwd(), target);
const excluded = new Set(["node_modules", ".git", "packages", "tests", "pnpm-lock.yaml", "pnpm-workspace.yaml"]);

function copy(current, output) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const input = path.join(current, entry.name);
    const targetPath = path.join(output, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(targetPath, { recursive: true }); copy(input, targetPath); continue; }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(input, targetPath);
  }
}

if (fs.existsSync(destination) && fs.readdirSync(destination).length > 0) {
  console.error(`Directory is not empty: ${destination}`);
  process.exit(1);
}
fs.mkdirSync(destination, { recursive: true });
copy(source, destination);
const packagePath = path.join(destination, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.name = path.basename(destination);
packageJson.private = true;
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log(`Created Expo app in ${destination}`);
