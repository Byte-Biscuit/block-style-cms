import React from "react";

import Heading from "./renderer/heading";
import Paragraph from "./renderer/paragraph";
import BulletListItem from "./renderer/bullet-list-item";
import CodeBlock from "./renderer/code-block";
import { type LocalBlock as Block } from "@/block-note/schema";
import EnhancedFile, { EnhancedFileBlockData } from "./renderer/enhanced-file";
import EnhancedImage, {
    EnhancedImageBlockData,
} from "./renderer/enhanced-image";
import EnhancedVideo, {
    EnhancedVideoBlockData,
} from "./renderer/enhanced-video";
import EnhancedAudio, {
    EnhancedAudioBlockData,
} from "./renderer/enhanced-audio";
import Mermaid, { MermaidBlockData } from "./renderer/mermaid";
import NumberedListItem, {
    type NumberedListBlock,
} from "./renderer/numbered-list-item";
import { type BulletListItemBlock } from "./renderer/bullet-list-item";
import Quote from "./renderer/quote";
import TableRender from "./renderer/table";
import Divider from "./renderer/divider";

// Bullet list style mapping: level 0 -> disc, 1 -> circle, 2 -> square
const BULLET_STYLES = [
    "list-disc",
    "list-[circle]",
    "list-[square]",
    "list-dash",
];

// Numbered list style mapping: level 0 -> decimal, 1 -> lower-alpha, 2 -> lower-roman
const NUMBER_STYLES = [
    "list-decimal",
    "list-decimal-paren",
    "list-[lower-alpha]",
    "list-[lower-roman]",
];

interface BlockRendererProps {
    block: Block;
    className?: string;
}

// ============================================================
// BlockRenderer - renderer for a single Block
// ============================================================

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    className = "",
}) => {
    /**
     * It's recommended to use block.type for branching so TypeScript
     * can narrow the block's type automatically.
     */
    // paragraph
    if (block.type === "paragraph") {
        return (
            <Paragraph
                block={block}
                className={`${className} mb-4 leading-relaxed`}
            />
        );
    }
    // code block
    if (block.type === "codeBlock") {
        const { props, content } = block;
        const { language } = props as { language: string };
        const codes =
            content
                ?.map((item) => (item.type === "text" ? item.text : ""))
                .filter(Boolean) || [];
        if (codes.length === 0) return null;
        const lang =
            language === "ts"
                ? "typescript"
                : language === "js"
                  ? "javascript"
                  : language;
        return <CodeBlock language={lang} code={codes.join("")} />;
    }
    // enhanced-file
    if (block.type === "enhancedFile") {
        return (
            <EnhancedFile
                data={block as EnhancedFileBlockData}
                className={className || undefined}
            />
        );
    }
    // enhanced-image
    if (block.type === "enhancedImage") {
        return <EnhancedImage data={block as EnhancedImageBlockData} />;
    }
    // enhanced-video
    if (block.type === "enhancedVideo") {
        return <EnhancedVideo data={block as EnhancedVideoBlockData} />;
    }
    // enhanced-audio
    if (block.type === "enhancedAudio") {
        return <EnhancedAudio data={block as EnhancedAudioBlockData} />;
    }
    // mermaid
    if (block.type === "mermaid") {
        return <Mermaid data={block as MermaidBlockData} />;
    }
    // quote
    if (block.type === "quote") {
        return <Quote block={block} className="mb-4 leading-relaxed!" />;
    }
    // divider
    if (block.type === "divider") {
        return <Divider block={block} className={className || undefined} />;
    }
    // table
    if (block.type === "table") {
        return <TableRender block={block} className={className || undefined} />;
    }
    return null;
};

// ============================================================
// BlockListRenderer - renderer for a list of Blocks (handles list grouping and heading indexing)
// ============================================================

interface BlockListRendererProps {
    blocks: Block[];
    /** Starting heading index, used for TOC anchor generation */
    startHeadingIndex?: number;
    className?: string;
    level?: number;
}

/**
 * Render an array of Blocks, automatically handling:
 * - merging consecutive `bulletListItem` into a single `<ul>`
 * - merging consecutive `numberedListItem` into a single `<ol>`
 * - assigning sequential indices to `heading` blocks (used for TOC anchors)
 */
export const BlockListRenderer: React.FC<BlockListRendererProps> = ({
    blocks,
    className = "",
    startHeadingIndex = 2,
    level = 0,
}) => {
    if (!blocks || blocks.length === 0) return null;

    const result: React.ReactNode[] = [];
    let currentBulletGroup: BulletListItemBlock[] = [];
    let currentNumberedGroup: NumberedListBlock[] = [];
    let headingIndex = startHeadingIndex;

    // Dynamically compute styles for the current nesting level
    // Use modulo (%) to cycle styles after exceeding available entries to avoid array OOB
    const currentBulletClass = BULLET_STYLES[level % BULLET_STYLES.length];
    const currentNumberClass = NUMBER_STYLES[level % NUMBER_STYLES.length];

    const flushBulletGroup = () => {
        if (currentBulletGroup.length > 0) {
            result.push(
                <ul
                    key={`bullet-group-${currentBulletGroup[0].id}`}
                    className={`mb-4 space-y-2 pl-6 ${currentBulletClass}`}
                >
                    {currentBulletGroup.map((item) => (
                        <BulletListItem
                            key={item.id}
                            block={item}
                            level={level}
                        />
                    ))}
                </ul>
            );
            currentBulletGroup = [];
        }
    };

    const flushNumberedGroup = () => {
        if (currentNumberedGroup.length > 0) {
            result.push(
                <ol
                    key={`numbered-group-${currentNumberedGroup[0].id}`}
                    className={`mb-4 space-y-2 pl-6 ${currentNumberClass}`}
                >
                    {currentNumberedGroup.map((item) => (
                        <NumberedListItem
                            key={item.id}
                            block={item}
                            level={level}
                        />
                    ))}
                </ol>
            );
            currentNumberedGroup = [];
        }
    };

    const flushAllGroups = () => {
        flushBulletGroup();
        flushNumberedGroup();
    };

    blocks.forEach((block) => {
        if (block.type === "bulletListItem") {
            flushNumberedGroup();
            currentBulletGroup.push(block);
        } else if (block.type === "numberedListItem") {
            flushBulletGroup();
            currentNumberedGroup.push(block);
        } else {
            flushAllGroups();
            /**
             * ⚠️ SPECIAL CASE: Heading blocks
             *
             * Why not use UniversalBlockRenderer for headings?
             * - Headings require a sequential index for unique ID generation
             * - The index is used to create anchor links for TOC navigation
             * - UniversalBlockRenderer doesn't maintain state across blocks
             *
             * Solution:
             * - Render Heading component directly with headingIndex prop
             * - Increment headingIndex after each heading
             * - This ensures: heading-0-title, heading-1-intro, heading-2-conclusion, etc.
             */
            if (block.type === "heading") {
                // Headings need an index for TOC anchors
                result.push(
                    <Heading
                        key={block.id}
                        data={block}
                        index={headingIndex++}
                    />
                );
            } else {
                result.push(
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        className={className}
                    />
                );
            }
        }
    });
    // Flush any remaining list items
    flushAllGroups();
    return <>{result}</>;
};

interface ChildrenBlockRendererProps {
    blocks: Block[];
    className?: string;
    level?: number;
}

export const ChildrenBlockRenderer: React.FC<ChildrenBlockRendererProps> = ({
    blocks,
    className = "",
    level = 0,
}) => {
    if (!blocks || blocks.length === 0) return null;
    return (
        <div className={`mt-1 ml-2 w-full ${className}`}>
            <BlockListRenderer
                blocks={blocks}
                className={className}
                level={level + 1}
            />
        </div>
    );
};
