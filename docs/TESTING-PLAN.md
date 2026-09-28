# Test expansion plan

Status: **done** — created and completed 2026-09-28. This plan is a snapshot; supersede it by
renaming when a later plan replaces it.

## Why

`denebola` is the foundation for new projects, so its own behaviour must be regression-safe.
This plan adds tests for logic that the template **implements itself**, and deliberately skips
pass-through wrappers whose behaviour is already covered by the dependency or platform.

## Principle (the rule to keep)

Test the project's own code — algorithms, state machines, branching, parsing/mapping,
persistence and versioning rules. Do **not** re-test:

- thin wrappers/re-exports over a dependency (e.g. `useI18nFormatters` → `react-intl`,
  `platform` → `react-native`, `logger` → `consola`, `appConfig` → `expo-constants`);
- platform/browser APIs that already have their own test suites;
- pure type modules (`*/types.ts`);
- declarations whose only content is a constant or a re-export.

Prefer a unit test for pure logic. Use a component test only when the component owns
branching/state worth asserting. Cover the happy path plus the boundary that is most likely to
regress; skip redundant permutations. When a bug is found, add a test for it first.

## In scope (targets)

| # | Module under test | What is project logic | Level | File |
| - | --- | --- | --- | --- |
| 1 | `lib/state/hydration.ts`, `lib/state/persistStorage.ts` | hydration status mapping; `Storage`→Zustand string adapter (prefix, JSON round-trip, missing→null, remove) | unit | `tests/unit/state-storage.test.ts` |
| 2 | `lib/storage/crypto.ts`, `lib/storage/secureKV.ts`, `lib/storage/secureStorage.ts` | cipher plumbing, master-key/JSON round-trip, self-owned key index so `clear()` deletes only this app's keys | unit | `tests/unit/storage-secure.test.ts` |
| 3 | `lib/deeplink/allowlist.ts` | external-scheme allowlist and malformed-URL handling | unit | `tests/unit/deeplink-allowlist.test.ts` |
| 4 | `lib/database/migrations.ts` | generic version gate: ascending order, skip applied, advance, idempotency | unit | `tests/unit/database-migrations.test.ts` |
| 5 | `components/overlays/ToastProvider.tsx` | queue state, id allocation, defaults, dismiss/clear, provider guard | component | `tests/component/toast.test.tsx` |
| 6 | `components/forms/MultiSelect.tsx` | add/remove toggle, `max` gate, disabled options, custom value | component | `tests/component/multi-select.test.tsx` |
| 7 | `components/data/List.tsx`, `components/data/InfiniteList.tsx` | loading/error/empty branches; `hasMore`→`onEndReached`; loading footer | component | `tests/component/data-list.test.tsx` |
| 8 | `components/feedback/AppErrorBoundary.tsx` | error capture, `onError` hook, fallback + retry reset | component | `tests/component/app-error-boundary.test.tsx` |

## Out of scope (and why)

- UI primitives that only forward props (Text/Button/Input/Card/Badge/Avatar/Spinner/Skeleton/
  Checkbox/Radio/Switch/Slider/layout/overlays except Dialog-family state).
- Providers that only compose children (`AppProviders`, `Bootstrap`, `NetworkProvider`,
  `LifecycleProvider`, `PerformanceMonitorProvider`, `ApiProvider`) — integration wiring.
- Native adapters that only forward to a single Expo module (`platform`, `device`, `appState`,
  `expoBiometric`, `secureStorage`'s SecureStore calls are mocked, not re-verified). The
  `createExpoBiometricAdapter` mapping test was dropped during execution: it is a wrapper over
  `expo-local-authentication`, and that package is linked only inside the package (not hoisted),
  so Vitest inlines it and fails to parse React Native's Flow source before a mock can apply.
- Dedicated tests for `localeStore`/`useLocaleController` — already covered by
  `tests/component/locale-controller.test.tsx`.
- `runSqlMigrations`/`createExpoSqliteDatabase` — already covered by `tests/unit/sqlite.test.ts`;
  this plan adds only the uncovered `migrate` ordering gate.

## Commands

```sh
pnpm exec vitest run tests/unit/state-storage.test.ts tests/unit/storage-secure.test.ts \
  tests/unit/deeplink-allowlist.test.ts tests/unit/database-migrations.test.ts
pnpm exec jest --config jest.config.js tests/component/toast.test.tsx \
  tests/component/multi-select.test.tsx tests/component/data-list.test.tsx \
  tests/component/app-error-boundary.test.tsx
```

Run only the added files first; run the full suites before release.

## Checklist

- [x] 1 state/storage hydration + zustand adapter
- [x] 2 secure crypto / KV / storage
- [x] 3 deep-link allowlist
- [x] 4 database migration gate
- [x] 5 expo biometric mapping — dropped (wrapper; see Out of scope)
- [x] 6 ToastProvider
- [x] 7 MultiSelect
- [x] 8 List / InfiniteList
- [x] 9 AppErrorBoundary
- [x] all added tests green (`vitest` + `jest`, typecheck clean)
