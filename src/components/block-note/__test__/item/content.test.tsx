import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Content from "../../item/content";
import type { TextContent, LinkContent } from "../../meta";

describe("Content", () => {
    it("renders mixed array of text and link content correctly", () => {
        const items: (TextContent | LinkContent)[] = [
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
        ];

        const { asFragment } = render(<Content items={items} />);

        // 验证第一个文本节点 "这是"
        //const firstText = screen.getByText("这是");
        //expect(firstText).toBeTruthy();

        // 验证链接元素
        const linkEl = screen.getByRole("link") as HTMLAnchorElement;
        expect(linkEl).toBeTruthy();
        expect(linkEl.href).toBe("https://studio.xiyue.space/");

        // 验证链接内的第一个文本 "文" (无样式)
        const linkText1 = screen.getByText("文");
        expect(linkText1).toBeTruthy();
        //expect(linkText1.tagName).toBe("SPAN");

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

        // 验证整体渲染结构
        expect(screen.getByText("文")).toBeTruthy();
        expect(screen.getByText("字")).toBeTruthy();

        // snapshot 验证
        expect(asFragment()).toMatchSnapshot();
    });

    it("handles empty items array", () => {
        const { container } = render(<Content items={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it("handles undefined items prop", () => {
        const { container } = render(<Content />);
        expect(container.firstChild).toBeNull();
    });
});
