import * as everyauth from '@fusebit/everyauth-express';
import { Octokit } from 'octokit';
import Script from 'next/script';
import Image from 'next/image';
import profileEncryptedContent from '../profile';
import { decrypt } from '../utils/encryption';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'cookies';

function Page({ id, profile, repos, step }) {
  if (!profile) {
    return (
      <>
        {' '}
        <title>GitHub public repositories</title>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/js/all.min.js"
          defer
          crossOrigin="anonymous"
          integrity="sha512-6PM0qYu5KExuNcKt5bURAoT6KCThUmHRewN3zUFNaoI6Di7XJPTMoT6K0nsagZKk2OB4L7E3q1uQKHNHd4stIQ=="
        />
        <div className="alert">
          <h1>Welcome to <a target='_blank' rel='noreferrer' href='https://github.com/fusebit/everyauth-express'>EveryAuth</a> Demo</h1>
          <span>Connect your GitHub Account to display your profile and public repositories information</span>
          <p>
            <a className='button' href={`/api/${id}`}>
              {' '}
              <i className="fa-brands fa-github"></i>Connect your GitHub Account
            </a>
          </p>
        </div>
      </>
    );
  }
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
          {!repos.length && <div>
             <p className='empty'>No public repositories found</p>
            </div>}
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
  const cookies = new Cookies(context.req, context.res);
  const { FUSEBIT_ENCRYPTION_KEY, FUSEBIT_ENCRYPTION_IV, FUSEBIT_ENCRYPTION_TAG } = process.env;
  let userId = context.query.userId || cookies.get('user-id');

  if (!userId) {
    userId = uuidv4();
    cookies.set('user-id', userId, {
      httpOnly: true,
    });
  }

  if (!FUSEBIT_ENCRYPTION_KEY || !FUSEBIT_ENCRYPTION_IV || !FUSEBIT_ENCRYPTION_TAG) {
    return { props: { id: userId } };
  }

  const decrypted = decrypt(
    FUSEBIT_ENCRYPTION_KEY,
    FUSEBIT_ENCRYPTION_IV,
    FUSEBIT_ENCRYPTION_TAG,
    profileEncryptedContent
  );

  const decryptedData = JSON.parse(decrypted);
  everyauth.config(decryptedData);

  try {
    const userCredentials = await everyauth.getIdentity('githuboauth', userId);
    const client = new Octokit({ auth: userCredentials?.accessToken });
    const { data: profile } = await client.rest.users.getAuthenticated();
    const { data: repos } = await client.request('GET /user/repos', {});
    // Pass data to the page via props
    return { props: { profile, repos, id: userId } };
  } catch (error) {
    return { props: { id: userId } };
  }
}

export default Page;
