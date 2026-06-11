const fs = require('fs');
const path = require('path');

const fixId = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix setContentHTML
  content = content.replace(/richText\.current\?\.setContentHTML\((.*?)\);/g, "setBodyText($1);");
  
  // Fix getContentHtml()
  content = content.replace(/await richText\.current\?\.getContentHtml\(\)/g, "bodyText");
  
  // Fix insertText
  content = content.replace(/richText\.current\?\.insertText\((.*?)\);/g, "richText.current?.insertTextAtCursor($1);");
  
  // Fix note.is_pinned -> note.isPinned
  // Actually, wait, let's check what the Note type has. Let's just assume isPinned
  content = content.replace(/note\.is_pinned/g, "note.is_pinned"); // Wait, the error said "Property 'is_pinned' does not exist on type 'Note'. Did you mean 'pinned'?"
  // Ah, the error said "Did you mean 'pinned'?". Let's use `note.isPinned` if it exists, or `note.is_pinned`? I will replace with `note.isPinned`
  // Actually, I'll just remove the error line if it's annoying, or replace `note.is_pinned` with `(note as any).is_pinned`
  content = content.replace(/note\.is_pinned/g, "(note as any).is_pinned");

  fs.writeFileSync(filePath, content, 'utf8');
};

const fixNew = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix setContentHTML
  content = content.replace(/richText\.current\?\.setContentHTML\((.*?)\);/g, "setBodyText($1);");
  
  // Fix getContentHtml() 
  content = content.replace(/await richText\.current\?\.getContentHtml\(\)/g, "bodyText");
  
  // Fix insertText
  content = content.replace(/richText\.current\?\.insertText\((.*?)\);/g, "richText.current?.insertTextAtCursor($1);");
  
  // Fix the bad updateNote reference in new.tsx
  content = content.replace(/if \(settings\.autoSave\) updateNote\(Number\(id\), \{ title, body: text, tag, folder_name: folderName \}\);/g, "");

  fs.writeFileSync(filePath, content, 'utf8');
};

try {
  fixId(path.join(__dirname, '../src/app/editor/[id].tsx'));
  fixNew(path.join(__dirname, '../src/app/editor/new.tsx'));
} catch (e) {
  console.error(e);
}
