import type {
    DefaultInlineContentSchema,
    DefaultStyleSchema,
    InlineContent,
    Link as LinkType,
    StyledText,
} from "@blocknote/core";
import type React from "react";
import LinkContent from "./link-content";
import TextContent from "./text-content";

const Content: React.FC<{
    items?: InlineContent<DefaultInlineContentSchema, DefaultStyleSchema>[];
}> = ({ items = [] }) => {
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
