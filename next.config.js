/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "manggala.biz.id", "api.qrserver.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  // Environment variables for production
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://manggala.biz.id",
  },
}

module.exports = nextConfig
