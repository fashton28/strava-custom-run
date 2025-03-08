/** @type {import('next').NextConfig} */
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.strava.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dgtzuqphqg23d.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/strava/:path*',
        destination: '/api/strava/:path*',
      },
    ];
  },
}; 