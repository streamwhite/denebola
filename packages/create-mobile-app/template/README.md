# {{name}}

An Expo app built on `{{packageName}}`. The runtime package owns the providers, UI
primitives and platform abstractions; this project owns its routes, features and messages.

## Development

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts Metro. Press `w` for web, `a` for Android, `i` for iOS, or open the URL
Metro prints. Use `pnpm test` for unit tests and `pnpm typecheck` before committing.

## Structure

```text
src/app/                          Expo Router routes (business-owned)
src/features/                     feature code (business-owned)
src/lib/api.ts                    app API client wiring
src/messages.ts                   app translations
tests/                            app unit tests
app.config.ts                     app identity, permissions and plugins
```

## Environment

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`. Expo public variables are
bundled into the app, so they must never contain secrets.

## Diagnostics and updates

```sh
pnpm mobile-template:doctor     # versions, Expo/React Native lines, rebuild needed?
pnpm mobile-template:migrate --dry-run   # preview framework file migrations
pnpm mobile-template:migrate             # apply them (backs up changed files)
```

`mobile-template:migrate` only ever touches files the framework generated and recorded. It
refuses to overwrite a file you edited, and writes a `.bak` backup before changing one.
