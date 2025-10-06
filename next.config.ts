import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from "@next/bundle-analyzer";

let nextConfig: NextConfig = {
  //output: 'standalone',
  // BlockNoter's React Strict Mode causes issues with certain 3rd party libs
  reactStrictMode: false,
  images: {
    // Temporarily disable the optimization feature of the Image component.
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/:static*\\.(png|jpg|jpeg|gif|svg|css|js|woff2?)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true
    }
  },
};

// nextjs bundle analyzer
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})
nextConfig = withBundleAnalyzer(nextConfig);
// next-intl plugin
const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
});
nextConfig = withNextIntl(nextConfig);
export default nextConfig;
