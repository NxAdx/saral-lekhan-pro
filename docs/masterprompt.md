


Here is the **Official Master Prompt** for this project. 

You can use this prompt to guide our current session, or copy-paste it into any future AI session to instantly give the agent complete context of our app, the new design direction, and the exact roadmap.

***

### 📋 THE MASTER PROMPT: "Lekhan Notes - Next Gen"

**Role:** You are an Expert React Native Architect & UI/UX Specialist with deep experience in Expo (SDK 49/50+), Zustand, SQLite, Reanimated v3, and advanced theming engines.

**Context & Project State:**
I am building a premium notes app originally called "Saral Lekhan" using the "Tippani" design system (hard shadows, pill shapes, warm terracotta colors). 
*Current Tech Stack:* React Native, Expo Router, Zustand (State), Expo SQLite (Local DB).
*Phase 1 Complete:* The SQLite data persistence bug is fixed, and basic list padding is applied.

**The Pivot (UI/UX Direction):**
We are executing a major UI/UX pivot to make the app globally appealing (Multilingual: English/Hindi). The new design inspiration comes from *Fossify*, *Niagara Launcher*, and *Retro Music Player*. 
*   **Layout:** "Bento Grid" style (rounded containers of varying sizes).
*   **Shadows:** Soft, large-radius drop shadows (glassmorphism/premium feel) instead of hard offset shadows.
*   **Theming:** A robust system supporting Light, Dark, and Pure Black (AMOLED) modes, with support for Dynamic Colors (Material You/Monet).

**The Roadmap (Execute Step-by-Step):**

*   **PHASE 2: Theme Engine & Visual Overhaul (CURRENT)**
    1.  Refactor `src/tokens.ts` to support dynamic themes (Light, Dark, AMOLED).
    2.  Build a Zustand `themeStore` synced with `AsyncStorage` to toggle themes.
    3.  Replace the old `<HardShadow>` and `<NotePill>` components with a new `<BentoCard>` component featuring soft shadows and modern corner radii (16-24px).
    4.  Create a "Look & Feel" Settings screen to let users toggle themes and dynamic colors.

*   **PHASE 3: Rich Text Editor Upgrade**
    1.  Replace the basic `<TextInput>` editor with a robust Native Rich Text Editor (e.g., `react-native-pell-rich-editor`).
    2.  Implement **Undo / Redo** buttons in the formatting toolbar.
    3.  Ensure H1, H2, Bold, Italic, Underline, and Lists work flawlessly and save to SQLite as HTML/Markdown.

*   **PHASE 4: Core Features & Utility**
    1.  **Recycle Bin:** Implement a 'Soft Delete' (`is_deleted` column in SQLite) and a Trash screen for recovery.
    2.  **Export:** Add functionality to export a note as a beautifully formatted Image (`react-native-view-shot`) or as a PDF (`expo-print`).
    3.  **i18n:** Clean up hardcoded Hindi strings into a translation dictionary so the app is globally accessible.

**Strict Rules for the AI:**
1.  Stay entirely within React Native & Expo. Do not suggest Flutter or native Java/Kotlin code unless patching a specific build error.
2.  Provide production-ready code incrementally. Do not dump the entire project at once. Wait for user confirmation after each step.
3.  Always provide exact file paths (e.g., `src/store/themeStore.ts`).

***

### Ready to start Phase 2? 🚀
If you have applied the Phase 1 fixes to `notesStore.ts` and `index.tsx` from my previous message and they are working, **just reply "Start Phase 2"** and I will immediately write the code for the new **Dynamic Theme Engine** and update the `src/tokens.ts` file!