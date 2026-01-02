import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CMS_DATA_PATH } from '@/settings';
import { mergeDeep } from '@/lib/utils';

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
    console.log('[i18n] Messages cache cleared');
}

/**
 * Get cache status for debugging
 */
export function getMessagesCacheStatus() {
    return {
        size: messagesCache.size,
        locales: Array.from(messagesCache.keys())
    };
}

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
        console.warn(`[i18n] Invalid locale "${locale}", falling back to default: ${routing.defaultLocale}`);
        locale = routing.defaultLocale;
    }
    
    // Check cache first
    if (messagesCache.has(locale)) {
        console.log(`[i18n] Using cached messages for locale: ${locale}`);
        return {
            locale,
            messages: messagesCache.get(locale)
        };
    }
    
    console.log(`[i18n] Loading messages for locale: ${locale}`);
    
    // Load default messages from src/i18n/locales
    const defaultMessages = (await import(`./locales/${locale}.json`)).default;
    
    // Try to load custom messages from data/locales if CMS_DATA_PATH is configured
    let finalMessages = defaultMessages;
    
    if (CMS_DATA_PATH) {
        const customLocalePath = join(CMS_DATA_PATH, 'locales', `${locale}.json`);
        
        if (existsSync(customLocalePath)) {
            try {
                const customMessagesJson = readFileSync(customLocalePath, 'utf-8');
                const customMessages = JSON.parse(customMessagesJson);
                finalMessages = mergeDeep(defaultMessages, customMessages);
                console.log(`[i18n] Merged custom messages from: ${customLocalePath}`);
            } catch (error) {
                console.error(`[i18n] Failed to load custom messages from ${customLocalePath}:`, error);
            }
        } else {
            console.log(`[i18n] No custom messages found at: ${customLocalePath}`);
        }
    }
    
    // Cache the final merged messages
    messagesCache.set(locale, finalMessages);
    console.log(`[i18n] Cached messages for locale: ${locale}`);
    
    return {
        locale,
        messages: finalMessages
    };
});