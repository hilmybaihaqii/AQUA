const fs = require('fs');
const path = require('path');

const outputDir = './public';
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

const configContent = `
export const firebaseConfig = {
  databaseURL: "${process.env.FIREBASE_DB_URL}"
};
`;
fs.writeFileSync(path.join(outputDir, 'firebase-config.js'), configContent);

const filesToCopy = [
    'index.html', 
    'style.css', 
    'script.js', 
    '404.html'
];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(outputDir, file));
        console.log(`Copied: ${file}`);
    }
});

console.log("success");