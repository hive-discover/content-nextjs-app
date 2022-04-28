/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint : {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig

// const withReactSvg = require('next-react-svg')
// const path = require('path')

// module.exports = withReactSvg({
//   include: path.resolve(__dirname, 'public/img/LoadingBlobs/'),
//   webpack(config, options) {
//     return config
//   }
// })