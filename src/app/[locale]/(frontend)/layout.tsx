import React from "react";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { container } from "@/lib/classes";
import ScrollToTop from "@/components/scroll-to-top";

export default function LocaleLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark"]}
            storageKey="theme"
        >
            <div
                id="site-wrapper"
                className="flex min-h-screen flex-col bg-white text-black antialiased dark:bg-gray-950 dark:text-white"
            >
                <Header />
                <main className={`${container.main} flex-1`}>{children}</main>
                <Footer />
            </div>
            <ScrollToTop />
        </ThemeProvider>
    );
}
