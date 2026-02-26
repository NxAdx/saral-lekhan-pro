UI / UX Summary — सरल लेखन (Saral Lekhan)

Principles
- Tactile First: buttons and keys should feel physical (translateY on press, shadow collapse).
- Warmth: warm greys as surface, burnt terracotta (#C14E28) as the single saturated accent.
- Devanagari-first: Hindi labels primary; avoid letter-spacing on Devanagari; use Hind for UI/body.

Key Screens (visual reference: saral-lekhan-sample.html)
- Home / Feed
  - Header with bilingual app name, settings icon.
  - Pill-shaped search input with leading icon and clear action.
  - Horizontal tag rail (scrollable), "सभी / All" default.
  - Vertical note feed using `NotePill` components (title, preview, date, tag).
  - FAB floating above bottom nav.
- Editor
  - Header: back, autosave indicator, Done accent pill.
  - Format toolbar: tactile key buttons (B, I, U, H1, List, Link, Pin).
  - Title input and body textarea: Hind font, proper line-heights (Hindi 2.0).
  - Meta bar: word/char count + tag picker.

Components & Interaction
- NotePill: full-width capsule, 2.5px stroke, hover lift & press translateY + shadow collapse.
- KeyButton: small keycaps (30px height), md radius (8px), active state = accent background.
- TagPill: pill chip; active style uses accent background & darker border.
- FAB: 64px circle, terracotta, radial highlight on face.

Accessibility
- Minimum touch target 44×44px; toolbar keys must include hitSlop to reach target size.
- WCAG AA for readable labels; `ink-dim` only for timestamps/placeholders.
- Reduced motion: provide opacity-only fallbacks.
- Inputs: explicit `writingDirection: 'ltr'` for mixed-script numeric entries.

Testing guidance
- Test with long Devanagari paragraphs (1.2–1.4× width of Latin content).
- Verify fonts load before rendering editor (Hind 400/600 critical weights).
- Run with screen readers (TalkBack/VoiceOver) and reduced motion enabled.
