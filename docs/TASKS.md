Current tasks and next actions

Completed:
- Scaffold project structure in `src/` with skeleton screens and `NotePill` component.
- Extracted design system (DOCX + HTML) and created `src/tokens.ts`.
- Created prototype `saral-lekhan-sample.html`.
- Installed dependencies and resolved peer conflicts to get Metro bundler running.
- Started Metro and connected Android device via Expo Go (after installing matching Expo Go).
- **NoteList (Home) screen**: header (सरल लेखन / Saral Lekhan), pill search, tag rail (सभी / All + dynamic tags), `NotePill` list from `notesStore`, FAB → new note.
- **Create flow**: FAB opens `/editor/new`; New Note screen with title/body/tag and Done saves via `notesStore.addNote` and navigates back.
- **Edit flow**: Tapping a note opens `/editor/[id]`; Edit screen loads note and `updateNote` on Done.
- **Store**: `getNotesFilteredByTag`, `getUniqueTags`, `updateNote`, `deleteNote`; exported `Note` type and `ALL_TAG_ID`.
- **UI components**: `TagPill`, `FAB`; `NotePill` extended with optional `tag` and meta row.
- **Layouts**: `src/app/_layout.tsx` and `src/app/(main)/_layout.tsx` (Stack, headerShown: false).

In progress:
- None.

Next actions (priority order):
1. ~~Implement `NoteList` screen bound to `notesStore` with create flow (FAB → new note screen).~~ ✓
2. Build Editor with format toolbar, autosave indicator, and meta bar.
3. Wire SQLite DB queries and persist notes; implement tag manager.
4. Add accessibility labels, reduced motion support, and tests.
5. Create CI pipeline and prepare EAS / store builds.

If you want me to continue now, say which item to implement next (2–5) or "follow the list" for item 2.
