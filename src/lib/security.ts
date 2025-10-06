/**
 * Sanitize a string to prevent XSS attacks by escaping special HTML characters.
 * @param content 
 * @returns 
 */
export const sanitize = (content: string | null | undefined): string | null => {
    if (!content) return null;
    return content.replace(/[<>&"']/g, (match) => {
        const escapeMap: Record<string, string> = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;",
            "'": "&#x27;",
        };
        return escapeMap[match] || match;
    });
}