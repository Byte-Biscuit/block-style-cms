/**
 * Font stack for SVG → PNG (sharp/librsvg).
 * ponytail: CJK must come first — librsvg picks the primary face and does
 * not per-glyph fall through to later families, so "DejaVu Sans, Noto CJK"
 * renders Chinese as .notdef tofu boxes. Noto Sans CJK covers Latin too.
 */
export const EXPORT_SVG_FONT =
    "Noto Sans CJK SC, WenQuanYi Micro Hei, Noto Sans CJK TC, DejaVu Sans, sans-serif";
