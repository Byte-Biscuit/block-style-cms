import { BasicTextStyle, textStyleTwMap } from "@/components/block-note/meta";

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


// Convert an array or set of text styles to a Tailwind CSS class string
export const textStylesToTw = (styles?: BasicTextStyle[] | Set<BasicTextStyle>) => {
    if (!styles) return "";
    const arr = Array.isArray(styles) ? styles : Array.from(styles);
    return arr.map(s => textStyleTwMap[s]).filter(Boolean).join(" ");
};

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