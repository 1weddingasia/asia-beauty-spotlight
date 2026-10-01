import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho phép hiển thị ảnh từ mọi domain vì đây là danh bạ cào dữ liệu từ nhiều nguồn
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
