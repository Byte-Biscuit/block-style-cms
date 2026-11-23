import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blocksToHtml } from "../blocks-to-html";
import {
    diagramBlockToPngUrl,
    renderDiagramBlockPng,
} from "../diagram-from-article";

const ARTICLE_ID = "b08da6f0-c461-47df-a073-acf88a543f76";
const ARTICLE = `/opt/local/data/block-style-cms/articles/${ARTICLE_ID}.json`;

describe("article mermaid via articleId+blockId", () => {
    it.skipIf(!existsSync(ARTICLE))(
        "loads block from article and renders PNG",
        async () => {
            const art = JSON.parse(readFileSync(ARTICLE, "utf8"));
            const block = art.content.find(
                (b: { type: string }) => b.type === "mermaid"
            );
            expect(block?.id).toBeTruthy();
            expect(block?.props?.code).toContain("flowchart LR");

            const url = diagramBlockToPngUrl(
                ARTICLE_ID,
                block.id,
                "http://localhost:3000"
            );
            expect(url).toBe(
                `http://localhost:3000/export/diagram/${ARTICLE_ID}/${block.id}.png`
            );

            const png = await renderDiagramBlockPng(ARTICLE_ID, block.id);
            expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
            expect(png.length).toBeGreaterThan(200);
            writeFileSync("/tmp/mermaid-verify.png", png);

            const html = await blocksToHtml(art.content, {
                baseUrl: "http://localhost:3000",
                articleId: ARTICLE_ID,
                demoteHeadingsForShell: true,
                flattenNestedLists: true,
            });
            expect(html).toContain(url);
            expect(html).not.toContain("flowchart LR");
        },
        60_000
    );
});
