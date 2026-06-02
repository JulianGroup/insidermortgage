/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/insidermortgage',
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
