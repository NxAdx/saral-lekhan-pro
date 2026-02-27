Design System — Tippani tokens (summary)

Source files:
- `tippani-design-system.html` — CSS tokens and component examples
- `tippani-design-system-documentation.docx` — full specification (extracted into implementation_plan.md.resolved)

Token highlights (as used in `src/tokens.ts`):
- Colors:
  - bg: #D9D7D2
  - bgRaised: #E2E0DB
  - bgDeep: #C8C6C1
  - ink: #1C1A17
  - inkMid: #5A5751
  - inkDim: #8E8B85
  - stroke: #2B2926
  - accent: #C14E28
  - accentDark: #8B3118
- Radius (pill-forward): pill=9999, xl=28, lg=20, md=14, sm=8
- Spacing: base unit 4px; tokens: 1=4,2=8,3=12,4=16,5=20,6=24,8=32,10=40,12=48,16=64
- Shadows: hard-offset shadows with zero blur for tactile feel.
- Typography: Hind (UI, Devanagari), Vesper Libre (display), DM Mono (metadata)

Implementation notes
- All tokens live in `src/tokens.ts` and components must import tokens only (no hard-coded hex values).
- Button press animation: onPressIn translateY(+2px) + shadow collapse (80ms), onPressOut restore (120ms).
- NotePill border: 2.5px solid `--stroke`.

Files to consult when implementing components:
- `tippani-design-system.html` — visual patterns and example CSS classes
- `implementation_plan.md.resolved` — architecture and component list
