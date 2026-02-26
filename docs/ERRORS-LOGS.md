Important errors, logs and resolutions encountered during setup

1) Python docx read error (initial)
- Symptom: `docx.opc.exceptions.PackageNotFoundError: Package not found at 'd:\Development\Production\सरल लखन\tippani-design-system-documentation.docx'` when attempting to open docx via Python.
- Cause: Unicode path handling differences and initial incorrect path variant.
- Resolution: used `glob.glob('d:/Development/Production/*')` to discover the folder and then read the docx; installed `python-docx` package to extract text.

2) npm ERESOLVE / peer dependency conflicts
- Symptom: `npm ERR! ERESOLVE unable to resolve dependency tree` referencing `react` and `react-native` peer mismatches.
- Cause: package versions did not match Expo SDK expectations (react 18.3.0 vs required 18.2.0 for RN 0.72.x, etc.).
- Resolution: updated `package.json` to align versions (set `react` to 18.2.0), moved TypeScript and @types to devDependencies, and installed with `--legacy-peer-deps`. Also invoked `npx expo install --fix` suggestion when appropriate.

3) `expo start` / Expo Go SDK mismatch
- Symptom: Expo Go reported "Project is incompatible with this version of Expo Go" (device had SDK 54 while project used SDK 49).
- Cause: installed Expo Go app on device did not match project SDK.
- Resolution: installed the Expo Go build that matches SDK 49, or alternatively upgrade project to SDK 54 via `npx expo upgrade`.

4) Metro port conflict and change
- Symptom: `Port 8081 is being used by another process`.
- Cause: another process (previous Metro or other service) bound to 8081.
- Resolution: accepted Expo prompt to use port 8082; Metro started on 8082.

5) Bundling error: "Helpers are not supported by the default hub"
- Symptom: Android bundling failed with `node_modules\expo\AppEntry.js` or `node_modules\expo-router\_app.tsx` / `renderRootComponent.tsx: Helpers are not supported by the default hub.`
- Cause: Babel’s default Hub is used when transforming some files (e.g. in node_modules or when path/encoding triggers a different pipeline). The default Hub does not support `addHelper()`, so the transform throws.
- Resolution / Workarounds (try in order):
  - Set `"main": "expo-router/entry"` in `package.json` so Metro uses Expo Router’s entry instead of `expo/AppEntry.js`.
  - Add a root `babel.config.js` with `presets: ['babel-preset-expo']` and `plugins: ['react-native-reanimated/plugin']`.
  - Add a root `metro.config.js`: `const { getDefaultConfig } = require('expo/metro-config'); module.exports = getDefaultConfig(__dirname);`
  - Add `@babel/runtime` to dependencies and run `npm install --legacy-peer-deps`, then `npx expo start --clear`.
  - **Most reliable:** Copy the project to an **ASCII-only path** (e.g. `d:\Development\Production\saral-lekhan`), delete `node_modules` and `package-lock.json`, run `npm install --legacy-peer-deps`, then `npx expo start --clear`. Unicode in the folder path can cause Metro/Babel to use a code path that triggers this error.

6) `npx expo run:android` failing during prebuild
- Symptom: the run command attempted to create native project files and failed during `npm install` (non-zero exit code).
- Cause: native prebuild attempted to install packages and native toolchain mismatches / dependency issues.
- Resolution: for development we used Expo Go to iterate faster; to run `expo run:android` successfully, ensure native environment (Android SDK, JDK) is installed and package.json versions match Expo's recommendations; run `npx expo prebuild` manually to observe errors.

Notes
- Most problems encountered were package-version mismatches and Windows path encoding edge cases. These are documented above and in `IMPLEMENTATION-GUIDE.md` with recommended commands.
