/**
 * Light SSR-safe SVG scrub (no DOMPurify Window).
 * Strips script tags and inline event handlers / javascript: URLs.
 */
export function stripSvgForRaster(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed || !/<svg[\s>]/i.test(trimmed)) return null;

    let out = trimmed.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    out = out.replace(
        /\s(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi,
        ""
    );
    if (!/<svg[\s>]/i.test(out)) return null;
    return out;
}
