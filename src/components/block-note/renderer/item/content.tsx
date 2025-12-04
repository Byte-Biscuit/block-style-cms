import React from "react";
import {
    type StyledText,
    type Link as LinkType,
    type DefaultStyleSchema,
    type DefaultInlineContentSchema,
    InlineContent
} from "@blocknote/core";
import TextContent from "./text-content";
import LinkContent from "./link-content";


const Content: React.FC<{ items?: InlineContent<DefaultInlineContentSchema, DefaultStyleSchema>[] }> = ({ items = [] }) => {
    return (
        <>
            {items.map((item, idx) => {
                const key = `cnt-${idx}`;
                if (item?.type === "text") {
                    return (
                        <TextContent
                            key={key}
                            item={item as StyledText<DefaultStyleSchema>}
                        />
                    );
                }
                if (item?.type === "link") {
                    return (
                        <LinkContent
                            key={key}
                            item={item as LinkType<DefaultStyleSchema>}
                        />
                    );
                }
                return null;
            })}
        </>
    );
};
export default Content;
