import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    console.log('[i18n] requestLocale received:', locale);
    if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
        console.warn(`[i18n] Invalid locale "${locale}", falling back to default: ${routing.defaultLocale}`);
        locale = routing.defaultLocale;
    }
    console.log(`[i18n] Loading messages for locale: ${locale}`);
    return {
        locale,
        messages: (await import(`./locales/${locale}.json`)).default
    };
});