/**
 * The index signature [key: string]: unknown allows the interface to include any additional, undeclared string key properties, 
 * with the type of these properties being unknown (which must be narrowed down in type before use). 
 * It provides greater flexibility to the interface but also requires type checking of dynamic properties to ensure safe usage.
 */
export interface BaseBlockProps {
    textColor?: keyof typeof twColorMap | "default";
    backgroundColor?: keyof typeof twColorMap | "default";
    textAlignment?: "left" | "center" | "right";
    [key: string]: unknown;
}

export interface BlockData<T extends string = string> {
    id: string;
    type: T;
    props?: BaseBlockProps;
    content?: (TextContent | LinkContent)[];
    children?: BlockData[];
}
// All blocknote editor color types
export const twColorMap = {
    gray: { textClass: "text-gray-400", bgClass: "bg-gray-200", textHex: "#9b9a97", bgHex: "#ebeced" },
    brown: { textClass: "text-stone-700", bgClass: "bg-stone-100", textHex: "#64473a", bgHex: "#e9e5e3" },
    red: { textClass: "text-red-600", bgClass: "bg-red-100", textHex: "#e03e3e", bgHex: "#fbe4e4" },
    orange: { textClass: "text-orange-600", bgClass: "bg-orange-100", textHex: "#d9730d", bgHex: "#f6e9d9" },
    yellow: { textClass: "text-yellow-600", bgClass: "bg-yellow-100", textHex: "#dfab01", bgHex: "#fbf3db" },
    green: { textClass: "text-teal-700", bgClass: "bg-teal-100", textHex: "#4d6461", bgHex: "#ddedea" },
    blue: { textClass: "text-sky-700", bgClass: "bg-sky-100", textHex: "#0b6e99", bgHex: "#ddebf1" },
    purple: { textClass: "text-violet-600", bgClass: "bg-violet-100", textHex: "#6940a5", bgHex: "#eae4f2" },
    pink: { textClass: "text-pink-600", bgClass: "bg-pink-100", textHex: "#ad1a72", bgHex: "#f4dfeb" },
} as const;

// From blocknote core
export type BasicTextStyle = "bold" | "italic" | "underline" | "strike" | "code";
export const textStyleTwMap: Record<BasicTextStyle, string | undefined> = {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strike: "line-through",
    code: "font-mono bg-gray-100 px-1 rounded",
};

export interface TextContent {
    type: "text";
    text: string;
    styles: Partial<Record<BasicTextStyle, boolean>> & {
        textColor?: keyof typeof twColorMap | "default";
        backgroundColor?: keyof typeof twColorMap | "default";
    };
}

export interface LinkContent {
    type: "link";
    href: string;
    content: TextContent[];
}