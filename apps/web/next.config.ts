import type { NextConfig } from "next";

// API_URL is server-side only (never shipped to the client). NEXT_PUBLIC_API_URL is accepted as a fallback.
const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API}/api/v1/:path*` }];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ] }];
  },
};
export default nextConfig;
