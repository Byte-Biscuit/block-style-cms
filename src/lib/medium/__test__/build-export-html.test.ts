import { describe, expect, it } from "vitest";
import { buildMediumExportHtml } from "../build-export-html";

describe("buildMediumExportHtml", () => {
    it("builds shell with noindex and no external canonical", async () => {
        const html = await buildMediumExportHtml(
            {
                id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                title: "Hello",
                summary: "Sub",
                slug: "hello-world-article",
                locale: "en-US",
                image: "https://studio.xiyue.space/images/cover.webp",
                content: [
                    {
                        type: "paragraph",
                        content: [{ type: "text", text: "Body" }],
                    },
                    {
                        type: "divider",
                    },
                    {
                        type: "heading",
                        props: { level: 2 },
                        content: [
                            { type: "text", text: "Uses " },
                            {
                                type: "text",
                                text: "route.ts",
                                styles: { code: true },
                            },
                        ],
                    },
                    {
                        type: "quote",
                        content: [
                            {
                                type: "text",
                                text: "AsyncLocalStorage",
                                styles: { code: true },
                            },
                        ],
                    },
                    {
                        id: "tbl1",
                        type: "table",
                        content: {
                            type: "tableContent",
                            headerRows: 1,
                            rows: [
                                {
                                    cells: [
                                        {
                                            type: "tableCell",
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Expectation",
                                                },
                                            ],
                                        },
                                        {
                                            type: "tableCell",
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Reality",
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    cells: [
                                        {
                                            type: "tableCell",
                                            content: [
                                                { type: "text", text: "A" },
                                            ],
                                        },
                                        {
                                            type: "tableCell",
                                            content: [
                                                { type: "text", text: "B" },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
            { baseUrl: "https://studio.xiyue.space" }
        );
        expect(html).toContain('name="robots" content="noindex, nofollow"');
        expect(html).not.toContain('<link rel="canonical"');
        expect(html).not.toContain("Originally published at");
        expect(html).toContain("<h1>Hello</h1>");
        expect(html).toContain("<h2>Sub</h2>");
        expect(html).toContain("<p>Body</p>");
        expect(html).toContain(
            'src="https://studio.xiyue.space/images/cover.webp.jpg"'
        );
        expect(html).toContain(
            'property="og:image" content="https://studio.xiyue.space/images/cover.webp.jpg"'
        );
        expect(html).toContain("<figcaption>Hello</figcaption>");
        expect(html).not.toContain("<hr");
        expect(html).not.toContain("<table");
        expect(html).toContain(
            `src="https://studio.xiyue.space/export/diagram/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/tbl1.png"`
        );
        expect(html).toContain("<h3>Uses route.ts</h3>");
        expect(html).not.toMatch(/<h3>[^<]*<code>/);
        expect(html).toContain("<blockquote>AsyncLocalStorage</blockquote>");
        expect(html).not.toMatch(/<blockquote>[^<]*<code>/);
        expect(html).not.toContain("<script");
        expect(html).not.toContain("<nav");
    });
});
