#!/usr/bin/env bash
# Verifies the consumer flow end to end: scaffold, pack the runtime package, install in a clean
# project, resolve the Expo config, and report through the doctor command.
# Usage: bash scripts/verify-consumer-fixture.sh   (WORK_DIR=/tmp/x KEEP=1 to keep the fixture)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="$REPO_ROOT/packages/mobile-template"
CREATE_BIN="$REPO_ROOT/packages/create-mobile-app/bin/create.js"
PACKAGE_SPEC="denebola"
PROJECT_NAME="fixture-app"
SINGLE_INSTANCE_PACKAGES="expo|react|react-native|expo-router|react-intl|@tanstack\+react-query"
EXPECTED_SINGLE_INSTANCE=6
WORK_DIR="${WORK_DIR:-$(mktemp -d)}"
APP_DIR="$WORK_DIR/$PROJECT_NAME"
mkdir -p "$WORK_DIR"

echo "==> work dir: $WORK_DIR"
( cd "$TEMPLATE_DIR" && npm pack --pack-destination "$WORK_DIR" > /dev/null )
TARBALL="$(ls "$WORK_DIR"/denebola-*.tgz)"
echo "==> packed $(basename "$TARBALL")"
CONTENTS="$(tar tzf "$TARBALL")"
grep -qE "^package/(app.plugin.js|src/index.tsx|bin/doctor.mjs|package.json)$" <<< "$CONTENTS"
! grep -qE "^package/(android|ios|src/app)/" <<< "$CONTENTS"

( cd "$WORK_DIR" && node "$CREATE_BIN" "$PROJECT_NAME" )
node -e 'const fs=require("node:fs");const [file,name,spec]=process.argv.slice(1);const manifest=JSON.parse(fs.readFileSync(file,"utf8"));manifest.dependencies[name]=`file:${spec}`;fs.writeFileSync(file,`${JSON.stringify(manifest,null,2)}\n`);' "$APP_DIR/package.json" "$PACKAGE_SPEC" "$TARBALL"

cd "$APP_DIR"
pnpm install --ignore-scripts --silent
echo "==> installed a clean project without installing Expo separately"

pnpm exec expo config --type public > /dev/null
echo "==> expo config resolved with the template config plugin"

pnpm exec tsc --noEmit
echo "==> consumer entry files typecheck against the packaged entry points"

pnpm denebola:doctor

count="$(ls node_modules/.pnpm | grep -cE "^($SINGLE_INSTANCE_PACKAGES)@")"
[ "$count" -eq "$EXPECTED_SINGLE_INSTANCE" ] || { echo "expected $EXPECTED_SINGLE_INSTANCE single-instance packages, found $count"; exit 1; }
echo "==> expo, expo-router, react, react-native, react-intl and @tanstack/react-query resolve to a single instance"

[ "${KEEP:-0}" = "1" ] || rm -rf "$WORK_DIR"
echo "==> consumer fixture verification passed"