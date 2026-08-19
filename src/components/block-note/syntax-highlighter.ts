import { SyntaxHighlightingExtension } from "@blocknote/core";
import { createBundledHighlighter } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

// Official `@blocknote/code-block` bundle plus langs we expose in the picker
// (go / powershell / dockerfile / toml) that Shiki already ships precompiled.
const bundledLanguages = {
    c: () => import("@shikijs/langs-precompiled/c"),
    cpp: () => import("@shikijs/langs-precompiled/cpp"),
    "c++": () => import("@shikijs/langs-precompiled/cpp"),
    css: () => import("@shikijs/langs-precompiled/css"),
    dockerfile: () => import("@shikijs/langs-precompiled/dockerfile"),
    docker: () => import("@shikijs/langs-precompiled/dockerfile"),
    go: () => import("@shikijs/langs-precompiled/go"),
    golang: () => import("@shikijs/langs-precompiled/go"),
    html: () => import("@shikijs/langs-precompiled/html"),
    java: () => import("@shikijs/langs-precompiled/java"),
    javascript: () => import("@shikijs/langs-precompiled/javascript"),
    js: () => import("@shikijs/langs-precompiled/javascript"),
    json: () => import("@shikijs/langs-precompiled/json"),
    powershell: () => import("@shikijs/langs-precompiled/powershell"),
    ps: () => import("@shikijs/langs-precompiled/powershell"),
    pwsh: () => import("@shikijs/langs-precompiled/powershell"),
    python: () => import("@shikijs/langs-precompiled/python"),
    py: () => import("@shikijs/langs-precompiled/python"),
    rust: () => import("@shikijs/langs-precompiled/rust"),
    rs: () => import("@shikijs/langs-precompiled/rust"),
    shellscript: () => import("@shikijs/langs-precompiled/shellscript"),
    bash: () => import("@shikijs/langs-precompiled/shellscript"),
    sh: () => import("@shikijs/langs-precompiled/shellscript"),
    shell: () => import("@shikijs/langs-precompiled/shellscript"),
    sql: () => import("@shikijs/langs-precompiled/sql"),
    toml: () => import("@shikijs/langs-precompiled/toml"),
    typescript: () => import("@shikijs/langs-precompiled/typescript"),
    ts: () => import("@shikijs/langs-precompiled/typescript"),
    xml: () => import("@shikijs/langs-precompiled/xml"),
    yaml: () => import("@shikijs/langs-precompiled/yaml"),
    yml: () => import("@shikijs/langs-precompiled/yaml"),
};

const bundledThemes = {
    "github-dark": () => import("@shikijs/themes/github-dark"),
    "github-light": () => import("@shikijs/themes/github-light"),
};

const createHighlighter = createBundledHighlighter({
    langs: bundledLanguages,
    themes: bundledThemes,
    engine: () => createJavaScriptRegexEngine(),
});

export const syntaxHighlighter = SyntaxHighlightingExtension({
    createHighlighter: () =>
        createHighlighter({
            themes: ["github-dark", "github-light"],
            langs: [],
        }),
});
