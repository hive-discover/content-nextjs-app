/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint : {
    ignoreDuringBuilds: true,
  },
  images : {
    domains : ["images.hive.blog"],
  }
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)