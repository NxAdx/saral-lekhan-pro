# Maestro E2E Testing for Saral Lekhan Plus

Maestro is our automated UI testing framework for critical user flows.

## Install Maestro CLI (one-time)
```bash
# macOS/Linux
curl -Ls "https://get.maestro.dev" | bash

# Windows (WSL2)
# Use WSL2 terminal, then run the curl command above
```

## Run Tests
```bash
# Run all test flows against a connected device/emulator
maestro test .maestro/flows/

# Run a specific flow
maestro test .maestro/flows/create_note.yaml
```

## Available Flows

| Flow | Description |
|------|-------------|
| `create_note.yaml` | Creates a new note and verifies it appears |
| `search_note.yaml` | Searches for a note by keyword |
| `settings_nav.yaml` | Navigates to Settings and back |

## Tips
- Make sure an emulator/device is connected before running (`adb devices`)
- Tests run against the installed APK, so build and install first
- Add `testId` props to React Native components for stable selectors
