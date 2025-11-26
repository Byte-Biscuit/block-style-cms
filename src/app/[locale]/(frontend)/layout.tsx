import React from "react";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { container } from "@/lib/style-classes";
import FloatingActionButtons from "@/components/floating-action-buttons";

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
            <FloatingActionButtons />
        </ThemeProvider>
    );
}
