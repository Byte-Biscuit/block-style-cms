/**
 * Pull LaTeX source from BlockNote plain content (mathBlock / inline math).
 * Plain content may be a string or a text-node array depending on serialization.
 */
export function latexFromPlainContent(content: unknown): string {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content
        .map((item) => {
            if (typeof item === "string") return item;
            if (
                item &&
                typeof item === "object" &&
                "text" in item &&
                typeof (item as { text: unknown }).text === "string"
            ) {
                return (item as { text: string }).text;
            }
            return "";
        })
        .join("");
}
