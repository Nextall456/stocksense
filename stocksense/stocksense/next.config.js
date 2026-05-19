/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['*.supabase.co', 'fonts.gstatic.com', 'images.unsplash.com'],
  },
}

module.exports = nextConfig