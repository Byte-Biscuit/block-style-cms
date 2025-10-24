import Script from "next/script";

interface UmamiAnalyticsProps {
    websiteId?: string;
    src?: string;
}

const UmamiAnalytics = ({
    websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    src = process.env.NEXT_PUBLIC_UMAMI_SRC ||
        "https://cloud.umami.is/script.js",
}: UmamiAnalyticsProps) => {
    if (!websiteId) {
        return null;
    }

    return (
        <Script
            src={src}
            data-website-id={websiteId}
            strategy="afterInteractive"
            defer
        />
    );
};

export default UmamiAnalytics;
