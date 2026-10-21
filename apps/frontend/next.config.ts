import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@solosocius/api-types"],
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
