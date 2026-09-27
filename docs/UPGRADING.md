# Upgrading

The runtime package is an ordinary npm package. Upgrading is a normal dependency update; the
commands below turn that update into a guided, verifiable sync.

## 1. Check the current state

```sh
pnpm exec mobile-template-doctor
```

Reports the installed version, the latest published version, the Expo/React Native line the
package integrates, and whether the installed native stack drifts (which requires a new binary).

## 2. Review the upgrade

```sh
pnpm exec mobile-template-update
```

Prints, without writing anything:

- project health,
- the upgrade type (`up-to-date`, `minor`, `breaking`),
- native compatibility (does the installed stack match the template line?),
- the planned framework-file migrations.

## 3. Update the package

```sh
pnpm update @your-scope/mobile-template --latest
```

Because Expo, Expo Router and the native modules are dependencies of the package, this raises the
whole runtime stack together. `react` and `react-native` stay peer dependencies, so keep them on
the line the package integrates (the doctor flags drift).

## 4. Apply framework-file migrations

```sh
pnpm exec mobile-template-update --apply
```

Only files the framework generated are considered. The engine plans first, refuses to write on a
checksum conflict or missing file, backs up every changed file with a `.bak` suffix and records
applied ids in `.mobile-template-migrations.json`. Business files are never touched.

## 5. Rebuild when the native stack changed

If step 1 or 2 reports native drift, build a new binary. JavaScript-only changes can ship with EAS
Update when the runtime version matches; see `docs/RELEASE.md`.

## Version compatibility

`VERSION_MATRIX` in the package maps each framework release line to the Expo, React and React
Native versions it integrates. `checkCompatibility({ framework, expo, react, reactNative })`
returns the matched entry, any drift issues and whether a rebuild is required. Update the matrix
when you bump the bundled Expo line.

## Breaking changes

A change is breaking when the framework major version increases. `classifyChange(from, to)`
returns `breaking`, `feature` or `fix`. Breaking releases ship with migrations whose entries set
`breaking: true`; `migrationSummary` counts them by kind (`config`, `dependency`, `template`) so
the upgrade guide and changelog can call them out. See `CHANGELOG.md` for the per-release notes.
