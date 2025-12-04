"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeLoading from "@/components/code-loading";

/**
 * import SyntaxHighlighter from 'react-syntax-highlighter';
 * Default using highlight.js for better performance.
 * If you want to use Prism, you can change the import statement to:
 * import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
 *
 * You can choose different themes from 'react-syntax-highlighter/dist/esm/styles/prism' or 'react-syntax-highlighter/dist/esm/styles/hljs'
 */

const SyntaxHighlighter = dynamic(
    // import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
    () => import("react-syntax-highlighter").then((mod) => mod.Prism),
    { ssr: false, loading: () => <CodeLoading variant="skeleton" lines={2} /> }
);

export default function CodeBlock({
    language,
    code,
}: {
    language: string;
    code: string;
}) {
    const t = useTranslations("web.article");
    const [copied, setCopied] = useState(false);
    const { resolvedTheme } = useTheme();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <figure
            className="relative my-4 w-full"
            data-language={language}
            aria-label={`Code sample in ${language}`}
        >
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                {language && language.trim().length > 0 && (
                    <span
                        className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        aria-hidden="true"
                    >
                        {language?.toUpperCase()}
                    </span>
                )}
                <button
                    onClick={handleCopy}
                    className="rounded-md bg-gray-700 px-3 py-1 text-xs text-white transition hover:bg-gray-600"
                    aria-label={`Copy ${language} code`}
                    type="button"
                >
                    {copied ? t("copied") : t("copy")}
                </button>
            </div>

            <SyntaxHighlighter
                language={language}
                wrapLines
                showLineNumbers
                style={resolvedTheme === "dark" ? dracula : solarizedlight}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.9rem",
                    fontFamily:
                        'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
                    fontFeatureSettings: '"liga" 0',
                    borderRadius: 6,
                }}
            >
                {code}
            </SyntaxHighlighter>
        </figure>
    );
}
