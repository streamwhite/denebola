# Local Development

Setup, device workflows, cache clearing and Android tooling for working on Denebola itself.

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

3. Open the development build app and scan the terminal QR code, or open the `exp+denebola://...` link shown by Metro.

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

### Clearing caches

Metro/JS and native build caches are separate.

Clear the Metro bundler cache:

```sh
pnpm dev -- --clear
```

Clear the Android native Gradle build cache:

```sh
pnpm android -- --no-build-cache
```

Clear both at once (Metro in one terminal, native build in another):

```sh
# terminal 1
pnpm dev -- --clear

# terminal 2 (reuse the running Metro instead of starting a second one)
pnpm android -- --no-build-cache --no-bundler
```

Options:

- `--clear`: clears the Metro/JS bundle cache.
- `--no-build-cache`: clears the Android native build cache.
- `--no-bundler`: skips starting Metro, so it reuses the server from terminal 1.

If a build is still stale, regenerate the native projects (this project uses Continuous Native Generation, so `android/` and `ios/` are not committed):

```sh
pnpm exec expo prebuild --clean
pnpm android -- --no-build-cache
```

### Notes

- The QR code must be opened by the development build, not by Expo Go.
- `pnpm dev:go` exists only for screens that do not require custom native modules.
- Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_APP_ENV` from `.env.example`. Public Expo variables must not contain secrets.

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
