import { diagramBlockToPngUrl } from "./diagram-from-article";
import { escapeAttr, escapeHtml } from "./html-escape";
import { type InlineItem, inlineToHtml } from "./inline-to-html";
import { absolutizeUrl } from "./resolve-base-url";

/** Loose BlockNote-like block for channel HTML export. */
export type ExportBlock = {
    id?: string;
    type: string;
    props?: Record<string, unknown>;
    content?: unknown;
    children?: ExportBlock[];
};

export type BlocksToHtmlOptions = {
    baseUrl: string;
    /** Required for mermaid/svg/table → `/export/diagram/{articleId}/{blockId}.png`. */
    articleId?: string;
    /**
     * When true: drop body H1; map H2→h3, H3+→h4
     * (page shell owns title/subtitle as h1/h2). Default false.
     */
    demoteHeadingsForShell?: boolean;
    /**
     * When true: nested lists become paragraphs + sibling lists
     * (for importers that break on nested ol/ul). Default false.
     */
    flattenNestedLists?: boolean;
    /** When true: omit `<hr />` for divider blocks. Default false. */
    stripDividers?: boolean;
    /**
     * When true: headings and quotes render inline code as plain text
     * (no `<code>` tags). Default false.
     */
    stripCodeInHeadingsAndQuotes?: boolean;
    /**
     * When true: tables become PNG figures via `/export/diagram/...`,
     * or a structured `<ul>` when articleId/block.id is missing. Default false.
     */
    rasterizeTables?: boolean;
    /**
     * When true: rewrite site-hosted `/images/*.webp|*.avif` to
     * `.webp.jpg` / `.avif.jpg` aliases. Default false.
     */
    preferStandardRasterImages?: boolean;
    /** Override diagram URL builder (tests). */
    diagramBlockUrl?: (
        articleId: string,
        blockId: string,
        block: ExportBlock
    ) => string | null;
};

function isStaticRasterUrl(src: string): boolean {
    if (!src || /^data:/i.test(src)) return false;
    if (/\.svg(\?|#|$)/i.test(src)) return false;
    if (src.startsWith("/images/")) return true;
    if (/\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(src)) return true;
    return /^https?:\/\//i.test(src);
}

/** Site `/images/...webp|avif` → `.webp.jpg` / `.avif.jpg` for crawlers. */
export function preferJpegImageUrl(src: string): string {
    const trimmed = src.trim();
    if (!trimmed) return trimmed;
    try {
        const hasScheme = /^https?:\/\//i.test(trimmed);
        const u = hasScheme
            ? new URL(trimmed)
            : new URL(trimmed, "https://example.invalid");
        if (!/\/images\//i.test(u.pathname)) return trimmed;
        if (/\.(webp|avif)\.(jpe?g|png)$/i.test(u.pathname)) return trimmed;
        if (!/\.(webp|avif)$/i.test(u.pathname)) return trimmed;
        u.pathname = `${u.pathname}.jpg`;
        if (!hasScheme) {
            return `${u.pathname}${u.search}${u.hash}`;
        }
        return u.toString();
    } catch {
        if (
            /\/images\//i.test(trimmed) &&
            /\.(webp|avif)$/i.test(trimmed.split(/[?#]/)[0] ?? "")
        ) {
            const [pathPart, ...rest] = trimmed.split(/([?#].*)/);
            return `${pathPart}.jpg${rest.join("")}`;
        }
        return trimmed;
    }
}

function figureHtml(src: string, alt: string, caption?: string): string {
    const cap = caption?.trim();
    const figcaption = cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : "";
    return `<figure><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" />${figcaption}</figure>`;
}

function codeBlockHtml(code: string): string {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
}

function headingTagForLevel(
    level: number,
    demoteForShell: boolean
): "h1" | "h2" | "h3" | "h4" | null {
    if (demoteForShell) {
        if (level <= 1) return null;
        if (level === 2) return "h3";
        return "h4";
    }
    if (level <= 1) return "h1";
    if (level === 2) return "h2";
    if (level === 3) return "h3";
    return "h4";
}

function listItemHasNestedList(block: ExportBlock): boolean {
    return (block.children ?? []).some(
        (c) => c.type === "bulletListItem" || c.type === "numberedListItem"
    );
}

function nonListChildren(block: ExportBlock): ExportBlock[] {
    return (block.children ?? []).filter(
        (c) => c.type !== "bulletListItem" && c.type !== "numberedListItem"
    );
}

function nestedListChildren(block: ExportBlock): ExportBlock[] {
    return (block.children ?? []).filter(
        (c) => c.type === "bulletListItem" || c.type === "numberedListItem"
    );
}

function contentAsInline(content: unknown): InlineItem[] {
    if (!Array.isArray(content)) return [];
    return content as InlineItem[];
}

function codeFromBlock(block: ExportBlock): string {
    const fromProps = block.props?.code;
    if (typeof fromProps === "string" && fromProps.trim()) return fromProps;
    return contentAsInline(block.content)
        .map((i) => (i.type === "text" ? (i.text ?? "") : ""))
        .join("");
}

function cellInline(cell: unknown): InlineItem[] {
    if (
        cell &&
        typeof cell === "object" &&
        !Array.isArray(cell) &&
        (cell as { type?: string }).type === "tableCell"
    ) {
        return contentAsInline((cell as { content?: unknown }).content);
    }
    if (Array.isArray(cell)) return contentAsInline(cell);
    return [];
}

async function renderTableNative(block: ExportBlock): Promise<string> {
    const content = block.content as
        | { type?: string; rows?: Array<{ cells?: unknown[] }> }
        | undefined;
    const rows = content?.rows;
    if (!rows?.length) return "";

    const rowHtml = rows
        .map((row, rowIndex) => {
            const cells = row.cells ?? [];
            const cellTag = rowIndex === 0 ? "th" : "td";
            const cellsHtml = cells
                .map((cell) => {
                    const inline = cellInline(cell);
                    return `<${cellTag}>${inlineToHtml(inline) || "&nbsp;"}</${cellTag}>`;
                })
                .join("");
            return `<tr>${cellsHtml}</tr>`;
        })
        .join("");

    return `<table>${rowHtml}</table>`;
}

function renderTableAsList(block: ExportBlock): string {
    const content = block.content as
        | {
              type?: string;
              rows?: Array<{ cells?: unknown[] }>;
              headerRows?: number;
          }
        | undefined;
    const rows = content?.rows;
    if (!rows?.length) return "";

    const headerRows = Math.max(0, Number(content?.headerRows ?? 1) || 0);
    const headers =
        headerRows > 0
            ? (rows[0]?.cells ?? []).map(
                  (cell) => inlineToHtml(cellInline(cell)) || "Column"
              )
            : [];
    const dataRows = headerRows > 0 ? rows.slice(headerRows) : rows;
    if (!dataRows.length) return "";

    const items = dataRows.map((row) => {
        const cells = row.cells ?? [];
        const parts = cells.map((cell, i) => {
            const label = headers[i] || `Column ${i + 1}`;
            const value = inlineToHtml(cellInline(cell)) || "";
            return `<strong>${label}:</strong> ${value}`;
        });
        return `<li>${parts.join(" — ")}</li>`;
    });
    return `<ul>${items.join("")}</ul>`;
}

async function renderTable(
    block: ExportBlock,
    opts: BlocksToHtmlOptions
): Promise<string> {
    if (opts.rasterizeTables === true) {
        const url = diagramFigureUrl(block, opts);
        if (url) return figureHtml(url, "Table");
        return renderTableAsList(block);
    }
    return renderTableNative(block);
}

async function renderListGroup(
    items: ExportBlock[],
    listTag: "ul" | "ol",
    opts: BlocksToHtmlOptions,
    startIndex = 1
): Promise<string> {
    const flatten = opts.flattenNestedLists === true;
    const needsFlatten = flatten && items.some(listItemHasNestedList);

    if (!needsFlatten) {
        const lis: string[] = [];
        for (const item of items) {
            const text = inlineToHtml(contentAsInline(item.content));
            // Recurse all children so nested lists stay inside <li>.
            const extra = await blocksToHtml(item.children ?? [], opts);
            lis.push(`<li>${text}${extra}</li>`);
        }
        return `<${listTag}>${lis.join("")}</${listTag}>`;
    }

    const parts: string[] = [];
    let n = startIndex;
    for (const item of items) {
        const text = inlineToHtml(contentAsInline(item.content));
        const nested = nestedListChildren(item);
        const extra = await blocksToHtml(nonListChildren(item), opts);

        if (listTag === "ol" && nested.length > 0) {
            parts.push(`<p><strong>${n}. ${text}</strong></p>${extra}`);
            n += 1;
            const bullets = nested.filter((c) => c.type === "bulletListItem");
            const numbers = nested.filter((c) => c.type === "numberedListItem");
            if (bullets.length) {
                parts.push(await renderListGroup(bullets, "ul", opts));
            }
            if (numbers.length) {
                parts.push(await renderListGroup(numbers, "ol", opts));
            }
        } else if (nested.length > 0) {
            parts.push(`<p>${text}</p>${extra}`);
            const bullets = nested.filter((c) => c.type === "bulletListItem");
            const numbers = nested.filter((c) => c.type === "numberedListItem");
            if (bullets.length) {
                parts.push(await renderListGroup(bullets, "ul", opts));
            }
            if (numbers.length) {
                parts.push(await renderListGroup(numbers, "ol", opts));
            }
        } else if (listTag === "ol") {
            parts.push(`<p><strong>${n}. ${text}</strong></p>${extra}`);
            n += 1;
        } else {
            parts.push(`<p>${text}</p>${extra}`);
        }
    }
    return parts.join("");
}

async function renderDiagramFallback(
    kind: "mermaid" | "svg",
    source: string
): Promise<string> {
    return codeBlockHtml(kind === "mermaid" ? `mermaid\n${source}` : source);
}

function diagramFigureUrl(
    block: ExportBlock,
    opts: BlocksToHtmlOptions
): string | null {
    const blockId = block.id?.trim();
    const articleId = opts.articleId?.trim();
    if (!blockId || !articleId) return null;
    if (opts.diagramBlockUrl) {
        return opts.diagramBlockUrl(articleId, blockId, block);
    }
    return diagramBlockToPngUrl(articleId, blockId, opts.baseUrl);
}

async function renderMermaid(
    block: ExportBlock,
    opts: BlocksToHtmlOptions
): Promise<string> {
    const code = codeFromBlock(block).trim();
    if (!code) return "";
    try {
        const url = diagramFigureUrl(block, opts);
        if (!url) return renderDiagramFallback("mermaid", code);
        return figureHtml(url, "Mermaid diagram");
    } catch (err) {
        console.warn("[export-html] mermaid url build failed:", err);
        return renderDiagramFallback("mermaid", code);
    }
}

async function renderSvg(
    block: ExportBlock,
    opts: BlocksToHtmlOptions
): Promise<string> {
    const markup = codeFromBlock(block).trim();
    if (!markup) return "";
    try {
        const url = diagramFigureUrl(block, opts);
        if (!url) return renderDiagramFallback("svg", markup);
        return figureHtml(url, "Diagram");
    } catch (err) {
        console.warn("[export-html] svg url build failed:", err);
        return renderDiagramFallback("svg", markup);
    }
}

async function renderBlock(
    block: ExportBlock,
    opts: BlocksToHtmlOptions
): Promise<string> {
    const demote = opts.demoteHeadingsForShell === true;
    const stripCode = opts.stripCodeInHeadingsAndQuotes === true;

    switch (block.type) {
        case "paragraph": {
            const inner = inlineToHtml(contentAsInline(block.content));
            const kids = await blocksToHtml(block.children ?? [], opts);
            return `${inner ? `<p>${inner}</p>` : ""}${kids}`;
        }
        case "heading": {
            const level = Number(block.props?.level ?? 1);
            const tag = headingTagForLevel(level, demote);
            const inner = inlineToHtml(contentAsInline(block.content), {
                stripCode,
            });
            const kids = await blocksToHtml(block.children ?? [], opts);
            if (!tag) return kids;
            if (!inner) return kids;
            return `<${tag}>${inner}</${tag}>${kids}`;
        }
        case "quote": {
            const inner = inlineToHtml(contentAsInline(block.content), {
                stripCode,
            });
            const kids = await blocksToHtml(block.children ?? [], opts);
            return `<blockquote>${inner}${kids}</blockquote>`;
        }
        case "divider":
            return opts.stripDividers === true ? "" : "<hr />";
        case "codeBlock":
            return codeBlockHtml(codeFromBlock(block));
        case "enhancedImage": {
            const src = String(block.props?.url ?? block.props?.src ?? "");
            if (!src || !isStaticRasterUrl(src)) return "";
            let abs = absolutizeUrl(src, opts.baseUrl);
            if (/\.svg(\?|#|$)/i.test(abs) || /^data:/i.test(abs)) return "";
            if (opts.preferStandardRasterImages === true) {
                abs = preferJpegImageUrl(abs);
            }
            const alt = String(
                block.props?.alt ?? block.props?.caption ?? "Article image"
            );
            const caption = String(block.props?.caption ?? "");
            return figureHtml(abs, alt, caption);
        }
        case "mermaid":
            return renderMermaid(block, opts);
        case "svg":
            return renderSvg(block, opts);
        case "mathBlock": {
            const latex = String(
                block.props?.latex ?? block.props?.text ?? codeFromBlock(block)
            );
            return latex ? codeBlockHtml(latex) : "";
        }
        case "table":
            return renderTable(block, opts);
        case "enhancedVideo":
        case "enhancedAudio":
        case "enhancedFile": {
            const url = String(block.props?.url ?? block.props?.src ?? "");
            if (!url) return "";
            const abs = absolutizeUrl(url, opts.baseUrl);
            const name = String(
                block.props?.name ?? block.props?.caption ?? abs
            );
            return `<p><a href="${escapeAttr(abs)}">${escapeHtml(name)}</a></p>`;
        }
        case "bulletListItem":
        case "numberedListItem":
            return "";
        default:
            return "";
    }
}

/**
 * Convert BlockNote blocks to channel-oriented body HTML (no document shell).
 * Shared by Medium and other syndication exporters.
 */
export async function blocksToHtml(
    blocks: ExportBlock[] | undefined | null,
    opts: BlocksToHtmlOptions
): Promise<string> {
    if (!blocks?.length) return "";

    const out: string[] = [];
    let bulletGroup: ExportBlock[] = [];
    let numberedGroup: ExportBlock[] = [];

    const flushBullets = async () => {
        if (!bulletGroup.length) return;
        out.push(await renderListGroup(bulletGroup, "ul", opts));
        bulletGroup = [];
    };
    const flushNumbered = async () => {
        if (!numberedGroup.length) return;
        out.push(await renderListGroup(numberedGroup, "ol", opts));
        numberedGroup = [];
    };
    const flushAll = async () => {
        await flushBullets();
        await flushNumbered();
    };

    for (const block of blocks) {
        if (block.type === "bulletListItem") {
            await flushNumbered();
            bulletGroup.push(block);
            continue;
        }
        if (block.type === "numberedListItem") {
            await flushBullets();
            numberedGroup.push(block);
            continue;
        }
        await flushAll();
        out.push(await renderBlock(block, opts));
    }
    await flushAll();
    return out.filter(Boolean).join("\n");
}
