# Agent Context & Specialized Skills

This document provides critical context for AI agents working on **Saral Lekhan Plus** regarding newly integrated specialized skills and platform tooling.

## 1) Official Android Skills
The project has been upgraded with official, modular Android skills from `https://github.com/android/skills`. These are located in `.agents/skills/` and registered in `skills-lock.json`.

### Available Skills:
- **`agp-9-upgrade`**: Guidelines for upgrading and troubleshooting Android Gradle Plugin 9.
- **`edge-to-edge`**: Instructions for implementing adaptive system bar support and handling IME insets.
- **`migrate-xml-views-to-jetpack-compose`**: Structured workflow for converting legacy XML layouts to Compose.
- **`navigation-3`**: Implementation patterns for Jetpack Navigation 3.
- **`play-billing-library-version-upgrade`**: Commerce compliance and migration steps.
- **`r8-analyzer`**: Size optimization and Proguard/R8 rule debugging.

### How to use:
When tasked with any of the above (e.g., "migrate this view to Compose"), agents **MUST** use the `view_file` tool on the corresponding `SKILL.md` in `.agents/skills/` before proceeding.

## 2) Android CLI
The **Android CLI** (`android.exe`) is installed and available for terminal-based automation.

- **Location**: `%USERPROFILE%\.android-cli\android.exe` (Added to User PATH)
- **Primary Commands**:
  - `android init`: Refresh agent initialization.
  - `android skills list`: Check status of project skills.
  - `android skills add --all --project=.`: Force-sync skills with the official repository.
  - `android doctor`: Diagnose agent environment issues.

## 3) Skill Management Consistency
All specialized skills are tracked in `skills-lock.json`. Any new skill added to the project must be:
1.  Unpacked into a dedicated folder in `.agents/skills/`.
2.  Hashed (SHA256) and registered in `skills-lock.json` with its source.

---
*This document ensures that any agent joining the project can immediately leverage the enhanced capabilities and follow the established engineering standards.*
