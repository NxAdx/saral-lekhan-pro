# Play Store Strategy & Monetization Plan

This document outlines the strategy for scaling Saral Lekhan to a wider audience, implementing monetization, and ensuring Play Store compliance.

## 1. Google Drive Scaling (100+ Users)
**Can it handle 100+ users?** Yes, easily.

*   **How it works**: Since we use the **App Data Folder** on the user's *own* Google Drive, the storage cost is paid by the user (using their free 15GB), not the app developer.
*   **Capacity**: Google's API allows **1 billion requests per day** for an app project. 100 or even 10,000 users will not exceed these limits.
*   **Security**: The App Data Folder is hidden from the user, making it a very safe place for notes and backups.

---

## 2. Monetization: How to "Pay for Pro"
To charge for features (e.g., Cloud Sync, Unlimited Notes, Ad-Free), we must use **Google Play Billing**.

### Option A: In-App Purchase (IAP) - *Recommended*
Users download the app for free and pay a one-time fee or subscription to unlock "Pro" features.
*   **Integration**: Use `expo-in-app-purchases` or `RevenueCat` SDK.
*   **Logic**: A "Pro" check is implemented in the state. If `isPro === false`, the app limits features and shows a "Buy Now" screen.

### Option B: Paid App
Users must pay before they can even download the app.
*   **Pros**: Simplest to set up in the Play Console.
*   **Cons**: Much harder to get new users to try the app without a free trial.

---

## 3. Important Play Store Policies (2026)
As a production-ready application, we must maintain these compliance standards:

1.  **Developer Verification**: Google requires a valid ID/Address to verify developers.
2.  **Privacy Policy**: We must host a privacy policy URL explaining that the app uses Google Drive for storage (e.g., via GitHub Pages).
3.  **Data Deletion**: We must provide a way for users to delete their account and data from within the app.
4.  **Permission Justification**: Clear explanation in the Play Console for why `READ_EXTERNAL_STORAGE` (or newer Media Store permissions) are requested.

---

## 4. Play Store Launch Roadmap

### ✅ Step 1: Developer Account
*   Register at **[Google Play Console](https://play.google.com/console/signup)**.
*   Complete **Identity Verification**.

### ✅ Step 2: Store Assets
*   **Screenshots**: 2-8 high-quality images.
*   **Description**: Compelling copy for "Saral Lekhan" (Simple Writing).
*   **Privacy Policy Link**.

### ✅ Step 3: Technical Release
1.  Generate the **Production AAB** (Android App Bundle).
2.  Deployment to **Internal Testing** track for final verification.
3.  Full **Production Rollout**.

---
> [!TIP]
> **Production Recommendation**: Launch the "Free" version first to build a user base and gather reviews. Once stable (v3.0.0), introduce "Pro" features via IAP.
