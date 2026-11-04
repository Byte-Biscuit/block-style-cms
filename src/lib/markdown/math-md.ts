import { v4 as uuidv4 } from "uuid";
import { latexFromPlainContent } from "@/lib/latex-utils";

/** Fence language used as a bridge for mathBlock ↔ $$ (default schema has no math). */
export const MATH_FENCE_LANGUAGE = "math";

type LooseInline =
    | { type: "text"; text: string; styles?: Record<string, unknown> }
    | { type: "link"; href?: string; content?: LooseInline[] }
    | { type: "math"; content?: unknown; props?: Record<string, unknown> }
    | { type: string; [key: string]: unknown };

type LooseBlock = {
    id?: string;
    type: string;
    props?: Record<string, unknown>;
    content?: unknown;
    children?: LooseBlock[];
};

function textNode(text: string): {
    type: "text";
    text: string;
    styles: Record<string, never>;
} {
    return { type: "text", text, styles: {} };
}

/** Remap mathBlock → codeBlock(language=math) for default-schema MD export. */
export function fromMathBlock(block: LooseBlock): LooseBlock {
    const latex = latexFromPlainContent(block.content);
    return {
        id: block.id ?? uuidv4(),
        type: "codeBlock",
        props: { language: MATH_FENCE_LANGUAGE },
        content: [textNode(latex)],
        children: [],
    };
}

/** Remap codeBlock(language=math) → mathBlock after default-schema MD parse. */
export function toMathBlock(block: LooseBlock): LooseBlock {
    return {
        id: block.id ?? uuidv4(),
        type: "mathBlock",
        props: {},
        content: latexFromPlainContent(block.content),
        children: [],
    };
}

export function isMathFenceLanguage(language: string): boolean {
    return language.trim().toLowerCase() === MATH_FENCE_LANGUAGE;
}

/**
 * Inline math → `$latex$` text so default BlockNote can serialize it.
 * Links are walked recursively.
 */
export function remapInlineMathToText(content: unknown): unknown {
    if (!Array.isArray(content)) return content;
    const out: LooseInline[] = [];
    for (const item of content as LooseInline[]) {
        if (item?.type === "math") {
            const latex = latexFromPlainContent(item.content).trim();
            out.push(textNode(latex ? `$${latex}$` : ""));
            continue;
        }
        if (item?.type === "link" && Array.isArray(item.content)) {
            out.push({
                ...item,
                content: remapInlineMathToText(item.content) as LooseInline[],
            });
            continue;
        }
        out.push(item);
    }
    return out;
}

/**
 * Split plain-text `$...$` (not `$$`) into text + math + text nodes.
 * ponytail: same delimiter convention as BlockNote; currency false positives accepted.
 * Skip inline `code` text — tutorials document `$` / `$$` inside backticks.
 */
export function splitInlineMathFromText(content: unknown): unknown {
    if (!Array.isArray(content)) return content;
    const out: LooseInline[] = [];
    const re = /(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g;

    for (const item of content as LooseInline[]) {
        if (item?.type === "link" && Array.isArray(item.content)) {
            out.push({
                ...item,
                content: splitInlineMathFromText(item.content) as LooseInline[],
            });
            continue;
        }
        if (item?.type !== "text" || typeof item.text !== "string") {
            out.push(item);
            continue;
        }
        if ((item as { styles?: { code?: boolean } }).styles?.code) {
            out.push(item);
            continue;
        }

        const text = item.text;
        let last = 0;
        for (const match of text.matchAll(re)) {
            if (match.index > last) {
                out.push({
                    ...item,
                    text: text.slice(last, match.index),
                });
            }
            out.push({
                type: "math",
                props: {},
                content: match[1],
            });
            last = match.index + match[0].length;
        }
        if (last === 0) {
            out.push(item);
        } else if (last < text.length) {
            out.push({ ...item, text: text.slice(last) });
        }
    }
    return out;
}

/**
 * Before default-schema parse: turn `$$...$$` display math into ```math fences.
 * Inline `$...$` stays as text and is split after parse.
 * Skip fenced + inline code so tutorials can document `$$` / `$` literally.
 */
export function preprocessMathMarkdown(md: string): string {
    const saved: string[] = [];
    const shield = (chunk: string) => {
        saved.push(chunk);
        return `\0CODE${saved.length - 1}\0`;
    };
    // Fences first, then inline `code` (non-greedy, no newlines).
    const shielded = md
        .replace(/```[\s\S]*?```/g, shield)
        .replace(/`[^`\n]+`/g, shield);
    const converted = shielded.replace(
        /\$\$([\s\S]+?)\$\$/g,
        (_full, body: string) => {
            const latex = body.replace(/^\n+|\n+$/g, "");
            return `\n\`\`\`${MATH_FENCE_LANGUAGE}\n${latex}\n\`\`\`\n`;
        }
    );
    return converted.replace(/\0CODE(\d+)\0/g, (_full, index: string) => {
        return saved[Number(index)] ?? "";
    });
}

/**
 * After default-schema export: turn ```math fences back into `$$...$$`.
 */
export function postprocessMathMarkdown(md: string): string {
    return md.replace(/```math\n([\s\S]*?)```/g, (_full, body: string) => {
        const latex = body.replace(/\n$/, "");
        return `$$\n${latex}\n$$`;
    });
}
