import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev2" : ".next-prod",
  reactStrictMode: true,
};

export default nextConfig;
