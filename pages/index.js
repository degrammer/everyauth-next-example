import * as everyauth from '@fusebit/everyauth-express';
import { Octokit } from 'octokit';
import Script from 'next/script';
import Image from 'next/image';
import crypto from 'crypto';
import profileFile from './api/profile';

function Page({ profile, repos }) {
  return (
    <>
      <title>{profile.login}&#39;s public repositories</title>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/js/all.min.js"
        defer
        crossOrigin="anonymous"
        integrity="sha512-6PM0qYu5KExuNcKt5bURAoT6KCThUmHRewN3zUFNaoI6Di7XJPTMoT6K0nsagZKk2OB4L7E3q1uQKHNHd4stIQ=="
      />
      <div className="container">
        <div className="profile">
          <div className="top">
            <Image className="pic" height={400} width={400} src={profile.avatar_url} alt="GitHub Avatar" />
            <h2>{profile.name}</h2>
            <a href={profile.html_url} rel="noreferrer">
              {profile.login}
            </a>
            <p>{profile.bio}</p>
          </div>
          <p className="followers">
            <i className="fa-solid fa-users"></i>
            <span>{profile.followers}</span>
            <span className="separator">-</span>
            <span>{profile.following}</span>
          </p>
          <section>
            <i className="fa-solid fa-building"></i>
            <span>{profile.company}</span>
          </section>
          <section>
            <i className="fa fa-location-dot"></i>
            <span>{profile.location}</span>
          </section>
          <section>
            <i className="fa-brands fa-twitter"></i>
            <a href={`https://www.twitter.com/${profile.twitter_username}`} rel="noreferrer" target="_blank">
              {profile.twitter_username}
            </a>
          </section>
          <section>
            <i className="fa-solid fa-floppy-disk"></i>
            <span>
              Using {Math.round((profile.disk_usage * 100) / profile.plan.space, 2)}% of {profile.plan.name} plan
              storage
            </span>
          </section>
        </div>
        <div className="public-repos">
          <h2>Your public repositories ({repos.length})</h2>
          <ul>
            {repos.map((repo, index) => {
              return (
                <li key={index}>
                  <a href={repo.html_url} target="_blank" rel="noreferrer" title={repo.description}>
                    {repo.full_name}
                  </a>
                  <span>{repo.description}</span>
                  {repo.language && <span className="lang">repo.language</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

// This gets called on every request
export async function getServerSideProps(context) {
  const algorithm = 'aes-128-cbc';
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.SERVICE_ENCRYPTION_KEY,
    process.env.SERVICE_ENCRYPTION_IV
  );
  let decrypted = decipher.update(profileFile, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  const decryptedData = JSON.parse(decrypted);
  everyauth.config(decryptedData);

  const userId = context.params.userId; // req.user.id in production

  // Send a message over slack.
  const userCredentials = await everyauth.getIdentity('githuboauth', userId);
  const client = new Octokit({ auth: userCredentials?.accessToken });
  const { data: profile } = await client.rest.users.getAuthenticated();
  const { data: repos } = await client.request('GET /user/repos', {});
  // Pass data to the page via props
  return { props: { profile, repos } };
}

export default Page;
