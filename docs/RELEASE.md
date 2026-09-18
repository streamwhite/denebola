# Release Workflow

## Profiles

- `development`: development client and `development` update channel
- `preview`: internal distribution and `staging` update channel
- `production`: store binary and `production` update channel

Build a binary with `eas build --profile <profile>`, submit production with `eas submit --profile production`, and publish JavaScript-only changes with the matching `eas update` script.

Native dependency, app config, permission, runtime-version, and native code changes require a new binary. OTA updates are only for compatible JavaScript/assets changes.

## Versioning

EAS remote app versioning controls build increments. Keep the marketing version in `app.config.ts` and update the runtime version whenever native compatibility changes.

## Pre-release checklist

- Audit dependencies and native permissions.
- Verify public environment variables contain no secrets.
- Validate deep links and external URL schemes.
- Review production logs and update channels.
- Test a release build on both iOS and Android.
