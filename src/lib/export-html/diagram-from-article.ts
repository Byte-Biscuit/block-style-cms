import { articleService } from "@/lib/services/article-service";
import { mermaidCodeToPngBuffer, svgMarkupToPngBuffer } from "./diagram-to-png";
import { absolutizeUrl } from "./resolve-base-url";
import { tableBlockToPngBuffer } from "./table-to-png";

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

export type DiagramBlockRef = {
    articleId: string;
    blockId: string;
};

type LooseBlock = {
    id?: string;
    type?: string;
    props?: Record<string, unknown>;
    content?: unknown;
    children?: LooseBlock[];
};

export function isSafeDiagramId(id: string): boolean {
    return ID_RE.test(id);
}

/** `/export/diagram/{articleId}/{blockId}.png` — ids only, no source in URL. */
export function diagramBlockToPngUrl(
    articleId: string,
    blockId: string,
    baseUrl: string
): string {
    if (!isSafeDiagramId(articleId) || !isSafeDiagramId(blockId)) {
        throw new Error("Invalid diagram id");
    }
    return absolutizeUrl(
        `/export/diagram/${articleId}/${blockId}.png`,
        baseUrl
    );
}

export function findBlockById(
    blocks: LooseBlock[] | undefined,
    blockId: string
): LooseBlock | null {
    if (!blocks?.length) return null;
    for (const block of blocks) {
        if (block.id === blockId) return block;
        const nested = findBlockById(block.children, blockId);
        if (nested) return nested;
    }
    return null;
}

function codeFromBlock(block: LooseBlock): string {
    const fromProps = block.props?.code;
    if (typeof fromProps === "string" && fromProps.trim()) return fromProps;
    return "";
}

/**
 * Load article + block server-side, rasterize mermaid/svg/table in memory.
 * Rejects unknown ids / non-diagram blocks (no client-supplied source).
 */
export async function renderDiagramBlockPng(
    articleId: string,
    blockId: string
): Promise<Buffer> {
    const cleanArticleId = articleId.replace(/\.png$/i, "");
    const cleanBlockId = blockId.replace(/\.png$/i, "");
    if (!isSafeDiagramId(cleanArticleId) || !isSafeDiagramId(cleanBlockId)) {
        throw new Error("Invalid diagram id");
    }

    const article = await articleService.getArticle(cleanArticleId);
    if (!article) throw new Error("Article not found");

    const block = findBlockById(
        article.content as LooseBlock[] | undefined,
        cleanBlockId
    );
    if (!block) throw new Error("Block not found");

    if (block.type === "table") {
        return tableBlockToPngBuffer(block.content);
    }

    const code = codeFromBlock(block).trim();
    if (!code) throw new Error("Empty diagram code");

    if (block.type === "mermaid") {
        return mermaidCodeToPngBuffer(code);
    }
    if (block.type === "svg") {
        return svgMarkupToPngBuffer(code);
    }
    throw new Error("Block is not a diagram");
}
