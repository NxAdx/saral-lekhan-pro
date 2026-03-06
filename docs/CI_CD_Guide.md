# CI/CD Guide - Mobile APK Workflow

This document outlines the GitHub Actions workflow designed to ensure every commit is validated and production-grade APKs are generated automatically.

## 🛠️ Workflow Objective
Generate a **Production Release APK** on every tag or manual trigger, ensuring code quality via automated checks.

## 🔄 Pipeline Stages

1.  **Code Validation**
    - `npm lint`: Verify coding standards.
    - `npm test`: Run Jest unit tests.
    - `npm run tsc`: Static type checking.
2.  **Build Preparation**
    - Install Node.js (v18+).
    - Cache `node_modules` and Gradle dependencies.
    - Set up Android SDK and NDK.
3.  **Security Scan**
    - Check for exposed secrets/keys.
    - Audit dependencies for known vulnerabilities.
4.  **Production Build**
    - `npx expo prebuild`: Generate native Android project.
    - `./gradlew assembleRelease`: Generate the production APK.
5.  **Artifact Generation**
    - Upload unsigned APK to GitHub Artifacts.
    - (Optional) Sign APK and upload to Play Store internal track.

## 🚀 Manual Build Commands
To simulate the CI build locally:
```bash
# Clean build
cd android && ./gradlew clean
# Generate Release APK
./gradlew assembleRelease
```

## 🔐 Secrets Required
- `EXPO_TOKEN`: Access to Expo services.
- `ANDROID_KEYSTORE`: For signing production builds (base64 encoded).
- `KEYSTORE_PASSWORD`: Password for the keystore.

## 📁 Artifact Location
After a successful run, the APK can be found under the **Actions** tab on GitHub:
`outputs/apk/release/app-release.apk`
