import React from "react";
import { twColorMap, BlockData } from "./meta";
import Content from "./item/content";

export const Paragraph: React.FC<{
    data: BlockData;
    className?: string;
}> = ({ data, className }) => {
    const { props, content } = data;

    // parent tag classes
    const tagClasses = [
        props?.backgroundColor !== "default" &&
            props?.backgroundColor &&
            twColorMap[props.backgroundColor]?.bgClass,
        props?.textColor !== "default" &&
            props?.textColor &&
            twColorMap[props.textColor]?.textClass,
        props?.textAlignment === "center" && "text-center",
        props?.textAlignment === "right" && "text-right",
        className,
    ].filter(Boolean);
    if (tagClasses.length === 0)
        return (
            <p>
                <Content items={content} />
            </p>
        );
    return (
        <p className={tagClasses.join(" ")}>
            <Content items={content} />
        </p>
    );
};

export default Paragraph;
