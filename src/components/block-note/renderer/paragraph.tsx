import type React from "react";
import type { LocalBlock as Block } from "@/block-note/schema";
import { getBlockClasses } from "@/lib/style-classes";
import { ChildrenBlockRenderer } from "../universal-block-renderer";
import Content from "./item/content";

export type ParagraphBlock = Extract<Block, { type: "paragraph" }>;

export const Paragraph: React.FC<{
    block: ParagraphBlock;
    className?: string;
}> = ({ block, className }) => {
    const { props, content, children } = block;
    const classes = getBlockClasses(props, className);
    return (
        <section>
            <p className={classes}>
                <Content items={content} />
            </p>
            <ChildrenBlockRenderer blocks={children || []} />
        </section>
    );
};

export default Paragraph;
