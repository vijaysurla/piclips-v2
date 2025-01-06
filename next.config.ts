import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // This will warn but not error on ESLint issues
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;




