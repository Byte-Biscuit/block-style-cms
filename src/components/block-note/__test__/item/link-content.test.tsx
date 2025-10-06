import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FormattedLink from "../../item/link-content";
import type { LinkContent } from "../../meta";

describe("FormattedLink", () => {
    it("renders link with nested text content and applies correct styles", () => {
        const item = {
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
        } as LinkContent;

        const { asFragment } = render(<FormattedLink item={item} />);

        // 验证链接存在且href正确
        const linkEl = screen.getByRole("link") as HTMLAnchorElement;
        expect(linkEl).toBeTruthy();
        expect(linkEl.href).toBe("https://studio.xiyue.space/");

        // 验证第一个文本节点 "文" (无样式)
        const firstTextEl = screen.getByText("文");
        expect(firstTextEl).toBeTruthy();

        // 验证第二个文本节点 "字" (有样式)
        const secondTextEl = screen.getByText("字");
        expect(secondTextEl).toBeTruthy();
        expect(secondTextEl.tagName).toBe("SPAN");

        const secondClassName = secondTextEl.className;
        expect(secondClassName).toContain("font-bold");
        expect(secondClassName).toContain("italic");
        expect(secondClassName).toContain("underline");
        expect(secondClassName).toContain("line-through");
        expect(secondClassName).toContain("text-red-600");

        // snapshot 验证
        expect(asFragment()).toMatchSnapshot();
    });
});
