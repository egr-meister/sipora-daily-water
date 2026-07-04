# Sipora Daily Water

A calm, offline **daily water journal** for Android, built with React Native and Expo.

Sipora Daily Water is not just a water counter. It helps you keep a gentle daily
hydration journal divided into the natural parts of the day — **Morning**,
**Afternoon**, and **Evening** — so logging water feels like filling out a quiet
journal page rather than using a fitness dashboard.

---

## 1. Project description

Sipora Daily Water lets you log drinks by time of day, set a personal daily goal,
write a short daily note, review a weekly overview, browse your history, and see
soft in-app reminder cards. Everything is stored locally on your device. There is
no account, no internet connection, and no tracking of any kind.

## 2. Features

- Three-part daily journal: Morning / Afternoon / Evening sections
- Manual water logging with quick-add buttons (150, 250, 330, 500 ml)
- Add, edit, and delete individual drink entries
- Customizable glass sizes (add / edit / delete / reset to defaults)
- Daily water goal with progress and friendly percentage labels
- One short daily note per day
- Weekly overview: weekly total, daily average, best day, goal days, section split
- Seven-day journal spread with per-section mini bars (no chart library)
- History of previous days with note previews and a calm streak label
- Gentle **in-app** reminder cards (no system notifications)
- Compact mode for a tighter journal view
- Fully offline, local-only storage via AsyncStorage

## 3. Manual tracking disclaimer

**Sipora Daily Water is a manual water journal. It does not detect drinking
automatically and does not connect to Health Connect, Google Fit, sensors, or
wearable devices.** All water intake is entered manually.

## 4. Offline-first

The app works fully offline, including in airplane mode. It never makes network
requests. All reads and writes happen on-device through AsyncStorage.

## 5. No internet / no permissions

The app does not request any runtime permissions and does not include the
`INTERNET` permission in its Android manifest. It requires no location, camera,
microphone, contacts, storage/gallery, calendar, alarm, or activity permissions.

## 6. No sensors

The app does not use body sensors, accelerometers, step counters, activity
recognition, or any device sensors.

## 7. No Google Fit

The app does not integrate with Google Fit and does not read or write fitness data.

## 8. No Health Connect

The app does not integrate with Android Health Connect.

## 9. No wearable integration

The app does not connect to smartwatches or any wearable devices.

## 10. No automatic water detection

Water is never detected automatically. Every entry is added by you, manually.

## 11. Non-medical disclaimer

Sipora Daily Water is a wellness-style journal utility. It is **not** a medical,
diagnostic, or treatment app. It does not provide medical advice, does not
diagnose dehydration, and makes no medical claims. If you have questions about
your hydration or health, talk to a qualified professional.

## 12. In-app reminders

Reminders are shown **only inside the app**. When you open the app, it checks the
current time and today's progress and may show soft reminder cards, for example:

- If Morning has no entries and it is after 10:00 — "Morning is still empty. Add a drink if you had one."
- If Afternoon has no entries and it is after 15:00 — "Afternoon journal is waiting."
- If Evening has no entries and it is after 20:00 — "Add your evening water if needed."
- If your daily total is below your goal — "You can still add today's drinks manually."

You can turn reminders on/off and enable each of Morning, Afternoon, and Evening
in Reminder Settings.

## 13. No notification permission

**Sipora Daily Water uses in-app reminder cards only. It does not send system
notifications.** It does not request notification permission, does not use
`expo-notifications`, does not use background tasks, alarms, or calendar access.

## 14. Airplane mode support

Because there is no networking, the app behaves identically online or in airplane
mode. You can install it and use every feature with no connection.

## 15. Local storage

All data is stored on the device using
[`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/):
daily water records, drink entries, daily notes, the daily goal, glass sizes,
reminder settings, general settings, and the onboarding-completed flag. Loaded
data is always merged with safe defaults, so missing or corrupted values never
crash the app.

## 16. Morning / Afternoon / Evening journal

Each day is divided into three sections. Every drink belongs to one section, and
the section totals add up to the daily total. Each section shows its title, total
in ml, quick-add buttons, drink rows, a calm water-fill mark, and a soft empty
state such as "No morning drinks yet."

## 17. Quick water additions

Inside each section, tap a quick amount (150 / 250 / 330 / 500 ml) to add water to
that section. You can also tap "more" to open the full add screen and pick a glass
size or type a custom amount and label.

## 18. Glass size settings

Default glasses are **Small glass (150 ml)**, **Glass (250 ml)**, and
**Bottle (500 ml)**. You can add custom glass sizes, edit or delete custom ones,
and reset back to the defaults. Amounts must be greater than 0 and at most
5000 ml, and labels must not be empty.

## 19. Daily goal

The default goal is **2000 ml**. You can change it in the Goal screen or Settings.
Progress is shown as `total / goal`, capped visually at 100% while still showing
the real total. Goals must be greater than 0 and at most 10000 ml.

## 20. Daily note

Each day has one optional short note, for example "Hot day", "Workout day", or
"Mostly tea". Notes are stored locally and the app never crashes if a note is
empty.

## 21. Weekly overview

The weekly overview (Monday-based week) shows the weekly total, daily average,
best day, number of goal days, the most-logged section, and a seven-day spread
with per-section mini bars. Days with no entries are treated as 0 ml. Totals use
ml, with liters shown for weekly figures where useful.

## 22. History

History lists previous days in reverse chronological order. Each card shows the
date, daily total, goal-reached indicator, Morning / Afternoon / Evening mini
totals, and a note preview. Tap to open and edit a day; long-press or use Delete
to remove a day after confirmation.

## 23. App icon concept

The app icon is a rounded square on a pale-aqua background with three small water
drops representing Morning, Afternoon, and Evening, plus a small journal page line
underneath. It is calm, manual-journal themed, uses no medical symbols, and stays
readable at small sizes. See `assets/icon.png` and `assets/adaptive-icon.png`.

## 24. Splash screen concept

The splash screen (`assets/splash.png`) shows a centered three-drop journal symbol
with the app name "Sipora Daily Water" on a warm-white background. It is simple,
with no heavy image assets.

## 25. Visual style concept

The visual style is "Sipora Calm Water Journal": calm, soft, clean, fresh, and
journal-like. The palette uses a warm-white background, pale-aqua panels, deep
blue-gray text, muted teal accents, soft sky-blue water marks, light-sand note
cards, and a pale-lavender evening accent. It avoids medical, fitness-competition,
childish, neon, and casino styles, and avoids heavy gradients or 3D assets.

## 26. Three-part water journal layout

The home screen is intentionally not a generic dashboard, circular tracker, or
bottle tracker, and has no mascot header or large vertical button menu. Instead it
is a three-part journal page: a compact header with the app title and a settings
link, a small daily header (total + goal progress), three stacked journal panels
for Morning / Afternoon / Evening with their own quick adds and water marks, a
paper-style daily note at the bottom, gentle reminder prompts, and a seven-day
mini preview. The weekly and history screens follow the same journal-spread feel.

---

## 27. Scaffold with the Expo template

This repository already contains a complete Expo project. If you want to recreate
the scaffold from scratch, the base template is created with:

```bash
npx create-expo-app sipora-daily-water
```

## 28. Install dependencies through `npx expo install`

Always install packages with `npx expo install` so versions match the Expo SDK.
Every imported package is listed as a direct dependency in `package.json`:

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-asset expo-constants expo-font expo-modules-core expo-status-bar
npx expo install expo-build-properties
```

Then align everything and check:

```bash
npx expo install --fix
npx expo-doctor
npx expo install --check
```

## 29. Run locally

```bash
npm install
npx expo install --fix
npm run android      # or: npx expo start --android
```

Open the app in Expo Go (development) or in a development build on an emulator or
physical Android device.

## 30. Build Android (release)

Generate the native Android project and build with Gradle:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease   # signed APK
./gradlew bundleRelease     # signed AAB
```

Outputs:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Release optimization (do this in two steps)

First confirm the release runs **without** minification. In
`android/app/build.gradle`:

```gradle
minifyEnabled false
shrinkResources false
```

Once a non-minified release launches cleanly, enable R8 / ProGuard shrinking:

```gradle
minifyEnabled true
shrinkResources true
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```

Merge the rules from this repo's `proguard-rules.pro` into
`android/app/proguard-rules.pro`, then re-test launch. Only standard Android
R8/ProGuard is used — no third-party obfuscation tools.

## 31. Generate a PKCS12 keystore

Create a PKCS12 keystore using the **same password** for the store and the key:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore sipora-daily-water-release-key.p12 \
  -alias sipora_daily_water_key \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Do not commit the keystore or passwords to the repository.**

## 32. Add GitHub Secrets

Base64-encode the keystore and add these repository secrets under
Settings → Secrets and variables → Actions:

```bash
base64 -i sipora-daily-water-release-key.p12 -o keystore.base64.txt
# copy the contents of keystore.base64.txt into ANDROID_KEYSTORE_BASE64
```

| Secret | Description |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of the PKCS12 keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g. `sipora_daily_water_key`) |
| `ANDROID_KEY_PASSWORD` | Key password (same as keystore password) |

## 33. GitHub Actions

The workflow at `.github/workflows/android-build.yml` runs on every push to
`main`. It installs Node.js and JDK 17, sets up the Android SDK, installs
dependencies with `npm install`, runs `npx expo install --fix`, `npx expo-doctor`,
and `npx expo install --check`, installs **Android Platform 35** and
**Build Tools 35.0.0**, runs `expo prebuild`, decodes the keystore from secrets,
injects a release signing config, builds the signed APK and AAB, and uploads both
as build artifacts. It intentionally does not run emulator smoke-tests so free
runners stay fast and stable.

## 34. Google Play compatibility notes

The app targets modern Android to satisfy Google Play requirements: it targets
API 35 (not 34), includes no `INTERNET` permission, requests no runtime
permissions, and contains no Firebase, ads, analytics, payment, Google Fit,
Health Connect, sensor, wearable, notification, or background-task SDKs.

## 35. Android API 35 notes

`expo-build-properties` pins `compileSdkVersion 35`, `targetSdkVersion 35`, and
`buildToolsVersion 35.0.0`, with `minSdkVersion 24` (compatible with React Native
0.79). The CI installs `platforms;android-35` and `build-tools;35.0.0`.

## 36. 16 KB page size compatibility

The project uses the current Expo SDK / React Native version and enables the New
Architecture, which ships native libraries aligned for Android 15+ **16 KB memory
page sizes**. No old native libraries are added, so the final AAB supports 16 KB
page sizes.

## 37. Release optimization notes

See section 30. Verify a non-minified release first, then enable
`minifyEnabled`/`shrinkResources` with the optimized ProGuard file and re-test the
launch. Hermes is enabled by default in this SDK.

## 38. Local launch verification checklist

A CI build is **not** proof that the app launches. Before release, install the
release APK on a device/emulator and watch logcat:

```bash
adb install app-release.apk
adb logcat
```

Confirm there are no errors such as: "Cannot find native module", "Module has not
been registered", "Invariant Violation", "theme.fonts.regular is undefined",
AsyncStorage JSON parse crash, missing route params crash, invalid date crash, or
invalid number crash.

Then test the full flow:

- First launch with empty storage
- Add Morning, Afternoon, and Evening drinks
- Edit a drink entry; delete a drink entry
- Add a daily note
- Change a glass size; add a custom glass size
- Change the daily goal
- Check in-app reminders
- Open the weekly overview and history
- Edit a previous day; reset today
- Reset all local data; relaunch the app
- Launch in airplane mode
- Confirm no sensor, Google Fit, Health Connect, wearable, notification, or
  internet permission is requested

## 39. Privacy note

**Sipora Daily Water stores water entries, goals, notes, glass sizes, and reminder
settings only on this device. No account, no ads, no analytics, no internet
connection, no sensors, no Google Fit, no Health Connect, and no notification
permission.**

---

## Project structure

```
sipora-daily-water/
├── App.js                     # Navigation + providers (custom theme extends DefaultTheme)
├── index.js                   # Entry point (registerRootComponent)
├── app.json                   # Expo config: portrait, API 35, blocked permissions
├── package.json               # Direct dependencies (install via npx expo install)
├── babel.config.js
├── proguard-rules.pro         # Reference R8/ProGuard rules
├── assets/                    # Custom icon, adaptive icon, splash, favicon
├── .github/workflows/
│   └── android-build.yml      # CI: signed APK + AAB
└── src/
    ├── theme.js               # Palette, section themes, spacing
    ├── data/
    │   ├── defaults.js        # Defaults + constants + disclaimers
    │   ├── dateUtils.js       # Safe ISO date helpers
    │   └── water.js           # Totals, weekly stats, reminders, streaks
    ├── storage/
    │   └── storage.js         # AsyncStorage load/save with safe merge
    ├── context/
    │   └── AppContext.js      # App state + all actions
    ├── components/
    │   ├── common.js          # Reusable UI pieces
    │   └── WaterSection.js    # Morning/Afternoon/Evening journal panel
    └── screens/
        ├── OnboardingScreen.js
        ├── HomeScreen.js
        ├── DayDetailScreen.js
        ├── EditEntryScreen.js
        ├── WeeklyScreen.js
        ├── HistoryScreen.js
        ├── GlassSizeScreen.js
        ├── GoalScreen.js
        ├── ReminderScreen.js
        └── SettingsScreen.js
```

## License

You may use and adapt this project for your own purposes.
