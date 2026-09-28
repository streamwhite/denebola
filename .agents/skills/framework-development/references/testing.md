# Testing conventions

Denebola is the foundation for new projects, so its own behaviour must stay regression-safe.
Test what the framework **implements itself**; do not re-test a dependency or the platform.

## What to test (in scope)

- Algorithms, state machines, branching and edge cases in `src/lib/**` and `src/components/**`.
- Parsing / mapping / serialization / versioning / persistence rules the framework owns.
- Public contracts that are not plain re-exports (e.g. `isAllowedExternalUrl`, `migrate`,
  the `createStore` persist adapter, `secureStorage`'s self-owned key index).
- Any bug you fix: add a failing test that reproduces it first, then fix the code.

## What not to test (out of scope)

- Thin wrappers / re-exports over a dependency: `platform`→`react-native`,
  `appConfig`→`expo-constants`, `useI18nFormatters`→`react-intl`, `logger`→`consola`.
- Platform / browser / native APIs that already have their own suites. If a module only
  forwards to one Expo module, mock the module when it is a dependency of logic you *do* test
  (e.g. mock `expo-secure-store` to test `secureStorage`'s index logic) rather than asserting
  the forwarded call.
- Pure type modules and constant/`index.ts` re-export files.
- Redundant permutations and implementation details.

Keep tests **necessary**: cover the happy path and the one boundary most likely to regress.
Prefer a unit test for pure logic; use a component test only when the component owns real
branching or state. Do not duplicate coverage that already exists (check `tests/` first).

## Layout and runners

- Unit logic → vitest, `tests/unit/*.test.ts`, import via the `@/` alias
  (`@/lib/...`, `@/components/...`). Node environment.
- Component/stateful UI → jest + `@testing-library/react-native`, `tests/component/*.test.tsx`.
  Mount `ThemeProvider` (and `AppIntlProvider` when `useText` is used), mirroring
  `tests/component/select.test.tsx`.
- End-to-end web smoke → Playwright, `tests/e2e/`.
- Mock a dependency with `vi.mock(...)` (vitest) or `jest.mock(...)` (jest); use `vi.hoisted`
  for values referenced inside a hoisted mock factory.

## Commands

Run only the files you changed or added first; run the full suites before release.

```sh
pnpm exec vitest run tests/unit/<file>.test.ts
pnpm exec jest --config jest.config.js tests/component/<file>.test.tsx
pnpm test            # vitest, all unit tests
pnpm test:component  # jest, all component tests
pnpm test:e2e        # playwright web smoke
```

When a test fails, fix the code — do not weaken the expectation to make it pass.
