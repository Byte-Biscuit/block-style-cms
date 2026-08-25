/** `photos/my_photo-01.jpg?w=1` → `my photo 01`. Empty if nothing usable remains. */
export function labelFromFilename(value: string): string {
    const last = value.split(/[/\\]/).pop() ?? value;
    const noQuery = last.split("?")[0].split("#")[0];
    let decoded = noQuery;
    try {
        decoded = decodeURIComponent(noQuery);
    } catch {
        // ponytail: malformed % sequences stay as-is
    }
    return decoded
        .replace(/\.[A-Za-z0-9]{1,8}$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
