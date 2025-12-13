import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [new URL('https://shvxzuvqnlffnldbvtdf.supabase.co/**')],
  },
  experimental: {
    middlewareClientMaxBodySize: '50mb',
  },
}

export default nextConfig
