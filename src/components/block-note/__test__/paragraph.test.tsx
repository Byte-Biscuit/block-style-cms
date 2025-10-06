import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Paragraph } from "../paragraph";
import type { BlockData, TextContent, LinkContent } from "../meta";

describe("Paragraph", () => {
    it("renders complex paragraph with mixed text, styled text, and link content", () => {
        const paragraphData: BlockData = {
            id: "084b6db0-1ec5-49d9-b1cc-4194342684cc",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                {
                    type: "text",
                    text: "When using Snapshots with async concurrent tests, ",
                    styles: {},
                },
                {
                    type: "text",
                    text: "expect",
                    styles: {
                        code: true,
                    },
                },
                {
                    type: "text",
                    text: " from the local ",
                    styles: {},
                },
                {
                    type: "link",
                    href: "https://vitest.dev/guide/test-context",
                    content: [
                        {
                            type: "text",
                            text: "Test Context",
                            styles: {
                                bold: true,
                                underline: true,
                            },
                        },
                    ],
                },
                {
                    type: "text",
                    text: " must be used to ensure the right test is detected.",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(<Paragraph data={paragraphData} />);

        // 验证段落元素存在
        const paragraphElement = screen.getByText(
            /When using Snapshots with async concurrent tests/
        );
        expect(paragraphElement).toBeTruthy();
        expect(paragraphElement.tagName).toBe("P");

        // 验证代码样式的文本
        const codeText = screen.getByText("expect");
        expect(codeText).toBeTruthy();
        expect(codeText.className).toContain("font-mono");
        expect(codeText.className).toContain("bg-gray-100");

        // 验证链接元素
        const linkElement = screen.getByRole("link") as HTMLAnchorElement;
        expect(linkElement).toBeTruthy();
        expect(linkElement.href).toBe("https://vitest.dev/guide/test-context");

        // 验证链接内的文本样式
        const linkText = screen.getByText("Test Context");
        expect(linkText).toBeTruthy();
        expect(linkText.className).toContain("font-bold");
        expect(linkText.className).toContain("underline");

        // 验证完整文本内容
        expect(paragraphElement.textContent).toContain(
            "When using Snapshots with async concurrent tests, expect from the local Test Context must be used to ensure the right test is detected."
        );

        // Snapshot 测试
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders simple paragraph with plain text", () => {
        const simpleParagraphData: BlockData = {
            id: "simple-paragraph",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                {
                    type: "text",
                    text: "This is a simple paragraph with plain text.",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(<Paragraph data={simpleParagraphData} />);

        const paragraphElement = screen.getByText(
            "This is a simple paragraph with plain text."
        );
        expect(paragraphElement).toBeTruthy();
        expect(paragraphElement.tagName).toBe("P");

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with different text alignments", () => {
        const centerAlignedData: BlockData = {
            id: "center-paragraph",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "center",
            },
            content: [
                {
                    type: "text",
                    text: "Center aligned text",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { rerender, asFragment } = render(
            <Paragraph data={centerAlignedData} />
        );

        const centerElement = screen.getByText("Center aligned text");
        expect(centerElement.className).toContain("text-center");

        // Test right alignment
        const rightAlignedData: BlockData = {
            ...centerAlignedData,
            id: "right-paragraph",
            content: [
                {
                    type: "text",
                    text: "Right aligned text",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            props: {
                ...centerAlignedData.props,
                textAlignment: "right",
            },
        };

        rerender(<Paragraph data={rightAlignedData} />);
        const rightElement = screen.getByText("Right aligned text");
        expect(rightElement.className).toContain("text-right");

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with different background and text colors", () => {
        const coloredParagraphData: BlockData = {
            id: "colored-paragraph",
            type: "paragraph",
            props: {
                textColor: "red",
                backgroundColor: "yellow",
                textAlignment: "left",
            },
            content: [
                {
                    type: "text",
                    text: "Colored paragraph text",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(
            <Paragraph data={coloredParagraphData} />
        );

        const paragraphElement = screen.getByText("Colored paragraph text");
        expect(paragraphElement.className).toContain("text-red-600");
        expect(paragraphElement.className).toContain("bg-yellow-100");

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with all text styles", () => {
        const styledParagraphData: BlockData = {
            id: "styled-paragraph",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                {
                    type: "text",
                    text: "This is bold, ",
                    styles: { bold: true },
                },
                {
                    type: "text",
                    text: "this is italic, ",
                    styles: { italic: true },
                },
                {
                    type: "text",
                    text: "this is underlined, ",
                    styles: { underline: true },
                },
                {
                    type: "text",
                    text: "this is strikethrough, ",
                    styles: { strike: true },
                },
                {
                    type: "text",
                    text: "and this is code",
                    styles: { code: true },
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(<Paragraph data={styledParagraphData} />);

        const boldText = screen.getByText("This is bold,");
        expect(boldText.className).toContain("font-bold");

        const italicText = screen.getByText("this is italic,");
        expect(italicText.className).toContain("italic");

        const underlineText = screen.getByText("this is underlined,");
        expect(underlineText.className).toContain("underline");

        const strikeText = screen.getByText("this is strikethrough,");
        expect(strikeText.className).toContain("line-through");

        const codeText = screen.getByText("and this is code");
        expect(codeText.className).toContain("font-mono");

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders empty paragraph without content", () => {
        const emptyParagraphData: BlockData = {
            id: "empty-paragraph",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [],
            children: [],
        };

        const { asFragment } = render(<Paragraph data={emptyParagraphData} />);

        const paragraphElement = screen.getByRole("paragraph", {
            hidden: true,
        });
        expect(paragraphElement).toBeTruthy();
        expect(paragraphElement.textContent).toBe("");

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with multiple links", () => {
        const multiLinkParagraphData: BlockData = {
            id: "multi-link-paragraph",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                {
                    type: "text",
                    text: "Check out ",
                    styles: {},
                },
                {
                    type: "link",
                    href: "https://vitest.dev",
                    content: [
                        {
                            type: "text",
                            text: "Vitest",
                            styles: {},
                        },
                    ],
                },
                {
                    type: "text",
                    text: " and ",
                    styles: {},
                },
                {
                    type: "link",
                    href: "https://react.dev",
                    content: [
                        {
                            type: "text",
                            text: "React",
                            styles: { bold: true },
                        },
                    ],
                },
                {
                    type: "text",
                    text: " documentation.",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(
            <Paragraph data={multiLinkParagraphData} />
        );

        const vitestLink = screen.getByRole("link", { name: "Vitest" });
        expect(vitestLink).toBeTruthy();
        expect((vitestLink as HTMLAnchorElement).href).toBe(
            "https://vitest.dev/"
        );

        const reactLink = screen.getByRole("link", { name: "React" });
        expect(reactLink).toBeTruthy();
        expect((reactLink as HTMLAnchorElement).href).toBe(
            "https://react.dev/"
        );

        const reactText = screen.getByText("React");
        expect(reactText.className).toContain("font-bold");

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph without props (minimal data)", () => {
        const minimalParagraphData: BlockData = {
            id: "minimal-paragraph",
            type: "paragraph",
            content: [
                {
                    type: "text",
                    text: "Minimal paragraph without props",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(
            <Paragraph data={minimalParagraphData} />
        );

        const paragraphElement = screen.getByText(
            "Minimal paragraph without props"
        );
        expect(paragraphElement).toBeTruthy();
        expect(paragraphElement.tagName).toBe("P");
        // Should not have additional classes when no props
        //expect(paragraphElement.className).toBe("");

        expect(asFragment()).toMatchSnapshot();
    });
});
