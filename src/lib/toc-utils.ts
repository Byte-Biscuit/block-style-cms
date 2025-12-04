import type { LocalBlock as Block } from "@/block-note/schema";
import type { InlineContent, Link, StyledText } from "@blocknote/core";
import { schema } from "@/block-note/schema";

// Infer the InlineContent and StyleSchema types from our custom schema
type SchemaInlineContent = InlineContent<
    typeof schema.inlineContentSchema,
    typeof schema.styleSchema
>;

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
export function extractToc(content: Block[]): TocItem[] {
    const toc: TocItem[] = [];
    // Start from 2 to avoid conflict with article title and summary
    let headingIndex = 2;
    function traverse(blocks: Block[]) {
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

/**
 * Type guard to check if inline content is a Link type
 */
export function isLinkContent(
    item: SchemaInlineContent
): item is Link<typeof schema.styleSchema> {
    return item.type === "link" && "content" in item && Array.isArray(item.content);
}

/**
 * Type guard to check if inline content is a StyledText type
 */
export function isStyledTextContent(
    item: SchemaInlineContent
): item is StyledText<typeof schema.styleSchema> {
    return item.type === "text" && "text" in item;
}

/**
 * Extract plain text from BlockNote inline content array
 * @param content Array of inline content items
 * @returns Extracted plain text
 */
export function extractTextFromContent(
    content: SchemaInlineContent[]
): string {
    return content
        .map((item) => {
            if (isLinkContent(item)) {
                // Recursively extract text from link content
                return extractTextFromContent(item.content);
            }
            if (isStyledTextContent(item)) {
                return item.text;
            }
            return "";
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