import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Content from "../../item/content";
import type {
    InlineContent,
    DefaultInlineContentSchema,
    DefaultStyleSchema,
} from "@blocknote/core";

type ContentItem = InlineContent<DefaultInlineContentSchema, DefaultStyleSchema>;

describe("Content", () => {
    it("renders text content", () => {
        const items: ContentItem[] = [
            { type: "text", text: "Hello World", styles: {} },
        ];

        const { asFragment } = render(<Content items={items} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders mixed text and link content", () => {
        const items: ContentItem[] = [
            { type: "text", text: "Visit ", styles: {} },
            {
                type: "link",
                href: "https://example.com",
                content: [{ type: "text", text: "Example", styles: { bold: true } }],
            },
            { type: "text", text: " for more.", styles: {} },
        ];

        const { asFragment } = render(<Content items={items} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders styled text content", () => {
        const items: ContentItem[] = [
            { type: "text", text: "Bold ", styles: { bold: true } },
            { type: "text", text: "Italic ", styles: { italic: true } },
            { type: "text", text: "Code", styles: { code: true } },
        ];

        const { asFragment } = render(<Content items={items} />);
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
