const localeMapping: Record<string, string> = {
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    "en-US": "en-US",
};

const getLocale = (locale: string): string => {
    return localeMapping[locale] || "en-US";
};

export const formatDateI18n = (
    date: string | Date,
    locale: string,
    options?: Intl.DateTimeFormatOptions
): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(dateObj.getTime())) {
        return "";
    }

    const normalizedLocale = getLocale(locale);

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // 12-hour clock for English locales
        hour12: normalizedLocale.startsWith("en"),
    };

    // Prefer caller-provided options when present
    const formatOptions = options || defaultOptions;

    try {
        return new Intl.DateTimeFormat(normalizedLocale, formatOptions).format(
            dateObj
        );
    } catch (error) {
        console.error("Date formatting error:", error);
        return dateObj.toISOString();
    }
};
