const everyauth = require('@fusebit/everyauth-express');
const { Octokit } = require('octokit');
const crypto = require('crypto');
const profile = require('./profile');

const app = require('express')();

const algorithm = 'aes-128-cbc';
const decipher = crypto.createDecipheriv(
  algorithm,
  process.env.SERVICE_ENCRYPTION_KEY,
  process.env.SERVICE_ENCRYPTION_IV
);
let decrypted = decipher.update(profile, 'base64', 'utf8');
decrypted += decipher.final('utf8');

const decryptedData = JSON.parse(decrypted);
everyauth.config(decryptedData);

app.use(
  '/api/githuboauth',
  everyauth.authorize('githuboauth', {
    finishedUrl: '/',
    mapToUserId: (req) => 'degrammer', // req.user.id in production
  })
);

app.get('/api', (req, res) => {
  res.redirect('/api/githuboauth');
});

module.exports = app;
