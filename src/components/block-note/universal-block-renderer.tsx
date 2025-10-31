import React from "react";
import { type BlockData } from "./meta";
import { TextContent, LinkContent } from "./meta";
import Heading from "./heading";
import Paragraph from "./paragraph";
import BulletListItem from "./bullet-list-item";
import CodeBlock from "./code-block";
import EnhancedFile, { EnhancedFileBlockData } from "./enhanced-file";
import EnhancedImage, { EnhancedImageBlockData } from "./enhanced-image";
import EnhancedVideo, { EnhancedVideoBlockData } from "./enhanced-video";
import EnhancedAudio, { EnhancedAudioBlockData } from "./enhanced-audio";
import Mermaid, { MermaidBlockData } from "./mermaid";
import NumberedListItem from "./numbered-list-item";
import Quote from "./quote";
import Table, { TableBlockData } from "./table";

interface UniversalBlockRendererProps {
    block: BlockData;
    className?: string;
}

// Helper function to group consecutive bullet list items and numbered list items
export const groupListItems = (blocks: BlockData[]): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let currentBulletGroup: BlockData[] = [];
    let currentNumberedGroup: BlockData[] = [];
    // Start from 2 to avoid conflict with article title and summary
    let headingIndex = 2;

    const flushBulletGroup = () => {
        if (currentBulletGroup.length > 0) {
            result.push(
                <ul
                    key={`bullet-group-${currentBulletGroup[0].id}`}
                    className="mb-4 list-disc space-y-2 pl-6"
                >
                    {currentBulletGroup.map((item) => (
                        <BulletListItem key={item.id} data={item} />
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
                    className="mb-4 list-decimal space-y-2 pl-6"
                >
                    {currentNumberedGroup.map((item) => (
                        <NumberedListItem key={item.id} data={item} />
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
            flushNumberedGroup(); // flush numbered group when switching to bullets
            currentBulletGroup.push(block);
        } else if (block.type === "numberedListItem") {
            flushBulletGroup(); // flush bullet group when switching to numbers
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
                result.push(
                    <Heading
                        key={block.id}
                        data={block as BlockData & { props: { level: number } }}
                        index={headingIndex++} // Pass and increment counter
                    />
                );
            } else {
                // All other block types use the unified renderer
                result.push(
                    <UniversalBlockRenderer key={block.id} block={block} />
                );
            }
        }
    });

    // Flush any remaining list items
    flushAllGroups();

    return result;
};

export const UniversalBlockRenderer: React.FC<UniversalBlockRendererProps> = ({
    block,
    className = "",
}) => {
    const blockType = block.type;
    // paragraph
    if (blockType === "paragraph") {
        return <Paragraph data={block} className="mb-4 leading-relaxed" />;
    }
    // code block
    if (blockType === "codeBlock") {
        const { props, content } = block;
        const { language } = props as { language: string };
        const codes =
            content
                ?.map((item: TextContent | LinkContent) =>
                    item.type === "text" ? item.text : ""
                )
                .filter(Boolean) || [];
        if (codes.length === 0) return <></>;
        const lang =
            language === "ts"
                ? "typescript"
                : language === "js"
                  ? "javascript"
                  : language;
        return <CodeBlock language={lang} code={codes.join("")} />;
    }
    // enhanced-file
    if (blockType === "enhancedFile") {
        return (
            <EnhancedFile
                data={block as EnhancedFileBlockData}
                className={className || undefined}
            />
        );
    }
    // enhanced-image
    if (blockType === "enhancedImage") {
        return <EnhancedImage data={block as EnhancedImageBlockData} />;
    }
    // enhanced-video
    if (blockType === "enhancedVideo") {
        return <EnhancedVideo data={block as EnhancedVideoBlockData} />;
    }
    // enhanced-audio
    if (blockType === "enhancedAudio") {
        return <EnhancedAudio data={block as EnhancedAudioBlockData} />;
    }
    // mermaid
    if (blockType === "mermaid") {
        return <Mermaid data={block as MermaidBlockData} />;
    }
    // quote
    if (blockType === "quote") {
        return <Quote data={block} className="mb-4 !leading-relaxed" />;
    }
    // table
    if (blockType === "table") {
        return (
            <Table
                data={block as TableBlockData}
                className={className || undefined}
            />
        );
    }
    return <> </>;
};

export default UniversalBlockRenderer;
