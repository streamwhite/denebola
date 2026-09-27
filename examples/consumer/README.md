# Consumer Example

How an application installs, runs and extends `@your-scope/mobile-template`.
`@your-scope/create-mobile-app` generates the project files shown here; the manual steps below are the same integration applied to an existing Expo project.

## 1. Create a new project

```sh
pnpm create @your-scope/mobile-app my-app
cd my-app
pnpm install
pnpm dev
```

`pnpm dev` starts Metro. Press `w` for web, `a` for an Android emulator/device, `i` for iOS, or open the URL Metro prints.

The generated project is small on purpose — it only owns the entry, the config and your business code:

```text
app.config.ts                    Expo config and config plugins
babel.config.js                  NativeWind JSX transform
metro.config.js                  NativeWind + Metro wiring
tailwind.config.js               semantic color tokens
global.css                       Tailwind layers and light/dark variables
.env.example                     EXPO_PUBLIC_* template
src/app/_layout.tsx              wraps MobileTemplateProvider with app messages
src/app/index.tsx                route entry
src/features/home/HomeScreen.tsx first feature
src/messages.ts                  app translations
```

Add business routes under `src/app` and features under `src/features`. Nothing outside the generated files is rewritten when the runtime package is updated.

### What is declared where

| Declared by the generated project | Declared by `@your-scope/mobile-template` |
| --- | --- |
| `expo`, `expo-router` (entry points Metro, Babel and the config resolver read from the project root) | `expo`, `expo-router` (same ranges, deduplicated) |
| `react`, `react-native`, `react-dom`, `react-native-web` | `expo-secure-store`, `expo-splash-screen`, `expo-linking`, `expo-constants`, `expo-status-bar` |
| `nativewind`, `react-native-css-interop`, `react-native-reanimated`, `react-native-worklets` | `react-native-safe-area-context`, FormatJS Intl polyfills |
| `react-intl`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod` (so your own screens can import them under pnpm's isolated `node_modules`) | `react-intl`, `@tanstack/react-query` (same ranges, deduplicated) |

`react` and `react-native` are peer dependencies of the package, so the app always provides the single copy. pnpm resolves everything else to exactly one version per range, which keeps React, React Native, React Intl and TanStack Query single-instance at runtime. Because Expo, Expo Router and the native modules are dependencies of the package, `pnpm update @your-scope/mobile-template --latest` raises the whole stack together — the app declares the entry points as well only because Metro, Babel and the Expo config resolver read them from the project root.

## 2. Add to an existing Expo project

```sh
pnpm add @your-scope/mobile-template
```

Then apply the one-time integration:

1. Wrap the root layout (`src/app/_layout.tsx`), see below.
2. Register the config plugin in `app.config.ts`.
3. Keep NativeWind enabled (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`).
4. Align the toolchain with the versions the package expects:

   ```sh
   pnpm exec expo install expo-router expo-secure-store expo-splash-screen expo-status-bar expo-linking expo-constants
   pnpm exec expo install react-native-safe-area-context react-native-reanimated
   pnpm add nativewind react-native-css-interop tailwindcss -E
   ```

   `pnpm why expo` shows the copy the package resolved; if `expo` shows two entries, the app and the package resolved different versions. The package's `react` (`~19.2.0`) and `react-native` (`~0.86.0`) peer ranges must match your app versions, otherwise the package manager reports a peer conflict — which is the signal that the app is on a different Expo SDK line than the package.

### Root layout (one time)

```tsx
// src/app/_layout.tsx
import "../../global.css";
import { Stack } from "expo-router";
import { MobileTemplateProvider } from "@your-scope/mobile-template";

export default function RootLayout() {
  return (
    <MobileTemplateProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MobileTemplateProvider>
  );
}
```

`MobileTemplateProvider` composes the TanStack Query client, the Intl provider, the error boundary, the splash-screen bootstrap and the status bar. It accepts `queryClient`, `defaultLocale` and `messages`, so the app can inject its own Query client, initial locale and translations instead of taking the defaults. Nest your own providers (auth, analytics, feature flags) inside it.

### Config plugin

```ts
// app.config.ts
export default {
  scheme: "myapp",
  plugins: ["expo-router", "expo-secure-store", "expo-splash-screen", "@your-scope/mobile-template"],
};
```

The plugin only applies package-owned defaults (for example `userInterfaceStyle: "automatic"`). It never touches your identifiers, permissions or branding.

## 3. Check the install

The runtime package ships a doctor binary, so both generated and existing projects can run it:

```sh
pnpm exec mobile-template-doctor
```

Generated projects also expose it as a script:

```sh
pnpm mobile-template:doctor
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
update                   pnpm update @your-scope/mobile-template --latest
```

- `native rebuild: not required` means the installed Expo/native stack still matches the package, so JavaScript-only changes can ship through EAS Update.
- `native rebuild: required` means the installed native stack drifted from the package (or the package moved to a new Expo SDK), so ship a new binary before the JavaScript update.

`MOBILE_TEMPLATE_PACKAGE` overrides the package name the doctor inspects, and `NPM_CONFIG_REGISTRY` overrides the registry it asks for the latest version.
## 4. Build a business screen

```tsx
// src/app/index.tsx
import { Card, Screen, Text } from "@your-scope/mobile-template";

export default function HomeScreen() {
  return (
    <Screen>
      <Text className="text-4xl font-extrabold">Orders</Text>
      <Card>
        <Text>Your business feature goes here.</Text>
      </Card>
    </Screen>
  );
}
```

The design system ships a theme and the common components: `ThemeProvider`/`useTheme` (light/dark/system) with design tokens (`colors`, `spacing`, `radius`, `fontSize`, `fontWeight`, `lineHeight`, `shadow`, `typography`) and hooks (`useColors`, `useSpacing`, `useTypography`); `Text` (`variant`, `tone`), `Button` (variant/size/loading), `Input`/`Textarea`, `Select`/`MultiSelect` (searchable + free input), `Checkbox`/`Radio`/`Switch`/`Slider`, `Card`/`Badge`/`Avatar`, `Spinner`/`Skeleton`, `List`/`ListItem`, `Dialog`/`ConfirmationDialog`/`BottomSheet`/`Tooltip`, `useToast`, `Search`/`Pagination`/`PullToRefresh`/`InfiniteList`, and `Screen`/`Container`/`KeyboardAvoidingScreen`/`SafeAreaView`. All accept NativeWind `className` and use the theme tokens.

```tsx
import { Button, Card, Screen, Text, useText, useToast, type TypographyVariant } from "@your-scope/mobile-template";

function OrdersEmpty() {
  const text = useText();
  const toast = useToast();
  return (
    <Screen>
      <Text variant="h2">{text({ id: "home.title" })}</Text>
      <Card>
        <Text tone="muted">{text({ id: "home.subtitle" })}</Text>
        <Button title={text({ id: "common.retry" })} onPress={() => toast.show({ message: "Retrying", tone: "info" })} />
      </Card>
    </Screen>
  );
}
```

## 5. Data, auth and storage

```tsx
import { createApiClient, secureStorage, createSessionManager, AuthProvider, useAuth, Card, ErrorState, LoadingState, Screen, Text } from "@your-scope/mobile-template";
import type { Session } from "@your-scope/mobile-template";
import { useQuery } from "@tanstack/react-query";

const sessionManager = createSessionManager(secureStorage);
const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  getToken: async () => (await sessionManager.restore())?.accessToken ?? null,
});

// inject your backend; the runtime never couples to a vendor
const authClient = {
  login: (email: string, password: string) => api.request<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => api.request<void>("/auth/logout", { method: "POST" }),
  restore: () => sessionManager.restore(),
};

export function OrdersScreen() {
  const { status } = useAuth();
  const { data, error, isPending, refetch } = useQuery({ queryKey: ["orders"], queryFn: () => api.request<Order[]>("/orders"), enabled: status === "authenticated" });

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState title="Could not load orders" onRetry={() => refetch()} />;
  return <Screen>{data?.map((order) => <Card key={order.id}><Text>{order.reference}</Text></Card>)}</Screen>;
}

// wrap business screens
<MobileTemplateProvider>
  <AuthProvider client={authClient}>
    <OrdersScreen />
  </AuthProvider>
</MobileTemplateProvider>
```

`createApiClient` adds an `Accept` header, JSON content type, a bearer token from `getToken`, `Accept-Language` from `locale()`, an `X-Request-Id`/`X-Correlation-Id`, a configurable timeout, exponential-backoff retry (network + 5xx) and normalized `ApiError` failures (`status`, `code`, `details`, `retryable`, `requestId`). `refreshToken` retries the request once on 401. Use `api.requestWithMeta` for status/headers/requestId, `{ signal }` to cancel, `{ expect: "none" }` for 204, and pass the client to `<MobileTemplateProvider apiClient={api}>` to read it via `useApiClient()`.

```ts
import { createWebSocketClient, subscribeToSSE, toFormData, uploadWithProgress, downloadBlob, useNetwork, useIsOffline } from "@your-scope/mobile-template";

await uploadWithProgress({ url: `${base}/files`, form: toFormData({ title }, { file: { uri, name, type } }), onProgress: setProgress });
await downloadBlob(url);
subscribeToSSE(`${base}/events`, { onEvent: (event) => render(event) });
const socket = createWebSocketClient({ url: "wss://api/ws", onMessage: handle, reconnect: true });

const { isOnline, isMetered } = useNetwork();   // connectivity handling
const offline = useIsOffline();
```

Swap `secureStorage` for `createMemoryStorage()` in tests; any `Storage` implementation works.

### Auth, RBAC, OAuth and biometrics

```tsx
import { AuthProvider, AuthGuard, useAuth, useCan, useAuthGuard, createExpoBiometricAdapter, unlockWithBiometrics, createCredentialStore } from "@your-scope/mobile-template";

<AuthProvider client={authClient}>
  <Stack />
</AuthProvider>

const { login, logout, register, requestPasswordReset, verifyEmail, refresh, user, status } = useAuth();
const isAdmin = useCan({ roles: ["admin"], permissions: ["orders:write"] });
const redirect = useAuthGuard({ permissions: ["orders:read"] });   // "/login" | "/unauthorized" | null

const biometrics = createExpoBiometricAdapter();
if (await unlockWithBiometrics(biometrics, "Unlock to view orders")) showOrders();

const credentials = createCredentialStore(secureStorage);          // "remember me", cleared independently
```

`AuthClient` methods are optional — implement `register`, `requestPasswordReset`, `verifyEmail`, `refresh`, `updateProfile` and `loginWithOAuth` only when your backend supports them (calling an unimplemented action throws a clear error). OAuth/OIDC URLs are built with `buildAuthorizationUrl(config, state, challenge)` and mapped with `toSession`.

### Secure storage (encryption, rotation, delete)

```ts
import { createSecureKV, createKeyRotation } from "@your-scope/mobile-template";

const rotation = createKeyRotation({ storage: secureStorage });
if (rotation.isDue(await rotation.read("signing-key"))) await rotation.rotate("signing-key", deriveNext);
```

`secureStorage` tracks its own keys so `clear()` performs a real secure delete; `createSecureKV` supports a pluggable `Cipher` (identity by default, since SecureStore already encrypts at rest).

### Server state (TanStack Query, cache, offline)

```ts
import { createQueryKeys, createQueryPersister, createSyncQueue, invalidateScope, optimisticListUpdate, rollbackQueries, useMutation, useQuery } from "@your-scope/mobile-template";

const orders = createQueryKeys("orders");
const persister = createQueryPersister(storage);
const writes = createSyncQueue<{ path: string; body: string }>({ storage, process: (w) => api.request(w.path, { method: "POST", body: w.body }) });

<MobileTemplateProvider queryPersister={persister} onReconnect={() => writes.flush()}>…</MobileTemplateProvider>

useQuery({ queryKey: orders.list({ page }), queryFn: () => api.request(`/orders?page=${page}`) });
useMutation({
  mutationFn: (order) => api.request("/orders", { method: "POST", body: JSON.stringify(order) }),
  onMutate: (order) => ({ snapshot: optimisticListUpdate(client, "orders", (items) => [...items, order]) }),
  onError: (_e, _v, ctx) => ctx && rollbackQueries(client, ctx.snapshot),
  onSettled: () => invalidateScope(client, "orders"),
});
```

Queries retry network/5xx errors (not 4xx), refetch on reconnect, and cache through `persister`; queued mutations replay on reconnect via `onReconnect`.

### Client state (Zustand, persistent, reset)

```ts
import { createStore, createUiStore, useStore, useUiStore } from "@your-scope/mobile-template";

const useCart = createStore<{ items: string[]; add: (id: string) => void }>(
  {
    initial: { items: [] },
    create: (set, get) => ({ add: (id) => set({ items: [...get().items, id] }) }),
  },
  { persist: { storage, name: "cart", version: 1 } },   // persisted across launches
);

const modal = useStore(useUiStore, (s) => s.modal);      // global UI state
useCart.reset();                                          // reset state, keep actions
```

Persist is backed by any `Storage` (secure storage, memory, or a custom one); `onHydration` and `isHydrated` gate first paint until the persisted state is restored.

## 6. i18n and formatting

```tsx
import { LocaleSwitcher, useI18nFormatters, useLocale, useText } from "@your-scope/mobile-template";
import { appMessages, supportedLocales } from "./src/messages";

// one-time: detect the device locale, persist the choice, load app translations
<MobileTemplateProvider locale={{ source: appMessages }} defaultLocale="en">…</MobileTemplateProvider>

export function LocaleAndFormats() {
  const { locale, setLocale } = useLocale();
  const text = useText();
  const { formatCurrency, formatDate, formatRelativeTime } = useI18nFormatters();

  return (
    <View className="gap-3">
      <Text>{text({ id: "common.retry" })}</Text>
      <LocaleSwitcher locale={locale} locales={supportedLocales} onChange={setLocale} />
      <Text>{formatCurrency(19.99, "USD")}</Text>            {/* "$19.99" */}
      <Text>{formatDate(Date.now(), { dateStyle: "medium" })}</Text>
      <Text>{formatRelativeTime(-2, "hour")}</Text>
    </View>
  );
}
```

Framework messages live in the runtime package (`en`, `zh-CN`) for shared labels (retry, search, pagination, theme names). Business messages belong to the application: define them in `src/messages.ts` and pass them through `locale={{ source: appMessages }}`. The provider detects the device locale (`expo-localization`), persists the choice with the injected `Storage`, and falls back to `defaultLocale` (or `EXPO_PUBLIC_DEFAULT_LOCALE`). Keep every UI string in a translation file and validate catalogs with `validateTranslations(appMessages, "en")` — the scaffold ships a test that does this.

`Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.PluralRules` and `Intl.RelativeTimeFormat` are polyfilled with locale and timezone data by the package, so Hermes does not fall back to English or UTC. ICU messages, plurals and `select` come from `react-intl`; `pnpm i18n:extract` scans `defineMessages` call sites if you adopt FormatJS ids.

## 7. Deep links, notifications and permissions

```tsx
import { subscribeToDeepLinks, handleDeepLink, isAllowedExternalUrl, parseNotificationPayload, notificationPath, requestPermission } from "@your-scope/mobile-template";

// cold and warm deep links, allowlisted per scheme
useEffect(() => subscribeToDeepLinks({ scheme: "myapp", allowedPaths: [/^\/profile\/[^/]+$/, /^\/orders$/] }), []);
if (isAllowedExternalUrl(url)) handleDeepLink(url, { scheme: "myapp", allowedPaths: [/^\/orders$/] });

// push payload -> route
const payload = parseNotificationPayload(notification.request.content.data);
const path = payload ? notificationPath(payload, { profile: (id) => `/profile/${id}` }) : null;
if (path) router.push(path);

// permissions with an optional rationale
const granted = await requestPermission(permissionService, async () => showRationale());
```

`subscribeToDeepLinks` returns its unsubscribe function, so it can be returned directly from `useEffect`. `parseDeepLink` rejects unknown schemes and unlisted paths (`javascript:` and other schemes are dropped), and `parseNotificationPayload` rejects payloads without string `type`/`id`, so navigation is never driven by unvalidated input.

## 8. Offline queue, lifecycle, device and diagnostics

```tsx
import { createSyncQueue, subscribeToLifecycle, device, appVersion, templateVersion, logger, noopAnalytics, defaultFeatureFlags, migrate, createPluginRegistry } from "@your-scope/mobile-template";

const queue = createSyncQueue<{ orderId: string }>();
queue.enqueue({ orderId: "42" });          // list() / remove(id)
subscribeToLifecycle((status) => logger.info("app state", { status }));
const registry = createPluginRegistry({ logger });
registry.register(notificationPlugin);
await registry.initialize();
await migrate(database, [{ version: 1, up: async (db) => createTables(db) }]);

logger.info("runtime", { device, appVersion, templateVersion, flags: defaultFeatureFlags });
noopAnalytics.track("screen_view", { name: "orders" });
```

`logger` and `noopAnalytics` are replaceable interfaces: pass your own implementation rather than calling a vendor SDK from business code. Native capability adapters (`NotificationAdapter`, `MediaAdapter`, `FileStore`, `BiometricAdapter`, `PermissionService`) are type-only contracts — implement them in the app so the runtime stays free of business native code.

### App config, environment, flags, lifecycle, performance and errors

```tsx
import { appConfig, environment, isProduction, device, platform, appVersion, useFeatureFlag, useAppLifecycle, usePerformanceMonitor, measure, installGlobalErrorHandler, type ErrorReporter } from "@your-scope/mobile-template";

appConfig.name;          // from app.config.ts via expo-constants
environment;             // "development" | "preview" | "production" (EXPO_PUBLIC_APP_ENV)
appVersion.marketing;    // version / build / runtime, read from the Expo config
platform.isIOS;          // platform detection
device.screen.width;     // platform + app + version + locale + screen

const offlineMode = useFeatureFlag("offlineMode");            // reads FeatureFlagsProvider
const lifecycle = useAppLifecycle();                          // "active" | "background" | "inactive"
const monitor = usePerformanceMonitor();
await measure("loadOrders", () => api.request("/orders"), monitor);

const reporter: ErrorReporter = { report: (error, context) => crashVendor.capture(error, context) };
const uninstall = installGlobalErrorHandler(reporter);        // ErrorUtils + unhandledRejection
// pass the same reporter to <MobileTemplateProvider errorReporter={reporter}> for render errors
```

Feature flags can be injected through `MobileTemplateProvider featureFlags={{ offlineMode: true }}`, and a performance monitor through `performance={monitor}`. `installGlobalErrorHandler` chains any existing handler and returns an uninstall function.

### Navigation

```tsx
import { AppTabs, AuthGuard, RouteGuard, navigation, modalScreenOptions, buildDeepLink, isRouteActive, useNavigationState } from "@your-scope/mobile-template";

navigation.push("/orders", { page: 2 });   // path + query helper
openModal("/filters");                     // modal stack screen

<AuthGuard redirectTo="/login"><Tabs /></AuthGuard>
<RouteGuard when={isOnboarded} redirectTo="/onboarding">{children}</RouteGuard>
<AppTabs tabs={[{ name: "index", title: "Home", icon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }]} />
```

`MobileTemplateProvider onRouteChange={(s) => analytics.screen(s.pathname)}` reports route changes, or mount `NavigationStateProvider` yourself. `buildDeepLink("myapp", "/orders", { page: 2 })` and `buildUniversalLink("example.com", "/orders")` construct links; `isUniversalLink(url, ["example.com"])` validates them. Universal/App Links are wired through the config plugin (`{ universalLinks: ["example.com"], appLinks: ["example.com"] }`).

### Structured logging

```ts
import { createLogger, createMemoryLogSink, createPersistentLogSink, createMemoryStorage } from "@your-scope/mobile-template";

const sink = createMemoryLogSink({ maxEntries: 500 });            // rotation in memory
const persistent = createPersistentLogSink({ storage, key: "logs" }); // restore()/flush() around app lifecycle

const log = createLogger({ namespace: "orders", sinks: [sink, persistent] })
  .withContext({ requestId, traceId, userId })   // userId: pseudonymous id, never PII
  .child("detail");

log.info("loaded", { count: 12 });
log.error("failed", new Error("boom"), { orderId: "42" });
```

The default `logger` uses `consola` (pretty in development, JSON lines in production) and reads
`EXPO_PUBLIC_LOG_LEVEL` (`silent|error|warn|info|debug|trace`). Context, metadata, error
serialization, timestamps, environment and ids are attached to every entry; sensitive keys are
redacted automatically. `LogSink` is the persistence contract, so you can add a file sink for
OS-level rotation.

## 9. One package, everything inside

There is a single runtime package to install, version and update — everything the runtime exports comes from `@your-scope/mobile-template`, and there are no capability packages to keep in sync.

```ts
import { createApiClient, createSyncQueue, parseDeepLink, secureStorage } from "@your-scope/mobile-template";
```

The package's own `dependencies` carry the rest of the stack (`expo`, `expo-router`, `expo-constants`, `expo-linking`, `expo-secure-store`, `expo-splash-screen`, `expo-status-bar`, `@tanstack/react-query`, `react-intl`, FormatJS Intl polyfills), so one version bump raises all of them:

```sh
pnpm why expo    # one entry, coming from the runtime package's dependency range
pnpm why react-intl
```

If a future capability really warrants its own dependency (for example an optional native module you do not want installed by default), publish it as its own ordinary package with `"@your-scope/mobile-template": "^<version>"` and re-export what it needs — a plain `npm publish`, nothing in the runtime changes.

## 10. Update the runtime

```sh
pnpm update @your-scope/mobile-template --latest
```

- The application keeps its own lockfile and business code; nothing in `src/app` or `src/features` is rewritten.
- The package bump raises Expo, Expo Router and the native modules with it, so the whole native stack stays aligned.
- JavaScript-only changes can ship with EAS Update when the runtime version still matches. Any change that alters compiled native code or native configuration requires a new binary.
- `pnpm exec mobile-template-doctor` reports installed vs latest, Expo compatibility and whether a rebuild is required.
- Use the exported `templateVersion` for in-app diagnostics:

  ```tsx
  import { templateVersion, appVersion } from "@your-scope/mobile-template";
  logger.info("versions", { templateVersion, appVersion });
  ```

### Framework file migrations (only if a release ships one)

```sh
pnpm mobile-template:migrate --dry-run   # show what would change, write nothing
pnpm mobile-template:migrate             # apply, backing up changed files as .bak
```

Migrations only target files the framework generated and recorded, never `src/app` routes or
`src/features`. If you edited a target file, the command aborts without writing anything.
Runtime updates themselves still arrive through `pnpm update`, not file replacement.

## 11. Ownership rules

Owned by `@your-scope/mobile-template`:

```text
runtime package code, providers, UI primitives, hooks
API/auth/storage/i18n/deep-link/notification abstractions
config plugin behavior
```

Owned by the application:

```text
src/app business routes and src/features
business schemas and API endpoints
backend integration, branding, app identifiers and permissions
```

The package never overwrites consumer files. There is no sync command that rewrites your tree; updates arrive through the package manager, not through file replacement.

## 12. Registries and custom scopes

Nothing in the runtime hard-codes a registry or scope:

```sh
# private registry for installs
pnpm config set registry https://npm.pkg.github.com
# or per project, in .npmrc
echo "registry=https://npm.pkg.github.com" >> .npmrc

# the doctor and the scaffold read these
export NPM_CONFIG_REGISTRY=https://npm.pkg.github.com
export MOBILE_TEMPLATE_PACKAGE=@acme/mobile-template   # fork that publishes under another name
```

`NPM_CONFIG_REGISTRY` is the registry the doctor queries, `MOBILE_TEMPLATE_PACKAGE` is the package name it inspects and the one the scaffold writes into new projects. Publishing is a plain `npm publish` in the package directory (`publishConfig.access` is already `public`, dependencies are plain semver ranges), with `NPM_CONFIG_REGISTRY` and `NODE_AUTH_TOKEN` selecting a private registry when needed.

## 13. Reproduce this flow

Everything above is verified from this repository:

```sh
pnpm test:packages     # unit tests, including the scaffold and publish-metadata tests
pnpm pack:packages     # inspect the tarball each package would publish
pnpm publish:dry-run   # prove both packages publish with a plain npm publish
pnpm verify:consumer   # pack, scaffold, install, expo config, typecheck, doctor, single-instance check
```

`pnpm verify:consumer` creates a temporary project from the scaffold, installs the packed runtime package into it with pnpm, resolves the Expo config (proving the config plugin loads), typechecks the generated entry files against the published entry points, runs the doctor and asserts that `expo`, `expo-router`, `react`, `react-native`, `react-intl` and `@tanstack/react-query` each resolve to a single copy. Set `WORK_DIR=/tmp/consumer KEEP=1` to inspect the fixture afterwards.

## 14. Plain npm consumption

The packed tarball is an ordinary npm package: one declared dependency pulls the whole stack.

```sh
mkdir npm-consumer && cd npm-consumer && npm init -y
npm install ./your-scope-mobile-template-0.1.0.tgz
```

```text
expo         57.0.24     (dependency of the runtime package)
expo-router  57.0.22
react-native 0.86.3      (peer ~0.86.0, installed once)
react        19.2.8      (peer ~19.2.0, installed once)
react-intl   7.1.14
@tanstack/react-query 5.103.1
```

`node_modules/.bin/mobile-template-doctor` is available after that install, and `require("@your-scope/mobile-template/app.plugin")` returns the config plugin function. For a real app you still declare `react`, `react-native` and the toolchain entry points yourself (as the generated project does) so the versions match your Expo SDK line; the package's peer ranges (`react ~19.2.0`, `react-native ~0.86.0`) tell you immediately when they do not.
