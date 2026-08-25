import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { v4 as uuidv4 } from "uuid";
import {
    CODE_BLOCK_LANGUAGES,
    CODE_LANGUAGE_ALIASES,
} from "@/block-note/code-block-languages";
import type { LocalBlock } from "@/block-note/schema";

export class UnresolvedImagePathsError extends Error {
    readonly paths: string[];

    constructor(paths: string[]) {
        const unique = [...new Set(paths)];
        super(
            `Unresolved relative image paths: ${unique.join(", ")}. Upload assets first and rewrite to /images/{filename}.`
        );
        this.name = "UnresolvedImagePathsError";
        this.paths = unique;
    }
}

export type MarkdownToBlocksOptions = {
    /** Drop the first heading if it is H1 and its plain text equals this title. */
    title?: string;
};

type LooseBlock = {
    id?: string;
    type: string;
    props?: Record<string, unknown>;
    content?: unknown;
    children?: LooseBlock[];
};

/** BlockNote's LocalBlock is a large union; imported JSON only needs a compatible shape. */
function toLocalBlock(block: LooseBlock & { id: string }): LocalBlock {
    return block as unknown as LocalBlock;
}

function isRelativeImageSrc(src: string): boolean {
    if (!src) return true;
    if (src.startsWith("/")) return false;
    if (/^https?:\/\//i.test(src)) return false;
    return true;
}

/** Map markdown fence language to a codeBlock language id stored in article content. */
export function resolveStoredCodeLanguage(language: string): string {
    const normalized = language.trim().toLowerCase();
    if (!normalized) return "text";
    if (normalized in CODE_BLOCK_LANGUAGES) return normalized;
    const aliased = CODE_LANGUAGE_ALIASES[normalized];
    if (aliased) return aliased;
    return "text";
}

function isMermaidLanguage(language: string): boolean {
    const normalized = language.trim().toLowerCase();
    return normalized === "mermaid" || normalized === "mmd";
}

function isSvgLanguage(language: string): boolean {
    return language.trim().toLowerCase() === "svg";
}

function inlineText(content: unknown): string {
    if (!Array.isArray(content)) return "";
    return content
        .map((item) => {
            if (
                item &&
                typeof item === "object" &&
                "type" in item &&
                (item as { type: string }).type === "text" &&
                "text" in item
            ) {
                return String((item as { text: unknown }).text ?? "");
            }
            return "";
        })
        .join("");
}

function plainTextFromContent(content: unknown): string {
    if (!Array.isArray(content)) return "";
    return content
        .map((item) => {
            if (!item || typeof item !== "object") return "";
            const node = item as {
                type?: string;
                text?: string;
                content?: unknown;
            };
            if (node.type === "text") return node.text ?? "";
            if (node.type === "link") return plainTextFromContent(node.content);
            return "";
        })
        .join("");
}

function toEnhancedImage(block: LooseBlock): LocalBlock {
    const props = block.props ?? {};
    const src = String(props.url ?? "");
    const name = String(props.name ?? "").trim();
    const caption = String(props.caption ?? "").trim();
    const alt = name || caption;
    const finalCaption = caption || name;

    return toLocalBlock({
        id: block.id ?? uuidv4(),
        type: "enhancedImage",
        props: {
            src,
            alt,
            caption: finalCaption,
            width: "800",
            height: "600",
            source: src.startsWith("/images/") ? "upload" : "url",
            alignment: "center",
            objectFit: "cover",
            maxWidth: "100%",
        },
        content: undefined,
        children: [],
    });
}

function toMermaid(block: LooseBlock): LocalBlock {
    return toLocalBlock({
        id: block.id ?? uuidv4(),
        type: "mermaid",
        props: {
            code: inlineText(block.content),
            mode: "preview",
            theme: "default",
        },
        content: undefined,
        children: [],
    });
}

function toSvg(block: LooseBlock): LocalBlock {
    return toLocalBlock({
        id: block.id ?? uuidv4(),
        type: "svg",
        props: {
            code: inlineText(block.content),
        },
        content: undefined,
        children: [],
    });
}

function remapCodeBlock(block: LooseBlock): LocalBlock {
    const language = String(block.props?.language ?? "");
    if (isMermaidLanguage(language)) {
        return toMermaid(block);
    }
    if (isSvgLanguage(language)) {
        return toSvg(block);
    }
    return toLocalBlock({
        ...block,
        id: block.id ?? uuidv4(),
        props: {
            ...block.props,
            language: resolveStoredCodeLanguage(language),
        },
        children: (block.children ?? []).map(remapBlock),
    });
}

function remapBlock(block: LooseBlock): LocalBlock {
    if (block.type === "image") {
        return toEnhancedImage(block);
    }
    if (block.type === "codeBlock") {
        return remapCodeBlock(block);
    }
    return toLocalBlock({
        ...block,
        id: block.id ?? uuidv4(),
        children: (block.children ?? []).map(remapBlock),
    });
}

function collectUnresolvedImagePaths(
    blocks: LooseBlock[],
    out: string[] = []
): string[] {
    for (const block of blocks) {
        if (block.type === "image") {
            const src = String(block.props?.url ?? "");
            if (isRelativeImageSrc(src)) out.push(src || "(empty)");
        }
        if (block.children?.length) {
            collectUnresolvedImagePaths(block.children, out);
        }
    }
    return out;
}

function dropMatchingTitleHeading(
    blocks: LocalBlock[],
    title: string
): LocalBlock[] {
    if (!title || blocks.length === 0) return blocks;
    const first = blocks[0] as LooseBlock;
    if (first.type !== "heading") return blocks;
    const level = Number(first.props?.level ?? 0);
    if (level !== 1) return blocks;
    if (plainTextFromContent(first.content).trim() !== title.trim()) {
        return blocks;
    }
    return blocks.slice(1);
}

let editorSingleton: ServerBlockNoteEditor | null = null;

function getEditor(): ServerBlockNoteEditor {
    if (!editorSingleton) {
        // Default schema keeps BlockNote's image + codeBlock so markdown images
        // and fences parse; remapToLocalBlocks maps them to CMS block types.
        editorSingleton = ServerBlockNoteEditor.create();
    }
    return editorSingleton;
}

/**
 * Parse markdown into CMS LocalBlock JSON via BlockNote's default schema,
 * then remap image → enhancedImage and mermaid/svg fences → custom blocks.
 */
export async function markdownToBlocks(
    md: string,
    options: MarkdownToBlocksOptions = {}
): Promise<LocalBlock[]> {
    const editor = getEditor();
    const parsed = (await editor.tryParseMarkdownToBlocks(
        md
    )) as unknown as LooseBlock[];

    const unresolved = collectUnresolvedImagePaths(parsed);
    if (unresolved.length > 0) {
        throw new UnresolvedImagePathsError(unresolved);
    }

    let blocks = parsed.map(remapBlock);
    if (options.title) {
        blocks = dropMatchingTitleHeading(blocks, options.title);
    }
    return blocks;
}
