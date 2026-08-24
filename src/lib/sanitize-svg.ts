import DOMPurify from "dompurify";

const HAS_SVG_ROOT = /<svg[\s>]/i;

/**
 * Sanitize SVG markup for safe injection. Strips script, event handlers,
 * and javascript: URLs via DOMPurify's SVG profile.
 * Returns null when the result has no <svg> root.
 */
export function sanitizeSvg(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const clean = DOMPurify.sanitize(trimmed, {
        USE_PROFILES: { svg: true, svgFilters: true },
        RETURN_DOM: false,
    });

    if (typeof clean !== "string" || !HAS_SVG_ROOT.test(clean)) {
        return null;
    }
    return clean;
}

/** True when sanitizeSvg would accept this markup. */
export function isValidSvgMarkup(raw: string): boolean {
    return sanitizeSvg(raw) !== null;
}
