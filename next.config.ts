import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 1MB 제한을 10MB로 늘립니다!
    },
  },
};

export default nextConfig;