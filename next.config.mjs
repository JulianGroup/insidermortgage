/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // Emit page/index.html so Apache (DreamHost) serves /page/ without rewrites
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
