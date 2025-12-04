import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Paragraph, type ParagraphBlock } from "../paragraph";

describe("Paragraph", () => {
    it("renders simple paragraph", () => {
        const block: ParagraphBlock = {
            id: "p1",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                { type: "text", text: "Hello World", styles: {} },
            ],
            children: [],
        };

        const { asFragment } = render(<Paragraph block={block} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with styled text", () => {
        const block: ParagraphBlock = {
            id: "p2",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                { type: "text", text: "Bold ", styles: { bold: true } },
                { type: "text", text: "Italic ", styles: { italic: true } },
                { type: "text", text: "Code", styles: { code: true } },
            ],
            children: [],
        };

        const { asFragment } = render(<Paragraph block={block} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with link", () => {
        const block: ParagraphBlock = {
            id: "p3",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                { type: "text", text: "Visit ", styles: {} },
                {
                    type: "link",
                    href: "https://example.com",
                    content: [{ type: "text", text: "Example", styles: {} }],
                },
            ],
            children: [],
        };

        const { asFragment } = render(<Paragraph block={block} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders paragraph with text alignment", () => {
        const block: ParagraphBlock = {
            id: "p4",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "center",
            },
            content: [
                { type: "text", text: "Centered text", styles: {} },
            ],
            children: [],
        };

        const { asFragment } = render(<Paragraph block={block} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders empty paragraph", () => {
        const block: ParagraphBlock = {
            id: "p5",
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [],
            children: [],
        };

        const { asFragment } = render(<Paragraph block={block} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
