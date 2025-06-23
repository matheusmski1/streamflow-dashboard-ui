import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for static generation (SSG)
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Streamflow Dashboard',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // Performance optimizations
  // experimental: {
  //   optimizeCss: true, // Disabled - requires additional dependencies
  // },

  // Security headers disabled for static export
  // Headers are not supported with output: 'export'
  // These should be configured at the server/CDN level instead
};

export default nextConfig;
