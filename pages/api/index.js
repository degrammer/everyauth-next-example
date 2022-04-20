const everyauth = require('@fusebit/everyauth-express');
const { Octokit } = require('octokit');
const crypto = require('crypto');
const profile = require('./profile');
const { join } = require('path');

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
console.log('setting decrypted data', decryptedData);
everyauth.config(decryptedData);

app.set('views', join(__dirname, '..', '..','views'));
app.engine("pug", require("pug").__express);
app.set('view engine', 'pug');

app.use(
  '/api/githuboauth',
  everyauth.authorize('githuboauth', {
    finishedUrl: '/api/finished',
    mapToUserId: (req) => 'degrammer', // req.user.id in production
  })
);

app.get('/api/finished', async (req, res) => {
  const userId = 'degrammer'; // req.user.id in production

  // Send a message over slack.
  const userCredentials = await everyauth.getIdentity('githuboauth', userId);
  const client = new Octokit({ auth: userCredentials?.accessToken });
  const { data } = await client.rest.users.getAuthenticated();
  const { data: repos } = await client.request('GET /user/repos', {});
  //res.status(200).json({ data, repos});

  res.render('index', {
    title: `GitHub Profile for ${data.login}`,
    ...data,
    used_storage: Math.round((data.disk_usage * 100) / data.plan.space, 2),
    public_repos: repos,
  });

});

app.get('/api', (req, res) => {
  res.redirect('/api/githuboauth');
});

module.exports = app;
