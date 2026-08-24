import { render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";

// Mock @blocknote/react components
vi.mock("@blocknote/react", () => ({
    FormattingToolbar: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="formatting-toolbar">{children}</div>
    ),
    BlockTypeSelect: () => (
        <button type="button" data-testid="block-type-select">
            BlockType
        </button>
    ),
    BasicTextStyleButton: ({ basicTextStyle }: { basicTextStyle: string }) => (
        <button type="button" data-testid={`style-${basicTextStyle}`}>
            {basicTextStyle}
        </button>
    ),
    TextAlignButton: ({ textAlignment }: { textAlignment: string }) => (
        <button type="button" data-testid={`align-${textAlignment}`}>
            {textAlignment}
        </button>
    ),
    CreateLinkButton: () => (
        <button type="button" data-testid="create-link">
            Link
        </button>
    ),
    NestBlockButton: () => (
        <button type="button" data-testid="nest-block">
            Nest
        </button>
    ),
    UnnestBlockButton: () => (
        <button type="button" data-testid="unnest-block">
            Unnest
        </button>
    ),
    TableCellMergeButton: () => (
        <button type="button" data-testid="table-cell-merge">
            Merge
        </button>
    ),
    useBlockNoteEditor: () => ({}),
}));

// Mock color picker (uses useBlockNoteEditor internally)
vi.mock("../color-picker-button", () => ({
    ColorPickerButton: ({ type }: { type: string }) => (
        <button type="button" data-testid={`color-${type}`}>
            {type}
        </button>
    ),
}));

import EnhancedFormattingToolbar from "../enhanced-formatting-toolbar";

describe("EnhancedFormattingToolbar", () => {
    it("renders toolbar with all components", () => {
        const { asFragment } = render(<EnhancedFormattingToolbar />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("contains block type select", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("block-type-select")).toBeTruthy();
    });

    it("contains text style buttons", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("style-bold")).toBeTruthy();
        expect(getByTestId("style-italic")).toBeTruthy();
        expect(getByTestId("style-underline")).toBeTruthy();
        expect(getByTestId("style-strike")).toBeTruthy();
    });

    it("contains text align buttons", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("align-left")).toBeTruthy();
        expect(getByTestId("align-center")).toBeTruthy();
        expect(getByTestId("align-right")).toBeTruthy();
    });

    it("contains color buttons", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("color-textColor")).toBeTruthy();
        expect(getByTestId("color-backgroundColor")).toBeTruthy();
    });

    it("contains nest and unnest buttons", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("nest-block")).toBeTruthy();
        expect(getByTestId("unnest-block")).toBeTruthy();
    });

    it("contains create link button", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("create-link")).toBeTruthy();
    });

    it("contains table cell merge button", () => {
        const { getByTestId } = render(<EnhancedFormattingToolbar />);
        expect(getByTestId("table-cell-merge")).toBeTruthy();
    });

    it("renders separators between button groups", () => {
        const { container } = render(<EnhancedFormattingToolbar />);
        const separators = container.querySelectorAll('[aria-hidden="true"]');
        expect(separators.length).toBe(6);
    });
});
