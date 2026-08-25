import type { DefaultStyleSchema, Link as LinkType } from "@blocknote/core";
import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import LinkContent from "../../item/link-content";

describe("LinkContent", () => {
    it("renders link with plain text", () => {
        const item: LinkType<DefaultStyleSchema> = {
            type: "link",
            href: "https://example.com",
            content: [{ type: "text", text: "Example Link", styles: {} }],
        };

        const { asFragment } = render(<LinkContent item={item} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders link with styled text", () => {
        const item: LinkType<DefaultStyleSchema> = {
            type: "link",
            href: "https://example.com",
            content: [
                { type: "text", text: "Bold ", styles: { bold: true } },
                { type: "text", text: "Italic", styles: { italic: true } },
            ],
        };

        const { asFragment } = render(<LinkContent item={item} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("returns null when href is missing", () => {
        const item = {
            type: "link",
            href: "",
            content: [{ type: "text", text: "No Link", styles: {} }],
        } as LinkType<DefaultStyleSchema>;

        const { container } = render(<LinkContent item={item} />);
        expect(container.firstChild).toBeNull();
    });

    it("returns null when content is empty", () => {
        const item: LinkType<DefaultStyleSchema> = {
            type: "link",
            href: "https://example.com",
            content: [],
        };

        const { container } = render(<LinkContent item={item} />);
        expect(container.firstChild).toBeNull();
    });
});
