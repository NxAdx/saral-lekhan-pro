const fs = require('fs');
const path = require('path');

const cleanFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the list breakout script and its setTimeout
  const breakoutScriptRegex = /\/\/ Inject List & Quote Breakout Script[\s\S]*?true;\n\s*`;/g;
  content = content.replace(breakoutScriptRegex, '');
  
  const breakoutScriptNewRegex = /const editorListBreakoutScript = useMemo\(\(\) => `[\s\S]*?true;\n\s*`, \[\]\);/g;
  content = content.replace(breakoutScriptNewRegex, '');

  const timerRegexId = /const timer = setTimeout\(\(\) => \{\s*if \(isMounted\.current\) \{\s*\/\/ @ts-ignore - Pell library uses lowercase 's'\s*richText\.current\?\.injectJavascript\(script\);\s*\}\s*\}, 800\);\s*return \(\) => \{\s*isMounted\.current = false;\s*clearTimeout\(timer\);\s*\};\s*\}, \[id, note\?\.id\]\);/g;
  content = content.replace(timerRegexId, 'return () => { isMounted.current = false; }; }, [id, note?.id]);');

  const timerRegexNew = /useEffect\(\(\) => \{\s*const timer = setTimeout\(\(\) => \{\s*\/\/ @ts-ignore - Pell exposes injectJavascript on the ref\.\s*richText\.current\?\.injectJavascript\(editorListBreakoutScript\);\s*\}, 800\);\s*return \(\) => clearTimeout\(timer\);\s*\}, \[editorListBreakoutScript\]\);/g;
  content = content.replace(timerRegexNew, '');

  // Remove other injectJavascript blocks
  content = content.replace(/const script = `\s*document\.execCommand\('insertText', false, '\${char}'\);\s*`;\s*richText\.current\?\.injectJavascript\(script\);/g, 'richText.current?.insertTextAtCursor(char);');
  content = content.replace(/const script = `\s*document\.execCommand\('insertText', false, '\\n\\n\${output}\\n'\);\s*`;\s*richText\.current\?\.injectJavascript\(script\);/g, 'richText.current?.insertTextAtCursor(`\\n\\n${output}\\n`);');

  // Any remaining injectJavascript calls
  content = content.replace(/richText\.current\?\.injectJavascript\(script\);/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
};

try {
  cleanFile(path.join(__dirname, '../src/app/editor/[id].tsx'));
  cleanFile(path.join(__dirname, '../src/app/editor/new.tsx'));
  console.log('Cleaned Pell leftovers successfully.');
} catch (e) {
  console.error(e);
}
