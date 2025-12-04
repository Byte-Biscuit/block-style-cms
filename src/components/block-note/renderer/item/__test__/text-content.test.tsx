import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { type StyledText, type DefaultStyleSchema } from "@blocknote/core";
import TextContent from "../text-content";

describe("TextContent", () => {
    it("renders text and applies style classes from styles object", () => {
        const item = {
            type: "text",
            text: "测试文本内容",
            styles: {
                bold: true,
                italic: true,
                underline: true,
                strike: false,
                textColor: "red",
                backgroundColor: "blue",
            },
        } as StyledText<DefaultStyleSchema>;

        //const { asFragment, container } = render(<FormattedText item={item} />);
        const { asFragment } = render(<TextContent item={item} />);
        //screen.debug();
        //console.log(container.innerHTML);
        const el = screen.getByText("测试文本内容") as HTMLElement;
        expect(el).toBeTruthy();

        const className = el.className;
        // basic text style classes
        expect(className).toContain("font-bold");
        expect(className).toContain("italic");
        expect(className).toContain("underline");
        expect(className).not.toContain("line-through");

        // color mapping (from meta.twColorMap)
        // red -> text-red-600
        expect(className).toContain("text-red-500");
        // blue -> bg-sky-100 (background mapping)
        expect(className).toContain("bg-blue-100");

        expect(asFragment()).toMatchSnapshot();
    });
});
