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

    return (
        <Link
            className="rounded text-blue-600 decoration-2 underline-offset-2 transition-colors hover:text-blue-800 hover:underline focus:ring-2 focus:ring-blue-300 focus:outline-none dark:text-blue-300 dark:hover:text-blue-100 dark:focus:ring-blue-700"
            href={item.href}
        >
            {children}
        </Link>
    );
};

export default FormattedLink;
