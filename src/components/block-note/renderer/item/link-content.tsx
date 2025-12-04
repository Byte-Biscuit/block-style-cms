import React from "react";
import Link from "@/components/link";
import {
    type Link as LinkType,
    type DefaultStyleSchema,
} from "@blocknote/core";
import TextContent from "./text-content";

const LinkContent: React.FC<{ item: LinkType<DefaultStyleSchema> }> = ({
    item,
}) => {
    if (!item?.href) return null;
    if (!item.content || item.content.length === 0) return null;

    return (
        <Link
            className="inline-block max-w-full rounded wrap-break-word text-blue-600 decoration-2 underline-offset-2 transition-colors 
            hover:text-blue-800 hover:underline focus:ring-2 focus:ring-blue-300 focus:outline-none 
            dark:text-blue-300 dark:hover:text-blue-100 dark:focus:ring-blue-700"
            href={item.href}
        >
            {item.content.map((textItem, idx) => (
                <TextContent key={`link-${idx}`} item={textItem} />
            ))}
        </Link>
    );
};

export default LinkContent;
