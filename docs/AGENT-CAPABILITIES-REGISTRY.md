# AGENT-CAPABILITIES-REGISTRY

This document tracks the tools, services, and automation capabilities available to the AI development agent for **Saral Lekhan Plus**.

## 🛠️ MCP Servers (Model Context Protocol)

- **StitchMCP**: High-level UI/UX design and frontend component generation.
- **Cloud Run**: GCP integration for containerized deployment (if applicable).
- **Firebase MCP**: Integration with Firebase services (Auth, Firestore, Hosting, Data Connect).

## 🚀 DevOps & Infrastructure

- **GitHub Actions**: CI/CD pipeline for linting, testing, and production APK builds.
- **ADB (Android Debug Bridge)**: On-device diagnostics and log analysis.
  - *Path*: `C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe`
- **Sentry**: Real-time error tracking and crash reporting.
  - *DSN*: `https://3a2804f7a6c66cc9f1c0ab029bdfef94@o4510973886464000.ingest.de.sentry.io/4510973892100176`

## 🧠 Specialized Skills & Automation

- **vercel-react-best-practices**: Advanced patterns for React/Next.js and modern frontend architecture.
- **Image Generation**: Tools for creating branding assets (logos, icons) using professional AI models.
- **Unit Testing**: Pre-configured Jest/React Native Testing Library for automated verification.

## ⚠️ Critical Constraints for AI Agents

- **Startup Sequence**: The splash screen dismissal is handled in `src/app/(main)/index.tsx`. The intermediate loading background (Gap View) in `src/app/_layout.tsx` must always match the light grey splash background (`#d9d7d2`) to maintain a seamless transition.
- **Versioning**: Always synchronize version numbers in both `app.json` and `package.json` before tagging a release to avoid update notification loops.
- **Icon Colors**: Splash and adaptive icon backgrounds are hardcoded to `#d9d7d2`. Do not change these unless explicitly asked for a branding refresh.
