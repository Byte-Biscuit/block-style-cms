/**
 * i18next configuration
 */
import { getTranslations } from "next-intl/server";

// supported locales
export const locales = ['zh-CN', 'zh-TW', 'en-US'] as const;

// default  locale
export const defaultLocale = 'en-US' as const;

// locale mapping
export const localeMap = {
    'zh-CN': {
        code: "zh-CN",
        name: "简体中文",
        nativeName: "简体中文",
        englishName: "Chinese Simplified",
        flag: "简"
    },
    'zh-TW': {
        code: "zh-TW",
        name: "繁體中文",
        nativeName: "繁體中文",
        englishName: "Chinese Traditional",
        flag: "繁"
    },
    'en-US': {
        code: "en-US",
        name: "English",
        nativeName: "English",
        englishName: "English",
        flag: "EN"
    }
} as const;

// Escape language code
export const getLanguageDisplayName = (
    code: keyof typeof localeMap | string,
    displayIn: 'native' | 'english' | 'current' = 'native'
): string => {
    if (!Object.keys(localeMap).includes(code)) {
        return code;
    }
    const lang = localeMap[code as keyof typeof localeMap];

    switch (displayIn) {
        case 'native':
            return lang.nativeName;
        case 'english':
            return lang.englishName;
        case 'current':
            return lang.name;
        default:
            return lang.nativeName;
    }
};

export const getLocale = (locale: string) => {
    if (!Object.keys(localeMap).includes(locale)) {
        return defaultLocale;
    }
    return locale as Locale;
}

// react-i18next-router
const i18nConfig: {
    locales: string[];
    defaultLocale: string;
    prefixDefault: boolean;
} = {
    locales: [...locales],
    defaultLocale,
    prefixDefault: false,
};

export { i18nConfig };
// export types
export type Locale = typeof locales[number];
// export type Translations = Awaited<ReturnType<typeof getTranslations>>;
export type TranslationFunction = Awaited<ReturnType<typeof getTranslations>>