/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { REACT_APP_API_URL: process.env.NEXT_PUBLIC_API_HOST },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
