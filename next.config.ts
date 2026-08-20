import createBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

let nextConfig: NextConfig = {
    //output: 'standalone',
    // BlockNoter's React Strict Mode causes issues with certain 3rd party libs
    reactStrictMode: false,
    // Dev: allow non-localhost hosts (LAN IP / hostname) to load HMR and /_next assets.
    // Bind address is set in package.json: next dev|start --hostname 0.0.0.0
    // Override with ALLOWED_DEV_ORIGINS=192.168.1.10,10.0.0.5
    allowedDevOrigins: (
        process.env.ALLOWED_DEV_ORIGINS ?? "127.0.0.1,0.0.0.0"
    )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    experimental: {
        proxyClientMaxBodySize: "50mb",
        serverActions: {
            bodySizeLimit: "50mb",
        },
    },
    images: {
        // Temporarily disable the optimization feature of the Image component.
        unoptimized: true,
        formats: ["image/webp", "image/avif"],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
    },
    async headers() {
        return [
            {
                source: "/_next/static/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                source: "/:static*\\.(png|jpg|jpeg|gif|svg|css|js|woff2?)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            use: ["@svgr/webpack"],
        });
        return config;
    },
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
    },
};

// nextjs bundle analyzer
const withBundleAnalyzer = createBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
    openAnalyzer: false,
});
nextConfig = withBundleAnalyzer(nextConfig);
// next-intl plugin
const withNextIntl = createNextIntlPlugin({
    requestConfig: "./src/i18n/request.ts",
});
nextConfig = withNextIntl(nextConfig);
export default nextConfig;
