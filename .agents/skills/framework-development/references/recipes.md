# Recipes

Copy-paste patterns for building a feature on `denebola`. All imports come from the package root unless shown otherwise. User-facing copy always goes through `useText()` and `src/messages.ts`.

## 1. Add a screen and route

```tsx
// src/features/orders/OrdersScreen.tsx
import { Button, Card, Screen, Text, useText } from "denebola";
import { navigation } from "denebola";

export function OrdersScreen() {
  const text = useText();
  return (
    <Screen>
      <Text variant="h1">{text({ id: "orders.title" })}</Text>
      <Card>
        <Button title={text({ id: "orders.new" })} onPress={() => navigation.push("/orders/new")} />
      </Card>
    </Screen>
  );
}

// src/app/orders/index.tsx — thin route
import { OrdersScreen } from "../../features/orders/OrdersScreen";
export default function OrdersRoute() {
  return <OrdersScreen />;
}
```

Add `orders.title` / `orders.new` to both `en` and `zh-CN` in `src/messages.ts`.

## 2. Query a list

```tsx
import { useQuery, createQueryKeys, LoadingState, ErrorState, List, ListItem, Text } from "denebola";
import { api } from "../lib/api";

const orders = createQueryKeys("orders");

export function OrdersScreen() {
  const q = useQuery({ queryKey: orders.list(), queryFn: () => api.request<Order[]>("/orders") });
  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState onRetry={q.refetch} />;
  return <List data={q.data ?? []} renderItem={(o) => <ListItem title={o.id} />} />;
}
```

## 3. Mutation with optimistic update + invalidation

```tsx
import { useMutation, useQueryClient, optimisticListUpdate, rollbackQueries, invalidateScope } from "denebola";

const client = useQueryClient();
const mutation = useMutation({
  mutationFn: (input: OrderInput) => api.request("/orders", { method: "POST", body: JSON.stringify(input) }),
  onMutate: (input) => ({ snapshot: optimisticListUpdate(client, "orders", (items) => items.concat(input)) }),
  onError: (_e, _v, ctx) => ctx && rollbackQueries(client, ctx.snapshot),
  onSettled: () => invalidateScope(client, "orders"),
});
```

## 4. Form (zod + react-hook-form)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput, SubmitButton, mapFieldErrors, Screen } from "denebola";

const schema = z.object({ email: z.string().email(), name: z.string().min(1) });
type Values = z.infer<typeof schema>;

export function ProfileForm({ onSave }: { onSave: (v: Values) => Promise<void> }) {
  const { control, handleSubmit, setError, formState } = useForm<Values>({ resolver: zodResolver(schema) });
  return (
    <Screen>
      <FormInput control={control} name="email" label="Email" keyboardType="email-address" />
      <FormInput control={control} name="name" label="Name" />
      <SubmitButton loading={formState.isSubmitting} onPress={handleSubmit(async (v) => {
        try { await onSave(v); } catch (e) { Object.entries(mapFieldErrors(e)).forEach(([k, m]) => setError(k as keyof Values, { message: m })); }
      })} />
    </Screen>
  );
}
```

## 5. API client wiring

```ts
// src/lib/api.ts
import { createApiClient, createSessionManager, secureStorage } from "denebola";

const session = createSessionManager(secureStorage);
export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  getToken: async () => (await session.restore())?.accessToken ?? null,
  refreshToken: async () => {
    const current = await session.restore();
    if (!current?.refreshToken) return null;
    const next = await api.request<typeof current>("/auth/refresh", {
      method: "POST", body: JSON.stringify({ refreshToken: current.refreshToken }), skipAuth: true,
    });
    await session.save(next);
    return next.accessToken;
  },
  timeoutMs: 15_000,
});
```

Pass `apiClient={api}` to `MobileTemplateProvider` to expose `useApiClient()`. Requests surface `ApiError` (`status`, `code`, `details`, `retryable`, `requestId`).

## 6. Auth, guard and RBAC

```tsx
import { AuthProvider, AuthGuard, useAuth, useCan, useHasRole, type AuthClient } from "denebola";

const authClient: AuthClient = {
  login: ({ email, password }) => api.request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => api.request("/auth/logout", { method: "POST", expect: "none" }),
  restore: () => session.restore(),
  // register / requestPasswordReset / verifyEmail / refresh / updateProfile: implement as needed
};

<AuthProvider client={authClient}>
  <AuthGuard redirectTo="/login"><App /></AuthGuard>
</AuthProvider>

const { login, session, user } = useAuth();
const canEdit = useCan({ permissions: ["orders:write"] });
const isAdmin = useHasRole("admin");
```

Requires are AND across dimensions, OR within a list. `useAuthGuard({ roles, permissions })` returns a redirect target or `null`.

## 7. Secure storage and sessions

```ts
import { secureStorage, createSecureKV, createCredentialStore, createKeyRotation } from "denebola";

secureStorage.set("token", { value });
const kv = createSecureKV();                         // JSON over the keychain
const credentials = createCredentialStore(secureStorage); // "remember me", separate from session
```

Use `secureStorage` only for secrets. Preferences go through a `Storage` adapter (see recipe 8).

## 8. Persistent global store

```ts
import { createStore, isHydrated, type Storage } from "denebola";

type Cart = { items: string[]; add: (id: string) => void; clear: () => void };
export const useCart = createStore<Cart>(
  { initial: { items: [] }, create: (set, get) => ({
    add: (id) => set({ items: [...get().items, id] }),
    clear: () => set({ items: [] }),
  }) },
  { persist: { storage, name: "cart", version: 1 } }, // stores under `state:cart`
);
useCart.getState().add("sku-1");
useCart.reset(); // state fields reset, actions preserved
```

Gate first paint on `isHydrated(state)`. Global UI state: `useUiStore` (modal/sheet/keyboard) or `createUiStore()`.

## 9. Offline: cache + mutation queue

```ts
import { createQueryPersister, createSyncQueue, type Storage } from "denebola";

export const queryPersister = createQueryPersister(storage); // pass to MobileTemplateProvider
export const queue = createSyncQueue<PendingWrite>({
  storage,
  process: (w) => api.request(w.path, { method: "POST", body: w.body, retry: false, expect: "none" }),
});
// flush() replays persisted writes; an item is dropped after maxAttempts.
```

```tsx
<MobileTemplateProvider queryPersister={queryPersister} onReconnect={() => queue.flush()}>…</MobileTemplateProvider>
```

## 10. Theme, tokens and components

```tsx
import { Text, Button, Card, useColors, useSpacing } from "denebola";

export function Panel() {
  const colors = useColors();
  const spacing = useSpacing();
  return (
    <Card className="rounded-2xl border border-border bg-card p-5">
      <Text variant="h3">Title</Text>
      <Button variant="secondary" size="sm" icon={<Icon />} title="Action" onPress={() => {}} />
    </Card>
  );
}
```

Prefer `className` with semantic tokens over inline colors; do not mix `className` and `StyleSheet` on one component. `ThemeProvider` is mounted by `MobileTemplateProvider` (pass `themePreference`).

## 11. i18n: messages and locale switching

```tsx
// src/messages.ts
export const appMessages = {
  en: { "home.title": "Home" },
  "zh-CN": { "home.title": "首页" },
};
export const supportedLocales = Object.keys(appMessages);

// usage
import { useLocale, useText, useI18nFormatters, LocaleSwitcher } from "denebola";
const text = useText();
text({ id: "cart.items" }, { count: 3 });            // ICU plural
const { formatCurrency, formatDate } = useI18nFormatters();
formatCurrency(1234.5, "EUR");
<Text>{text({ id: "home.title" })}</Text>
<LocaleSwitcher locale={locale} locales={supportedLocales} onChange={setLocale} />
```

Validate catalogs with `validateTranslations(appMessages, "en")` in a test. Extract with `pnpm i18n:extract`.

## 12. Deep links and notifications

```ts
import { parseDeepLink, handleDeepLink, validateDeepLink, parseNotificationPayload, notificationPath } from "denebola";

const link = parseDeepLink(url);                 // validate + normalize
if (!validateDeepLink(url)) return;
handleDeepLink(url, navigation);                 // route to the mapped path

const payload = parseNotificationPayload(notification); // typed + validated
navigation.push(notificationPath(payload));
```

## 13. Testing a feature

```ts
import { createMockFetch, createMockStorage, createFactory, stableSnapshot } from "denebola";

const fetchMock = createMockFetch({ "/orders": { body: [{ id: "1" }] } });
const storage = createMockStorage();
const order = createFactory<Order>((i) => ({ id: String(i), total: 10 }));
```

Unit tests run with vitest; component tests with `@testing-library/react-native`; web smoke tests with Playwright (repo-level).

## 14. Framework tooling

```sh
pnpm denebola:doctor              # installed vs latest, Expo/RN drift, rebuild needed?
pnpm denebola:migrate --dry-run   # plan framework-file migrations
pnpm denebola:migrate             # apply (backs up changed files, checksum-guarded)
pnpm exec denebola-update         # guided upgrade plan
```
