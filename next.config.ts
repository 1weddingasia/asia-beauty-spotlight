import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/pho-tiec',
        destination: '/tat-nien',
      },
      {
        source: '/pho-tiec/dang-ky',
        destination: '/tat-nien/dang-ky',
      },
    ];
  },
  images: {
    remotePatterns: [
      // Supabase storage
      { protocol: "https", hostname: "ejlltaigohemjagfzxxh.supabase.co" },
      // Stock/placeholder
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      // Social CDNs
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "*.zalo.me" },
      { protocol: "https", hostname: "*.zaloapp.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // Local dev
      { protocol: "http", hostname: "localhost" },
      // Business websites (directory site needs to allow all external images)
      { protocol: "https", hostname: "**.vn" },
      { protocol: "https", hostname: "**.com" },
      { protocol: "https", hostname: "**.com.vn" },
      { protocol: "https", hostname: "**.net" },
      { protocol: "https", hostname: "**.org" },
      { protocol: "https", hostname: "**.asia" },
      { protocol: "https", hostname: "**.world" },
      { protocol: "https", hostname: "**.me" },
      { protocol: "https", hostname: "**.co" },
      { protocol: "https", hostname: "**.wixstatic.com" },
      { protocol: "https", hostname: "**.hstatic.net" },
      { protocol: "http", hostname: "**.hstatic.net" },
    ],
  },
  transpilePackages: ['maplibre-gl'],
};

export default nextConfig;

