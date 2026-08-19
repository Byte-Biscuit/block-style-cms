export type CodeLanguageGroup =
    | "Plain"
    | "Languages"
    | "Web"
    | "Data"
    | "Shell";

export type CodeLanguageDef = {
    name: string;
    aliases?: string[];
    group: CodeLanguageGroup;
};

export const CODE_LANGUAGE_GROUP_ORDER: CodeLanguageGroup[] = [
    "Plain",
    "Languages",
    "Web",
    "Data",
    "Shell",
];

export const CODE_BLOCK_LANGUAGES: Record<string, CodeLanguageDef> = {
    text: {
        name: "Plain text",
        aliases: ["plaintext", "plain", "txt"],
        group: "Plain",
    },
    java: { name: "Java", group: "Languages" },
    python: { name: "Python", aliases: ["py"], group: "Languages" },
    c: { name: "C", group: "Languages" },
    cpp: { name: "C++", aliases: ["cc"], group: "Languages" },
    go: { name: "Go", aliases: ["golang"], group: "Languages" },
    rust: { name: "Rust", aliases: ["rs"], group: "Languages" },
    typescript: {
        name: "TypeScript",
        aliases: ["ts"],
        group: "Web",
    },
    javascript: {
        name: "JavaScript",
        aliases: ["js"],
        group: "Web",
    },
    css: { name: "CSS", group: "Web" },
    html: { name: "HTML", aliases: ["htm", "markup"], group: "Web" },
    xml: { name: "XML", aliases: ["xhtml"], group: "Web" },
    json: { name: "JSON", aliases: ["jsn"], group: "Web" },
    sql: {
        name: "SQL",
        aliases: ["mysql", "postgres", "postgresql", "sqlite"],
        group: "Data",
    },
    yaml: { name: "YAML", aliases: ["yml"], group: "Data" },
    toml: { name: "TOML", group: "Data" },
    bash: {
        name: "Bash",
        aliases: ["shell", "sh", "shellscript"],
        group: "Shell",
    },
    powershell: {
        name: "PowerShell",
        aliases: ["ps", "pwsh"],
        group: "Shell",
    },
    dockerfile: {
        name: "Dockerfile",
        aliases: ["docker"],
        group: "Shell",
    },
};

export const CODE_BLOCK_SUPPORTED_LANGUAGES = Object.fromEntries(
    Object.entries(CODE_BLOCK_LANGUAGES).map(([id, { name, aliases }]) => [
        id,
        { name, aliases },
    ])
);

export const CODE_LANGUAGE_ALIASES: Record<string, string> = Object.fromEntries(
    Object.entries(CODE_BLOCK_LANGUAGES).flatMap(([id, { aliases }]) =>
        (aliases ?? []).map((alias) => [alias, id])
    )
);

export function resolveCodeLanguage(language: string): string {
    const normalized = language.trim().toLowerCase();
    const id = CODE_LANGUAGE_ALIASES[normalized] ?? normalized;
    if (id === "html") return "markup";
    if (id === "dockerfile") return "docker";
    return id;
}

export function getCodeLanguageName(id: string): string {
    return CODE_BLOCK_LANGUAGES[id]?.name ?? id;
}
