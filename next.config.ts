import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
