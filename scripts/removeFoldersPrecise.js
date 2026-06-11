const fs = require('fs');
const path = require('path');

const applyToEditor = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove useState
  content = content.replace(/const \[folderName, setFolderName\] = useState\(''\);\n/g, '');
  
  // Remove setFolderName from load (in [id].tsx)
  content = content.replace(/setFolderName\(note\.folder_name \|\| ''\);\n/g, '');
  
  // Remove folder_name from save (in [id].tsx and new.tsx)
  content = content.replace(/folder_name: folderName\.trim\(\) \|\| null,/g, 'folder_name: null,');
  
  // Remove the folder TextInput UI block.
  // We want to match:
  // <View style={{ width: 1, height: 20, backgroundColor: colors.strokeDim, marginHorizontal: 12 }} />
  // <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
  //   <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={colors.inkDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={s.folderIcon}>
  //     <Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  //   </Svg>
  //   <TextInput
  //     style={s.tagInput}
  //     placeholder={loc.home?.folderPlaceholder || "Folder..."}
  //     placeholderTextColor={colors.inkDim + '88'}
  //     value={folderName}
  //     onChangeText={(t) => { setFolderName(t); setIsDirty(true); }}
  //     autoCapitalize="words"
  //     onFocus={() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300); }}
  //   />
  // </View>
  
  const uiRegex = /<View style=\{\{\s*width:\s*1,\s*height:\s*20,\s*backgroundColor:\s*colors\.strokeDim,\s*marginHorizontal:\s*12\s*\}\}\s*\/>\s*<View style=\{\{\s*flex:\s*1,\s*flexDirection:\s*'row',\s*alignItems:\s*'center'\s*\}\}>\s*<Svg[^>]*>[\s\S]*?<\/Svg>\s*<TextInput[\s\S]*?value=\{folderName\}[\s\S]*?onChangeText=\{.*?setFolderName.*?\}[\s\S]*?\/>\s*<\/View>/g;
  
  content = content.replace(uiRegex, '');

  fs.writeFileSync(filePath, content, 'utf8');
};

try {
  applyToEditor(path.join(__dirname, '../src/app/editor/[id].tsx'));
  applyToEditor(path.join(__dirname, '../src/app/editor/new.tsx'));
  console.log('Removed folders from editors.');
} catch (e) {
  console.error(e);
}
