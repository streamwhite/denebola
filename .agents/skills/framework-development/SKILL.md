---
name: framework-development
description: "Denebola — an opinionated Expo + React Native application framework shipped as the `denebola` npm package. Use when building, scaffolding or maintaining a mobile app on this framework/template: adding Expo Router screens or features, wiring MobileTemplateProvider, server state with TanStack Query, the typed API client, auth/RBAC/secure storage, i18n with react-intl, navigation/deep links/notifications, permissions/device/file/media/background contracts, the NativeWind design-system components, EAS release/OTA updates, or framework doctor/migrate/update. Relevant whenever code imports from `denebola` or the task mentions Denebola, `create-denebola`, or this template."
---

# Denebola — Expo + React Native app framework

Denebola is an opinionated Expo (React Native + TypeScript) foundation consumed as a **package**, not copied. It ships the app-wide runtime (providers, navigation helpers, server/client state, API client, auth/storage/i18n abstractions, design-system UI, platform contracts, logging, release and update tooling). The application owns its routes, features, business schemas/endpoints, branding and identifiers.

- Scaffold a project: `pnpm create create-denebola my-app`
- Add to an existing Expo app: `pnpm add denebola`
- Import everything from the package root: `import { Button, useText } from "denebola"` (a fork may publish under another name; check `package.json`).

Reference files in this skill:

- `references/api.md` — complete grouped inventory of the public API (contracts and deferred features marked).
- `references/recipes.md` — copy-paste patterns for the most common tasks.
- `references/testing.md` — what to test (framework logic) vs. skip (wrappers), and how to run it.

## Core integration (the only required wiring)

Wrap the Expo Router root layout in `MobileTemplateProvider`. It mounts the theme, Intl, Query, flags, lifecycle, network, toast and error-boundary providers.

```tsx
// src/app/_layout.tsx
import "../../global.css";
import { Stack } from "expo-router";
import { MobileTemplateProvider } from "denebola";
import { api } from "../lib/api";
import { appMessages } from "../messages";

export default function RootLayout() {
  return (
    <MobileTemplateProvider locale={{ source: appMessages }} apiClient={api}>
      <Stack screenOptions={{ headerShown: false }} />
    </MobileTemplateProvider>
  );
}
```

Register the config plugin in `app.config.ts`. It applies package defaults and optionally wires Universal/App Links; it never touches identifiers, permissions or branding you own.

```ts
export default {
  plugins: ["expo-router", "expo-secure-store", "expo-splash-screen", "denebola"],
};
// Links: [["denebola", { universalLinks: ["example.com"], appLinks: ["example.com"] }]]
```

## Project layout (generated app)

```text
src/app/            Expo Router routes — thin; render a feature screen
src/features/<name> Business feature code (screens, hooks, components)
src/lib/api.ts      API client wiring (token + refresh)
src/messages.ts     App translations (en, zh-CN)
tests/              Unit tests (vitest)
app.config.ts       App identity, permissions and plugins
```

## Rules that keep changes consistent

1. Import infrastructure from `denebola`; do not re-implement providers, clients or primitives.
2. Keep business logic out of the core — it belongs in `src/features` and the app's own libs.
3. Every user-facing string goes through `useText()` against `src/messages.ts`; never hard-code copy.
4. Style with NativeWind `className` and semantic tokens (`background`, `foreground`, `card`, `primary`, `muted`, `border`, `destructive`). Do not mix `className` and `StyleSheet` on the same component.
5. Server data → TanStack Query hooks with `createQueryKeys`; global client state → `createStore`; local state → React `useState`.
6. Sessions/tokens → `secureStorage`; preferences → a `Storage` adapter (never the keychain for non-secrets).
7. Native-backed features (NetInfo, localization, notifications, camera, files, SQLite, biometrics, slider) need a development build, not Expo Go. Contracts (battery, clipboard, haptics, orientation, media, etc.) are type-only — the app supplies the implementation.
8. Run `pnpm typecheck` and `pnpm test`; keep `en`/`zh-CN` messages in sync (`validateTranslations`).
9. Treat the deferred list in `references/api.md` as unavailable; build it in the app if needed.
10. For new framework logic, add a test per `references/testing.md`: test the framework's own logic, not wrappers over dependencies/platform APIs. Add a test for any bug you fix.

## Capability map

Full export names and contract markers: `references/api.md`.

| Domain | What you get (key exports) |
| --- | --- |
| Providers / runtime | `MobileTemplateProvider`, `AppProviders`, `Bootstrap`, `AppErrorBoundary`, startup/launch, lifecycle, feature flags, plugin registry, update policy |
| Navigation | Expo Router re-exports (`Link`, `Stack`, `Tabs`, hooks), `navigation`, `AppTabs`, `RouteGuard`, `AuthGuard`, `modalScreenOptions`, `NavigationStateProvider`, deep links, Universal/App Links |
| Server state | TanStack Query re-exports, `createQueryClient`, `createQueryKeys`, invalidation/prefetch, optimistic helpers, offline cache (`createQueryPersister`) and mutation queue (`createSyncQueue`) |
| Networking | `createApiClient` (auth header, 401 refresh, timeout, retry/backoff, cancellation, request/correlation ids), upload/download/SSE/WebSocket, `useNetwork`, `ApiProvider` |
| Auth & RBAC | `AuthProvider`, `useAuth`, `createSessionManager`, `useAuthGuard`/`AuthGuard`, `can`/`hasRole`/`hasPermission` (+ hooks), OAuth/OIDC, biometric unlock |
| Storage | `secureStorage`, `createSecureKV`, key rotation, encryption `Cipher`, in-memory/KV backends, typed preferences, TTL cache, versioned storage |
| Client state | `createStore` (persist + reset + hydration), `createUiStore`, `useStore` (Zustand re-export) |
| Forms | `FormInput`, `SubmitButton`, `mapFieldErrors`; `react-hook-form` + `zod` are available |
| i18n | `AppIntlProvider`, `useLocale`, `LocaleSwitcher`, `useText`, `useI18nFormatters`, detection/fallback, `validateTranslations`, FormatJS polyfills |
| UI / design system | `ThemeProvider`, `useTheme`/`useColors`/`useSpacing`, tokens, and components: `Text`, `Button`, `Input`, `Textarea`, `Select`, `MultiSelect`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Card`, `Badge`, `Avatar`, `Spinner`, `Skeleton`, `List`, overlays, `ToastProvider`, `Search`, `Pagination`, `PullToRefresh`, `InfiniteList`, `Screen`, `KeyboardAvoidingScreen`, `Container`, state views |
| Platform & native | device/platform/OS info, app state, battery, clipboard, haptics, orientation, brightness, device security, notifications (payload/routing/tokens/prefs), permissions + gate, files/filesystem, media/camera, image processing, background tasks/fetch/location, native module/event contracts |
| Logging / analytics | `createLogger`, log levels/namespaces/sinks/redaction, `Analytics`, consent-gated analytics, session/crash/network trackers, performance contracts |
| Config & version | `appConfig`, `environment`, `appVersion`, `framework`/`templateVersion`, `MODULE_VERSIONS`, semver + compatibility matrix |
| Release & update | release profiles, runtime version, OTA `decideUpdate`, rollback, signing config; EAS profiles; `denebola-update` |
| Data / offline | SQLite contract + migrations, `createRepository`, conflict resolution, `createSyncEngine`, background sync |
| Testing | fixtures/factories, `createMockFetch`, mock storage/permissions/native, stable snapshots, accessibility helpers |
| Utilities | ids/UUID, `Result`, date/time + timezone, money/number, string/validation, debounce/throttle, pagination, retry |
| Tooling | `denebola-doctor`, `denebola-migrate`, `denebola-update`, `denebola/app.plugin`, `create-denebola` |

## Common workflows

- **Add a screen**: create `src/features/<name>/XScreen.tsx`, add a thin route in `src/app/...` that renders it. Use `Screen`, `Text`, `Button`, `Card`; add strings to `src/messages.ts` under both locales.
- **Fetch + mutate**: `createQueryKeys("orders")` for stable keys; `useQuery`/`useInfiniteQuery`; `optimisticListUpdate` + `rollbackQueries` + `invalidateScope` for optimistic edits.
- **Wire the API client**: `createApiClient({ baseUrl: process.env.EXPO_PUBLIC_API_URL, getToken, refreshToken, timeoutMs })`; pass it to `MobileTemplateProvider` to expose `useApiClient()`.
- **Add auth**: implement the `AuthClient` methods your backend needs, wrap in `AuthProvider`, gate routes with `<AuthGuard redirectTo="/login">` and the UI with `useCan`/`useHasRole`.
- **Persist state**: `createStore({...}, { persist: { storage, name, version, migrate } })`; gate first paint with `isHydrated`.
- **Go offline-first**: `createQueryPersister(storage)` for the cache and `createSyncQueue({ storage, process })` for queued mutations.
- **Deep links / push**: parse and validate with `parseDeepLink`/`validateDeepLink` and `parseNotificationPayload`, then route with `handleDeepLink`/`notificationPath`.

Details and code for each: `references/recipes.md`.

## Commands

App project:

```sh
pnpm dev            # Metro dev client   | pnpm web / android / ios
pnpm test           # vitest             | pnpm typecheck
pnpm i18n:extract   # FormatJS message extraction
pnpm denebola:doctor          # versions, Expo/RN drift, rebuild needed?
pnpm denebola:migrate --dry-run   # preview framework-file migrations
```

Framework source repository (this repo, when editing the package itself):

```sh
pnpm test / test:component / test:e2e / test:packages / typecheck / format:check
pnpm verify:consumer   # pack → scaffold → install → doctor
```

## Working inside the framework source

The runtime package lives in `packages/mobile-template` (published as `denebola`); the generator is `packages/create-mobile-app` (published as `create-denebola`). New capabilities go in `src/lib/<domain>/` and are re-exported from `packages/mobile-template/src/index.tsx`; add unit tests and update `docs/CAPABILITIES.md`. Business/domain code stays out of the package. The package ships TypeScript source (no build step) so NativeWind's JSX transform runs in the consumer's pipeline.
