import React from "react";
import Link from "@/components/link";
import type { LinkContent, TextContent } from "../meta";
import FormattedText from "./text-content";

const FormattedLink: React.FC<{ item: LinkContent }> = ({ item }) => {
    if (!item) return null;
    if (!item.href) return null;
    if (!item.content || item.content.length === 0) return null;

    const children = item.content?.map((textItem: TextContent, idx: number) => (
        <FormattedText key={`link-${idx}`} item={textItem} />
    ));

    return <Link href={item.href}>{children}</Link>;
};

export default FormattedLink;
