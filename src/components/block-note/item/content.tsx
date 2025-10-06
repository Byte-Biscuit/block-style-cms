import React from "react";
import FormattedText from "./text-content";
import FormattedLink from "./link-content";
import type { TextContent, LinkContent } from "../meta";

const Content: React.FC<{ items?: (TextContent | LinkContent)[] }> = ({
    items = [],
}) => {
    return (
        <>
            {items.map((item, idx) => {
                const key = `cnt-${idx}`;
                if (item?.type === "text") {
                    return (
                        <FormattedText key={key} item={item as TextContent} />
                    );
                }
                if (item?.type === "link") {
                    return (
                        <FormattedLink key={key} item={item as LinkContent} />
                    );
                }
                return null;
            })}
        </>
    );
};

export default Content;
