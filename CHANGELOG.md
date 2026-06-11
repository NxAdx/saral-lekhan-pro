# Changelog

## v2.19.0 - Editor Rewrite & UI Polish
- **Pure Native Editor:** Replaced the legacy WebView rich text editor with a lightning-fast native Markdown text box. Perfect 60FPS scrolling and instant keyboard responsiveness.
- **Dual-Mode Magic:** A new View Mode automatically renders your Markdown into beautiful headings and lists.
- **Consolidated Category Rail:** Replaced the clunky double-rails for folders and tags into a single, unified, horizontal category filter on the home screen.
- **OTA Updates Re-Enabled:** The in-app updater and remote UX flags have been fully re-enabled.
- **Premium UX:** Replaced all formatting toolbar buttons with rounded, vector-perfect icons.
- **Backwards Compatibility:** Old notes seamlessly auto-convert their legacy HTML into clean Markdown without losing formatting.

## [2.18.0] - 2026-06-11
### Added
- **Checklist Mode**: Added a dedicated checklist editor for notes. Users can seamlessly toggle a note between standard rich text and an interactive checklist, complete with drag-and-drop reordering.
- **Folder Organization**: Added the ability to organize notes into Folders. The Home Screen now features a dual-rail filter system for folders and context-aware tags.
- **Google Keep Import**: Added native support for importing Google Keep Takeout `.zip` files directly from the Home Screen. Checklists, text, and labels map seamlessly into the local database.
- **Markdown Export Enhancements**: Markdown exports now include full YAML frontmatter containing tags, folders, pinned status, and dates for perfect compatibility with Obsidian and Joplin.

### Changed
- SQLite Database schema migrated to support enriched `Note` properties safely (backward-compatible).
