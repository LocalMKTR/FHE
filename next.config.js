/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fheontheroad.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "bytegrad.com",
        pathname: "/course-assets/**",
      },
    ],
  },
}

module.exports = nextConfig

