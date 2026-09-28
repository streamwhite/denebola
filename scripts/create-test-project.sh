#!/usr/bin/env bash
# Creates a runnable test project from this repository's packages, using the packed tarball so the
# project genuinely consumes the published artifact (not workspace links).
#
#   bash scripts/create-test-project.sh [project-name] [target-dir]
#
# Env:
#   KEEP=1          keep the work dir even on success (default: project is kept, temp tarball removed)
#   INSTALL=0       scaffold only, skip pnpm install and verification
#   DENEBOLA_PACKAGE  override the runtime package name (forks)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="$REPO_ROOT/packages/mobile-template"
CREATE_BIN="$REPO_ROOT/packages/create-mobile-app/bin/create.js"
PACKAGE_SPEC="${DENEBOLA_PACKAGE:-denebola}"
PROJECT_NAME="${1:-test-app}"
TARGET_DIR="${2:-$REPO_ROOT/../$PROJECT_NAME}"
APP_DIR="$TARGET_DIR/$PROJECT_NAME"
TMP_DIR="$(mktemp -d)"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "==> packaging $PACKAGE_SPEC"
mkdir -p "$TARGET_DIR"
( cd "$TEMPLATE_DIR" && npm pack --pack-destination "$TMP_DIR" > /dev/null )
TARBALL="$(ls "$TMP_DIR"/denebola-*.tgz)"
echo "==> packed $(basename "$TARBALL")"

echo "==> scaffolding $PROJECT_NAME in $TARGET_DIR"
( cd "$TARGET_DIR" && node "$CREATE_BIN" "$PROJECT_NAME" )

# Vendor the tarball inside the project so the dependency path stays valid after install.
mkdir -p "$APP_DIR/vendor"
cp "$TARBALL" "$APP_DIR/vendor/"
VENDORED="$APP_DIR/vendor/$(basename "$TARBALL")"
node -e 'const fs=require("node:fs");const [file,name,spec]=process.argv.slice(1);const m=JSON.parse(fs.readFileSync(file,"utf8"));m.dependencies[name]=`file:${spec}`;fs.writeFileSync(file,`${JSON.stringify(m,null,2)}\n`);' \
  "$APP_DIR/package.json" "$PACKAGE_SPEC" "$VENDORED"

if [ "${INSTALL:-1}" = "0" ]; then
  echo "==> scaffolded only. Next: cd $APP_DIR && pnpm install && pnpm dev"
  exit 0
fi

echo "==> installing"
# A clean project must resolve from a public registry regardless of the local pnpm config;
# override with NPM_REGISTRY for a private/mirrored registry.
( cd "$APP_DIR" && pnpm install --ignore-scripts --registry "${NPM_REGISTRY:-https://registry.npmjs.org/}" --fetch-timeout "${NPM_FETCH_TIMEOUT:-600000}" )

echo "==> resolving Expo config"
( cd "$APP_DIR" && pnpm exec expo config --type public > /dev/null )

echo "==> typechecking generated entry files"
( cd "$APP_DIR" && pnpm exec tsc --noEmit )

echo "==> project health"
( cd "$APP_DIR" && pnpm denebola:doctor )

echo
echo "==> test project ready: $APP_DIR"
echo "    cd $APP_DIR && pnpm dev"
