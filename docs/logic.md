# Core Logic & Architecture

## State Management
- `authStore.ts`: Local and Biometric authentication tracking.
- `settingsStore.ts`: Theme, layout density, and language preferences.
- `notesStore.ts`: Core CRUD operations for notes.

## Native Integration
- Google Drive OAuth via `expo-google-app-auth` & custom Web Client ID structure.
- In-app updates via generic download logic pulling from GitHub API.
