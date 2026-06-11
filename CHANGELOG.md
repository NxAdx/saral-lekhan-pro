# Changelog

All notable changes to this project will be documented in this file.

## [2.18.0] - 2026-06-11
### Added
- **Checklist Mode**: Added a dedicated checklist editor for notes. Users can seamlessly toggle a note between standard rich text and an interactive checklist, complete with drag-and-drop reordering.
- **Folder Organization**: Added the ability to organize notes into Folders. The Home Screen now features a dual-rail filter system for folders and context-aware tags.
- **Google Keep Import**: Added native support for importing Google Keep Takeout `.zip` files directly from the Home Screen. Checklists, text, and labels map seamlessly into the local database.
- **Markdown Export Enhancements**: Markdown exports now include full YAML frontmatter containing tags, folders, pinned status, and dates for perfect compatibility with Obsidian and Joplin.

### Changed
- SQLite Database schema migrated to support enriched `Note` properties safely (backward-compatible).
