import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Import the icons used by a screen instead of compiling the entire icon barrel.
    optimizePackageImports: ["@hugeicons/core-free-icons"],
  },
};

export default nextConfig;
