/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Expose server env to the browser for client-side use
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.MAPS_PLATFORM_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
}

export default nextConfig