# Changelog

All notable changes to `@your-scope/mobile-template` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Package update / sync contract: framework and module versions (`frameworkVersion`,
  `MODULE_VERSIONS`, `moduleVersion`), version compatibility matrix (`VERSION_MATRIX`,
  `checkCompatibility`), breaking-change detection (`classifyChange`, `isBreaking`, `isNewer`)
  and the migration/codemod contract (`FrameworkMigration`, `Codemod`, `migrationSummary`).
- `mobile-template-update` CLI: reports project health, upgrade type, native compatibility and
  the migration plan; `--apply` runs framework-file migrations through the checksum-guarded engine.
- `docs/UPGRADING.md` upgrade guide and this changelog.

## [0.1.0]

### Added

- Initial runtime package: providers, UI primitives, API/auth/storage/i18n/navigation/native
  abstractions, testing helpers, Expo config plugin, `mobile-template-doctor` and
  `mobile-template-migrate` binaries.
