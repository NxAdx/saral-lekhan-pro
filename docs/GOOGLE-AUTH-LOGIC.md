# Google Sign-In Logic and Architecture

Last updated: 2026-03-04
Scope: Android login for `com.sarallekhan` using `@react-native-google-signin/google-signin` and Google Drive REST access.

## 1. Purpose

This document explains exactly how Google login works in app code, why `DEVELOPER_ERROR` happens, and what protections are in place to reduce production auth failures.

## 2. Source of Truth Files

- `src/services/googleDriveService.ts`
- `src/app/(main)/settings.tsx`
- `.github/workflows/android-build.yml`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `app.json`

## 3. Core Identity Constants

Current expected values:

- App package: `com.sarallekhan`
- Web OAuth client id (code constant): `871132329368-vbvrs4cuon807asqrbh2eabedr86iljl.apps.googleusercontent.com`
- Required scopes:
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/userinfo.email`

If any of these drift between code and `google-services.json`, login may fail.

## 4. Runtime Login Flow

### 4.1 Initial configuration

At startup, app configures Google Sign-In in strict mode:

- Uses `webClientId` from code.
- Uses `offlineAccess: true`.
- Uses required Drive/email scopes.

This mode is preferred because Drive API access depends on correct web OAuth wiring.

### 4.2 Sign-in request path

`GoogleDriveService.signIn()` does:

1. `GoogleSignin.hasPlayServices()`
2. If previous session exists:
   - attempts silent sign-in
   - returns access token if available
3. If not available:
   - opens interactive Google account picker
   - returns fresh access token

### 4.3 Error normalization

Errors are mapped by `mapGoogleSignInError()`:

- Cancelled flow
- In-progress flow
- Play Services unavailable
- Developer config mismatch (`DEVELOPER_ERROR`, numeric `10`, or matching message)

The app shows a user-friendly modal for config mismatch.

### 4.4 Resilience fallback on `DEVELOPER_ERROR`

If strict mode fails with developer config error, app now performs a one-time fallback:

1. Re-configure sign-in to Android fallback mode:
   - no forced `webClientId`
   - `offlineAccess: false`
2. Retry interactive sign-in once.
3. Restore strict config after retry.

Goal: recover from client-id wiring edge cases where Android native config is valid but strict web-client path fails on specific devices.

## 5. Token Refresh Flow for Backup/Restore

Before every Drive API call:

1. Try `GoogleSignin.getTokens()`.
2. If missing/expired, attempt `signInSilently()`.
3. If session is gone, require interactive sign-in.

This is used by both backup and restore paths.

## 6. Why `DEVELOPER_ERROR` (Error 10) Happens

Most common root causes:

1. APK is signed with a certificate not registered in Firebase Android app.
2. `GOOGLE_SERVICES_JSON` secret is stale and does not match keystore used in CI.
3. Wrong Firebase/GCP project selected while editing OAuth config.
4. Package name mismatch.
5. App still holds old account grant/session after config changes.

## 7. CI Auth Guard Rails

Workflow `.github/workflows/android-build.yml` validates before build:

1. `google-services.json` package must be `com.sarallekhan`.
2. Must contain OAuth web client entry (`client_type=3`).
3. `APP_PACKAGE` in code must match `google-services`.
4. `WEB_CLIENT_ID` in code must exist in `google-services`.
5. Release keystore SHA-1 must match Android OAuth `certificate_hash` in `google-services`.

If any check fails, workflow exits before publishing artifacts.

## 8. Release Signing Model

`android/app/build.gradle` release signing uses:

- `MYAPP_UPLOAD_STORE_FILE`
- `MYAPP_UPLOAD_STORE_PASSWORD`
- `MYAPP_UPLOAD_KEY_ALIAS`
- `MYAPP_UPLOAD_KEY_PASSWORD`

Release build is blocked when credentials are missing for release tasks.

## 9. UX Surface Where Login Is Triggered

Main entry point:

- Settings screen: Google Drive Sync card in `src/app/(main)/settings.tsx`

Failure behavior:

- Modal with explicit cause and action text.

Success behavior:

- Access token and email saved in sync store.
- Backup/restore actions enabled.

## 10. Security and Data Notes

- App stores tokens only as needed for sync flow.
- App does not require full-drive scope; it uses `drive.file`.
- User can disconnect account from app and from Google Account settings.
- Rotating OAuth config requires user grant reset for reliable testing.

## 11. Change Checklist (When touching auth code)

Before merge:

1. Keep package constant as `com.sarallekhan`.
2. Keep web client constant synchronized with GCP project.
3. Confirm workflow checks still pass for package/client/sha.
4. Test interactive sign-in on fresh install.
5. Test silent token refresh via backup/restore.
6. Update docs:
   - `docs/ERRORS-LOGS.md`
   - `docs/MASTER-PROJECT-DOCUMENTATION.md`
   - release notes

## 12. Known Constraints

- Expo Go is not valid for this production sign-in flow.
- Sideload builds and Play-distributed builds may use different signing fingerprints.
- OAuth branding propagation in Google systems can take time.

