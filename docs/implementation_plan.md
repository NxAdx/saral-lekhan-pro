# Saral Lekhan - Final UI/UX Polish Plan

## Identified Issues & Gaps
Based on your feedback and the new screenshots, I've identified the specific areas where the current implementation falls short of the `tippani-design-system.html` specifications:

1.  **Missing "Hard" Shadows (Tactile Look):** React Native's `elevation` on Android creates soft, diffuse shadows. To achieve the sharp, solid-color "block" shadows seen in the HTML design system (e.g., `#B0AEA9` or `#8B3118`), we need a different approach on Android, likely using a layered absolute-positioned view behind the cards and buttons.
2.  **Editor Toolbar & Back Button Mismatch:** The back button (<-) is misaligned. Also, the design system specifies proper SVG icons for the toolbar keys (List, Heading, Back), not raw text.
3.  **Numbered List Glitch:** Pressing the `1.` button in an empty editor first inserts a blank line before adding the `1.`. It needs to smartly check if it's on a blank line to avoid unnecessary line breaks.
4.  **Note Preview Raw Markdown:** We need to ensure the preview stripping is robust.
5.  **Missing Animations:** The design specifies a "Mechanical Key Press" (translateY + shadow collapse) and other micro-interactions (e.g., an animated FAB pop).

## Proposed Changes

### 1. The "Tactile" Shadow System
*   I will create a custom `HardShadow` wrapper component or update the styles to use a dual-layer approach for Android. This will place a solid, colored box slightly offset behind the `NotePill`, `TagPill`, and `FAB` to perfectly replicate the CSS `box-shadow: 2px 3px 0px #color;` look.

### 2. Editor & Toolbar Polish
*   **SVG Icons:** I will replace text-based icons with exact SVG paths from the design system for the Back, Done, and formatting buttons (List, Heading, etc.) using `react-native-svg` (if available) or precise text rendering.
*   **Back Button Alignment:** Center the SVG precisely within the circular bounds.
*   **Smart Numbered Lists:** Fix the regex logic so it inserts `1. ` without a leading newline when at the start of the editor or on an already blank line.

### 3. Animations (`Animated` API)
*   Integrate React Native's `Animated` library for the "Key Press" state (moving down 2px while the shadow layer stays still, simulating a mechanical depression).
*   Add a subtle pop animation when the Floating Action Button (FAB) appears.

## Verification Plan
*   **Automated Tests:** Run `npx expo start` and verify there are no syntax or React errors.
*   **Manual Verification:** Ask you to check the emulator to confirm the shadows are now "hard blocks" instead of soft blurs, test the numbered list behavior on empty lines, and verify the back button alignment.
