# The "Zero to Pro" Online Build Guide (March 2026)

This is a **beginner-friendly, follow-along tutorial**. I will assume you are starting completely from scratch. Follow every step in order, and do not skip anything.

> [!NOTE]
> **Why are we doing this?** We are moving your app from building on your laptop to building on a pristine Linux Server owned by GitHub. This completely eliminates errors like "Java Version Mismatch" and "Unsupported Class Files", and bypassed Expo's EAS limits.

---

## Phase 1: Uploading your Code to a Private Vault

Your code is currently sitting on your `D:` drive. We need to upload it to a private, hidden folder on GitHub.

### Step 1: Create the GitHub Repository
1. Go to [GitHub.com](https://github.com) and log in.
2. In the top-right corner next to your profile picture, click the **`+`** icon and select **New repository**.
3. **Repository name:** Type `saral-lekhan-pro`.
4. **CRITICAL:** Select the **Private** option. (This guarantees nobody else can see or steal your code, and gives you 2,000 free build minutes every month).
5. Do *not* check any boxes for "Add a README" or ".gitignore".
6. Click the green **Create repository** button.

### Step 2: Upload Your Code from Windows
1. Open a new **PowerShell** window.
2. Type this to go to your project folder:
   ```powershell
   cd d:\Development\Production\saral-lekhan-plus
   ```
3. Type these exact commands one by one, pressing Enter after each:
   ```powershell
   git init
   git add .
   git commit -m "First upload to the cloud"
   ```
4. Now, look at the GitHub page you left open in Step 1. Copy the two lines under the section **"…or push an existing repository from the command line"**. They look like this:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/saral-lekhan-pro.git
   git branch -M main
   git push -u origin main
   ```
5. Paste them into PowerShell and hit enter. (It may ask you to log in to GitHub on a pop-up window).

Great! Your code is now physically stored in the cloud.

---

## Phase 2: Generating the "Secret Keys"

A professional app requires "Keys" to prove to Google Play that you, and only you, created this app. Because these keys are powerful, **they cannot be uploaded to the code vault in Phase 1.** They go in a separate "Secrets" vault.

### Step 3: Generate the Master Keystore
1. In your same PowerShell window at `d:\Development\Production\saral-lekhan-plus`, paste this exact command:
   ```powershell
   keytool -genkeypair -v -keystore release.keystore -alias androidreleasekey -keyalg RSA -keysize 2048 -validity 10000
   ```
2. It will ask for a **password**. Type `SaralSecret2026!` and press Enter. (You will not see the letters typing, that is normal. Keep typing). Retype it when asked again.
3. It will ask for your First and Last name. Type your name and press Enter.
4. Keep pressing Enter to skip the rest of the questions until it asks `[no]:`. Type `yes` and press Enter.

### Step 4: Convert the Keystore to Text
The cloud server is a Linux machine; it needs your Keystore as a massive block of text.
1. Run this exact line in PowerShell. It will "copy" the massive text block to your mouse clipboard invisibly:
   ```powershell
   [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes("release.keystore")) | clip
   ```

### Step 5: Get the Google Connections File
This file connects your app to Google Sign-In and Firebase. (Its absence was crashing your app earlier).
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Click your **Saral Lekhan** project.
3. Click the **Gear icon (⚙️)** in the top left next to "Project Overview" -> Select **Project settings**.
4. Scroll down to the "Your apps" section. Select your Android app (`com.sarallekhan`).
5. Click the download button for **`google-services.json`**.
6. Open that file in Notepad or VS Code on your computer. **Select ALL the text inside it and copy it (CTRL+C).**

---

## Phase 3: Giving the Secrets to the Cloud Builder

### Step 6: Injecting the 5 Vault variables
1. Go back to your `saral-lekhan-pro` repository on GitHub.
2. Click the **Settings** tab.
3. On the left menu bar, scroll down to "Security" and click **Secrets and variables**, then click **Actions**.
4. Click the big green button: **New repository secret**.

You are going to repeat this process 5 times to create 5 distinct secrets.

| Fill in the "Name" box with this | Paste this into the "Secret" large box below it |
| :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Paste the massive text block from **Step 4**. |
| `ANDROID_KEY_ALIAS` | Type exactly: `androidreleasekey` |
| `ANDROID_KEY_PASSWORD` | Type exactly: `SaralSecret2026!` (Or whatever you typed in Step 3). |
| `ANDROID_STORE_PASSWORD` | Type exactly: `SaralSecret2026!` (Or whatever you typed in Step 3). |
| `GOOGLE_SERVICES_JSON` | Paste the entire text of the file from **Step 5**. |

---

## Phase 4: Trigger the Cloud Build!

You have uploaded the code and locked the secrets in the vault. The cloud builder script (`.github/workflows/android-build.yml`) is already waiting to do the rest.

### Step 7: Start the Machines
1. On your GitHub repository page, click the **Actions** tab at the top.
2. You will see a green warning that says "I understand my workflows, go ahead and enable them". Click it.
3. On the left side, click **Production Android Build**.
4. On the right side of the screen, click the **Run workflow** dropdown, then click the green **Run workflow** button.

### Step 8: Understand the March 2026 Workflow Hardening
The production workflow was hardened to avoid auth regressions:
- It now builds from committed native Android files directly (no `expo prebuild --clean` in production CI).
- It validates `GOOGLE_SERVICES_JSON` before build (must include package `com.sarallekhan` and an OAuth Web client entry).
- Release signing is consumed from secrets via `MYAPP_UPLOAD_*`, so production artifacts use your release keystore fingerprints.

## Phase 5: Google Sign-In & Production Go-Live

If you see a `DEVELOPER_ERROR` or `Error 10`, it means Firebase/GCP still does not trust the signing fingerprints used by the current release artifact. Follow these steps to link them.

### Step 9: Register your Release Fingerprints
1. **Read the exact fingerprint from the current workflow run logs** (the build prints release keystore SHA values right before Gradle build starts).
2. Go to the [Firebase Console](https://console.firebase.google.com).
3. Open your project -> **Project settings** -> **General** tab.
4. Scroll to "Your apps" (com.sarallekhan) and click **Add fingerprint**.
5. Paste the **SHA-1** string and click Save. Repeat for **SHA-256**.
6. (Optional but Recommended): Re-download `google-services.json` and update your GitHub Secret if the fingerprints change the file contents.

#### If app shows: "Google Sign-In config mismatch for package com.sarallekhan"
This means the installed APK signature does not match Firebase OAuth fingerprints.

Use the same keystore that signed the APK and register BOTH SHA-1 and SHA-256:

```powershell
# Release keystore fingerprints
keytool -list -v -keystore release.keystore -alias androidreleasekey

# Debug keystore fingerprints (for local debug/dev builds)
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Then:
1. Add missing fingerprints in Firebase Android app `com.sarallekhan`.
2. Download fresh `google-services.json`.
3. Replace CI secret `GOOGLE_SERVICES_JSON` (and local file if building locally).
4. Remove old app OAuth grant from Google Account -> Security -> Third-party access, then sign in again.

### Step 10: Switch to Production Mode (GCP)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent).
2. Ensure you have the **Saral Lekhan** project selected at the top.
3. Click on the **OAuth consent screen** on the left menu.
4. Under "Publishing status", you will see "Testing". Click the **PUBLISH APP** button.
5. Confirm that you want to move to Production. This removes the "Only invited users can login" restriction.

### Step 11: Final Client ID Check
1. Go to the [Credentials](https://console.cloud.google.com/apis/credentials) page in GCP.
2. Ensure you have an **OAuth 2.0 Client ID** of type **Web application**.
3. Copy its **Client ID** (it looks like `12345-abcde.apps.googleusercontent.com`).
4. In your code, check `src/services/googleDriveService.ts`. Ensure the `WEB_CLIENT_ID` variable matches this exact string.
5. Push any code changes to GitHub and let the Cloud Build run one last time!

### Step 12: Production Monitoring (Sentry)
To catch crashes that happen on users' phones:
1. Create a free account at [Sentry.io](https://sentry.io).
2. Create a new "React Native" project called `saral-lekhan`.
3. Copy your **DSN** (Data Source Name).
4. In your code, open `src/app/_layout.tsx` and replace the placeholder DSN with your actual one.
5. In `app.json`, update the `organization` and `project` slugs to match your Sentry account.
