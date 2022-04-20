const everyauth = require('@fusebit/everyauth-express');
import profileEncryptedContent from '../profile';
import { decrypt } from '../utils/encryption';

const app = require('express')();


const { FUSEBIT_ENCRYPTION_KEY, FUSEBIT_ENCRYPTION_IV, FUSEBIT_ENCRYPTION_TAG} = process.env;
if (!FUSEBIT_ENCRYPTION_KEY || !FUSEBIT_ENCRYPTION_IV || !FUSEBIT_ENCRYPTION_TAG) {
  throw new Error('Missing required encryption configuration');
}

const decrypted = decrypt(
  FUSEBIT_ENCRYPTION_KEY,
  FUSEBIT_ENCRYPTION_IV,
  FUSEBIT_ENCRYPTION_TAG,
  profileEncryptedContent
);

const decryptedData = JSON.parse(decrypted);
everyauth.config(decryptedData);

app.use(
  '/api/:user',
  everyauth.authorize('githuboauth', {
    finishedUrl: '/',
    mapToUserId: (req) => req.params.user, // req.user.id in production
  })
);
module.exports = app;
