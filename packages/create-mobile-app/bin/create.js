#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE_PACKAGE = process.env.DENEBOLA_PACKAGE ?? "denebola";
const PLACEHOLDER_NAME = "{{name}}";
const PLACEHOLDER_PACKAGE = "{{packageName}}";
const PLACEHOLDER_APP_ID = "{{appId}}";
const PLACEHOLDER_SCHEME = "{{scheme}}";
const SOURCE_DIR = path.resolve(__dirname, "../template");
const USAGE = "Usage: create-mobile-app <directory>";
const APP_ID_PREFIX = (process.env.DENEBOLA_APP_ID_PREFIX ?? "com.example").replace(/\.+$/, "");
const JAVA_KEYWORDS = /^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/;

const target = process.argv[2];
if (!target || target === "--help" || target === "-h") {
  console.log(USAGE);
  process.exit(target ? 0 : 1);
}

const dest = path.resolve(process.cwd(), target);
const baseName = path.basename(dest);
const name = toProjectName(baseName);
const segment = toJavaSegment(baseName);
if (!name || !segment) {
  console.error(`Cannot derive a project name from: ${target}`);
  process.exit(1);
}
if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
  console.error(`Directory not empty: ${dest}`);
  process.exit(1);
}

// Lowercase slug used for the project name and manifest slug.
function toProjectName(value) {
  return value.replace(/[^a-z0-9-]/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

// A valid Java package segment: alphanumeric, starting with a letter, not a reserved word.
function toJavaSegment(value) {
  const cleaned = value.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!cleaned) return "";
  const segment = /^[a-z]/.test(cleaned) ? cleaned : `app${cleaned}`;
  return JAVA_KEYWORDS.test(segment) ? `${segment}app` : segment;
}

function toScheme(value) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase() || "myapp";
}

function write(source, out) {
  const replacements = {
    [PLACEHOLDER_NAME]: name,
    [PLACEHOLDER_PACKAGE]: TEMPLATE_PACKAGE,
    [PLACEHOLDER_APP_ID]: `${APP_ID_PREFIX}.${segment}`,
    [PLACEHOLDER_SCHEME]: toScheme(name),
  };
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(out, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      write(from, to);
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    const template = fs.readFileSync(from, "utf8");
    const content = Object.entries(replacements).reduce((text, [token, value]) => text.replaceAll(token, value), template);
    fs.writeFileSync(to, content);
  }
}

fs.mkdirSync(dest, { recursive: true });
write(SOURCE_DIR, dest);
console.log(`Created ${name} in ${dest}`);
console.log(`Next: cd ${target} && pnpm install && pnpm dev`);
