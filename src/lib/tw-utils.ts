import { BasicTextStyle, textStyleTwMap } from "@/components/block-note/meta";

// Unify title style function
export const getDefaultHeadingClasses = (level: number): string => {
    const headingClasses = {
        1: "text-3xl leading-9 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 font-extrabold tracking-tight",
        2: "text-2xl leading-8 sm:text-3xl sm:leading-9 md:text-4xl md:leading-10 font-bold tracking-tight",
        3: "text-xl leading-7 sm:text-2xl sm:leading-8 md:text-3xl md:leading-9 font-bold tracking-tight",
        4: "text-lg leading-6 sm:text-xl sm:leading-7 md:text-2xl md:leading-8 font-semibold tracking-tight",
        5: "text-base leading-6 sm:text-lg sm:leading-6 md:text-xl md:leading-7 font-semibold tracking-tight",
        6: "text-base leading-6 font-medium tracking-tight",
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