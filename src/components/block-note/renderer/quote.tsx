import React from "react";
import { LocalBlock as Block } from "@/block-note/schema";
import Content from "./item/content";
import { getBlockClasses } from "@/lib/style-classes";

export type QuoteBlock = Extract<Block, { type: "quote" }>;

export const Quote: React.FC<{
    block: QuoteBlock;
    className?: string;
}> = ({ block, className }) => {
    const { props,content } = block;
    const classes=getBlockClasses(props,
        "rounded-lg border-l-4 border-gray-300 bg-gray-50 py-2 pr-2 pl-4 text-gray-700 italic",
        "dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300",className)
    return (
        <blockquote className={classes}>
            <Content items={content} />
        </blockquote>
    );
};

export default Quote;
