import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FormattedText from "../../item/text-content";
import type { TextContent } from "../../meta";

describe("FormattedText", () => {
    it("renders text and applies style classes from styles object", () => {
        const item = {
            type: "text",
            text: "试文",
            styles: {
                bold: true,
                italic: true,
                underline: true,
                strike: false,
                textColor: "red",
                backgroundColor: "blue",
            },
        } as TextContent;

        //const { asFragment, container } = render(<FormattedText item={item} />);
        const { asFragment } = render(<FormattedText item={item} />);
        //screen.debug();
        //console.log(container.innerHTML);
        const el = screen.getByText("试文") as HTMLElement;
        expect(el).toBeTruthy();

        const className = el.className;
        // basic text style classes
        expect(className).toContain("font-bold");
        expect(className).toContain("italic");
        expect(className).toContain("underline");
        expect(className).not.toContain("line-through");

        // color mapping (from meta.twColorMap)
        // red -> text-red-600
        expect(className).toContain("text-red-600");
        // blue -> bg-sky-100 (background mapping)
        expect(className).toContain("bg-sky-100");

        expect(asFragment()).toMatchSnapshot();
    });
});
