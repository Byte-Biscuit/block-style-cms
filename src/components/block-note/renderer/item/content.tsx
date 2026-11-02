import type {
    DefaultStyleSchema,
    InlineContent,
    Link as LinkType,
    StyledText,
} from "@blocknote/core";
import type React from "react";
import type { schema } from "@/block-note/schema";
import LinkContent from "./link-content";
import MathContent, { type MathInlineItem } from "./math-content";
import TextContent from "./text-content";

type SchemaInline = InlineContent<
    typeof schema.inlineContentSchema,
    typeof schema.styleSchema
>;

const Content: React.FC<{
    items?: SchemaInline[];
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
                if (item?.type === "math") {
                    return (
                        <MathContent
                            key={key}
                            item={item as unknown as MathInlineItem}
                        />
                    );
                }
                return null;
            })}
        </>
    );
};
export default Content;
