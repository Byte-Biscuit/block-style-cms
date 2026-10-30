/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import {
    blocksToMarkdown,
    normalizeImageSrcForMarkdown,
    remapToExportBlocks,
} from "../blocks-to-md";
import { markdownToBlocks } from "../md-to-blocks";

const BASE = "https://cms.example.com";

describe("normalizeImageSrcForMarkdown", () => {
    it("keeps http(s) absolute URLs unchanged", () => {
        expect(
            normalizeImageSrcForMarkdown(
                "https://cms.example.com/images/a.webp",
                { baseUrl: BASE }
            )
        ).toBe("https://cms.example.com/images/a.webp");
        expect(
            normalizeImageSrcForMarkdown("https://cdn.example.com/a.png", {
                baseUrl: BASE,
            })
        ).toBe("https://cdn.example.com/a.png");
    });

    it("prefixes /images/ with baseUrl and strips query", () => {
        expect(
            normalizeImageSrcForMarkdown("/images/a.webp", { baseUrl: BASE })
        ).toBe("https://cms.example.com/images/a.webp");
        expect(
            normalizeImageSrcForMarkdown("/images/a.webp?x=1", {
                baseUrl: BASE,
            })
        ).toBe("https://cms.example.com/images/a.webp");
    });

    it("leaves /images/ as path when baseUrl is empty", () => {
        expect(normalizeImageSrcForMarkdown("/images/a.webp")).toBe(
            "/images/a.webp"
        );
    });
});

describe("blocksToMarkdown", () => {
    it("round-trips paragraph, heading, list, code, image, mermaid", async () => {
        const md = [
            "## Hello",
            "",
            "A paragraph.",
            "",
            "- item one",
            "- item two",
            "",
            "```typescript",
            "const x = 1;",
            "```",
            "",
            "![alt text](/images/demo.webp)",
            "",
            "```mermaid",
            "flowchart TD",
            "  A-->B",
            "```",
        ].join("\n");

        const blocks = await markdownToBlocks(md);
        const exported = await blocksToMarkdown(blocks, { baseUrl: BASE });

        expect(exported).toContain("Hello");
        expect(exported).toContain("A paragraph.");
        expect(exported).toContain("item one");
        expect(exported).toMatch(/```typescript[\s\S]*const x = 1/);
        expect(exported).toContain(
            "https://cms.example.com/images/demo.webp"
        );
        expect(exported).toMatch(/```mermaid[\s\S]*flowchart TD/);
    });

    it("exports /images/ enhancedImage as absolute URL", async () => {
        const blocks = remapToExportBlocks(
            [
                {
                    id: "1",
                    type: "enhancedImage",
                    props: {
                        src: "/images/x.webp",
                        alt: "x",
                        caption: "x",
                    },
                    children: [],
                },
            ],
            { baseUrl: BASE }
        );
        expect(blocks[0]?.type).toBe("image");
        expect(blocks[0]?.props?.url).toBe(
            "https://cms.example.com/images/x.webp"
        );

        const md = await blocksToMarkdown(
            [
                {
                    id: "1",
                    type: "enhancedImage",
                    props: {
                        src: "/images/x.webp",
                        alt: "x",
                        caption: "cap",
                    },
                    children: [],
                },
            ] as never,
            { baseUrl: BASE }
        );
        expect(md).toContain("https://cms.example.com/images/x.webp");
    });

    it("keeps already-absolute image URLs", async () => {
        const md = await blocksToMarkdown(
            [
                {
                    id: "1",
                    type: "enhancedImage",
                    props: {
                        src: "https://cdn.example.com/a.png",
                        alt: "a",
                        caption: "a",
                    },
                    children: [],
                },
            ] as never,
            { baseUrl: BASE }
        );
        expect(md).toContain("https://cdn.example.com/a.png");
    });
});
