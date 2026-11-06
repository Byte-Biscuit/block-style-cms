import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { headers } from "next/headers";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { X_PATH_HEADER_KEY } from "@/constants";
import { mergeDeep } from "@/lib/utils";
import { CMS_DATA_PATH } from "@/settings";
import { routing } from "./routing";

/**
 * In-memory cache for merged i18n messages
 * Key: locale (e.g., 'zh-CN', 'en')
 * Value: merged messages object
 */
const messagesCache = new Map<string, any>();

/**
 * Clear messages cache (useful in development mode)
 */
export function clearMessagesCache() {
    messagesCache.clear();
    console.log("[i18n] Messages cache cleared");
}

/**
 * Get cache status for debugging
 */
export function getMessagesCacheStatus() {
    return {
        size: messagesCache.size,
        locales: Array.from(messagesCache.keys()),
    };
}

/** Best-effort request path for i18n debug logs. */
async function getRequestPathForLog(): Promise<string> {
    try {
        const h = await headers();
        return (
            h.get(X_PATH_HEADER_KEY) ||
            h.get("x-middleware-rewrite") ||
            h.get("next-url") ||
            h.get("x-url") ||
            "(no-path)"
        );
    } catch {
        return "(no-headers)";
    }
}

async function resolveLocale(explicit?: string): Promise<string> {
    // Call-site override (Server Actions / Route Handlers — root-params unsupported there).
    if (explicit && hasLocale(routing.locales, explicit)) {
        return explicit;
    }

    try {
        const paramValue = await rootParams.locale();
        if (hasLocale(routing.locales, paramValue)) {
            return paramValue;
        }
        // undefined/invalid outside a matching [locale] segment — fall back quietly.
        if (paramValue != null && paramValue !== "") {
            const path = await getRequestPathForLog();
            console.warn(
                `[i18n] Invalid locale "${String(paramValue)}" path=${path}, falling back to default: ${routing.defaultLocale}`
            );
        }
    } catch {
        // Outside [locale] tree or Route Handler — root-params unsupported; use default.
    }

    return routing.defaultLocale;
}

export default getRequestConfig(async ({ locale: localeOverride }) => {
    const locale = await resolveLocale(localeOverride);
    const path = await getRequestPathForLog();

    // Check cache first
    if (messagesCache.has(locale)) {
        console.log(
            `[i18n] Using cached messages for locale: ${locale} path=${path}`
        );
        return {
            locale,
            messages: messagesCache.get(locale),
        };
    }

    console.log(`[i18n] Loading messages for locale: ${locale} path=${path}`);

    // Load default messages from src/i18n/locales
    const defaultMessages = (await import(`./locales/${locale}.json`)).default;

    // Try to load custom messages from CMS_DATA_PATH/locales if CMS_DATA_PATH is configured
    let finalMessages = defaultMessages;

    if (CMS_DATA_PATH) {
        const customLocalePath = join(
            CMS_DATA_PATH,
            "locales",
            `${locale}.json`
        );

        if (existsSync(customLocalePath)) {
            try {
                const customMessagesJson = readFileSync(
                    customLocalePath,
                    "utf-8"
                );
                const customMessages = JSON.parse(customMessagesJson);
                finalMessages = mergeDeep(defaultMessages, customMessages);
                console.log(
                    `[i18n] Merged custom messages from: ${customLocalePath}`
                );
            } catch (error) {
                console.error(
                    `[i18n] Failed to load custom messages from ${customLocalePath}:`,
                    error
                );
            }
        } else {
            console.log(
                `[i18n] No custom messages found at: ${customLocalePath}`
            );
        }
    }

    // Cache the final merged messages
    messagesCache.set(locale, finalMessages);
    console.log(`[i18n] Cached messages for locale: ${locale} path=${path}`);

    return {
        locale,
        messages: finalMessages,
    };
});
