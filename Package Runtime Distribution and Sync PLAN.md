# Package Runtime Distribution and Sync Plan

## 1. Goal

将当前 Expo 模板改造成可发布、可安装、可持续升级的运行时 package，并附带一个 create 命令，像 create-react-app 一样直接生成新项目。

创建新项目：

```sh
pnpm create @your-scope/mobile-app my-app
```

或安装到已有项目：

```sh
pnpm add @your-scope/mobile-template
```

Expo、Expo Router、React Native 和所有原生模块都作为该 package 的依赖，随 package 一起安装和升级，consumer 不需要单独安装 Expo。

业务代码始终由项目自己维护，package 不静默覆盖项目文件。

## 2. Target Architecture

```text
Expo application (business routes/features owned by application)
        │
        └── @your-scope/mobile-template
                ├── peerDependencies (single instance)
                │       ├── react
                │       └── react-native
                │
                ├── dependencies (bundled, transitive)
                │       ├── expo
                │       ├── expo-router
                │       ├── nativewind
                │       ├── react-hook-form / zod / react-query / react-intl
                │       ├── expo-secure-store
                │       ├── expo-splash-screen
                │       ├── expo-status-bar
                │       ├── expo-linking
                │       ├── expo-constants
                │       └── other native modules as needed
                │
                └── own code
                        ├── providers
                        ├── API / auth / storage
                        ├── i18n runtime
                        ├── UI primitives
                        ├── permissions / notifications / deep links / lifecycle
                        └── config plugin
```

单实例约束：React 和 React Native 在运行时只能有一份，因此 `react` / `react-native` 通过 `peerDependencies` 提升到 consumer 顶层；其余（Expo、Expo Router、原生模块）作为 `dependencies` 随包安装。

## 3. Package Layout

### Primary package

```text
@your-scope/mobile-template
```

This is the default package that most applications install.

Exports:

```text
MobileTemplateProvider
AppProviders
Bootstrap
AppErrorBoundary
createApiClient
createSessionManager
secureStorage
createMemoryStorage
useLocale
useText
UI primitives
permission adapters
notification adapters
deep-link utilities
analytics/logger interfaces
```

### Scaffold package

```text
@your-scope/create-mobile-app
```

Creates a new project like create-react-app:

```sh
pnpm create @your-scope/mobile-app my-app
```

The generated project depends only on `@your-scope/mobile-template` plus a thin entry and config. Expo comes transitively from the package.

### Optional packages

Keep capability packages independently publishable:

```text
@your-scope/mobile-notifications
@your-scope/mobile-deeplink
@your-scope/mobile-permissions
@your-scope/mobile-sqlite
@your-scope/mobile-biometric
@your-scope/mobile-files
@your-scope/mobile-camera
@your-scope/mobile-device
@your-scope/mobile-analytics
@your-scope/mobile-logging
```

`@your-scope/mobile-template` may depend on the non-native core modules. Native capability packages remain installable on their own when a consumer enables a specific capability.

## 4. Consumer Integration

### New project (recommended)

```sh
pnpm create @your-scope/mobile-app my-app
cd my-app
pnpm install
pnpm start
```

The generated project contains only business-owned entry files:

```text
app.config.ts
src/app/_layout.tsx
src/app/index.tsx
```

`src/app/_layout.tsx` wraps the package provider:

```tsx
import { MobileTemplateProvider } from "@your-scope/mobile-template";

export default function RootLayout() {
  return (
    <MobileTemplateProvider>
      <Stack />
    </MobileTemplateProvider>
  );
}
```

### Existing Expo project

```sh
pnpm add @your-scope/mobile-template
```

Then apply the same one-time root layout and config plugin integration. The package must not own business routes or overwrite `src/app`.

### Expo config plugin

```ts
plugins: ["@your-scope/mobile-template"]
```

The plugin may configure package-owned native requirements, but must not modify business-owned native configuration.

## 5. Remove Placeholder Content

Remove business/example UI from the distributable runtime:

```text
Welcome
Profile
Settings
Login
Start building
EXPO / FOUNDATION
```

Remove or move these example routes:

```text
src/app/profile.tsx
src/app/settings.tsx
src/app/(auth)/login.tsx
```

Keep only reusable infrastructure:

```text
providers
components/ui
components/forms
components/feedback
lib/api
lib/auth
lib/storage
lib/i18n
lib/platform abstractions
```

The generated/consumer application creates its own routes and business screens.

## 6. Make Packages Publishable

For every published package:

- Remove `private: true`.
- Add `files` with only `dist`, package metadata, README, and config plugin files.
- Build TypeScript source into `dist`.
- Add `main`, `module`, `types`, and `exports`.
- Remove all `../../../src` imports.
- Declare runtime dependencies explicitly.
- Declare `react` and `react-native` as `peerDependencies` (single instance in a React Native app).
- Declare `expo`, `expo-router`, and all native Expo modules as regular `dependencies`, so a package version bump updates the whole Expo/native stack together.
- Add package README and API documentation.

Example package metadata:

```json
{
  "name": "@your-scope/mobile-template",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./app.plugin": "./app.plugin.js"
  }
}
```

## 7. Build and Release

Use Changesets for independent package versioning:

```text
changesets
  ↓
version packages
  ↓
build packages
  ↓
publish packages
```

Required scripts:

```text
pnpm build:packages
pnpm test:packages
pnpm changeset
pnpm version:packages
pnpm release:packages
```

Publishing must support both:

```text
public npm registry
private GitHub/npm-compatible registry
```

The registry must be configurable and must not be hard-coded into runtime code.

## 8. Consumer Update Flow

Runtime updates are normal package updates:

```sh
pnpm update @your-scope/mobile-template --latest
```

Or explicitly:

```sh
pnpm add @your-scope/mobile-template@latest
```

The application remains independent and keeps its own lockfile.

## 9. Template Metadata

The package exposes its version through a small metadata API:

```ts
import { templateVersion } from "@your-scope/mobile-template";
```

The consumer may expose a diagnostic command:

```sh
pnpm mobile-template:doctor
```

The command reports:

```text
installed template version
latest compatible version
Expo SDK compatibility
native rebuild required or not
```

## 10. Dependency and Update Model

The runtime package bundles Expo and every native module it needs as its own dependencies, exactly like any library that pulls in its own transitive dependencies:

```text
@your-scope/mobile-template@2.0.0
  ├── expo ~57
  ├── expo-router ~57
  ├── expo-secure-store ~57
  ├── expo-splash-screen ~57
  ├── react-native-reanimated ...
  └── ...
```

Updating the package updates its dependencies:

```sh
pnpm update @your-scope/mobile-template --latest
```

This raises the whole Expo/native stack together; the consumer does not manage Expo or native module versions separately.

Factual note (unavoidable, independent of how dependencies are declared): when a dependency update changes compiled native code or native configuration, the installed app must be rebuilt to pick up the change. JavaScript-only changes can still be delivered with EAS Update when runtime-compatible.

## 11. Conflict and Ownership Rules

The package must not silently overwrite consumer files.

Owned by package:

```text
runtime package code
config plugin behavior
shared UI and providers
API/auth/storage abstractions
```

Owned by consumer:

```text
src/app business routes
src/features
business schemas
business API endpoints
backend integration
branding
app identifiers
```

If a future scaffold sync command is added, it must use three-way merge or checksum-based conflict detection and never overwrite modified consumer files automatically.

## 12. Testing Requirements

Package tests must cover:

```text
API client
storage
auth session
i18n locale loading
Intl NumberFormat
Intl DateTimeFormat and timezone
deep-link validation
notification payload validation
provider rendering
UI accessibility
```

Consumer fixture tests must verify the create flow without a pre-existing Expo install:

```text
pnpm create @your-scope/mobile-app fixture-app
pnpm install
Expo Router starts
NativeWind loads
config plugin resolves
Android development build configuration works
web bundle works
pnpm add @your-scope/mobile-template into an existing Expo project
```

## 13. Definition of Done

- `pnpm create @your-scope/mobile-app my-app` creates a working project without the consumer installing Expo separately.
- `pnpm add @your-scope/mobile-template` works in an existing Expo project.
- Expo, Expo Router, and native modules come from the package's own dependencies.
- No published package imports files through `../../../src`.
- No placeholder business pages are included in the runtime package.
- One-time root layout integration is documented.
- Config plugin integration is documented.
- Package updates work through normal pnpm updates and update the bundled Expo/native dependencies together.
- Native code changes clearly require a new binary.
- Consumer business code is never overwritten.
- Public/private registry publishing is supported.
- Package, integration, and E2E tests pass.

## 14. Implementation Order

1. Extract runtime source from the current root `src` directory.
2. Remove placeholder routes and business messages.
3. Create `@your-scope/mobile-template` facade package that declares Expo and native modules as dependencies.
4. Convert existing module packages to real buildable packages.
5. Remove all relative imports that escape package roots.
6. Add package build/export metadata.
7. Add config plugin export.
8. Add `@your-scope/create-mobile-app` scaffold that emits a thin project.
9. Add Changesets and release workflow.
10. Add a consumer fixture that installs without a pre-existing Expo.
11. Run package, component, web, and native configuration verification.
## 15. Implementation Notes (verified in this pass)

Deliberate deviations from the plan above, with the reason implementation revealed them:

1. **The runtime package ships TypeScript source, not a compiled `dist`.** Plan §6/§7 assumed a build step. NativeWind requires the `jsxImportSource` transform to run in the *consumer's* Babel pipeline; precompiling JSX into `dist` strips `className` handling, and Metro/Babel already transform `node_modules` for the consumer. `files` therefore publishes `src`, `bin`, `app.plugin.js` and the NativeWind types reference, and `main`/`types`/`exports` point at `src/index.tsx` (with `types`, `react-native`, `import`, `require` and `default` conditions). There is no `build:packages`; `pack:packages` (`npm pack --dry-run`) plus `verify:consumer` replace it.
2. **The application still declares the toolchain entry points.** Plan §13 said the consumer should install nothing but the template. Metro, Babel and the Expo config resolver read `expo`, `expo-router`, `react`, `react-native`, `nativewind` and the plugin modules from the *project root*, and pnpm does not hoist transitive dependencies. Expo, Expo Router, the native modules and the app-facing stack therefore stay dependencies of the package (version bumps raise them together), while the generated project declares the same entry points. The fixture script asserts that `expo`, `expo-router`, `react`, `react-native`, `react-intl` and `@tanstack/react-query` each resolve to a single copy.
3. **The doctor is a binary of the runtime package**, not a file copied into generated projects: `mobile-template-doctor` works for scaffolded *and* existing projects from one implementation. Generated projects expose it as `pnpm mobile-template:doctor`. It resolves installs from `<app>/node_modules` so a leaked `NODE_PATH` cannot produce a false positive.
4. **The scaffold parameterises the package name** (`{{packageName}}`, overridable through `MOBILE_TEMPLATE_PACKAGE`) so a fork can publish under its own scope without editing template files.

Verification evidence:

```sh
pnpm test:packages       # 70 unit tests pass, including the new scaffold and publish-metadata suites
pnpm typecheck           # clean
pnpm pack:packages       # every package packs with only declared files
pnpm verify:consumer     # passed: pack -> scaffold -> install -> expo config -> typecheck -> doctor -> single instance
```

`pnpm verify:consumer` proves, from a packed tarball and a clean install:

- `pnpm create`-equivalent scaffolding produces a project with no placeholder left and no import escaping the project root,
- the project installs without installing Expo separately and boots the Expo config resolver with the template config plugin,
- the generated entry files typecheck against the packaged entry points,
- the doctor reports installed/latest/Expo compatibility/native-rebuild status,
- `expo`, `expo-router`, `react`, `react-native`, `react-intl` and `@tanstack/react-query` are single-instance.

New tests added for the gaps found: `tests/unit/create-mobile-app.test.ts` (scaffold flow, placeholder resolution, no-overwrite guard, doctor offline path) and `tests/unit/package-metadata.test.ts` (publish metadata, exported targets exist, no escaping imports, every imported package declared, no hard-coded registry, `templateVersion` matches the published version).

Still requires credentials or a device to complete: publishing to the real registry (`pnpm release:packages` with `NPM_TOKEN`) and a native binary build; both are documented in `docs/RELEASE.md`, and CI runs the consumer fixture on every push.

## 16. Single-package publish model (supersedes §3 optional packages and §7 Changesets)

Requirement: the project must behave like one ordinary package — download, publish and update like any npm package — with Expo and everything else as its dependencies, and publishing must be nothing more than `npm publish`.

What changed to satisfy that:

1. **The runtime package is the single published product.** The 15 `@your-scope/mobile-*` capability packages were pure re-exports of `@your-scope/mobile-template`; they are deleted. Consumers install one package, and the release story is one `npm publish` instead of sixteen coordinated publishes.
2. **No workspace-protocol dependencies in any publishable package.** `workspace:` specs cannot be published by npm (pnpm rewrites them, npm does not), so every package under `packages/` now declares plain semver ranges. Only the private root app still uses `workspace:*`, and it is never published.
3. **`publishConfig.access: "public"`** on both packages, so a scoped package publishes with plain `npm publish` without `--access public`.
4. **Changesets removed** (`.changeset/`, `@changesets/cli`, `pnpm changeset|version:packages|release:packages`). Versioning is a plain edit of `version` in the package manifest; the workflow is `npm publish`.
5. **Release workflow is a plain publish.** `.github/workflows/release.yml` takes a package directory and runs `npm publish` in it (registry from the `NPM_REGISTRY_URL` variable, token from `NPM_TOKEN`). CI additionally runs `pnpm publish:dry-run` on every push, which proves both packages are publishable without credentials.

Dependency/update model, unchanged and now asserted by tests: `expo`, `expo-router`, the native Expo modules and the app-facing stack (`@tanstack/react-query`, `react-intl`, FormatJS polyfills) are `dependencies` of `@your-scope/mobile-template`, while `react` and `react-native` stay `peerDependencies` for a single runtime instance. `react-native-safe-area-context` is declared on both sides with the same range and deduplicates to one copy.

Evidence:

```sh
pnpm publish:dry-run
# + @your-scope/create-mobile-app@0.1.0   ... Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)
# + @your-scope/mobile-template@0.1.0     ... Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)
```

`tests/unit/package-metadata.test.ts` locks the model in place: no `workspace:` protocol, `publishConfig.access` present, license present, every bundled dependency declared, `react`/`react-native` only as peers and never as open-ended ranges.

Plain-npm consumption was verified against the packed tarball (this is what a "normal package" download looks like):

```sh
mkdir npm-consumer && cd npm-consumer && npm init -y
npm install ./your-scope-mobile-template-0.1.0.tgz
```

```text
expo        57.0.24
expo-router 57.0.22
react-native 0.86.3   (peer ~0.86.0)
react       19.2.8    (peer ~19.2.0)
react-intl  7.1.14
query       5.103.1
copies of react-native: 1
```

One declared dependency pulled the entire Expo/React Native stack transitively, `node_modules/.bin/mobile-template-doctor` works, `require("@your-scope/mobile-template/app.plugin")` returns a function, and npm reports no peer problem for this package. That test also caught the open-ended peer ranges (`react >=19`, `react-native >=0.86`) which let npm install `react-native@0.87.1` next to `expo@57`; both peers are now pinned to the SDK's release line.

