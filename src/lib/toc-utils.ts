import type { BlockData, TextContent, LinkContent } from "@/components/block-note/meta";

export interface TocItem {
    id: string;
    text: string;
    level: number; // 1-6 for h1-h6
}

/**
 * Extract table of contents from BlockNote content
 * @param content BlockNote content array
 * @returns Array of TOC items
 */
export function extractToc(content: BlockData[]): TocItem[] {
    const toc: TocItem[] = [];
    // Start from 2 to avoid conflict with article title and summary
    let headingIndex = 2;
    function traverse(blocks: BlockData[]) {
        for (const block of blocks) {
            // Check if block is a heading
            if (block.type === "heading" && block.content) {
                const level = (block.props?.level as number) || 1;
                const text = extractTextFromContent(block.content);
                if (text) {
                    // Generate unique ID for the heading
                    const id = generateHeadingId(level, headingIndex++);
                    toc.push({ id, text, level });
                }
            }

            // Recursively traverse children
            if (block.children && block.children.length > 0) {
                traverse(block.children);
            }
        }
    }

    traverse(content);
    return toc;
}

export function isLinkContent(item: TextContent | LinkContent): item is LinkContent {
    return "content" in item && Array.isArray(item.content);
}

export function extractTextFromContent(
    content: Array<TextContent | LinkContent>
): string {
    return content
        .map((item) => {
            if (isLinkContent(item)) {
                return extractTextFromContent(item.content);
            }
            return item.text || "";
        })
        .join("")
        .trim();
}

/**
 * Generate URL-friendly ID from heading text
 */
export function generateHeadingId(level: number, index: number): string {
    return `h${level}-${index}`;
}