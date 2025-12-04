import React from "react";
import { type LocalBlock as Block } from "@/block-note/schema";
import Content from "./item/content";
import { getBlockClasses} from "@/lib/style-classes";
import {ChildrenBlockRenderer} from "../universal-block-renderer";

// Extract the block type where type is "numberedListItem" from all Block types
export type NumberedListBlock = Extract<Block, { type: "numberedListItem" }>;

export const NumberedListItem: React.FC<{
    block: NumberedListBlock;
    className?: string;
    level?: number;
}> = ({ block, className,level=0 }) => {
    const { props, content,children } = block;
    const classes=getBlockClasses(props,"wrap-break-word leading",className)

    return (
        <li className={classes}>
            <Content items={content} />
            <ChildrenBlockRenderer blocks={children || []} level={level} />
        </li>
    );
};

export default NumberedListItem;
