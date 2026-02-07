/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize barrel imports for better bundle size and faster cold starts
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'objectstorageapi.ap-southeast-1.clawcloudrun.com',
      },
    ],
  },
};

export default nextConfig;
