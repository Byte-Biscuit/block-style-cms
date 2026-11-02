import type React from "react";
import { latexFromPlainContent } from "@/lib/latex-utils";
import MathFormula from "../math-formula";

export type MathInlineItem = {
    type: "math";
    props?: Record<string, unknown>;
    content?: unknown;
};

const MathContent: React.FC<{ item: MathInlineItem }> = ({ item }) => {
    const latex = latexFromPlainContent(item.content);
    if (!latex.trim()) return null;
    return (
        <MathFormula
            latex={latex}
            className="bn-math-inline mx-0.5 inline-block align-baseline"
        />
    );
};

export default MathContent;
