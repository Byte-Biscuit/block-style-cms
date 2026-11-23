import { describe, expect, it } from "vitest";
import { buildMediumExportHtml } from "../build-export-html";

describe("buildMediumExportHtml", () => {
    it("builds shell with canonical and noindex", async () => {
        const html = await buildMediumExportHtml(
            {
                id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                title: "Hello",
                summary: "Sub",
                slug: "hello-world-article",
                locale: "en-US",
                content: [
                    {
                        type: "paragraph",
                        content: [{ type: "text", text: "Body" }],
                    },
                ],
            },
            { baseUrl: "https://studio.xiyue.space" }
        );
        expect(html).toContain('name="robots" content="noindex, nofollow"');
        expect(html).toContain(
            'rel="canonical" href="https://studio.xiyue.space/en-US/articles/hello-world-article"'
        );
        expect(html).toContain("<h1>Hello</h1>");
        expect(html).toContain("<h2>Sub</h2>");
        expect(html).toContain("<p>Body</p>");
        expect(html).not.toContain("Originally published at");
        expect(html).not.toContain("<script");
        expect(html).not.toContain("<nav");
    });
});
