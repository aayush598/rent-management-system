import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compiler optimizations
  compiler: {
    // Remove console.log in production (keep console.warn/error)
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["warn", "error"] } : false,
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Bundle analysis
  ...(process.env.ANALYZE === "true" ? { bundlePagesRouterDependencies: true } : {}),

  // Enable React strict mode for development
  reactStrictMode: true,

  // Powered-by header disabled for security
  poweredByHeader: false,

  // Experimental features
  experimental: {
    // Optimize server components
    optimizeServerReact: true,
    // Optimize CSS
    optimizeCss: true,
    // Enable scroll restoration
    scrollRestoration: true,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
