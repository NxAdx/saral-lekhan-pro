# Saral Lekhan Plus - Official Color Palette

This document lists every color used across the application's UI, branding, and native layers as of March 8, 2026.

## 🎨 Branding & Native Assets
These colors are hardcoded for branding consistency across the OS.

| Asset | Color (Hex) | Usage |
| :--- | :--- | :--- |
| **Splash Background** | `#D9D7D2` | Light grey for the launch screen (System + App). |
| **Android Adaptive Icon BG** | `#D9D7D2` | Background layer for the home screen icon. |
| **Default Foreground** | `#C14E28` | The "Saral Lekhan Orange" used in logos. |

---

## 🏛️ Theme Token System
The app uses a semantic token system. Each theme (Classic, Nord, etc.) maps these tokens to specific hex codes.

### Core Semantic Tokens
- **`bg`**: Main view background.
- **`bgRaised`**: Surface/Card background.
- **`stroke`**: Boundary borders and outlines.
- **`ink`**: Primary text/content color.
- **`accent`**: Interaction highlights and CTA buttons.

---

## 🌗 Primary Themes (Classic)
The default "Engraved Halftone" experience.

| Token | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| **`bg`** | `#D9D7D2` | `#1C1A17` |
| **`bgRaised`** | `#E2E0DB` | `#2B2926` |
| **`bgDeep`** | `#C8C6C1` | `#12110F` |
| **`stroke`** | `#2B2926` | `#3D3A36` |
| **`ink`** | `#1C1A17` | `#D9D7D2` |
| **`accent`** | `#C14E28` | `#E8866A` |
| **`accentDark`** | `#8B3118` | `#C14E28` |
| **`accentBg`** | `#F2D5C8` | `#2B2926` |

---

## 🌈 Alternative Themes (Summary)
Saral Lekhan Plus supports 10+ dynamic themes. Here are the primary IDs and their Accent colors.

| Theme ID | Primary Accent (Light) | Visual Style |
| :--- | :--- | :--- |
| **Nord** | `#5E81AC` | Arctic Blue (Modern) |
| **Lavender** | `#9D7BCE` | Purple Hue (Soft) |
| **Ocean** | `#008080` | Teal/Aqua (Calm) |
| **Forest** | `#478A52` | Natural Green (Deep) |
| **Sunset** | `#E65C00` | Golden/Amber (Warm) |
| **Midnight** | `#3E5FA5` | Deep Royal Blue |
| **Rose** | `#D14D6B` | Soft Pink/Burgundy |
| **Coffee** | `#8C5A35` | Earthy Brown (Vintage) |
| **Neon** | `#6325E8` | High-Contrast Violet |
| **Mint** | `#18A066` | Refreshing Green |

---

## 🌫️ Secondary & Utility Colors
- **Shadows**: All UI shadows use `#000000` with varying opacities (0.05 to 0.15).
- **Static White**: `#FFFFFF` (Used for specific text overlays and paper effects).
- **Ink Dim**: Secondary text/subtitles typically use grays derived from the theme (e.g., `#8E8B85` in Classic Light).

---

> [!NOTE]
> All colors are dynamically injected via `src/store/themeStore.ts` and can be customized per-user in the Settings.
