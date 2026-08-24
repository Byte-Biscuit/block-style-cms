import { ThemeProvider } from "next-themes";
import type React from "react";
import FloatingActionButtons from "@/components/floating-action-buttons";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { container } from "@/lib/style-classes";

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
