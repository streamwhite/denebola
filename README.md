# Denebola

A production-oriented **Expo + React Native framework** for iOS, Android and web. It is consumed as an npm package instead of copied: `denebola` provides the app-wide runtime, and your application keeps its routes, features, branding and business logic.

> **Status: active development (pre-1.0).** Denebola is under active development and the public API may change between `0.x` releases until `1.0.0`. Pin an exact version in production, read [`CHANGELOG.md`](CHANGELOG.md) and [`docs/UPGRADING.md`](docs/UPGRADING.md) before upgrading, and run `pnpm exec denebola-doctor` after a dependency change.

## Quick start

Requires Node 24+ and pnpm 12+ to work on this repository; consumers need a working Expo toolchain (Xcode for iOS, Android Studio for Android).

```sh
pnpm create create-denebola my-app
cd my-app
pnpm install
pnpm dev
```

The scaffold derives valid native identifiers from the directory name: `My-Cool.App` yields the display name `my-cool-app`, the Android package / iOS bundle id `com.example.mycoolapp` and the URL scheme `mycoolapp`. Override the identifier prefix with `DENEBOLA_APP_ID_PREFIX` (default `com.example`) and the runtime package name with `DENEBOLA_PACKAGE`.

## Add to an existing Expo app

```sh
pnpm add denebola
```

Wrap the Expo Router root layout:

```tsx
// src/app/_layout.tsx
import "../../global.css";
import { Stack } from "expo-router";
import { MobileTemplateProvider } from "denebola";

export default function RootLayout() {
  return (
    <MobileTemplateProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MobileTemplateProvider>
  );
}
```

Register the config plugin:

```ts
// app.config.ts
export default {
  plugins: ["expo-router", "expo-secure-store", "expo-splash-screen", "denebola"],
};
```

`MobileTemplateProvider` mounts the theme, Intl, Query, flags, lifecycle, network, toast and error-boundary providers. It accepts `queryClient`, `messages`, `defaultLocale`, `apiClient`, `queryPersister` and link handlers, so the app can inject its own implementations. The config plugin applies package defaults and can wire Universal Links / App Links; it never overwrites identifiers, permissions or branding owned by the app.

Expo, Expo Router, the native Expo modules and the app-facing stack are dependencies of `denebola`, so `pnpm update denebola --latest` raises them together. Native changes still require a new binary. Verify the installed stack with:

```sh
pnpm exec denebola-doctor
```

## Capabilities

| Area | What ships |
| --- | --- |
| App shell | `MobileTemplateProvider`, `AppProviders`, `Bootstrap`, error boundary, app config / environment / version, lifecycle, feature flags, startup pipeline and launch classification |
| Navigation | Expo Router facade, typed `navigation` helpers, tab and modal setup, `RouteGuard` / `AuthGuard`, deep links and Universal / App Links, external URL policy |
| Server state | TanStack Query provider, query-key factory, pagination, cache invalidation and prefetch, optimistic updates, retry policy, offline cache and mutation queue |
| Client state | React local state plus Zustand-backed global UI store, persisted state, hydration status and reset |
| Networking | Typed API client with auth headers, token refresh, timeout, retry/backoff, cancellation, request/correlation ids, multipart upload with progress, downloads, SSE and WebSocket, network status |
| Auth and security | Session, login/logout/register, password reset, email verification, restore, RBAC, OAuth/OIDC (PKCE), biometric unlock contract, secure storage, key rotation, encryption contract and security audit helpers |
| Internationalization | Locale detection, switching and fallback, ICU messages and plurals, FormatJS polyfills, date/number/currency/relative-time formatters, translation validation and extraction |
| Design system | Light/dark/system theme with design tokens, themed hooks and NativeWind components: Button, Input, Select, dialogs, sheets, toasts, lists, pagination, states and layout primitives |
| Platform | Device/OS info, notification parsing and routing, permissions, files, media/camera, clipboard, haptics, battery, background tasks, SQLite, repositories and sync engines — stable APIs plus type-only native contracts |
| Observability | `consola`-based structured logging with levels, namespaces, sinks and redaction, plus analytics, crash-reporting, session, network and performance contracts |
| Release | EAS development/preview/production profiles, runtime-version policy, OTA update gating, rollback selection and signing configuration |
| Framework updates | `denebola-doctor`, `denebola-migrate` and `denebola-update` CLIs, version compatibility matrix, breaking-change detection and checksum-guarded file migrations |
| Testing | Fixtures, factories, mock fetch/storage/permissions/native modules, stable snapshots, accessibility helpers, plus Vitest, React Native Testing Library and Playwright wiring |

The full API inventory — including what is **stable**, a **contract** you implement, or intentionally **deferred** — is in [`docs/CAPABILITIES.md`](docs/CAPABILITIES.md) and [`packages/mobile-template/README.md`](packages/mobile-template/README.md).

## Packages

| Package | Purpose |
| --- | --- |
| `denebola` | The runtime: providers, hooks, navigation, API client, auth/storage/i18n abstractions, design system, platform contracts, config plugin and CLI binaries |
| `create-denebola` | The scaffold that generates a consumer project (`pnpm create create-denebola my-app`) |

Both are ordinary npm packages with plain semver versions, real dependency ranges and `publishConfig.access: "public"`. The runtime ships TypeScript source so Metro/Babel and NativeWind process JSX inside the consumer app; there is no build step.

## Agent skill

This repository ships a coding-agent skill describing the framework, its integration points, the public API inventory and common recipes. Install it with the open agent-skills CLI:

```sh
npx skills add streamwhite/mobile-dev-template-expo -g
```

The skill lives in [`.agents/skills/framework-development/`](.agents/skills/framework-development/) (`SKILL.md` plus `references/api.md`, `references/recipes.md` and `references/testing.md`) and is discovered automatically by the CLI.

## Repository layout

```text
src/                        Demo application and routes used by this repository
packages/mobile-template/   The published `denebola` runtime package
packages/create-mobile-app/ The published `create-denebola` scaffold
examples/                   Consumer documentation: basic, auth, offline, full walkthrough
docs/                       Capabilities, release, upgrading, security and testing docs
tests/                      Unit, component and end-to-end tests
scripts/                    Release, consumer-verification and convenience scripts
```

Application code lives in `src/`. The distributable product lives in `packages/` and consists of exactly two npm packages, so there is no second package to version and no `workspace:` protocol to rewrite at publish time.

## Development

```sh
pnpm install
pnpm dev          # Metro for the development client
pnpm dev:web      # start web directly
pnpm typecheck
pnpm test         # unit tests, including scaffold and publish-metadata tests
pnpm test:component
pnpm test:e2e
pnpm format:check
```

Device workflows (Android over USB, emulators, iOS, cache clearing) and the complete Android toolchain / emulator-acceleration guide are in [`docs/LOCAL-DEVELOPMENT.md`](docs/LOCAL-DEVELOPMENT.md).

## Documentation

- [`docs/CAPABILITIES.md`](docs/CAPABILITIES.md) — auditable capability inventory and status legend
- [`packages/mobile-template/README.md`](packages/mobile-template/README.md) — package usage: auth, data, networking, i18n, UI, publishing
- [`examples/consumer/README.md`](examples/consumer/README.md) — full consumer walkthrough with every recipe
- [`docs/RELEASE.md`](docs/RELEASE.md) — EAS profiles, OTA updates, package releases and registry configuration
- [`docs/UPGRADING.md`](docs/UPGRADING.md) — upgrade guide and migration flow
- [`docs/SECURITY.md`](docs/SECURITY.md) — security model and procedures
- [`CHANGELOG.md`](CHANGELOG.md) — release notes

## Publishing

The release flow verifies, bumps both packages, updates the changelog and publishes to the public npm registry:

```sh
pnpm release patch                 # verify + bump + publish dry-run
pnpm release minor --publish       # really publish both packages
pnpm release 1.0.0 --publish --tag # explicit version and git tag
```

`NPM_REGISTRY_URL` overrides the publish target, and `NODE_AUTH_TOKEN` (CI) or a user-level `~/.npmrc` supplies authentication. A manual `npm publish` from each package directory works too. Details: [`docs/RELEASE.md`](docs/RELEASE.md).

## License

[Apache-2.0](LICENSE) © 2026 streamwhite
