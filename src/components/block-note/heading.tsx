import React from "react";
import { twColorMap, type BlockData } from "./meta";
import Content from "./item/content";
import { getDefaultHeadingClasses } from "@/lib/tw-utils";

interface HeadingProps {
    data: BlockData & { props: { level: number } };
    className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ data, className = "" }) => {
    const { props, content } = data;

    if (!props) return null;
    if (!content || content.length === 0) return null;

    const HeadingTag = `h${props.level}` as keyof React.JSX.IntrinsicElements;

    // build tag classes
    const tagClasses = [
        // tx color
        props.textColor !== "default" &&
            props.textColor &&
            twColorMap[props.textColor]?.textClass,
        // bg color
        props.backgroundColor !== "default" &&
            props.backgroundColor &&
            twColorMap[props.backgroundColor]?.bgClass,
        // textAlignment
        props.textAlignment === "center" && "text-center",
        props.textAlignment === "right" && "text-right",
        // Unify title style
        getDefaultHeadingClasses(props.level),
        // custom class name
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return React.createElement(
        HeadingTag,
        { className: tagClasses },
        <Content items={content} />
    );
};

export default Heading;
