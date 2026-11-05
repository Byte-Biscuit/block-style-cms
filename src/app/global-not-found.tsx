import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "404",
};

/** Non-localized 404 (outside [locale] / next-intl). */
export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-8">
                    <h1 className="font-bold text-6xl">404</h1>
                    <p className="text-gray-600">Page not found</p>
                </div>
            </body>
        </html>
    );
}
