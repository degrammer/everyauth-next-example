/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  headers: {
    'cache-control': 's-max-age=1, stale-while-revalidate'
  }
}

module.exports = nextConfig
