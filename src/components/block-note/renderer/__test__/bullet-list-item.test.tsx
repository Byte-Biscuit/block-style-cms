import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BulletListItem, type BulletListItemBlock } from "../bullet-list-item";

describe("BulletListItem", () => {
    it("renders simple bullet list item", () => {
        const block: BulletListItemBlock = {
            id: "b1",
            type: "bulletListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [{ type: "text", text: "First item", styles: {} }],
            children: [],
        };

        const { asFragment } = render(
            <ul>
                <BulletListItem block={block} />
            </ul>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders bullet list item with styled text", () => {
        const block: BulletListItemBlock = {
            id: "b2",
            type: "bulletListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                { type: "text", text: "Bold ", styles: { bold: true } },
                { type: "text", text: "text", styles: {} },
            ],
            children: [],
        };

        const { asFragment } = render(
            <ul>
                <BulletListItem block={block} />
            </ul>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders bullet list item with link", () => {
        const block: BulletListItemBlock = {
            id: "b3",
            type: "bulletListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [
                { type: "text", text: "Check ", styles: {} },
                {
                    type: "link",
                    href: "https://example.com",
                    content: [{ type: "text", text: "this link", styles: {} }],
                },
            ],
            children: [],
        };

        const { asFragment } = render(
            <ul>
                <BulletListItem block={block} />
            </ul>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders empty bullet list item", () => {
        const block: BulletListItemBlock = {
            id: "b4",
            type: "bulletListItem",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [],
            children: [],
        };

        const { asFragment } = render(
            <ul>
                <BulletListItem block={block} />
            </ul>
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
