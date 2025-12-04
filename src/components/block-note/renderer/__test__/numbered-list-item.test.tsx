import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NumberedListItem, type NumberedListBlock } from "../numbered-list-item";
// Ignore start property from props for testing
describe("NumberedListItem", () => {
    it("renders simple numbered list item", () => {
        const block: NumberedListBlock = {
            id: "n1",
            type: "numberedListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
                start: 0,
            },
            content: [{ type: "text", text: "First item", styles: {} }],
            children: [],
        };

        const { asFragment } = render(
            <ol>
                <NumberedListItem block={block} />
            </ol>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders numbered list item with styled text", () => {
        const block: NumberedListBlock = {
            id: "n2",
            type: "numberedListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
                start: 0,
            },
            content: [
                { type: "text", text: "Italic ", styles: { italic: true } },
                { type: "text", text: "text", styles: {} },
            ],
            children: [],
        };

        const { asFragment } = render(
            <ol>
                <NumberedListItem block={block} />
            </ol>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders numbered list item with link", () => {
        const block: NumberedListBlock = {
            id: "n3",
            type: "numberedListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
                start: 0,
            },
            content: [
                { type: "text", text: "Visit ", styles: {} },
                {
                    type: "link",
                    href: "https://example.com",
                    content: [{ type: "text", text: "Example", styles: { underline: true } }],
                },
            ],
            children: [],
        };

        const { asFragment } = render(
            <ol>
                <NumberedListItem block={block} />
            </ol>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders empty numbered list item", () => {
        const block: NumberedListBlock = {
            id: "n4",
            type: "numberedListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
                start: 0,
            },
            content: [],
            children: [],
        };

        const { asFragment } = render(
            <ol>
                <NumberedListItem block={block} />
            </ol>
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
