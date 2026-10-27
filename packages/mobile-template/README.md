# denebola

Production-oriented Expo + React Native foundation shipped as an installable runtime package.

> **Status: active development (pre-1.0).** The public API may change between `0.x` releases until `1.0.0`. Pin an exact version in production and check the changelog before upgrading.

## Install

```sh
pnpm add denebola
```

Or generate a project that already has the integration in place:

```sh
pnpm create create-denebola my-app
```

`react` and `react-native` are peer dependencies (single instance in a React Native app), restricted to the release line the bundled Expo SDK supports (`react ~19.2.0`, `react-native ~0.86.0`) so npm cannot auto-install a newer, incompatible native runtime next to it. Expo, Expo Router, the other native Expo modules and the app-facing stack (`react-query`, `react-intl`, FormatJS Intl polyfills) are dependencies of this package, so a version bump raises the runtime stack with it.

The application still declares the toolchain entry points (`expo`, `expo-router`, `react`, `react-native`, `nativewind`, reanimated, safe-area-context) because Metro, Babel and the Expo config resolver read them from the project root. The generated project does that for you; when adding the package to an existing app, keep those versions aligned with `pnpm exec expo install` and verify with `pnpm exec denebola-doctor`.

## Usage

Wrap your Expo Router root layout:

```tsx
// src/app/_layout.tsx
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

`MobileTemplateProvider` accepts `queryClient`, `defaultLocale` and `messages`, so the app can
inject its own Query client, initial locale and translations:

```tsx
import { MobileTemplateProvider } from "denebola";
import { appMessages } from "./messages";

<MobileTemplateProvider messages={appMessages} defaultLocale="zh-CN">…</MobileTemplateProvider>
```

Register the config plugin in `app.config.ts`:

```ts
export default {
  plugins: ["expo-router", "expo-secure-store", "expo-splash-screen", "denebola"],
};
```

The plugin (`app.plugin.js`, exported as `denebola/app.plugin`) applies package-owned defaults such as `userInterfaceStyle: "automatic"`. It never touches identifiers, permissions or branding you own.

Pass domains to also wire Universal Links and Android App Links (iOS `associatedDomains`, Android verified `intentFilters`):

```ts
plugins: [["denebola", { universalLinks: ["example.com"], appLinks: ["example.com"] }]];
```

## Navigation

The package re-exports the Expo Router foundation (`Link`, `Stack`, `Tabs`, `Slot`, `Redirect`, `useRouter`, `useSegments`, `usePathname`, `useLocalSearchParams`, `useGlobalSearchParams`) and adds helpers:

```tsx
import { AppTabs, AuthGuard, RouteGuard, modalScreenOptions, navigation, buildDeepLink, isRouteActive } from "denebola";

navigation.push("/orders", { page: 2 });        // typed path + query
navigation.replace("/home");
openModal("/filters");                            // stack screen with modalScreenOptions

<AuthGuard redirectTo="/login"><Tabs /></AuthGuard>
<RouteGuard when={isPremium} redirectTo="/upgrade">{children}</RouteGuard>
<AppTabs tabs={[{ name: "index", title: "Home", icon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }]} />
```

`NavigationStateProvider` (mount it once, or pass `onRouteChange` to `MobileTemplateProvider`) reports pathname/segments/params changes for analytics. `buildDeepLink`/`buildUniversalLink`/`isUniversalLink` construct and validate custom-scheme and https links.

## Doctor

The package ships one binary:

```sh
pnpm exec denebola-doctor
```

```text
template installed       0.1.0
template latest          0.2.1
expo expected            ~57.0.23
expo installed           57.0.23
react expected           ~19.2.0
react installed          19.2.4
react-native expected    ~0.86.0
react-native installed   0.86.3
native rebuild           not required for JavaScript-only changes
update                   pnpm update denebola --latest
```

`NPM_CONFIG_REGISTRY` selects the registry it queries, `DENEBOLA_PACKAGE` overrides the package it inspects (forks that publish under another name).

## Logging

`consola`-based structured logging with levels, namespaces, child loggers, context, error
serialization and redaction. The default `logger` is production-aware (pretty in development,
JSON lines in production, level from `EXPO_PUBLIC_LOG_LEVEL`).

```ts
import { createLogger, createMemoryLogSink, createPersistentLogSink, createMemoryStorage } from "denebola";

const sink = createMemoryLogSink({ maxEntries: 500 });           // in-memory rotation
const session = createPersistentLogSink({ storage, key: "logs" }); // persist with a Storage adapter

const log = createLogger({ namespace: "orders", level: "debug", sinks: [sink] })
  .withContext({ requestId, traceId, userId })                    // userId should be pseudonymous, not PII
  .child("detail");

log.info("loaded", { count: 12 });
log.error("failed", new Error("boom"), { orderId: "42" });
```

Sensitive keys (`token`, `password`, `secret`, `authorization`, `apiKey`, `credential`) are
redacted automatically; disable with `redact: false`. `LogSink` is the persistence contract, so
a file-based sink can be plugged in for OS-level log rotation. `formatLogEntries(entries)`
renders JSON lines for a file sink.

## Migrations

Framework-generated files are updated with a separate, safe command:

```sh
pnpm exec denebola-migrate --dry-run   # plan only, writes nothing
pnpm exec denebola-migrate             # apply, backing up each changed file as .bak
```

It only considers the exact paths a migration declares, refuses to write when a file was
edited or is missing, and records applied ids in `.denebola-migrations.json`. Business
files are never migrated. The registry (`migrations/index.mjs`) is empty until a breaking
generated-file change exists; a migration supplies `previousChecksum` (the content the
framework shipped) and a `transform`.

## Version metadata

```ts
import { templateVersion, appVersion } from "denebola";

console.info(templateVersion); // version of the installed runtime package
console.info(appVersion);      // marketing/build/runtime version of the application
```

## Exports

See `src/index.tsx` for the full public API: providers (`MobileTemplateProvider`, `AppProviders`, `Bootstrap`, `AuthProvider`, `FeatureFlagsProvider`, `LifecycleProvider`, `PerformanceMonitorProvider`), UI primitives, API client and errors, query client (`createQueryClient`) and query strings (`toQueryString`), form error mapping (`mapFieldErrors`), auth session manager, storage (key-value/preferences/TTL cache/versioned migrations), i18n locale/messages (`mergeMessages`, `AppMessages`, `Locale`), deep-link and notification helpers (payload parsing, routing/deep links, foreground/background handlers, push-token sync, notification preferences), integration (external URL policy, App/Universal Links, app-to-app linker, share intent/incoming files), startup pipeline and launch classification, app lifecycle, user preferences (theme/privacy/accessibility/onboarding), analytics (consent-gated tracking, sessions, crash and network reporters), security (config audit, network security, deep-link validation, permission minimization, dependency audit, sensitive log filtering), common utilities (ids, result types, date/time, money/number, string/validation, debounce/throttle), native extension (native module/event bridge/config contracts; config plugin with native permissions and build identifiers), and testing utilities (fixtures, factories, mock fetch/storage/permissions/native, stable snapshots, accessibility helpers), permission service/explanation gate, app config (`appConfig`) and environment (`environment`), device/platform (`device`, `platform`, OS info, app state, battery, clipboard, haptics, orientation, brightness, device security state), media (image/video pick, camera, image processing sizing/quality, upload mapping, media/file caches), files (filesystem/picker/share/open contracts, import/export helpers, file cache), background tasks/fetch/location contracts with a task scheduler, lifecycle, analytics contracts, structured logging (`createLogger`, `Logger`, `LogSink`, `serializeError`, `redact`), error reporting (`ErrorReporter`, `installGlobalErrorHandler`), performance (`PerformanceMonitor`, `measure`), offline queue/sync engine and background-sync contract, local repository and conflict handling, SQLite contract and migrations, plugin registry, feature flags, and version metadata (`templateVersion`, `appVersion`, `framework`).

The root layout is the only required integration point; everything else is opt-in.

## Client state

Local state stays with React (`useState`/`useReducer`). For global UI state and persisted
client state, the package wraps Zustand with a `Storage`-backed persist and an explicit reset.

```ts
import { createStore, createUiStore, useUiStore, useStore } from "denebola";
import { createMemoryStorage } from "denebola"; // or secureStorage / your own

type Cart = { items: string[]; add: (id: string) => void; clear: () => void };

const useCart = createStore<Cart>(
  {
    initial: { items: [] },
    create: (set, get) => ({ add: (id) => set({ items: [...get().items, id] }), clear: () => set({ items: [] }) }),
  },
  { persist: { storage, name: "cart", version: 1 } }, // survives launches via Storage
);

useCart.getState().add("sku-1");
useCart.reset();                    // back to the initial state (actions preserved)
```

- **Global UI state** — `useUiStore` (modal/sheet/keyboard) or `createUiStore()` for another instance; select with `useStore(useUiStore, (s) => s.modal)`.
- **Persistent state** — pass `persist: { storage, name, version, migrate, partialize }`; the adapter stores JSON under `state:<name>` in your `Storage`.
- **Hydration** — `onHydration` receives `{ status: "hydrated" | "error" }`; use `isHydrated`/`hydrationResult` to gate first paint.
- **Reset** — every store exposes `.reset()` (state fields only; actions remain).

## Authentication and secure storage

`AuthProvider` wraps a pluggable `AuthClient` and owns the session, RBAC checks and profile.
Implement only the methods your backend needs.

```tsx
import { AuthProvider, useAuth, useCan, useAuthGuard, createExpoBiometricAdapter, unlockWithBiometrics } from "denebola";

const authClient = {
  login: ({ email, password }) => api.request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => api.request("/auth/logout", { method: "POST", expect: "none" }),
  restore: () => sessionManager.restore(),
  register: (input) => api.request("/auth/register", { method: "POST", body: JSON.stringify(input) }),
  requestPasswordReset: (email) => api.request("/auth/password/forgot", { method: "POST", body: JSON.stringify({ email }), expect: "none" }),
  verifyEmail: (token) => api.request(`/auth/verify?token=${token}`, { expect: "none" }),
  refresh: (session) => api.request("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: session.refreshToken }) }),
  updateProfile: (patch) => api.request("/me", { method: "PATCH", body: JSON.stringify(patch) }),
};

<AuthProvider client={authClient}>
  <App />
</AuthProvider>
```

- **`useAuth()`** — `status`, `session`, `user`, `login`, `logout`, `register`, `requestPasswordReset`, `confirmPasswordReset`, `verifyEmail`, `refresh`, `restore`, `updateProfile`, `loginWithOAuth`, plus RBAC (`can`, `canAny`, `hasRole`, `hasAnyRole`, `hasPermission`).
- **Session restore / expiry** — a persisted session is restored on mount; sessions with `expiresAt` in the past are cleared. `refresh()` exchanges the session through `AuthClient.refresh`.
- **Auth guard & RBAC** — `useAuthGuard({ roles, permissions })` returns a redirect target (or null); `useCan`/`useHasRole`/`useHasPermission` gate UI. Requires are AND across dimensions, OR within a role/permission list.
- **OAuth / OIDC** — `buildAuthorizationUrl(config, state, challenge)` builds the PKCE code URL; map the provider's token response with `toSession`, then resolve it through `loginWithOAuth`.
- **Biometric unlock** — `createExpoBiometricAdapter()` + `unlockWithBiometrics(adapter, reason, required?)` gate a sensitive action; unavailable biometrics are allowed through unless `required`.

### Secure storage

```ts
import { secureStorage, createSecureKV, createKeyRotation, createCredentialStore } from "denebola";

secureStorage.set("token", { value });          // OS keychain; clear() deletes only this app's keys
const kv = createSecureKV();                     // JSON + pluggable Cipher (identity by default)
const rotation = createKeyRotation({ storage: secureStorage, maxAgeMs: 30 * 24 * 60 * 60 * 1000 });
await rotation.rotate("signing-key", (current) => nextSecret(current));
const credentials = createCredentialStore(secureStorage); // "remember me", separate from the session
```

- **Encryption abstraction** — `Cipher` (`passthroughCipher` by default: SecureStore already encrypts at rest). Provide an AES/KDF cipher when you need encryption above the keychain.
- **Key rotation** — `createKeyRotation` stores value + `rotatedAt`/`version`; `isDue()` reports when rotation is needed; the old value is only replaced after the new one is written.
- **Secure delete** — `Storage.remove` and `secureStorage.clear()`; credentials and sessions clear independently.

## Server state

TanStack Query is wired by `AppProviders` (the `QueryClientProvider`) and re-exported, plus
helpers for keys, cache, optimistic updates and offline.

```ts
import {
  useQuery, useMutation, useInfiniteQuery, createQueryKeys,
  invalidateScope, prefetchQuery, optimisticListUpdate, rollbackQueries, appendInfinitePage,
  createQueryPersister, createSyncQueue, DEFAULT_PAGE_SIZE,
} from "denebola";

const orders = createQueryKeys("orders");

useQuery({ queryKey: orders.list({ page }), queryFn: () => api.request("/orders") });
useInfiniteQuery({
  queryKey: orders.infinite(),
  initialPageParam: 0,
  queryFn: ({ pageParam }) => api.request(`/orders?cursor=${pageParam}`),
  getNextPageParam: (last) => last.nextCursor,
});

const mutation = useMutation({
  mutationFn: (input) => api.request("/orders", { method: "POST", body: JSON.stringify(input) }),
  onMutate: (input) => ({ snapshot: optimisticListUpdate(client, "orders", (items) => items.concat(input)) }),
  onError: (_e, _v, ctx) => ctx && rollbackQueries(client, ctx.snapshot),
  onSettled: () => invalidateScope(client, "orders"),
});
```

- **Keys** — `createQueryKeys("orders")` gives `.all`, `.list(filters)`, `.infinite(filters)`, `.detail(id)` (empty filter values are dropped so keys stay stable).
- **Cache / prefetch / invalidate** — `invalidateScope`, `invalidateKeys`, `prefetchQuery`, `snapshotQueries`, `restoreQueries`.
- **Optimistic updates** — `optimisticListUpdate` / `optimisticDetailUpdate` return a snapshot; `rollbackQueries` restores it on error.
- **Retry & background refetch** — defaults retry network errors and 5xx (never 4xx) and refetch on reconnect; override per query or via `createQueryClient`.
- **Offline cache** — `createQueryPersister(storage)` + pass `queryPersister` to `MobileTemplateProvider` (or mount `ServerStateProvider`) to restore on launch and persist on every cache change.
- **Offline mutations** — `createSyncQueue({ storage, process })` persists writes, replays them with `flush()`, and drops an item after `maxAttempts`.

```ts
<MobileTemplateProvider queryPersister={createQueryPersister(storage)} onReconnect={flushQueue}>…</MobileTemplateProvider>
```

## Networking

```ts
import {
  createApiClient, ApiError, createWebSocketClient, subscribeToSSE, toFormData, uploadWithProgress, downloadBlob,
  useNetwork, useIsOffline, ApiProvider, useApiClient,
} from "denebola";

const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  getToken: async () => tokenStore.access,
  refreshToken: async () => auth.refresh(),      // retried once on 401
  locale: () => currentLocale,
  getCorrelationId: () => trace.id,
  timeoutMs: 15_000,
  retry: { attempts: 3, baseDelayMs: 300, maxDelayMs: 5_000 }, // or retry: false
});

const orders = await api.request<Order[]>("/orders", { query: { page: 2 } });
const { data, status, requestId } = await api.requestWithMeta<Order>("/orders/1");
await api.request("/orders", { method: "POST", body: JSON.stringify(order) });
await api.request("/orders/1", { method: "DELETE", expect: "none", signal: controller.signal });
```

- **Headers & auth** — `getToken` sets `Authorization`; `Accept-Language` follows `locale()`; `X-Request-Id` and `X-Correlation-Id` are attached to every request (`requestId` is also surfaced on `ApiError` and `requestWithMeta`).
- **Timeout / cancellation / retry** — per-request `timeoutMs`, an `AbortSignal` (aborted requests surface as `REQUEST_ABORTED`), and a `RetryPolicy` (network + 5xx retried with exponential backoff; 4xx are not).
- **Errors** — `ApiError` carries `status`, `code`, `details`, `retryable`, `requestId`; `normalizeNetworkError` distinguishes `TIMEOUT`, `NETWORK_ERROR` and `REQUEST_ABORTED`.
- **Upload / Multipart** — `toFormData(fields, { file: { uri, name, type } })` then `uploadWithProgress` (XHR, so you get `onProgress`); `downloadBlob(url)`.
- **Streaming** — `subscribeToSSE(url, { onEvent })` for server-sent events; `streamResponse(url, { onChunk })` for chunked bodies.
- **WebSocket** — `createWebSocketClient({ url, onMessage, reconnect: true })` auto-reconnects with backoff and parses JSON payloads.
- **Network state** — `NetworkProvider` (mounted by `MobileTemplateProvider`) exposes `useNetwork()` / `useIsOffline()` (connectivity, connection type, metered detection) backed by NetInfo.

Wire `apiClient` into `MobileTemplateProvider` to expose `useApiClient()`; otherwise construct the client directly. NetInfo and expo-localization are native modules and require a development build.

## UI and design system

The package ships a design system: a `ThemeProvider` (light / dark / system) with design
tokens and themed hooks, plus the common components.

```tsx
import {
  ThemeProvider, useTheme, useColors, useSpacing,
  Text, Button, Input, Textarea, Card, Badge, Avatar, Spinner, Skeleton,
  Select, MultiSelect, Checkbox, Radio, Switch, Slider,
  Dialog, ConfirmationDialog, BottomSheet, ToastProvider, useToast, Tooltip,
  List, ListItem, Search, Pagination, PullToRefresh, InfiniteList,
  Screen, Container, KeyboardAvoidingScreen, SafeAreaView,
} from "denebola";
```

- **Theme + tokens** — `useTheme()` returns `{ preference, scheme, tokens, setPreference }`; `tokens` has `colors`, `spacing`, `radius`, `fontSize`, `fontWeight`, `lineHeight`, `shadow`, `typography`. Prefer `useColors`/`useSpacing`/`useTypography` in style objects. `ThemeProvider` is mounted by `MobileTemplateProvider`; pass `themePreference="dark" | "light" | "system"`.
- **Components** — all accept `className` (NativeWind) and theme-aware props. `Text` takes `variant` (`h1…h4`, `body`, `label`, `caption`) and `tone`; `Button` takes `variant` (`primary`/`secondary`/`outline`/`ghost`/`destructive`), `size`, `loading`, `icon`.
- **Select / MultiSelect** — searchable, filter as you type, and (with `allowCustom`) accept free input; `MultiSelect` supports `max` and chip removal.
- **Overlays** — `Dialog`/`ConfirmationDialog`, `BottomSheet`, `Tooltip`, and `useToast()` for toasts/snackbars (`show({ message, tone, durationMs, position })`).
- **Data display** — `List`/`InfiniteList` handle loading/empty/error; `Search` debounces; `Pagination` + `computePagination`/`paginate`; `PullToRefresh` wraps a scroll view.
- **Layout** — `Screen` (safe area + scroll), `KeyboardAvoidingScreen`, `Container`.

`Slider` uses `@react-native-community/slider` (a dependency of the package, version pinned to the Expo SDK).

## Internationalization (i18n)

Locale management, detection, switching and fallback, with ICU formatting from `react-intl`
plus the FormatJS Intl polyfills.

```tsx
import {
  MobileTemplateProvider, LocaleSwitcher, useLocale, useText, useI18nFormatters,
  detectLocale, validateTranslations, createLocaleStore,
} from "denebola";
import { appMessages } from "./src/messages";

// detect the device locale, persist the choice, and load app translations
<MobileTemplateProvider locale={{ source: appMessages }} defaultLocale="en">…</MobileTemplateProvider>

const { locale, setLocale } = useLocale();
const text = useText();
const { formatCurrency, formatDate, formatRelativeTime } = useI18nFormatters();

text({ id: "cart.items" }, { count: 3 });               // ICU plural
formatCurrency(1234.5, "EUR");
formatDate(Date.now(), { dateStyle: "medium" });
formatRelativeTime(-2, "hour");
```

- **Locale source** — `locale="bundled"` (framework catalog only), `locale="device"` (detect + persist framework locales), or `locale={{ source, storage, load }}` (app catalog, optional `Storage` persistence and an async `load(locale)` for lazy translation loading).
- **Detection / fallback** — `deviceLocales()` (expo-localization), `detectLocale(candidates, supported, fallback)`, `canonicalLocale`, `localeTag`, `fallbackMessages`. `EXPO_PUBLIC_DEFAULT_LOCALE` forces a default when set.
- **Switching** — `useLocale()` or the ready-made `LocaleSwitcher`.
- **Formatting** — `useI18nFormatters()` returns `formatNumber`, `formatCurrency`, `formatPercent`, `formatDate`, `formatShortDate`, `formatTime`, `formatRelativeTime`, `formatMessage`. Category constants live in `i18n/categories.ts` (no magic values in components).
- **Validation** — `validateTranslations({ en, "zh-CN" }, "en")` reports missing keys, extra keys and placeholder mismatches; the scaffold test asserts this for the app catalog.
- **Extraction** — `pnpm i18n:extract` (FormatJS) scans `defineMessages` / `<FormattedMessage>` for apps that adopt message ids; `pnpm i18n:compile` compiles catalogs.

`AppIntlProvider` accepts either a flat `Record<id, message>` or a per-locale catalog and
resolves the active locale automatically. Products of `expo-localization` (a dependency) require
a development build.

## NativeWind

The UI primitives use NativeWind `className`. Enable NativeWind in the consuming app with the standard Expo setup (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, and a `global.css` import), and keep the semantic tokens (`background`, `foreground`, `card`, `primary`, `muted`, `border`, `destructive`) in the app's Tailwind config.

## Publishing and registry

- The package ships TypeScript source instead of a compiled `dist`: Metro/Babel transform `node_modules` for the consumer, and NativeWind's `jsxImportSource` must run inside the consumer's Babel pipeline — precompiling JSX ahead of time would drop `className` handling. `files` therefore publishes `src`, `bin`, `app.plugin.js` and the NativeWind types reference.
- No registry is hard-coded anywhere. `publishConfig.access` is `public`, dependencies are plain semver ranges (no `workspace:` protocol), and the registry comes from `NPM_CONFIG_REGISTRY`/`NODE_AUTH_TOKEN` or the user's `.npmrc`.
- Publishing is exactly `npm publish` (run in this directory). `npm publish --dry-run` prints the tarball and target registry first, and `prepublishOnly` typechecks the package. `pnpm publish:dry-run` at the repository root does the same for every package.

## Updates

```sh
pnpm update denebola --latest
```

Because Expo and the native modules are dependencies of this package, a version bump raises the whole stack together. Native code changes still require rebuilding the app binary; JavaScript-only changes can ship with EAS Update while the runtime version matches.

## Ownership

Owned by this package: runtime code, providers, UI primitives, API/auth/storage/i18n/deep-link/notification abstractions and the config plugin.

Owned by the application: `src/app` routes, `src/features`, business schemas and endpoints, backend integration, branding, identifiers and permissions. The package never overwrites consumer files.

## License

[Apache-2.0](LICENSE)