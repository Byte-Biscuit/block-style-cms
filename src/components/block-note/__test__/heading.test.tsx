import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Heading } from "../heading";
import type { BlockData, TextContent, LinkContent } from "../meta";

describe("Heading", () => {
    it("renders h3 heading with mixed text and link content", () => {
        const headingData: BlockData & { props: { level: number } } = {
            id: "c33232af-a262-468e-a7e9-4df7d899af56",
            type: "heading",
            props: {
                textColor: "red",
                backgroundColor: "green",
                textAlignment: "center",
                level: 3,
                isToggleable: false,
            },
            content: [
                {
                    type: "text",
                    text: "这是",
                    styles: {},
                },
                {
                    type: "link",
                    href: "https://studio.xiyue.space",
                    content: [
                        {
                            type: "text",
                            text: "文",
                            styles: {},
                        },
                        {
                            type: "text",
                            text: "字",
                            styles: {
                                bold: true,
                                italic: true,
                                underline: true,
                                strike: true,
                                textColor: "red",
                            },
                        },
                    ],
                },
                {
                    type: "text",
                    text: "数据",
                    styles: {},
                },
            ] as (TextContent | LinkContent)[],
            children: [],
        };

        const { asFragment } = render(<Heading data={headingData} />);

        // 验证渲染的是 h3 标签
        const headingElement = screen.getByRole("heading", { level: 3 });
        expect(headingElement).toBeTruthy();
        expect(headingElement.tagName).toBe("H3");

        // 验证链接元素
        const linkEl = screen.getByRole("link") as HTMLAnchorElement;
        expect(linkEl).toBeTruthy();
        expect(linkEl.href).toBe("https://studio.xiyue.space/");

        // 验证链接内的第二个文本 "字" (有样式)
        const linkText2 = screen.getByText("字");
        expect(linkText2).toBeTruthy();
        expect(linkText2.tagName).toBe("SPAN");

        const styledClassName = linkText2.className;
        expect(styledClassName).toContain("font-bold");
        expect(styledClassName).toContain("italic");
        expect(styledClassName).toContain("underline");
        expect(styledClassName).toContain("line-through");
        expect(styledClassName).toContain("text-red-600");

        // 验证标题包含所有文本内容 (使用 DOM 查询验证包含关系)
        expect(headingElement.contains(linkEl)).toBe(true);

        // 验证默认样式类（左对齐，默认颜色）
        const headingClassName = headingElement.className;
        expect(headingClassName).not.toContain("text-right");
        expect(headingClassName).not.toContain("text-left");

        // snapshot 验证
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders different heading levels correctly", () => {
        const h1Data = {
            id: "test-h1",
            type: "heading",
            props: { level: 1 },
            content: [
                { type: "text" as const, text: "H1 Title", styles: {} },
            ] as (TextContent | LinkContent)[],
            children: [],
        } as BlockData & { props: { level: number } };

        const { rerender } = render(<Heading data={h1Data} />);

        const h1Element = screen.getByRole("heading", { level: 1 });
        expect(h1Element.tagName).toBe("H1");

        // 测试 h6
        const h6Data = {
            ...h1Data,
            props: { level: 6 },
            content: [
                { type: "text" as const, text: "H6 Title", styles: {} },
            ] as (TextContent | LinkContent)[],
        };
        rerender(<Heading data={h6Data} />);

        const h6Element = screen.getByRole("heading", { level: 6 });
        expect(h6Element.tagName).toBe("H6");
    });

    it("returns null when props is missing", () => {
        const invalidData = {
            id: "invalid",
            type: "heading",
            content: [{ type: "text" as const, text: "Test", styles: {} }] as (
                | TextContent
                | LinkContent
            )[],
            children: [],
        } as unknown as BlockData & { props: { level: number } };

        const { container } = render(<Heading data={invalidData} />);
        expect(container.firstChild).toBeNull();
    });

    it("returns null when content is empty", () => {
        const emptyContentData = {
            id: "empty",
            type: "heading",
            props: { level: 2 },
            content: [],
            children: [],
        } as BlockData & { props: { level: number } };

        const { container } = render(<Heading data={emptyContentData} />);
        expect(container.firstChild).toBeNull();
    });
});
