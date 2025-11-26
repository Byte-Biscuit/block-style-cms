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
