import { describe, expect, it } from "vitest";
import { blocksToHtml, type ExportBlock } from "../blocks-to-html";
import { escapeHtml } from "../html-escape";
import { stripSvgForRaster } from "../strip-svg";

const baseOpts = {
    baseUrl: "https://studio.xiyue.space",
    articleId: "11111111-1111-1111-1111-111111111111",
    diagramBlockUrl: (
        _articleId: string,
        _blockId: string,
        block: ExportBlock
    ) =>
        block.type === "mermaid"
            ? `https://studio.xiyue.space/images/mermaid-test.png`
            : `https://studio.xiyue.space/images/svg-test.png`,
};

const mediumOpts = {
    ...baseOpts,
    demoteHeadingsForShell: true,
    flattenNestedLists: true,
};

describe("escapeHtml", () => {
    it("escapes markup characters", () => {
        expect(escapeHtml(`<a & "b">`)).toBe("&lt;a &amp; &quot;b&quot;&gt;");
    });
});

describe("stripSvgForRaster", () => {
    it("strips script and event handlers", () => {
        const raw = `<svg xmlns="http://www.w3.org/2000/svg" onclick="alert(1)"><script>x()</script><circle cx="1" cy="1" r="1"/></svg>`;
        const clean = stripSvgForRaster(raw);
        expect(clean).toBeTruthy();
        expect(clean).not.toMatch(/script/i);
        expect(clean).not.toMatch(/onclick/i);
    });

    it("rejects non-svg", () => {
        expect(stripSvgForRaster("<div/>")).toBeNull();
    });
});

describe("blocksToHtml", () => {
    it("keeps natural heading levels by default", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "heading",
                props: { level: 1 },
                content: [{ type: "text", text: "Title" }],
            },
            {
                type: "heading",
                props: { level: 2 },
                content: [{ type: "text", text: "Section" }],
            },
        ];
        const html = await blocksToHtml(blocks, baseOpts);
        expect(html).toContain("<h1>Title</h1>");
        expect(html).toContain("<h2>Section</h2>");
    });

    it("demotes headings when demoteHeadingsForShell", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "heading",
                props: { level: 1 },
                content: [{ type: "text", text: "Dup Title" }],
            },
            {
                type: "heading",
                props: { level: 2 },
                content: [{ type: "text", text: "Section" }],
            },
            {
                type: "heading",
                props: { level: 3 },
                content: [{ type: "text", text: "Sub" }],
            },
        ];
        const html = await blocksToHtml(blocks, mediumOpts);
        expect(html).not.toContain("<h1>");
        expect(html).toContain("<h3>Section</h3>");
        expect(html).toContain("<h4>Sub</h4>");
        expect(html).not.toContain("Dup Title");
    });

    it("emits clean code blocks", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "codeBlock",
                props: { language: "bash" },
                content: [{ type: "text", text: "echo hi && true" }],
            },
        ];
        const html = await blocksToHtml(blocks, baseOpts);
        expect(html).toBe("<pre><code>echo hi &amp;&amp; true</code></pre>");
    });

    it("keeps nested lists inside li when flattenNestedLists is off", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "numberedListItem",
                content: [{ type: "text", text: "Parent" }],
                children: [
                    {
                        type: "bulletListItem",
                        content: [{ type: "text", text: "Child A" }],
                    },
                ],
            },
        ];
        const html = await blocksToHtml(blocks, baseOpts);
        expect(html).toContain("<ol>");
        expect(html).toContain("<li>Parent<ul><li>Child A</li></ul></li>");
    });

    it("flattens nested numbered lists when requested", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "numberedListItem",
                content: [{ type: "text", text: "Parent", styles: {} }],
                children: [
                    {
                        type: "bulletListItem",
                        content: [{ type: "text", text: "Child A" }],
                    },
                    {
                        type: "bulletListItem",
                        content: [{ type: "text", text: "Child B" }],
                    },
                ],
            },
        ];
        const html = await blocksToHtml(blocks, mediumOpts);
        expect(html).toContain("<p><strong>1. Parent</strong></p>");
        expect(html).toContain("<ul>");
        expect(html).toContain("<li>Child A</li>");
        expect(html).not.toMatch(/<ol>[\s\S]*<ul>/);
    });

    it("replaces mermaid and svg with img figures via overrides", async () => {
        const blocks: ExportBlock[] = [
            {
                id: "m1",
                type: "mermaid",
                props: { code: "flowchart TD; A-->B" },
            },
            {
                id: "s1",
                type: "svg",
                props: {
                    code: '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="1" cy="1" r="1"/></svg>',
                },
            },
        ];
        const html = await blocksToHtml(blocks, baseOpts);
        expect(html).toContain(
            'src="https://studio.xiyue.space/images/mermaid-test.png"'
        );
        expect(html).toContain(
            'src="https://studio.xiyue.space/images/svg-test.png"'
        );
        expect(html).not.toContain("<svg");
        expect(html).not.toContain("flowchart TD");
    });

    it("emits id-only diagram URLs", async () => {
        const articleId = "b08da6f0-c461-47df-a073-acf88a543f76";
        const blockId = "6a8a0475-8fc1-400e-b068-29652e10cef0";
        const blocks: ExportBlock[] = [
            {
                id: blockId,
                type: "mermaid",
                props: { code: "flowchart LR; A-->B" },
            },
        ];
        const html = await blocksToHtml(blocks, {
            baseUrl: "https://studio.xiyue.space",
            articleId,
        });
        expect(html).toContain(
            `src="https://studio.xiyue.space/export/diagram/${articleId}/${blockId}.png"`
        );
        expect(html).not.toContain("flowchart");
    });

    it("falls back to code when articleId missing", async () => {
        const blocks: ExportBlock[] = [
            {
                id: "m1",
                type: "mermaid",
                props: { code: "flowchart LR; A-->B" },
            },
        ];
        const html = await blocksToHtml(blocks, {
            baseUrl: "https://studio.xiyue.space",
        });
        expect(html).toContain("<pre><code>");
        expect(html).toContain("flowchart LR");
    });

    it("absolutizes enhanced images", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "enhancedImage",
                props: {
                    url: "/images/cover.webp",
                    alt: "Cover",
                    caption: "Cap",
                },
            },
        ];
        const html = await blocksToHtml(blocks, baseOpts);
        expect(html).toContain(
            'src="https://studio.xiyue.space/images/cover.webp"'
        );
        expect(html).toContain("<figcaption>Cap</figcaption>");
    });

    it("skips svg image urls", async () => {
        const blocks: ExportBlock[] = [
            {
                type: "enhancedImage",
                props: { url: "/images/icon.svg", alt: "Icon" },
            },
        ];
        const html = await blocksToHtml(blocks, baseOpts);
        expect(html).toBe("");
    });
});
