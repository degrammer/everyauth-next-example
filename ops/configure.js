const { encrypt } = require('../utils/encryption');
const fs = require('fs');
const path = require('path');


const saveEncryptedProfileToDisk = (content) => {
    fs.writeFileSync(
        path.join(__dirname, '..', 'pages/api', 'profile.js'),
        `module.exports = '${content}'`
      );
};


const { encrypted, key, iv, tag} = encrypt();
saveEncryptedProfileToDisk(encrypted);

console.log('Fusebit Profile Encrypted. Add the following env vars to your Vercel Deployment:');
console.log(`FUSEBIT_ENCRYPTION_KEY=${key}`);
console.log(`FUSEBIT_ENCRYPTION_IV=${iv}`);
console.log(`FUSEBIT_ENCRYPTION_TAG=${tag}`);