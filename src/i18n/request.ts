import { getRequestConfig, GetRequestConfigParams } from 'next-intl/server';
import { defaultLocale } from '@/i18n/config';


export default getRequestConfig(async ({ requestLocale }: GetRequestConfigParams) => {
    const locale = await requestLocale || defaultLocale;
    return {
        locale,
        messages: (await import(`./locales/${locale}.json`)).default
    };
});