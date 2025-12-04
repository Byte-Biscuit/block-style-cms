import React from "react";
import {type LocalBlock as Block } from "@/block-note/schema";
import { getBlockClasses} from "@/lib/style-classes";
import Content from "./item/content";
import {ChildrenBlockRenderer} from "../universal-block-renderer";

export type BulletListItemBlock = Extract<Block, { type: "bulletListItem" }>;


export const BulletListItem: React.FC<{
    block: BulletListItemBlock;
    className?: string;
    level?: number;
}> = ({ block: data, className,level=0 }) => {
    const { props, content,children  } = data;
    const classes=getBlockClasses(props,"wrap-break-word leading-relaxed",className)
    return (
        <li className={classes}>
            <Content items={content} />
            <ChildrenBlockRenderer blocks={children || []} level={level} />
        </li>
    );
};

export default BulletListItem;
