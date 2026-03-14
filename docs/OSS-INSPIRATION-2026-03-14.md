# OSS Inspiration Notes - 2026-03-14

This note records the open-source reference apps reviewed for Saral Lekhan stabilization and why they matter.

## Reviewed Repositories
- Mihon
  - repo: `https://github.com/mihonapp/mihon`
  - local: `D:/Development/Production/research/mihon`
- ImageToolbox
  - repo: `https://github.com/T8RIN/ImageToolbox`
  - local: `D:/Development/Production/research/ImageToolbox`
- Metrolist
  - repo: `https://github.com/MetrolistGroup/Metrolist`
  - local: `D:/Development/Production/research/Metrolist`

## Reusable Patterns
### 1. Splash ownership from Mihon
- Relevant files:
  - `app/src/main/java/eu/kanade/tachiyomi/ui/main/MainActivity.kt`
  - `app/src/main/res/values/themes.xml`
- Useful pattern:
  - native splash remains authoritative until the app is actually ready
  - splash exit is bounded by explicit conditions instead of showing a JS placeholder
- Saral Lekhan adoption:
  - keep native splash visible until first real root layout
  - do not render a branded or plain JS placeholder before startup is ready

### 2. Settings geometry from Metrolist
- Relevant file:
  - `app/src/main/kotlin/com/metrolist/music/ui/component/Material3SettingsGroup.kt`
- Useful pattern:
  - grouped settings cards use low or zero elevation
  - border/shape clarity is preferred over stacked shadow
- Saral Lekhan adoption:
  - flatten single-row settings cards
  - clip overflow to avoid switch/thumb shadow artifacts on Android

### 3. Typography and preference plumbing from ImageToolbox
- Relevant files:
  - `core/ui/src/main/kotlin/com/t8rin/imagetoolbox/core/ui/theme/Theme.kt`
  - `core/ui/src/main/kotlin/com/t8rin/imagetoolbox/core/ui/widget/preferences/PreferenceRowSwitch.kt`
  - `feature/settings/src/main/java/com/t8rin/imagetoolbox/feature/settings/presentation/components/ChangeLanguageSettingItem.kt`
- Useful pattern:
  - theme, typography, locale, and preference surfaces are driven from central state
  - reusable preference controls inherit that shared state rather than hardcoding visual behavior
- Saral Lekhan adoption:
  - small shared controls like pills must size from shared font scale
  - language/settings controls should use the same typography compensation path as primary content

## Decisions for Saral Lekhan
- Keep Expo SDK 49 splash path stable for now, but follow Mihon's principle of native-first splash ownership.
- On this Expo 49 baseline, that means avoiding a second Android 12 `Theme.SplashScreen` layer and letting Expo own the single splash surface.
- Keep settings cards visually flatter, following Metrolist's low-elevation grouping.
- Continue moving small controls and editor text sizing onto shared typography state, following ImageToolbox's centralized settings model.
- Apply the same consistency mindset to the editor toolbar: stable container metrics first, decorative selected states second.
