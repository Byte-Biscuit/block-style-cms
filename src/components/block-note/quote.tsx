import React from "react";
import { twColorMap, BlockData } from "./meta";
import Content from "./item/content";

export const Quote: React.FC<{
    data: BlockData;
    className?: string;
}> = ({ data, className }) => {
    const { props, content } = data;

    // parent tag classes - same logic as Paragraph
    const tagClasses = [
        props?.backgroundColor !== "default" &&
            props?.backgroundColor &&
            twColorMap[props.backgroundColor]?.bgClass,
        props?.textColor !== "default" &&
            props?.textColor &&
            twColorMap[props.textColor]?.textClass,
        // Quote-specific styling
        "border-l-4 border-gray-300 dark:border-gray-600",
        "pl-4 py-2 italic",
        "bg-gray-50 dark:bg-gray-800/50",
        "text-gray-700 dark:text-gray-300",
        "rounded-lg",
        className,
    ].filter(Boolean);

    if (tagClasses.length === 6)
        // only has the default quote classes
        return (
            <blockquote className="rounded-lg border-l-4 border-gray-300 bg-gray-50 py-2 pl-4 text-gray-700 italic dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
                <Content items={content} />
            </blockquote>
        );

    return (
        <blockquote className={tagClasses.join(" ")}>
            <Content items={content} />
        </blockquote>
    );
};

export default Quote;
