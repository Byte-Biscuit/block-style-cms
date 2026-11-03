"use client";

import katex from "katex";
import type React from "react";
import { useMemo } from "react";
import "katex/dist/katex.min.css";

type MathFormulaProps = {
    latex: string;
    /** Display (block) vs inline. */
    display?: boolean;
    className?: string;
};

/**
 * Render LaTeX via KaTeX (same engine as @blocknote/math-block).
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
    latex,
    display = false,
    className,
}) => {
    const { html, error } = useMemo(() => {
        const source = latex.trim();
        if (!source) {
            return { html: "", error: undefined as string | undefined };
        }
        try {
            return {
                html: katex.renderToString(source, {
                    throwOnError: true,
                    displayMode: display,
                    output: "htmlAndMathml",
                }),
                error: undefined,
            };
        } catch (err) {
            return {
                html: katex.renderToString(source, {
                    throwOnError: false,
                    displayMode: display,
                    output: "htmlAndMathml",
                }),
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }, [latex, display]);

    if (!html) return null;

    const Tag = display ? "div" : "span";
    return (
        <Tag
            className={className}
            data-math-error={error ? "true" : undefined}
            title={error}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX emits HTML from local LaTeX; required for formula render
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default MathFormula;
