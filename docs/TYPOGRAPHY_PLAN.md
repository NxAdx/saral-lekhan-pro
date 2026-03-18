# Material 3 Typography Integration Plan - सरल लेखन (Saral Lekhan)

## 1. Goal
Integrate Material 3 Typography standards to ensure a premium, consistent look across all languages (English, Hindi, Marathi) while resolving font size disparities and Marathi rendering issues.

## 2. Proposed Typography Tokens
We will define semantic tokens following Material 3 guidelines to replace ad-hoc `fontSize` values throughout the app.

| Token | Desktop/Web Ref | Mobile Target | Weight | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Display Large** | 57 | 42 | 400 | Main Hero / App Title |
| **Headline Large** | 32 | 28 | 400 | Note Title / Page Header |
| **Title Large** | 22 | 20 | 500 | Card Title / Modal Header |
| **Body Large** | 16 | 16 | 400 | Primary Content / Note Body |
| **Label Medium** | 12 | 12 | 500 | Secondary UI / Metadata |

## 3. Visual Parity (Font Normalization)
Different fonts have different visual sizes (e.g., Poppins 16px looks larger than Hind 16px). We will use a `fontScale` multiplier in `themeStore.ts` to normalize them.

| Font | Proposed Scale | Reason |
| :--- | :--- | :--- |
| **Hind** | 1.0 (Baseline) | Standard for Devanagari. |
| **Poppins** | 0.96 | Slightly larger visual weight. |
| **Baloo 2** | 1.02 | Rounded glyphs feel smaller. |
| **Tiro Devanagari** | 1.12 | High ascenders/descenders. |
| **Noto Sans** | 1.0 | Stable standard. |

## 4. Fixing the "Marathi Issue"
Marathi Devanagari rendering often suffers from descender clipping (dots under characters).
- **Proportional Line Heights**: Set `lineHeight` to at least **1.5x** font size for any Devanagari font.
- **Stable Fallbacks**: When Marathi is selected, force the font to either **Hind** or **Tiro Devanagari** if the user chooses a font that doesn't support the "eyelash ra" correctly.
- **Font Selection**: Add an indicator in the Settings UI for "Marathi Optimized" fonts.

## 5. Implementation Roadmap
1.  **Define Typography Tokens**: Create `src/theme/typography.ts` with the M3 token map.
2.  **Refactor Root Hook**: Update `useTheme` in `themeStore.ts` to return these tokens scaled by the user's global font size preference.
3.  **Component Refactor**: One-by-one, update UI components (`BentoCard`, `FAB`, `NoteCard`, etc.) to use semantic tokens like `typography.titleLarge`.
4.  **Verification**: Manual visual testing with complex Marathi phrases to ensure no clipping occurs.

---
*Generated: 2026-03-01 | Material 3 Style Studio Plan*
