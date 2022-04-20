import * as everyauth from '@fusebit/everyauth-express';
import profileEncryptedContent from '../../profile';
import { decrypt } from '../../utils/encryption';

const app = require('express')();

const { FUSEBIT_ENCRYPTION_KEY, FUSEBIT_ENCRYPTION_IV, FUSEBIT_ENCRYPTION_TAG} = process.env;

app.use(
  '/api/:user',
  (req, res, next) => {
    const decrypted = decrypt(
      FUSEBIT_ENCRYPTION_KEY,
      FUSEBIT_ENCRYPTION_IV,
      FUSEBIT_ENCRYPTION_TAG,
      profileEncryptedContent
    );

    if (!FUSEBIT_ENCRYPTION_KEY || !FUSEBIT_ENCRYPTION_IV || !FUSEBIT_ENCRYPTION_TAG) {
      return res.redirect('/configure');
    }
    
    const decryptedData = JSON.parse(decrypted);
    everyauth.config(decryptedData);
    return next();
  },
  everyauth.authorize('githuboauth', {
    finishedUrl: '/',
    mapToUserId: (req) => req.params.user,
  })
);
module.exports = app;
