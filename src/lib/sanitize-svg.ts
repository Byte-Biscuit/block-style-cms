import DOMPurify from "dompurify";

const HAS_SVG_ROOT = /<svg[\s>]/i;

type Purify = {
    sanitize: (
        dirty: string,
        cfg?: {
            USE_PROFILES?: { svg?: boolean; svgFilters?: boolean };
            RETURN_DOM?: boolean;
        }
    ) => string;
};

function hasSanitize(value: unknown): value is Purify {
    if (value === null || typeof value === "undefined") return false;
    return typeof (value as unknown as Purify).sanitize === "function";
}

/**
 * DOMPurify's ESM default is `createDOMPurify()`. With no Window (Next SSR)
 * that returns a factory, not `{ sanitize }`. Next then reads `.default.sanitize`.
 */
function resolveDOMPurify(): Purify | null {
    const imported = DOMPurify as unknown as Purify & {
        default?: Purify | ((root: Window) => Purify);
    };

    let instance: unknown =
        typeof imported.sanitize === "function"
            ? imported
            : (imported.default ?? imported);

    if (typeof instance === "function" && !hasSanitize(instance)) {
        if (typeof window === "undefined") return null;
        instance = (instance as (root: Window) => unknown)(window);
    }

    return hasSanitize(instance) ? instance : null;
}

/**
 * Sanitize SVG markup for safe injection. Strips script, event handlers,
 * and javascript: URLs via DOMPurify's SVG profile.
 * Returns null when the result has no <svg> root, or when purify is unavailable (SSR).
 */
export function sanitizeSvg(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const purify = resolveDOMPurify();
    if (!purify) return null;

    const clean = purify.sanitize(trimmed, {
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
