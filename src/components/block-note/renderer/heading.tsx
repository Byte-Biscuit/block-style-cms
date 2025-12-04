import React from "react";
import { LocalBlock as Block } from "@/block-note/schema";
import Content from "./item/content";
import { getDefaultHeadingClasses,getBlockClasses} from "@/lib/style-classes";
import { generateHeadingId } from "@/lib/toc-utils";
import {ChildrenBlockRenderer} from "../universal-block-renderer";

export type HeadingBlock = Extract<Block, { type: "heading" }>;

interface HeadingProps {
    data: HeadingBlock;
    className?: string;
    index?: number;
}

/**
 * Extract plain text for toc generation
 * @param content
 * @returns
 */

export const Heading: React.FC<HeadingProps> = ({
    data,
    className = "",
    index = 0,
}) => {
    const { props, content,children } = data;

    if (!props) return null;
    if (!content || content.length === 0) return null;

    const HeadingTag = `h${props.level}` as keyof React.JSX.IntrinsicElements;
    const classes= getBlockClasses(props,className,getDefaultHeadingClasses(props.level));
    
    const headingElement=React.createElement(
        HeadingTag,
        {
            className: classes,
            id: generateHeadingId(props.level, index),
        },
        <Content items={content} />
    );
    return (
        <>
            {headingElement}
            <ChildrenBlockRenderer blocks={children || []} level={1} />
        </>
    )
};
export default Heading;
