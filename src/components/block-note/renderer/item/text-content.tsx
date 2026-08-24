import type { DefaultStyleSchema, StyledText } from "@blocknote/core";
import type React from "react";
import { getBlockClasses } from "@/lib/style-classes";

const TextContent: React.FC<{ item: StyledText<DefaultStyleSchema> }> = ({
    item,
}) => {
    if (!item?.text) return null;
    const classes = getBlockClasses({ ...item?.styles });
    if (!classes) return <>{item.text}</>;
    return <span className={classes}>{item.text}</span>;
};

export default TextContent;
