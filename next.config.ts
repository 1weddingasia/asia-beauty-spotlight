import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;

