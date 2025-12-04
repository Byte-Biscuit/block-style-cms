import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import CodeBlock from "../code-block";

// Mock dependencies
vi.mock("next-themes", () => ({
    useTheme: vi.fn(),
}));

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}));

vi.mock("@/components/code-loading", () => ({
    default: ({ variant, lines }: { variant: string; lines: number }) => (
        <div
            data-testid="code-loading"
            data-variant={variant}
            data-lines={lines}
        >
            Loading code...
        </div>
    ),
}));

// Mock react-syntax-highlighter with Prism
vi.mock("react-syntax-highlighter", () => ({
    Prism: ({
        language,
        children,
        showLineNumbers,
    }: {
        language: string;
        children: string;
        showLineNumbers?: boolean;
        customStyle?: unknown;
    }) => (
        <pre
            data-testid="syntax-highlighter"
            data-language={language}
            data-show-line-numbers={showLineNumbers}
            className="syntax-highlighter"
        >
            <code>{children}</code>
        </pre>
    ),
}));

describe("CodeBlock", () => {
    const mockUseTheme = vi.mocked(useTheme);
    const mockUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        mockUseTheme.mockReturnValue({
            resolvedTheme: "light",
            themes: ["light", "dark"],
            setTheme: vi.fn(),
            theme: "light",
            systemTheme: "light",
            forcedTheme: undefined,
        });

        // Mock useTranslations to return a simple translator function
        mockUseTranslations.mockImplementation(() => {
            const translations: Record<string, string> = {
                copied: "Copied!",
                copy: "Copy",
            };

            return ((key: string) => translations[key] ?? key) as ReturnType<
                typeof useTranslations
            >;
        });
    });

    it("renders code block with vitest test code (from data sample)", async () => {
        const vitestCode = `import { expect, test } from 'vitest'

test('snapshot', () => {
  // in Jest and Vitest
  expect(new Error('error')).toMatchInlineSnapshot(\`[Error: error]\`)

  // Jest snapshots \`Error.message\` for \`Error\` instance
  // Vitest prints the same value as toMatchInlineSnapshot
  expect(() => {
    throw new Error('error')
  }).toThrowErrorMatchingInlineSnapshot(\`[Error: error]\`) 
})`;

        const { asFragment } = render(
            <CodeBlock language="" code={vitestCode} />
        );

        // Wait for dynamic import to resolve
        await waitFor(() => {
            const syntaxHighlighter =
                screen.queryByTestId("syntax-highlighter");
            expect(syntaxHighlighter).toBeTruthy();
        });

        const syntaxHighlighter = screen.getByTestId("syntax-highlighter");
        expect(syntaxHighlighter).toBeTruthy();
        expect(syntaxHighlighter.getAttribute("data-language")).toBe("");

        // Verify the code content is rendered
        const codeElement = syntaxHighlighter.querySelector("code");
        expect(codeElement).toBeTruthy();
        expect(codeElement?.textContent).toBe(vitestCode);

        // Verify copy button is present
        const copyButton = screen.getByRole("button", { name: /copy/i });
        expect(copyButton).toBeTruthy();
        expect(copyButton.textContent).toContain("Copy");

        // Snapshot test
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders code block with typescript language", async () => {
        const tsCode = `interface User {
  id: number;
  name: string;
}`;

        const { asFragment } = render(
            <CodeBlock language="ts" code={tsCode} />
        );

        await waitFor(() => {
            const syntaxHighlighter =
                screen.queryByTestId("syntax-highlighter");
            expect(syntaxHighlighter).toBeTruthy();
        });

        const syntaxHighlighter = screen.getByTestId("syntax-highlighter");
        //expect(syntaxHighlighter.getAttribute("data-language")).toBe("typescript");

        // Verify language tag shows "TS"
        const languageTag = screen.getByText("TS");
        expect(languageTag).toBeTruthy();

        const codeElement = syntaxHighlighter.querySelector("code");
        expect(codeElement?.textContent).toBe(tsCode);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders code block with custom language", async () => {
        const pythonCode = `def hello():
    print("Hello World!")`;

        const { asFragment } = render(
            <CodeBlock language="python" code={pythonCode} />
        );

        await waitFor(() => {
            const syntaxHighlighter =
                screen.queryByTestId("syntax-highlighter");
            expect(syntaxHighlighter).toBeTruthy();
        });

        const syntaxHighlighter = screen.getByTestId("syntax-highlighter");
        expect(syntaxHighlighter.getAttribute("data-language")).toBe("python");

        // Verify language tag shows "PYTHON"
        const languageTag = screen.getByText("PYTHON");
        expect(languageTag).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });
});
