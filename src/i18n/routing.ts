import { NextRequest } from 'next/server';
import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@/i18n/config"

export const routing = defineRouting(
    {
        locales,
        defaultLocale: defaultLocale,
        localePrefix: "always",
        localeDetection: true,
    }
);

/**
 * Emulate the core logic of next-intl's createMiddleware to obtain the current locale
 *
 * Configuration context:
 * - localePrefix: "always" (always include the prefix)
 * - localeDetection: false (do not detect locale from Header/Cookie)
 */
export function getLocale(request: NextRequest): string {
    const { pathname } = request.nextUrl;

    // 1. Iterate through the configured locales
    const matchedLocale = routing.locales.find((locale) => {
        // Core matching logic:
        // Case A: pathname is exactly "/en-US" -> match
        // Case B: pathname starts with "/en-US/" (e.g. "/en-US/about") -> match
        return (
            pathname === `/${locale}` ||
            pathname.startsWith(`/${locale}/`)
        );
    });

    // 2. If a match is found, return that locale
    if (matchedLocale) {
        return matchedLocale;
    }

    // 3. If no match is found (e.g. visiting /about or /api/...)
    // According to next-intl behavior, this typically means the user has not entered a localized route.
    // In strict mode, this is equivalent to falling back to the default locale.
    return routing.defaultLocale;
}