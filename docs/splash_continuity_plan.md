# Splash Consistency & Continuity Plan

The goal of this plan is to eliminate the "dual splash" perception (visual jumps or logo disappearing) during app startup by perfectly aligning the Android native splash with the JavaScript initialization layer.

## Proposed Changes

### [Component] Root Layout (JS Layer)

#### [MODIFY] [RootLayout](file:///d:/Development/Production/saral-lekhan-plus/src/app/_layout.tsx)
- Re-introduce the branded logo to the `!coreReady` fallback view.
- Use a calibrated size (e.g., `128px`) to match the Android 12+ system splash icon scale.
- Implement a 200ms `Animated.View` fade-out for the gap view to ensure a soft transition to the Home screen instead of a hard jump.
- Ensure the `backgroundColor` exactly matches `@color/splashscreen_background`.

### [Component] Native Resources (Android Layer)

#### [MODIFY] [MainActivity.java](file:///d:/Development/Production/saral-lekhan-plus/android/app/src/main/java/com/sarallekhan/MainActivity.java)
- Maintain the `setTheme(R.style.AppTheme)` call as it is required for AppCompat stability, but ensure the `AppTheme` background is truly seamless.

#### [MODIFY] [styles.xml](file:///d:/Development/Production/saral-lekhan-plus/android/app/src/main/res/values/styles.xml)
- Verify `Theme.App.SplashScreen` and `AppTheme` alignment.

## Verification Plan

### Manual Verification
1. **Cold Boot Test**: Close the app completely, then launch. Observe the branded logo. It should remain pinned in the center without resizing or vanishing until the Home screen fades in.
2. **Dark Mode Test**: Ensure the splash stays `#d9d7d2` even if the system is in dark mode (as per branding requirements).
3. **Ghosting Check**: Verify there is no "double logo" (one slightly larger than the other) during the transition.
