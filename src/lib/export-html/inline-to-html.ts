import { escapeAttr, escapeHtml } from "./html-escape";

type Styles = {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
};

type InlineItem = {
    type?: string;
    text?: string;
    styles?: Styles;
    href?: string;
    content?: InlineItem[];
    props?: { text?: string; latex?: string };
};

export type InlineToHtmlOptions = {
    /** When true: omit `<code>` wrappers (keep escaped text). */
    stripCode?: boolean;
};

function wrapStyles(
    html: string,
    styles: Styles | undefined,
    stripCode: boolean
): string {
    if (!styles) return html;
    let out = html;
    if (styles.code && !stripCode) out = `<code>${out}</code>`;
    if (styles.bold) out = `<strong>${out}</strong>`;
    if (styles.italic) out = `<em>${out}</em>`;
    if (styles.strike) out = `<s>${out}</s>`;
    if (styles.underline) out = `<u>${out}</u>`;
    return out;
}

/** Serialize BlockNote inline content to plain semantic HTML. */
export function inlineToHtml(
    items: InlineItem[] | undefined | null,
    opts?: InlineToHtmlOptions
): string {
    if (!items?.length) return "";
    const stripCode = opts?.stripCode === true;
    return items
        .map((item) => {
            if (!item) return "";
            if (item.type === "text") {
                return wrapStyles(
                    escapeHtml(item.text ?? ""),
                    item.styles,
                    stripCode
                );
            }
            if (item.type === "link") {
                const href = escapeAttr(item.href ?? "");
                const inner = inlineToHtml(item.content, opts);
                if (!href) return inner;
                return `<a href="${href}">${inner}</a>`;
            }
            if (item.type === "math") {
                const latex =
                    item.props?.latex ?? item.props?.text ?? item.text ?? "";
                const escaped = escapeHtml(latex);
                return stripCode ? escaped : `<code>${escaped}</code>`;
            }
            return "";
        })
        .join("");
}

export type { InlineItem };
