/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@apiclient/ui', '@apiclient/utils', '@apiclient/hooks'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
