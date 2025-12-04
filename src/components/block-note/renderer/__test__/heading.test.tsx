import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Heading, type HeadingBlock } from "../heading";

describe("Heading", () => {
    it("renders h1 heading", () => {
        const block: HeadingBlock = {
            id: "h1",
            type: "heading",
            props: {
                level: 1,
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [{ type: "text", text: "Heading 1", styles: {} }],
            children: [],
        };

        const { asFragment } = render(<Heading data={block} index={1} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders h3 heading with link", () => {
        const block: HeadingBlock = {
            id: "h3",
            type: "heading",
            props: {
                level: 3,
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                { type: "text", text: "Check ", styles: {} },
                {
                    type: "link",
                    href: "https://example.com",
                    content: [{ type: "text", text: "this link", styles: { bold: true } }],
                },
            ],
            children: [],
        };

        const { asFragment } = render(<Heading data={block} index={2} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders heading with text alignment", () => {
        const block: HeadingBlock = {
            id: "h2-center",
            type: "heading",
            props: {
                level: 2,
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "center",
            },
            content: [{ type: "text", text: "Centered Heading", styles: {} }],
            children: [],
        };

        const { asFragment } = render(<Heading data={block} index={3} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("returns null when content is empty", () => {
        const block: HeadingBlock = {
            id: "empty",
            type: "heading",
            props: {
                level: 2,
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [],
            children: [],
        };

        const { container } = render(<Heading data={block} />);
        expect(container.firstChild).toBeNull();
    });
});
