import React from "react";
import { twColorMap, BlockData } from "./meta";
import Content from "./item/content";

export const BulletListItem: React.FC<{
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
        props?.textAlignment === "center" && "text-center",
        props?.textAlignment === "right" && "text-right",
        // Add text wrapping and proper spacing
        "break-words leading-relaxed",
        className,
    ].filter(Boolean);

    if (tagClasses.length === 1)
        // only has the default break-words class
        return (
            <li className="leading-relaxed break-words">
                <Content items={content} />
            </li>
        );

    return (
        <li className={tagClasses.join(" ")}>
            <Content items={content} />
        </li>
    );
};

export default BulletListItem;
