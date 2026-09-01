import { describe, expect, it } from "vitest";
import type { LocalBlock } from "@/block-note/schema";
import { convertBlocksToAlgoliaMarkdown } from "../algolia-search-service";

const hugeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000">${"x".repeat(5000)}</svg>`;
const hugeMermaid = `graph TD\n${"A-->B\n".repeat(500)}`;

describe("convertBlocksToAlgoliaMarkdown", () => {
    it("replaces mermaid blocks with a short placeholder", () => {
        const markdown = convertBlocksToAlgoliaMarkdown([
            {
                type: "mermaid",
                props: { code: hugeMermaid },
            },
        ] as LocalBlock[]);

        expect(markdown).toBe("[Mermaid]");
        expect(markdown).not.toContain("graph TD");
    });

    it("replaces svg blocks with a short placeholder", () => {
        const markdown = convertBlocksToAlgoliaMarkdown([
            {
                type: "svg",
                props: { code: hugeSvg },
            },
        ] as LocalBlock[]);

        expect(markdown).toBe("[SVG]");
        expect(markdown).not.toContain("<svg");
    });

    it("replaces legacy mermaid/svg code fences with placeholders", () => {
        const markdown = convertBlocksToAlgoliaMarkdown([
            {
                type: "codeBlock",
                props: { language: "svg" },
                content: [{ type: "text", text: hugeSvg, styles: {} }],
            },
            {
                type: "codeBlock",
                props: { language: "mermaid" },
                content: [{ type: "text", text: hugeMermaid, styles: {} }],
            },
            {
                type: "codeBlock",
                props: { language: "mmd" },
                content: [{ type: "text", text: hugeMermaid, styles: {} }],
            },
        ] as LocalBlock[]);

        expect(markdown).toBe("[SVG]\n\n[Mermaid]\n\n[Mermaid]");
        expect(markdown).not.toContain("<svg");
        expect(markdown).not.toContain("graph TD");
    });

    it("keeps normal text and code blocks", () => {
        const markdown = convertBlocksToAlgoliaMarkdown([
            {
                type: "heading",
                props: { level: 1 },
                content: [{ type: "text", text: "Title", styles: {} }],
            },
            {
                type: "paragraph",
                content: [{ type: "text", text: "Body text", styles: {} }],
            },
            {
                type: "codeBlock",
                props: { language: "javascript" },
                content: [
                    { type: "text", text: "console.log('hi')", styles: {} },
                ],
            },
        ] as LocalBlock[]);

        expect(markdown).toContain("# Title");
        expect(markdown).toContain("Body text");
        expect(markdown).toContain("```javascript");
        expect(markdown).toContain("console.log('hi')");
    });
});
