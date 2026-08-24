import { describe, expect, it } from "vitest";
import {
    markdownToBlocks,
    resolveStoredCodeLanguage,
    UnresolvedImagePathsError,
} from "../md-to-blocks";

type LooseBlock = {
    type: string;
    props?: Record<string, unknown>;
    content?: Array<{ type: string; text?: string }>;
    children?: LooseBlock[];
};

describe("resolveStoredCodeLanguage", () => {
    it("maps aliases and known ids", () => {
        expect(resolveStoredCodeLanguage("ts")).toBe("typescript");
        expect(resolveStoredCodeLanguage("typescript")).toBe("typescript");
        expect(resolveStoredCodeLanguage("py")).toBe("python");
    });

    it("falls back to text for unknown languages", () => {
        expect(resolveStoredCodeLanguage("unknownlang")).toBe("text");
        expect(resolveStoredCodeLanguage("")).toBe("text");
    });
});

describe("markdownToBlocks", () => {
    it("maps /images/ src to enhancedImage with source upload", async () => {
        const blocks = (await markdownToBlocks(
            "![a](/images/x.webp)"
        )) as LooseBlock[];
        const image = blocks.find((b) => b.type === "enhancedImage");
        expect(image).toBeTruthy();
        expect(image?.props?.src).toBe("/images/x.webp");
        expect(image?.props?.alt).toBe("a");
        expect(image?.props?.source).toBe("upload");
    });

    it("maps https image to enhancedImage with source url", async () => {
        const blocks = (await markdownToBlocks(
            "![a](https://cdn.example/a.png)"
        )) as LooseBlock[];
        const image = blocks.find((b) => b.type === "enhancedImage");
        expect(image?.props?.src).toBe("https://cdn.example/a.png");
        expect(image?.props?.source).toBe("url");
    });

    it("rejects relative image paths", async () => {
        await expect(
            markdownToBlocks("![a](./assets/x.png)")
        ).rejects.toBeInstanceOf(UnresolvedImagePathsError);

        try {
            await markdownToBlocks("![a](./assets/x.png)");
        } catch (error) {
            expect(error).toBeInstanceOf(UnresolvedImagePathsError);
            expect((error as UnresolvedImagePathsError).paths).toContain(
                "./assets/x.png"
            );
        }
    });

    it("maps mermaid fence to mermaid block", async () => {
        const md = "```mermaid\nflowchart TD\n  A-->B\n```";
        const blocks = (await markdownToBlocks(md)) as LooseBlock[];
        const mermaid = blocks.find((b) => b.type === "mermaid");
        expect(mermaid).toBeTruthy();
        expect(mermaid?.props?.code).toContain("flowchart TD");
        expect(mermaid?.props?.mode).toBe("preview");
        expect(mermaid?.props?.theme).toBe("default");
    });

    it("maps svg fence to svg block", async () => {
        const md =
            '```svg\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>\n```';
        const blocks = (await markdownToBlocks(md)) as LooseBlock[];
        const svg = blocks.find((b) => b.type === "svg");
        expect(svg).toBeTruthy();
        expect(svg?.props?.code).toContain("<svg");
        expect(svg?.props?.code).toContain("<circle");
        expect(blocks.some((b) => b.type === "codeBlock")).toBe(false);
    });

    it("keeps html fence with svg markup as codeBlock", async () => {
        const md =
            '```html\n<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>\n```';
        const blocks = (await markdownToBlocks(md)) as LooseBlock[];
        const code = blocks.find((b) => b.type === "codeBlock");
        expect(code?.props?.language).toBe("html");
        expect(blocks.some((b) => b.type === "svg")).toBe(false);
    });

    it("maps ts fence to codeBlock with typescript language", async () => {
        const md = "```ts\nconst x = 1;\n```";
        const blocks = (await markdownToBlocks(md)) as LooseBlock[];
        const code = blocks.find((b) => b.type === "codeBlock");
        expect(code?.props?.language).toBe("typescript");
        expect(code?.content?.[0]?.text).toContain("const x = 1");
    });

    it("maps unknown fence language to text", async () => {
        const md = "```unknownlang\nfoo\n```";
        const blocks = (await markdownToBlocks(md)) as LooseBlock[];
        const code = blocks.find((b) => b.type === "codeBlock");
        expect(code?.props?.language).toBe("text");
    });

    it("drops first H1 when it matches title option", async () => {
        const md = "# My Title\n\nBody paragraph.";
        const blocks = (await markdownToBlocks(md, {
            title: "My Title",
        })) as LooseBlock[];
        expect(blocks[0]?.type).toBe("paragraph");
        expect(blocks.some((b) => b.type === "heading")).toBe(false);
    });
});
