/**
 * Color definitions for BlockNote editor and renderers.
 */
export const BLOCKNOTE_COLORS = [
    { name: "Default", value: "default", textClass: "text-foreground", bgClass: "bg-transparent" },
    { name: "Gray", value: "gray", textClass: "text-gray-500", bgClass: "bg-gray-100 dark:bg-gray-800" },
    { name: "Red", value: "red", textClass: "text-red-500", bgClass: "bg-red-100 dark:bg-red-900/30" },
    { name: "Orange", value: "orange", textClass: "text-orange-500", bgClass: "bg-orange-100 dark:bg-orange-900/30" },
    { name: "Yellow", value: "yellow", textClass: "text-yellow-500", bgClass: "bg-yellow-100 dark:bg-yellow-900/30" },
    { name: "Green", value: "green", textClass: "text-green-500", bgClass: "bg-green-100 dark:bg-green-900/30" },
    { name: "Blue", value: "blue", textClass: "text-blue-500", bgClass: "bg-blue-100 dark:bg-blue-900/30" },
    { name: "Purple", value: "purple", textClass: "text-purple-500", bgClass: "bg-purple-100 dark:bg-purple-900/30" },
    { name: "Pink", value: "pink", textClass: "text-pink-500", bgClass: "bg-pink-100 dark:bg-pink-900/30" },
] as const;

export const findColorByValue = (value: string) =>
    BLOCKNOTE_COLORS.find((color) => color.value === value);

/**
 * Basic text style mapping (Boolean prop -> Tailwind class)
 * If these keys exist in props with a value of true, the corresponding classes will be applied
 */
export const BASIC_STYLE_MAP: Record<string, string> = {
    bold: "font-bold",
    italic: "italic",
    underline: "underline underline-offset-4",
    strike: "line-through",
    code: "font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm",
    // If new boolean props are added in the future (e.g. highlight), add them here
    // highlight: "bg-yellow-200 dark:bg-yellow-800"
};

/**
 * Alignment mapping (value -> Tailwind class)
 */
export const ALIGNMENT_MAP: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
};

// ========================================================================
// 2. Core utility functions
// ========================================================================

/**
 * Generic class-name generator
 * Automatically extracts color, alignment and basic styles from props and merges extra classes
 *
 * @param props - BlockNote props object (typically Record<string, any>)
 * @param extraClasses - component-specific additional class names
 */
export function getBlockClasses(
    props: Record<string, unknown> | undefined | null,
    ...extraClasses: (string | undefined | null | false)[]
): string {
    // 1. If props is empty, return only the extra classes
    if (!props) {
        return extraClasses.filter(Boolean).join(" ");
    }

    const classes: (string | undefined | false)[] = [];

    // --------------------------------------------------------
    // A. Handle colors (textColor, backgroundColor)
    // --------------------------------------------------------
    if (props.textColor && typeof props.textColor === 'string') {
        classes.push(findColorByValue(props.textColor)?.textClass);
    }
    if (props.backgroundColor && typeof props.backgroundColor === 'string') {
        classes.push(findColorByValue(props.backgroundColor)?.bgClass);
    }

    // --------------------------------------------------------
    // B. Handle alignment (textAlignment)
    // --------------------------------------------------------
    if (props.textAlignment && typeof props.textAlignment === 'string' && ALIGNMENT_MAP[props.textAlignment]) {
        classes.push(ALIGNMENT_MAP[props.textAlignment]);
    }

    // --------------------------------------------------------
    // C. Auto-map basic styles (bold, italic, etc.)
    // --------------------------------------------------------
    // Iterate the mapping table and check whether props contain a true value for each key
    for (const [propKey, className] of Object.entries(BASIC_STYLE_MAP)) {
        if (props[propKey] === true) {
            classes.push(className);
        }
    }

    // --------------------------------------------------------
    // D. Merge extra classes
    // --------------------------------------------------------
    return [...classes, ...extraClasses]
        .filter(Boolean) // filter out undefined, null, false, empty strings
        .join(" ");      // join with spaces
}


// Base style components
export const base = {
    container: "w-full mx-auto px-4",
    flexCenter: "flex items-center justify-center",
    flexCol: "flex-col items-center justify-center text-center",
    flexBetween: "flex items-center justify-between",

    // Responsive maximum widths
    maxWidth: {
        sm: "sm:max-w-2xl",
        md: "md:max-w-4xl",
        lg: "xl:max-w-7xl",
        content: "sm:max-w-2xl md:max-w-3xl xl:max-w-5xl"
    },

    // Spacing
    padding: {
        page: "px-4 py-6",
        section: "px-6 py-4",
        compact: "px-4 py-2"
    }
} as const;

// Button base styles
export const buttonBase = "group flex items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:shadow-md font-medium";

export const button = {
    // Primary button
    primary: `${buttonBase} bg-primary-600 hover:bg-primary-700 text-white px-6 py-4`,

    // Secondary button
    secondary: `${buttonBase} bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-4 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`,

    // Icon button
    icon: "text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg p-2",

    // Size variants
    size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-lg"
    }
} as const;

// Card styles
export const card = {
    base: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
    hover: "hover:shadow-md transition-shadow duration-200",
    interactive: "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
} as const;

// Text styles
export const text = {
    heading: "text-gray-900 dark:text-gray-100 font-bold",
    body: "text-gray-600 dark:text-gray-400",
    muted: "text-gray-500 dark:text-gray-500",
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400"
} as const;

// Layout containers (preserve existing, add new)
export const container = {
    header: `${base.container} ${base.padding.page} ${base.maxWidth.lg} ${base.flexBetween}`,
    main: `${base.container} ${base.padding.page} ${base.maxWidth.content} flex-1`,
    messagePage: `${base.container} ${base.flexCol} sm:max-w-xl md:max-w-2xl xl:max-w-4xl`
} as const;

// Global border radius setting.
export const roundedPx = 8

// Unify title style function
export const getDefaultHeadingClasses = (level: number): string => {
    const baseClasses = "font-extrabold text-gray-900 dark:text-gray-100";

    const headingClasses = {
        1: `${baseClasses} text-3xl leading-normal sm:text-4xl sm:leading-normal md:text-5xl md:leading-normal`,
        2: `${baseClasses.replace('extrabold', 'bold')} text-2xl leading-normal sm:text-3xl sm:leading-normal md:text-4xl md:leading-normal`,
        3: `${baseClasses.replace('extrabold', 'bold')} text-xl leading-normal sm:text-2xl sm:leading-normal md:text-3xl md:leading-normal`,
        4: `${baseClasses.replace('extrabold', 'semibold')} text-lg leading-relaxed sm:text-xl sm:leading-relaxed md:text-2xl md:leading-relaxed`,
        5: `${baseClasses.replace('extrabold', 'semibold')} text-base leading-relaxed sm:text-lg sm:leading-relaxed md:text-xl md:leading-relaxed`,
        6: `${baseClasses.replace('extrabold', 'medium')} text-base leading-relaxed`,
    };

    return (
        headingClasses[level as keyof typeof headingClasses] ||
        headingClasses[3]
    );
}

// Get color classes based on file extension
export const getFileTypeColor = (extension: string): string => {
    const colors: Record<string, string> = {
        ".pdf": "text-red-600 bg-red-50 border-red-200",
        ".doc": "text-blue-600 bg-blue-50 border-blue-200",
        ".docx": "text-blue-600 bg-blue-50 border-blue-200",
        ".xls": "text-green-600 bg-green-50 border-green-200",
        ".xlsx": "text-green-600 bg-green-50 border-green-200",
        ".ppt": "text-orange-600 bg-orange-50 border-orange-200",
        ".pptx": "text-orange-600 bg-orange-50 border-orange-200",
        ".txt": "text-gray-600 bg-gray-50 border-gray-200",
        ".zip": "text-purple-600 bg-purple-50 border-purple-200",
        ".rar": "text-purple-600 bg-purple-50 border-purple-200",
    };
    return (
        colors[extension.toLowerCase()] ||
        "text-gray-600 bg-gray-50 border-gray-200"
    );
};