import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

// Require static export for Capacitor (local builds), but allow dynamic API routes on Vercel
if (!process.env.VERCEL) {
  nextConfig.output = 'export';
}

export default nextConfig;
