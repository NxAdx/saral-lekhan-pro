const fs = require('fs');
const path = require('path');

const applyMigration = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace Imports
  content = content.replace(
    /import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';/,
    `import { NativeMarkdownEditor, NativeMarkdownEditorRef } from '../../components/ui/NativeMarkdownEditor';\nimport { htmlToMarkdown } from '../../utils/htmlToMarkdown';`
  );

  // 2. Replace Ref & Add isEditMode state
  content = content.replace(
    /const richText = useRef<RichEditor>\(null\);/,
    `const richText = useRef<NativeMarkdownEditorRef>(null);\n  const [isEditMode, setIsEditMode] = useState(true);`
  );

  // 3. Fix initial load
  content = content.replace(
    /const stripped = note.body.replace\(\/<\[\^>\]\*>\\?\/gm, ' '\);\n      setBodyText\(stripped \|\| ''\);/g,
    `setBodyText(htmlToMarkdown(note.body) || '');`
  );

  // 4. Fix Image insertions
  content = content.replace(/richText\.current\?\.insertImage\((.+?)\);/g, "richText.current?.insertTextAtCursor(`![Image](${'$1'.replace(/\\s*trim\\(\\)/, '')})`);");

  // 5. Fix Link insertions
  content = content.replace(/richText\.current\?\.insertLink\('Link', (.*?)\);/g, "richText.current?.insertTextAtCursor(`[Link](${'$1'})`);");

  // 6. Fix AI text insertions
  content = content.replace(/richText\.current\?\.insertHTML\(`<br><br>\$\{markdownToHtml\(output\)\}<br>`\);/g, "richText.current?.insertTextAtCursor(`\\n\\n\${output}\\n`);");
  content = content.replace(/richText\.current\?\.setContentHTML\(markdownToHtml\(output\)\);/g, "setBodyText(output);");
  content = content.replace(/richText\.current\?\.insertHTML\(`<br><br><blockquote><b>\$\{loc\.plusFeatures\.aiSummaryPrefix\}<\/b><br>\$\{markdownToHtml\(summaryText\)\}<\/blockquote><br>`\);/g, "richText.current?.insertTextAtCursor(`\\n\\n> **\${loc.plusFeatures.aiSummaryPrefix}**\\n> \${summaryText.split('\\n').join('\\n> ')}\\n\\n`);");

  // 7. Fix Undo/Redo (Since we removed pell, we disable these temporarily or they become no-ops if ref fails, let's replace with empty string or comment out)
  content = content.replace(/<Pressable onPress=\{\(\) => richText\.current\?\.sendAction\(actions\.undo, 'result'\)\} hitSlop=\{12\}>[\s\S]*?<\/Pressable>/g, '{/* Undo/Redo handled natively by keyboard now */}');
  content = content.replace(/<Pressable onPress=\{\(\) => richText\.current\?\.sendAction\(actions\.redo, 'result'\)\} hitSlop=\{12\}>[\s\S]*?<\/Pressable>/g, '');

  // 8. Replace RichEditor Component
  content = content.replace(/<RichEditor[\s\S]*?\/>/m, 
    `<NativeMarkdownEditor
                    ref={richText}
                    value={bodyText}
                    onChange={(text) => {
                      setBodyText(text);
                      setIsDirty(true);
                      if (settings.autoSave) updateNote(Number(id), { title, body: text, tag, folder_name: folderName });
                    }}
                    placeholder={loc.editor.bodyPlaceholder}
                    minHeight={editorHeight}
                    theme={theme}
                    loc={loc}
                    isEditMode={isEditMode}
                  />`
  );

  // Similar for new.tsx (which doesn't have updateNote in onChange)
  content = content.replace(/<RichEditor[\s\S]*?\/>/m, 
    `<NativeMarkdownEditor
                ref={richText}
                value={bodyText}
                onChange={(text) => {
                  setBodyText(text);
                  setIsDirty(true);
                }}
                placeholder={loc.editor.bodyPlaceholder}
                minHeight={editorHeight}
                theme={theme}
                loc={loc}
                isEditMode={isEditMode}
              />`
  );

  // 9. Remove RichToolbar
  content = content.replace(/\{noteType === 'text' && \(\s*<RichToolbar[\s\S]*?\}\s*\/>\s*\)\}/, '');

  // 10. Add FAB for View/Edit toggle (inject right above the last </View>)
  // actually simpler to just put it in the header. We can add a toggle button in headerMid or header right.
  // Wait, let's add a floating FAB
  const fabJSX = `
      {noteType === 'text' && (
        <Pressable 
          onPress={() => { setIsEditMode(!isEditMode); Keyboard.dismiss(); }}
          style={{ position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', ...shadow.gentle }}
        >
          <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {isEditMode ? (
              <Path d="M15 12c0 1.657 -1.343 3 -3 3s-3 -1.343 -3 -3s1.343 -3 3 -3s3 1.343 3 3zM2 12c2.667 4.667 6 7 10 7s7.333 -2.333 10 -7c-2.667 -4.667 -6 -7 -10 -7s-7.333 2.333 -10 7" />
            ) : (
              <Path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
            )}
          </Svg>
        </Pressable>
      )}
    </View>
  );
}`;
  content = content.replace(/<\/View>\n\s*\);\n\}/, fabJSX);

  fs.writeFileSync(filePath, content, 'utf8');
};

try {
  applyMigration(path.join(__dirname, '../src/app/editor/[id].tsx'));
  console.log('Migrated [id].tsx');
  applyMigration(path.join(__dirname, '../src/app/editor/new.tsx'));
  console.log('Migrated new.tsx');
} catch (e) {
  console.error(e);
}
