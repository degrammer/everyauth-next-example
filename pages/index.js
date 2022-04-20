const everyauth = require('@fusebit/everyauth-express');
const { Octokit } = require('octokit');
import Script from 'next/script'

function Page({ profile, repos }) {
   return (<>
    <Script src='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/js/all.min.js' defer crossOrigin='anonymous' integrity='sha512-6PM0qYu5KExuNcKt5bURAoT6KCThUmHRewN3zUFNaoI6Di7XJPTMoT6K0nsagZKk2OB4L7E3q1uQKHNHd4stIQ==' />
    <div className='container'>
        <div className='profile'>
            <div className='top'>
                <img src={profile.avatar_url} />
                <h2>{profile.name}</h2>
                <a href={profile.html_url}>{profile.login}</a>
            </div>
            <p className='followers'>
              <i className='fa-solid fa-users'></i>
              <span>{profile.followers}</span>
              <span className='separator'>-</span>
              <span>{profile.following}</span>
            </p>
            <section>
              <i className='fa-solid fa-building'></i>
              <span>{profile.company}</span>
            </section>
            <section>
              <i className='fa fa-location-dot'></i>
              <span>{profile.location}</span>
            </section>
            <section>
              <i className='fa-brands fa-twitter'></i>
              <span>{profile.twitter_username}</span>
            </section>
            <section>
              <i className='fa-solid fa-floppy-disk'></i>
              <span>Using {Math.round((profile.disk_usage*100)/profile.plan.space, 2) }% of {profile.plan.name} plan storage</span>
            </section>
        </div>
        <div className='public-repos'>
          <h2>Your public repositories ({repos.length})</h2>
          <ul>
         {
            repos.map((repo, index) => {
              return  <li key={index}>
                <a href={repo.html_url} target='_blank' title={repo.description}>repo.full_name</a>
                <span>{repo.description}</span>
                { repo.language && <span className='lang'>repo.language</span>}
                </li>
           
            })
         }
         </ul>
        </div>
    </div>
   </>);
  }
  
  // This gets called on every request
  export async function getServerSideProps() {

    const userId = 'degrammer'; // req.user.id in production

  // Send a message over slack.
  const userCredentials = await everyauth.getIdentity('githuboauth', userId);
  const client = new Octokit({ auth: userCredentials?.accessToken });
  const { data: profile } = await client.rest.users.getAuthenticated();
  const { data: repos } = await client.request('GET /user/repos', {});
    // Pass data to the page via props
    return { props: { profile, repos } }
  }
  
  export default Page