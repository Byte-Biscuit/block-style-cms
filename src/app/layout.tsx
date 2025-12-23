import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Inter, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations, getMessages } from "next-intl/server";
import { systemConfigService } from "@/lib/services/system-config-service";
import { X_PATH_HEADER_KEY } from "@/constants";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

const notoSansSC = Noto_Sans_SC({
    variable: "--font-noto-sans-sc",
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});
async function isEmbedPage(): Promise<boolean> {
    const headersList = await headers();
    const pathname = headersList.get(X_PATH_HEADER_KEY) || "";
    return pathname.includes("/videos/embed/");
}
// Viewport
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
// metadata
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("web");
    return {
        title: t("title") + " - " + t("subtitle"),
        description: t("description"),
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();
    const isEmbed = await isEmbedPage();

    const headersList = await headers();
    const pathname = headersList.get(X_PATH_HEADER_KEY) || "";
    // 2. Detect whether the current request is for the install page
    // This check is safer than a pure regex because it uses the exact path
    // passed from middleware.
    const isInstallPage = pathname.match(/(^|\/)install(\/|$)/);

    // 3. Check whether the system is initialized
    // Note: isInitialized() uses fs.access which is fast and has short-lived cache
    const initialized = await systemConfigService.isInitialized();
    console.log(
        `[Layout] Path: ${pathname}, isInstallPage: ${!!isInstallPage}, initialized: ${initialized}`
    );

    // Scenario A: Not initialized and not on the install page -> force redirect to install
    if (!initialized && !isInstallPage) {
        console.log(`[Layout] Not initialized, redirecting to install`);
        redirect(`/${locale}/install`);
    }
    // Scenario B: Already initialized but user is visiting the install page -> force redirect to home
    if (initialized && isInstallPage) {
        console.log(`[Layout] Already initialized, redirecting to home`);
        redirect(`/${locale}`);
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${inter.variable} ${jetBrainsMono.variable} ${notoSansSC.variable}`}
            >
                {isEmbed ? (
                    children
                ) : (
                    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                        <NextIntlClientProvider
                            locale={locale}
                            messages={messages}
                        >
                            {children}
                        </NextIntlClientProvider>
                    </AppRouterCacheProvider>
                )}
            </body>
        </html>
    );
}
