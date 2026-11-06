import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { X_PATH_HEADER_KEY } from "@/constants";
import { routing } from "@/i18n/routing";
import { systemConfigService } from "@/lib/services/system-config-service";
import "../globals.css";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    interactiveWidget: "resizes-content",
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        return { title: "404" };
    }
    const t = await getTranslations({ locale, namespace: "web" });
    return {
        title: `${t("title")} - ${t("subtitle")}`,
        description: t("description"),
        icons: {
            icon: "/api/favicon",
        },
    };
}

/**
 * Root layout under [locale] so next/root-params can expose `locale`
 * (required by next-intl ≥4.13 instead of deprecated setRequestLocale).
 * Video embeds live under app/(embed)/ — a sibling root layout, no locale.
 */
export default async function LocaleLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale: paramLocale } = await params;
    if (!hasLocale(routing.locales, paramLocale)) {
        notFound();
    }

    const locale = await getLocale();
    const messages = await getMessages();

    const headersList = await headers();
    const pathname = headersList.get(X_PATH_HEADER_KEY) || "";
    const isInstallPage = pathname.match(/(^|\/)install(\/|$)/);

    const initialized = await systemConfigService.isInitialized();
    console.log(
        `[Layout] Path: ${pathname}, isInstallPage: ${!!isInstallPage}, initialized: ${initialized}`
    );

    if (!initialized && !isInstallPage) {
        console.log(`[Layout] Not initialized, redirecting to install`);
        redirect(`/${locale}/install`);
    }
    if (initialized && isInstallPage) {
        console.log(`[Layout] Already initialized, redirecting to home`);
        redirect(`/${locale}`);
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body>
                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
