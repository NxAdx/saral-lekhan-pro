const fs = require('fs');
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (pkg.dependencies && pkg.dependencies['@react-native-google-signin/google-signin']) {
    delete pkg.dependencies['@react-native-google-signin/google-signin'];
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('Successfully removed @react-native-google-signin/google-signin');
} else {
    console.log('Dependency not found or already removed.');
}
