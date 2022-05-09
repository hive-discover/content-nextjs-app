/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint : {
    ignoreDuringBuilds: true,
  }
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)