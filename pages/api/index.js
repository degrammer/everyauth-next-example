const everyauth = require('@fusebit/everyauth-express');
const { Octokit } = require("octokit");

const app = require('express')();

app.set('view engine', 'pug');

app.use(
  '/api/githuboauth',
  everyauth.authorize('githuboauth', {
    finishedUrl: '/api/finished',
    mapToUserId: (req) => 'degrammer', // req.user.id in production
  })
);

app.get('/api/finished', async (req, res) => {
  const userId = 'degrammer'  // req.user.id in production

  // Send a message over slack.
  const userCredentials = await everyauth.getIdentity('githuboauth', userId);
  const client = new Octokit({ auth: userCredentials?.accessToken });
  const { data } = await client.rest.users.getAuthenticated();
  const { data: repos } = await client.request('GET /user/repos', {});
  res.render('index',  { title: `GitHub Profile for ${data.login}`, ...data, used_storage: Math.round((data.disk_usage*100)/data.plan.space, 2) , public_repos: repos})
});

app.get('/api', (req, res) => {
  res.redirect('/api/githuboauth');
});


module.exports = app;