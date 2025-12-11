const fs = require('fs');
const content = `
export const firebaseConfig = {
  databaseURL: "${process.env.FIREBASE_DB_URL}"
};
`;
fs.writeFileSync('./firebase-config.js', content);

console.log("File firebase-config.js created successfully")