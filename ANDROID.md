# okna — Android APK build

okna ships as a native Android app by wrapping the static web build in a
[Capacitor](https://capacitorjs.com) WebView shell. **Everything runs
on-device and offline** — the app is a static export with all data kept
client-side in `localStorage`, so there is no server, no network calls, and no
account. This matches okna's local-only, privacy-first guardrail.

> The server-side Prisma + SQLite schema in `prisma/` is the canonical data
> model and dev seed for the roadmap features. It is **not** the phone's runtime
> store — Prisma runs on Node and cannot execute inside an Android WebView.

## What's in the box

| Path | Purpose |
| --- | --- |
| `next.config.mjs` | `output: 'export'` — emits the client-only site into `out/` |
| `capacitor.config.ts` | App id `com.okna.app`, `webDir: out` |
| `android/` | Generated native Android (Gradle) project |
| `okna-debug.apk` | Last built debug APK (git-ignored; rebuild anytime) |

## Prerequisites

- **JDK 21** (or 17+)
- **Android SDK** with `platform-tools`, `platforms;android-36`,
  `build-tools;36.0.0` (accept licenses via `sdkmanager --licenses`)
- Point Gradle at the SDK with `android/local.properties`:
  ```
  sdk.dir=/absolute/path/to/android-sdk
  ```
  (git-ignored — create it locally)

## Build a debug APK

```bash
npm install
npm run apk          # next build → cap sync → gradlew assembleDebug
npm run apk:copy     # copies the APK to ./okna-debug.apk
```

The APK lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install on a device/emulator:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

The debug APK is signed with the standard Android debug key — fine for
sideloading and testing, **not** for the Play Store.

## Release (signed) APK / AAB

For a distributable build you must sign with your own keystore:

```bash
keytool -genkey -v -keystore okna-release.keystore \
  -alias okna -keyalg RSA -keysize 2048 -validity 10000
```

Wire the keystore into `android/app/build.gradle` (`signingConfigs`), then:

```bash
cd android
./gradlew assembleRelease   # APK  → app/build/outputs/apk/release/
./gradlew bundleRelease      # AAB  → app/build/outputs/bundle/release/ (Play)
```

Keep the keystore and its passwords out of git.

## Notes for restricted/CI environments

The Gradle **wrapper** downloads its distribution from `github.com`, which some
sandboxes block. If `./gradlew` fails with an HTTP 403, use a system Gradle of
the matching version instead:

```bash
cd android && gradle assembleDebug --no-daemon   # requires Gradle 8.13+
```

## Updating the app after web changes

Any change to the web app needs a re-sync so the WebView bundle is refreshed:

```bash
npm run sync:android   # rebuilds out/ and copies it into android/
npm run apk            # or rebuild the APK directly
```
