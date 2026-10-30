import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { v4 as uuidv4 } from "uuid";
import type { LocalBlock } from "@/block-note/schema";
import { systemConfigService } from "@/lib/services/system-config-service";

type LooseBlock = {
    id?: string;
    type: string;
    props?: Record<string, unknown>;
    content?: unknown;
    children?: LooseBlock[];
};

export type NormalizeImageSrcOptions = {
    /** Site base URL (no trailing slash). Used to absolutize /images/ paths. */
    baseUrl?: string;
};

/**
 * Markdown export image src rules:
 * - http(s) absolute URLs stay as-is (displayable; SDK skips re-upload)
 * - /images/{filename} → {baseUrl}/images/{filename} so exported MD can render
 */
export function normalizeImageSrcForMarkdown(
    src: string,
    options: NormalizeImageSrcOptions = {}
): string {
    const s = src.trim();
    if (!s) return s;
    if (/^https?:\/\//i.test(s)) {
        return s;
    }
    if (s.startsWith("/images/")) {
        const pathOnly = s.split("?")[0];
        const base = (options.baseUrl ?? "").replace(/\/+$/, "");
        return base ? `${base}${pathOnly}` : pathOnly;
    }
    return s;
}

function textContent(text: string): Array<{ type: "text"; text: string; styles: Record<string, never> }> {
    return [{ type: "text", text, styles: {} }];
}

function fromEnhancedImage(
    block: LooseBlock,
    options: NormalizeImageSrcOptions
): LooseBlock {
    const props = block.props ?? {};
    const src = normalizeImageSrcForMarkdown(
        String(props.src ?? ""),
        options
    );
    const caption = String(props.caption ?? props.alt ?? "").trim();
    return {
        id: block.id ?? uuidv4(),
        type: "image",
        props: {
            url: src,
            caption,
            name: caption,
            showPreview: true,
            previewWidth: 512,
        },
        children: [],
    };
}

function fromMermaid(block: LooseBlock): LooseBlock {
    const code = String(block.props?.code ?? "");
    return {
        id: block.id ?? uuidv4(),
        type: "codeBlock",
        props: { language: "mermaid" },
        content: textContent(code),
        children: [],
    };
}

function fromSvg(block: LooseBlock): LooseBlock {
    const code = String(block.props?.code ?? "");
    return {
        id: block.id ?? uuidv4(),
        type: "codeBlock",
        props: { language: "svg" },
        content: textContent(code),
        children: [],
    };
}

/** Remap CMS LocalBlock types back to BlockNote default schema for markdown export. */
export function remapToExportBlocks(
    blocks: LooseBlock[],
    options: NormalizeImageSrcOptions = {}
): LooseBlock[] {
    return blocks.map((block) => {
        if (block.type === "enhancedImage") {
            return fromEnhancedImage(block, options);
        }
        if (block.type === "mermaid") {
            return fromMermaid(block);
        }
        if (block.type === "svg") {
            return fromSvg(block);
        }
        return {
            ...block,
            id: block.id ?? uuidv4(),
            children: block.children?.length
                ? remapToExportBlocks(block.children, options)
                : block.children,
        };
    });
}

let editorSingleton: ServerBlockNoteEditor | null = null;

function getEditor(): ServerBlockNoteEditor {
    if (!editorSingleton) {
        editorSingleton = ServerBlockNoteEditor.create();
    }
    return editorSingleton;
}

async function resolveSiteBaseUrl(explicit?: string): Promise<string> {
    if (explicit?.trim()) {
        return explicit.trim().replace(/\/+$/, "");
    }
    const config = await systemConfigService.readConfig();
    return (config?.siteInfo?.baseUrl ?? "").replace(/\/+$/, "");
}

/**
 * Export CMS LocalBlock JSON to markdown (lossy via BlockNote).
 * Embedded / uploaded images use absolute http(s) URLs when possible.
 */
export async function blocksToMarkdown(
    blocks: LocalBlock[] | LooseBlock[],
    options: NormalizeImageSrcOptions = {}
): Promise<string> {
    const baseUrl = await resolveSiteBaseUrl(options.baseUrl);
    const editor = getEditor();
    const exportBlocks = remapToExportBlocks(blocks as LooseBlock[], {
        baseUrl,
    });
    return editor.blocksToMarkdownLossy(
        exportBlocks as Parameters<
            typeof editor.blocksToMarkdownLossy
        >[0]
    );
}
