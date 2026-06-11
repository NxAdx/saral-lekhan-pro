const fs = require('fs');
const path = require('path');

const applyToIndex = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/const \[selectedFolder, setSelectedFolder\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const allNotesInFolder = useNotesStore\(\(s\) => s\.getNotesInFolder\(selectedFolder\)\);/g, 'const allNotes = useNotesStore((s) => s.notes);');
  content = content.replace(/allNotesInFolder/g, 'allNotes');
  content = content.replace(/const getUniqueFolders = useNotesStore\(\(s\) => s\.getUniqueFolders\);\n/g, '');
  content = content.replace(/const uniqueFolders = useMemo\(\(\) => getUniqueFolders\(\), \[getUniqueFolders, isLoaded\]\);\n/g, '');
  content = content.replace(/<TagPill \n          label=\{loc\.home\?\.allFolders \|\| "All Notes"\} \n          active=\{selectedFolder === null && selectedTag === ALL_TAG_ID\} \n          onPress=\{\(\) => \{\n            setSelectedFolder\(null\);\n            setSelectedTag\(ALL_TAG_ID\);\n          \}\} \n        \/>/g, 
    `<TagPill \n          label={loc.allTag || "All Notes"} \n          active={selectedTag === ALL_TAG_ID} \n          onPress={() => setSelectedTag(ALL_TAG_ID)} \n        />`);
  content = content.replace(/\{uniqueFolders\.map\(\(folder\) => \([\s\S]*?\}\) \/>\n        \)\)\}/g, '');
  content = content.replace(/setSelectedFolder\(null\);/g, '');
  content = content.replace(/, selectedFolder/g, '');
  content = content.replace(/, uniqueFolders/g, '');
  content = content.replace(/setSelectedTag\(selectedTag === tag \? ALL_TAG_ID : tag\);\n              /g, 'setSelectedTag(selectedTag === tag ? ALL_TAG_ID : tag);\n');
  fs.writeFileSync(filePath, content, 'utf8');
};

const applyToEditor = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/const \[folderName, setFolderName\] = useState\(''\);\n/g, '');
  content = content.replace(/setFolderName\(note\.folder_name \|\| ''\);\n/g, '');
  content = content.replace(/, folder_name: folderName/g, '');
  content = content.replace(/folderName,/g, '');
  content = content.replace(/<View style=\{\{ width: 1, height: 20, backgroundColor: colors\.strokeDim, marginHorizontal: 12 \}\} \/>[\s\S]*?<TextInput[\s\S]*?value=\{folderName\}[\s\S]*?onChangeText=\{\(t\) => \{ setFolderName\(t\); setIsDirty\(true\); \}\}[\s\S]*?\/>\n              <\/View>/g, '');
  fs.writeFileSync(filePath, content, 'utf8');
};

const applyToStore = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/moveNote: \(id: number, folderName: string \| null\) => void;\n/g, '');
  content = content.replace(/getUniqueFolders: \(\) => string\[\];\n/g, '');
  content = content.replace(/getNotesInFolder: \(folder: string \| null\) => Note\[\];\n/g, '');
  content = content.replace(/\/\/ ─── New: Folder Organization \(Phase 5\) ──────────────────────────────[\s\S]*?getNotesInFolder: \(folder\) => \{[\s\S]*?\},/g, '');
  fs.writeFileSync(filePath, content, 'utf8');
};

try {
  applyToIndex(path.join(__dirname, '../src/app/(main)/index.tsx'));
  applyToEditor(path.join(__dirname, '../src/app/editor/[id].tsx'));
  applyToEditor(path.join(__dirname, '../src/app/editor/new.tsx'));
  applyToStore(path.join(__dirname, '../src/store/notesStore.ts'));
  console.log('Removed folders from index, editor, and store.');
} catch (e) {
  console.error(e);
}
