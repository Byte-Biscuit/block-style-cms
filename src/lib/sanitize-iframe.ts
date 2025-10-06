import { parse } from "node-html-parser";

/**
 * Clean iframe HTML using node-html-parser and force the iframe to fill its parent:
 * - Remove iframe width / height attributes
 * - Remove width / height declarations from the iframe's inline style
 * - Append enforced styles: display:block; width:100%; height:100%; position:absolute; inset:0; border:none; border-radius:0;
 *
 * This utility is intended for server-side (Node) use only. Do not import it into client bundles
 * to avoid increasing browser bundle size.
 */
export function sanitizeIframeHtml(html: string): string {
    const root = parse(html, { comment: true });

    const iframes = root.querySelectorAll("iframe");
    iframes.forEach((el) => {
        // Remove width/height attributes
        el.removeAttribute("width");
        el.removeAttribute("height");

        // Parse the inline style and filter out width/height declarations
        const rawStyle = (el.getAttribute("style") || "").trim();
        const styleEntries = rawStyle
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => {
                const idx = s.indexOf(":");
                if (idx === -1) return null;
                const k = s.slice(0, idx).trim().toLowerCase();
                const v = s.slice(idx + 1).trim();
                return { k, v };
            })
            .filter(Boolean) as { k: string; v: string }[];

        const filtered = styleEntries.filter(
            ({ k }) => k !== "width" && k !== "height"
        );

        // Enforced styles appended last so they override any duplicated properties
        const enforced = [
            "display:block",
            "width:100%",
            "height:100%",
            "position:absolute",
            "inset:0",
            "border:none",
            "border-radius:0",
        ];

        const newStyle =
            filtered.map(({ k, v }) => `${k}:${v}`).concat(enforced).join(";") +
            ";";

        el.setAttribute("style", newStyle);
    });

    return root.toString();
}