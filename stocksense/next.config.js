/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['*.supabase.co', 'fonts.gstatic.com', 'images.unsplash.com'],
  },
}

module.exports = nextConfig