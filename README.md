# Expo Mobile Application Template

Production-oriented Expo + React Native foundation for iOS and Android.

## Included

- Expo Router with route-based example screens
- TypeScript strict mode and path aliases
- TanStack Query provider
- React Hook Form, Zod and React Intl-ready structure
- Light/dark semantic theme tokens
- NativeWind (Tailwind CSS) styling with semantic color tokens
- API client with timeout, auth header and normalized errors
- SecureStore and replaceable storage interfaces
- Deep-link and notification payload validation
- Permission request abstraction
- EAS development, preview and production profiles
- Vitest unit tests and GitHub Actions checks
- React Native Testing Library component test configuration and Playwright web smoke test
- Optional capability packages for notifications, deep links, permissions, SQLite, biometrics, files, camera, device, analytics and logging

## Start

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts Metro for the custom development client. It does not open the app UI by itself. Choose one of the ways below to see the interface.

### Web

Open the URL printed by Metro:

```text
http://localhost:8081
```

Or start directly in the browser:

```sh
pnpm dev:web
```

### Android device

1. Create the development build and install the generated APK:

   ```sh
   pnpm build:development:android
   ```

2. Start Metro:

   ```sh
   pnpm dev
   ```

3. Open the development build app and scan the terminal QR code, or open the `exp+expo-mobile-template://...` link shown by Metro.

If the device cannot reach the computer over Wi-Fi, use USB instead (see below) or a tunnel:

```sh
pnpm dev -- --tunnel
```

#### Android device over USB (no Wi-Fi)

Use `adb reverse` so the device reaches Metro through the USB cable. The phone does not need to be on the same network.

1. Install Android Platform Tools (provides `adb`) and enable **USB debugging** in the phone's developer options.
2. Connect the phone by USB and verify it is detected:

   ```sh
   adb devices
   ```

   If it shows `unauthorized`, accept the USB debugging prompt on the phone.

3. Forward the Metro port from the device to the computer:

   ```sh
   adb reverse tcp:8081 tcp:8081
   ```

   Re-run this after reconnecting the cable or restarting `adb`/the device.

4. Install the development build on the phone, then start Metro bound to localhost:

   ```sh
   pnpm dev -- --localhost
   ```

5. Open the development build app. It connects to `localhost:8081`, which `adb reverse` tunnels to your computer.

If you use a Metro port other than `8081`, forward that port too:

```sh
adb reverse tcp:<port> tcp:<port>
```

### Android emulator

Start an emulator from Android Studio, then run:

```sh
pnpm android
```

Metro launches with the development client connected.

### iOS

Requires macOS with Xcode:

```sh
pnpm ios
```

### Notes

- The QR code must be opened by the development build, not by Expo Go.
- `pnpm dev:go` exists only for screens that do not require custom native modules.
- Set `EXPO_PUBLIC_API_URL` from `.env.example`. Public Expo variables must not contain secrets.

## Update Android tooling

Expo SDK 57 builds require reasonably current Android tooling. If Android Studio has not been updated in a while, update all four layers: Android Studio, the SDK platform/build-tools, platform-tools (`adb`), and the emulator + system images.

### 1. Update Android Studio

- Open **Android Studio → Help → Check for Updates** (or use the JetBrains Toolbox to update), or download the latest stable from <https://developer.android.com/studio>.
- On Linux, install it through your package manager or the JetBrains Toolbox. Avoid mixing a very old IDE with a new SDK.

### 2. Update the Android SDK

- Open **Settings → Languages & Frameworks → Android SDK**.
- Under **SDK Platforms**, enable the latest stable API level (for example Android 15 / API 35 or newer) and apply.
- Under **SDK Tools**, enable:
  - Android SDK Build-Tools (latest)
  - Android SDK Platform-Tools
  - Android SDK Command-line Tools (latest)
  - Android Emulator
  - Android SDK Platform-Tools
- Click **Apply** to install or update.

### 3. Update from the command line (optional)

Use the Android CLI (`android`, in `$ANDROID_HOME/cmdline-tools/latest/bin`). Package names use `/` separators, and `install` takes one package at a time:

```sh
android sdk list                      # installed packages
android sdk list --all                # all available packages
android sdk list "platforms/*"        # filter by pattern
android sdk update                    # update all installed packages
android sdk update "platforms/android-36"

android sdk install "platform-tools"
android sdk install "cmdline-tools/latest"
android sdk install "emulator"
android sdk install "platforms/android-36"
android sdk install "build-tools/36.0.0"
android sdk install "system-images/android-36/google_apis/x86_64"
```

Replace the API level, build-tools, and system image with the latest stable ones shown by `android sdk list --all`. The CLI handles SDK licenses during install; to re-run the legacy license flow use `sdkmanager --licenses`.

The legacy `sdkmanager` (which uses `;` separators, for example `"platforms;android-36"`) still works but is deprecated:

| Legacy `sdkmanager` | Current `android` CLI |
| --- | --- |
| `sdkmanager --list` | `android sdk list` |
| `sdkmanager --update` | `android sdk update` |
| `sdkmanager "platforms;android-36"` | `android sdk install "platforms/android-36"` |
| `sdkmanager --uninstall "platforms;android-36"` | `android sdk remove "platforms/android-36"` |

### 4. Update the emulator and create a current AVD

Manage AVDs with the Android CLI:

```sh
android emulator list                 # list existing devices
android emulator list --long          # more detail
android emulator create --list-profiles
android emulator create <profile>     # e.g. a phone profile
android emulator start <device>       # add --cold to skip snapshot
android emulator stop <device>
android emulator remove <device>
```

- Use a recent system image (API 35+ with Google APIs).
- Prefer an x86_64 image on Intel/AMD and an arm64 image on Apple Silicon.
- If hardware acceleration is unavailable, enable virtualization (KVM on Linux, WHPX/Hyper-V on Windows).

### 5. Verify

```sh
android info
android sdk list
adb version
emulator -version
```

Then build and run:

```sh
pnpm android
```

Also keep the environment variables current. The `android` CLI (and the legacy `sdkmanager`) live in the command-line tools, so that directory must be on `PATH`:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

Persist it in your shell config. For fish:

```fish
set -gx ANDROID_HOME $HOME/Android/Sdk
set -gx ANDROID_SDK_ROOT $ANDROID_HOME
fish_add_path $ANDROID_HOME/cmdline-tools/latest/bin $ANDROID_HOME/emulator $ANDROID_HOME/platform-tools
```

For bash/zsh, add the `export` lines to `~/.bashrc` or `~/.zshrc`.

Do not install the distro `sdkmanager` package (`sudo apt install sdkmanager`): it is an unrelated tool with the same name. Android's `android` and `sdkmanager` come only from the Android SDK command-line tools. If `sdkmanager` is not found even though the SDK is installed, this `PATH` entry is the missing piece.

### 6. Enable emulator acceleration (KVM)

On Ubuntu the Android Emulator needs KVM for hardware acceleration. A script is provided to detect virtualization support, install KVM packages, load the kernel modules, grant the current user access, and verify the result:

```sh
pnpm emulator:accelerate          # install and enable
pnpm emulator:accelerate -- --check   # verify only
```

The script is idempotent and safe to re-run. It requires `sudo` for package installation and group changes. Log out and back in after it finishes, then restart the emulator.

Manual verification:

```sh
kvm-ok
"$ANDROID_HOME/emulator/emulator" -accel-check
```

If it reports that KVM is unavailable, enable VT-x/AMD-V in BIOS/UEFI (or nested virtualization on a VM host) and reboot.

### 7. Prune unused SDK packages

The Android SDK grows quickly (NDKs and system images are ~2 GB each). Before removing anything, keep the versions this template actually builds with. For Expo SDK 57 / React Native 0.86 they come from `node_modules/react-native/gradle/libs.versions.toml`:

```text
compileSdk 36, targetSdk 36, buildToolsVersion 36.0.0, ndkVersion 27.1.12297006
```

Keep these, plus whatever system image your AVD uses (`android emulator list --long`):

```text
platform-tools
cmdline-tools/latest
emulator
platforms/android-36
build-tools/36.0.0
ndk/27.1.12297006
cmake/3.22.1
```

Close Android Studio and the emulator first, then remove old packages. `android sdk remove` accepts several packages at once:

```sh
android sdk remove \
  "build-tools/35.0.0" \
  "build-tools/37.0.0-rc1" \
  "cmake/4.1.2" \
  "ndk/29.0.14206865" \
  "ndk/30.0.16248370" \
  "platforms/android-35" \
  "sources/android-37.2" \
  "system-images/android-35/google_apis_playstore/x86_64"
```

Notes:

- List packages first with `android sdk list` and check each name exactly.
- An AVD only needs its system image, not the matching `platforms/*` package.
- `sources/*` is only for browsing Android source in an IDE; safe to remove.
- If a build later complains about a missing package, reinstall it with `android sdk install "<package>"`.

## Styling (NativeWind)

This template uses NativeWind v4 (Tailwind CSS v3) with `className` on React Native components. Tailwind processes `global.css` through Metro; the Babel preset and `nativewind-env.d.ts` provide the JSX runtime and types.

Key files:

- `tailwind.config.js`: content globs and semantic color tokens.
- `global.css`: Tailwind directives and the light/dark CSS variables.
- `metro.config.js`: `withNativeWind` integration.
- `babel.config.js`: `nativewind/babel` preset.

Use semantic tokens instead of raw colors:

```tsx
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

export function Example() {
  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      <Text className="text-lg font-bold text-foreground">Title</Text>
      <Text className="text-muted">Supporting text</Text>
    </View>
  );
}
```

Available tokens: `background`, `foreground`, `card`, `primary`, `muted`, `border`, `destructive`. Light and dark values switch automatically via `prefers-color-scheme`.

Rules:

- Do not mix NativeWind `className` with `StyleSheet` for the same component; prefer `className`.
- Put shared primitives in `src/components/ui/` and style screens with utility classes.
- Restart Metro after changing `tailwind.config.js`.

## Structure

Application code lives in `src/`. Reusable package entry points live in `packages/`:

- `@your-scope/mobile-core`
- `@your-scope/mobile-api`
- `@your-scope/mobile-auth`
- `@your-scope/mobile-storage`
- `@your-scope/create-expo-app`

Native capabilities such as notifications, SQLite, camera, biometrics and filesystem should be added only when a generated application needs them.

## Checks

```sh
pnpm test
pnpm typecheck
pnpm format:check
pnpm test:component
pnpm test:e2e
```

The template deliberately does not include a backend, authentication vendor, analytics vendor or business domain.

Release and security procedures are documented in `docs/RELEASE.md` and `docs/SECURITY.md`.
