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

Every package under `packages/` is an ordinary npm package: it declares a plain semantic version, real dependency ranges (no `workspace:` protocol) and `publishConfig.access`, so publishing needs nothing but npm:

```sh
cd packages/mobile-template && npm publish
cd packages/create-mobile-app && npm publish
```

- `npm publish --dry-run` prints the tarball and the target registry without uploading; `pnpm publish:dry-run` does it for every package and runs in CI.
- `pnpm test:packages` must pass before publishing; the runtime package also runs `prepublishOnly: npm run typecheck`.
- `pnpm pack:packages` prints the tarball contents of every package, so a release can be reviewed without publishing.
- `pnpm verify:consumer` packs, scaffolds, installs and resolves a clean consumer project; it is also part of CI.
- No registry is hard-coded. `NPM_CONFIG_REGISTRY` and `NODE_AUTH_TOKEN` select the registry (the publish workflow reads the `NPM_REGISTRY_URL` repository variable and `NPM_TOKEN`), and `MOBILE_TEMPLATE_PACKAGE` renames the package when a fork publishes under another name.
- The publish workflow (`.github/workflows/release.yml`) runs a plain `npm publish` in the selected package directory.


## Versioning

EAS remote app versioning controls build increments. Keep the marketing version in `app.config.ts` and update the runtime version whenever native compatibility changes.

## Pre-release checklist

- Audit dependencies and native permissions.
- Verify public environment variables contain no secrets.
- Validate deep links and external URL schemes.
- Review production logs and update channels.
- Test a release build on both iOS and Android.
