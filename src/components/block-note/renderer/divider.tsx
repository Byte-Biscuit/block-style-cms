import React from "react";
import { LocalBlock as Block } from "@/block-note/schema";

export type DividerBlock = Extract<Block, { type: "divider" }>;

export const Divider: React.FC<{
    block: DividerBlock;
    className?: string;
}> = ({ className }) => {
    return (
        <hr
            className={`my-6 border-t border-gray-300 dark:border-gray-600 ${className || ""}`}
        />
    );
};

export default Divider;
