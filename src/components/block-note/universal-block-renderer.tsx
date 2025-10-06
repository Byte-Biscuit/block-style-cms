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
            result.push(
                <UniversalBlockRenderer key={block.id} block={block} />
            );
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
    // heading
    if (blockType === "heading") {
        return (
            <Heading
                data={block as BlockData & { props: { level: number } }}
                className={className || undefined}
            />
        );
    }
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
