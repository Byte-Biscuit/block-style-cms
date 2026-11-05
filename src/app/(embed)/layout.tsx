import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

/**
 * Separate root layout for iframe embeds (no locale / no site chrome).
 * Sibling of [locale]/layout so next/root-params still works for CMS pages.
 */
export default function EmbedRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body style={{ margin: 0, background: "#000" }}>{children}</body>
        </html>
    );
}
