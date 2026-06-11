const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const files = fs.readdirSync(localesDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace " on F-Droid" and localized equivalents with empty string
    content = content.replace(/ on F-Droid/g, '');
    content = content.replace(/ F-Droid లో/g, '');
    content = content.replace(/ F-Droid-ல்/g, '');
    content = content.replace(/ F-Droid वर/g, '');
    content = content.replace(/ F-Droid पर/g, '');
    content = content.replace(/ F-Droid-এ/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('Removed F-Droid mentions from locales.');
