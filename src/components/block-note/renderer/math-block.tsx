import type React from "react";
import type { LocalBlock as Block } from "@/block-note/schema";
import { latexFromPlainContent } from "@/lib/latex-utils";
import MathFormula from "./math-formula";

export type MathBlockData = Extract<Block, { type: "mathBlock" }>;

export const MathBlock: React.FC<{
    data: MathBlockData;
    className?: string;
}> = ({ data, className }) => {
    const latex = latexFromPlainContent(data.content);
    if (!latex.trim()) return null;

    return (
        <figure
            className={`bn-math-block my-6 overflow-x-auto text-center ${className ?? ""}`}
        >
            <MathFormula latex={latex} display />
        </figure>
    );
};

export default MathBlock;
