import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // FIX #8: Whitelist các hostname cụ thể thay vì cho phép ** (mọi domain)
    remotePatterns: [
      // Pexels — ảnh stock trong hero slides và bang-gia
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**",
      },
      // Unsplash — ảnh stock dự phòng
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Supabase Storage — ảnh upload của doanh nghiệp (logo, banner)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase Storage custom domain (nếu có)
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      // Google User Content — avatar từ Google OAuth
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Cloudflare Images (nếu dùng sau này)
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
    ],
  },
};

export default nextConfig;
