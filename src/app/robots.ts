import type { MetadataRoute } from 'next';

// Every 24 hours
export const revalidate = 86400;
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/m/',
        },
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
    }
}