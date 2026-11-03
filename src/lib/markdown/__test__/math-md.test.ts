/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import {
    fromMathBlock,
    postprocessMathMarkdown,
    preprocessMathMarkdown,
    remapInlineMathToText,
    splitInlineMathFromText,
    toMathBlock,
} from "../math-md";

describe("math-md", () => {
    it("preprocesses $$ into math fences and postprocesses back", () => {
        const md = "before\n\n$$\na^2\n$$\n\nafter";
        const prepared = preprocessMathMarkdown(md);
        expect(prepared).toContain("```math");
        expect(prepared).toContain("a^2");
        expect(prepared).not.toMatch(/\$\$/);

        const exported = postprocessMathMarkdown("```math\na^2\n```");
        expect(exported).toBe("$$\na^2\n$$");
    });

    it("round-trips mathBlock via codeBlock bridge", () => {
        const fence = fromMathBlock({
            id: "1",
            type: "mathBlock",
            content: "E=mc^2",
        });
        expect(fence.type).toBe("codeBlock");
        expect(fence.props?.language).toBe("math");

        const back = toMathBlock(fence);
        expect(back.type).toBe("mathBlock");
        expect(back.content).toBe("E=mc^2");
    });

    it("converts inline math to $...$ text and splits back", () => {
        const withMath = remapInlineMathToText([
            { type: "text", text: "see ", styles: {} },
            { type: "math", content: "a+b" },
            { type: "text", text: " now", styles: {} },
        ]);
        expect(withMath).toEqual([
            { type: "text", text: "see ", styles: {} },
            { type: "text", text: "$a+b$", styles: {} },
            { type: "text", text: " now", styles: {} },
        ]);

        const split = splitInlineMathFromText([
            { type: "text", text: "Has $E=mc^2$ here", styles: {} },
        ]);
        expect(split).toEqual([
            { type: "text", text: "Has ", styles: {} },
            { type: "math", props: {}, content: "E=mc^2" },
            { type: "text", text: " here", styles: {} },
        ]);
    });
});
