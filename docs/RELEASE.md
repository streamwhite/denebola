# Release Workflow

## Profiles

- `development`: development client and `development` update channel
- `preview`: internal distribution and `staging` update channel
- `production`: store binary and `production` update channel

Build a binary with `eas build --profile <profile>`, submit production with `eas submit --profile production`, and publish JavaScript-only changes with the matching `eas update` script.

Each profile extends `base` and pins its environment through both the EAS `environment` field and `env.EXPO_PUBLIC_APP_ENV`, so build-time environment variables cannot leak across profiles. `pnpm build:preview`, `pnpm build:production` and `pnpm submit:production` wrap the common cases.

## Runtime version, channel and OTA updates

`app.config.ts` sets `runtimeVersion: { policy: "nativeVersion" }`, so a binary's runtime version follows its native build. An OTA update is only applied when its channel and runtime version match the installed binary:

- `decideUpdate(binary, update)` returns `{ allowed, reason }` for `ok`, `channel-mismatch`, `runtime-mismatch` or `rollback`.
- `resolveRuntimeVersion(policy, appVersion)` maps the policy to the value; `isRuntimeCompatible` compares versions.
- `RELEASE_PROFILE_CONFIG` maps each profile to its channel, environment and distribution.

Roll back a bad update with `pnpm update:rollback`; `selectRollbackTarget(current, history)` identifies the most recent compatible earlier update on the same channel/runtime for an app-driven rollback.

Signing stays remote by default; `signingConfig("ios" | "android", "local")` describes a local-credentials override for a profile.

Native dependency, app config, permission, runtime-version, and native code changes require a new binary. OTA updates are only for compatible JavaScript/assets changes.

## Runtime package releases

Every package under `packages/` is an ordinary npm package: it declares a plain semantic version, real dependency ranges (no `workspace:` protocol) and `publishConfig.access`, so publishing needs nothing but npm. The release flow automates the whole sequence — verify, bump, changelog, publish, tag:

```sh
pnpm release patch              # verify + bump patch + publish dry-run + commit changelog
pnpm release minor --publish    # bump minor, really publish both packages, commit
pnpm release 1.0.0 --publish --tag   # explicit version and a git tag
```

`scripts/release.mjs`:

- runs `pnpm test:packages`, `pnpm typecheck` and `pnpm publish:dry-run` before changing anything;
- bumps both `packages/mobile-template` and `packages/create-mobile-app` to the same version and moves the `Unreleased` changelog notes under the new version;
- publishes each package with `npm publish` — pass `--publish` to upload, otherwise everything stays a `--dry-run`;
- commits the version bump when publishing (`--no-commit` to skip, `--commit` to force in dry-run) and tags `vX.Y.Z` with `--tag`;
- refuses a version that is not newer than the current one.

For a manual release the plain commands still work:

```sh
cd packages/mobile-template && npm publish
cd packages/create-mobile-app && npm publish
```

## Registry

Installs and publishes resolve from the public npm registry by default, so the project does not depend on a developer's global config:

- `pnpm-workspace.yaml` `registries` and `.npmrc`: installs resolve from `https://registry.npmjs.org/` (`@jsr` → jsr).
- `pnpm release` and `.github/workflows/release.yml` publish to `https://registry.npmjs.org/` with an explicit `--registry`.
- Override the publish target with `NPM_REGISTRY_URL` (for example a private mirror: `NPM_REGISTRY_URL=https://npm.example.com pnpm release minor --publish`). The publish workflow reads the same `NPM_REGISTRY_URL` repository variable.
- Auth is never committed. Provide `NODE_AUTH_TOKEN` (CI) or a user-level `~/.npmrc` token.

- `npm publish --dry-run` prints the tarball and the target registry without uploading; `pnpm publish:dry-run` does it for every package and runs in CI.
- `pnpm test:packages` must pass before publishing; the runtime package also runs `prepublishOnly: npm run typecheck`.
- `pnpm pack:packages` prints the tarball contents of every package, so a release can be reviewed without publishing.
- `pnpm verify:consumer` packs, scaffolds, installs and resolves a clean consumer project; it is also part of CI.
- `DENEBOLA_PACKAGE` renames the package when a fork publishes under another name.
- The publish workflow (`.github/workflows/release.yml`) runs `npm publish` against the selected registry in the selected package directory.

## Try it against a real project

Scaffold a runnable project from the packed packages, exactly as a consumer would install them:

```sh
pnpm create:test-project my-app          # -> ../my-app, installed, Expo config + typecheck + doctor
pnpm create:test-project my-app /tmp/apps # choose the parent directory
```

`scripts/create-test-project.sh` packs `packages/mobile-template`, vendors the tarball inside the project, scaffolds with `create-denebola`, installs from the public registry (override with `NPM_REGISTRY`), then resolves the Expo config, typechecks the generated entry files and prints `denebola-doctor`. Set `INSTALL=0` to scaffold only.


## Versioning

EAS remote app versioning controls build increments. Keep the marketing version in `app.config.ts` and update the runtime version whenever native compatibility changes.

## Pre-release checklist

- Audit dependencies and native permissions.
- Verify public environment variables contain no secrets.
- Validate deep links and external URL schemes.
- Review production logs and update channels.
- Test a release build on both iOS and Android.
