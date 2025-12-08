import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverActions: {
    bodySizeLimit: "20mb",
  },
};

export default nextConfig;
