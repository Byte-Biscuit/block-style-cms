"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    Box,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Code as CodeIcon,
    Visibility as PreviewIcon,
    InsertDriveFile as TemplateIcon,
    Palette as ThemeIcon,
} from "@mui/icons-material";
import { createReactBlockSpec, useBlockNoteEditor } from "@blocknote/react";
import { localizeMermaidTemplates } from "@/types/mermaid";
import mermaidMonacoEditor from "@/blockn/monaco-editor-mermaid";
import { getBlockEditorContainer } from "./block-editor-utils";
import { useDebounce } from "@/lib/hooks";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Re-added missing constants
export const MERMAID_BLOCK_TYPE = "mermaid";

const EDITOR_DEFAULT_HEIGHT = "300px";
// Global state management for Monaco Editor initialization
let monacoInitialized = false;
let monacoInitPromise: Promise<void> | null = null;

// Global state management for Mermaid initialization
let mermaidModule: typeof import("mermaid") | null = null;
let mermaidImportPromise: Promise<typeof import("mermaid")> | null = null;

// Get Mermaid instance (singleton)
const getMermaid = async (): Promise<typeof import("mermaid")> => {
    if (mermaidModule) return mermaidModule;
    if (!mermaidImportPromise) {
        mermaidImportPromise = import("mermaid").then((mod) => {
            mermaidModule = mod;
            return mod;
        });
    }
    return mermaidImportPromise;
};

// Pre-initialize Monaco Editor
const initializeMonacoEditor = async (
    monaco: typeof import("monaco-editor")
) => {
    if (monacoInitialized) return;

    try {
        await mermaidMonacoEditor(monaco);
        monacoInitialized = true;
    } catch (error) {
        console.error("Failed to initialize Monaco Editor:", error);
        throw error;
    }
};

// Mermaid render component
function MermaidRenderer({
    code,
    theme = "default",
    width,
    height,
    dict,
}: {
    code: string;
    theme?: string;
    width?: number;
    height?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dict?: any;
}) {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!code.trim()) {
            setSvg("");
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        setSvg("");

        getMermaid().then(async (mermaid) => {
            try {
                mermaid.default.initialize({
                    suppressErrorRendering: false,
                    startOnLoad: false,
                    theme: theme === "dark" ? "dark" : "default",
                    themeVariables: {},
                    fontFamily: "arial",
                    fontSize: 16,
                    flowchart: { useMaxWidth: true, htmlLabels: true },
                    sequence: { useMaxWidth: true },
                    gantt: { useMaxWidth: true },
                });
                try {
                    await mermaid.default.parse(code);
                } catch (err) {
                    const msg =
                        err instanceof Error
                            ? err.message
                            : typeof err === "string"
                              ? err
                              : "Unknown mermaid parse error";
                    setError(`Mermaid parse error: ${msg}`);
                    setLoading(false);
                    return;
                }
                const id = `mermaid-block-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 11)}`;
                try {
                    const { svg } = await mermaid.default.render(id, code);
                    setSvg(svg);
                } catch (err: unknown) {
                    setError(
                        `Mermaid rendering error: ${
                            err instanceof Error ? err.message : "Unknown error"
                        }`
                    );
                } finally {
                    setLoading(false);
                }
            } catch (err: unknown) {
                setSvg("");
                setLoading(false);
                throw new Error(
                    `Initialization error: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`
                );
            }
        });
    }, [code, theme]);
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={4}
            >
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    {dict?.renderer?.rendering || "Rendering chart..."}
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                <Typography variant="body2">{error}</Typography>
            </Alert>
        );
    }

    if (!svg) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={4}
                sx={{
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "grey.50",
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {dict?.renderer?.emptyPlaceholder ||
                        "Please enter Mermaid code to generate chart"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            id={`mermaid-block-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 11)}`}
            // Use data attribute to ensure Mermaid correctly identifies the container
            data-mermaid-container="true"
            sx={{
                width: width || "100%",
                height: height || "auto",
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                "& svg": {
                    maxWidth: "100%",
                    height: "auto",
                },
                // Ensure container content is fully controlled
                "& > *": {
                    maxWidth: "100%",
                },
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

// Mermaid editor component
function MermaidEditor({
    code,
    onChange,
    mode,
    onModeChange,
    theme,
    onThemeChange,
    width,
    height,
}: {
    code: string;
    onChange: (value: string) => void;
    mode: "edit" | "preview";
    onModeChange: (mode: "edit" | "preview") => void;
    theme?: string;
    onThemeChange?: (theme: string) => void;
    width?: number;
    height?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dict?: any;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.mermaid_block;

    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [localCode, setLocalCode] = useState(code);
    const debouncedCode = useDebounce(localCode, 300);

    useEffect(() => {
        if (debouncedCode !== code) {
            onChange(debouncedCode);
        }
    }, [debouncedCode, code, onChange]);
    // Initialize Monaco Editor with Mermaid support
    const handleEditorDidMount = async (editor: unknown, monaco: unknown) => {
        try {
            if (!monacoInitPromise) {
                monacoInitPromise = initializeMonacoEditor(
                    monaco as typeof import("monaco-editor")
                );
            }
            await monacoInitPromise;
        } catch (error) {
            console.error("Monaco Editor initialization failed:", error);
        }
    };

    // Localized templates from dictionary
    const localizedTemplates = React.useMemo(
        () => localizeMermaidTemplates(dict?.templates),
        [dict]
    );

    // Handle template selection
    const handleTemplateSelect = (templateValue: string) => {
        const selectedTemplate = localizedTemplates.find(
            (t) => t.value === templateValue
        );
        if (selectedTemplate) {
            setLocalCode(selectedTemplate.code);
            setSelectedTemplate(templateValue);
        }
    };

    const renderEditor = () => (
        <Box
            sx={{
                height: "100%",
                minHeight: EDITOR_DEFAULT_HEIGHT,
                position: "relative",
            }}
        >
            <Editor
                height={EDITOR_DEFAULT_HEIGHT}
                language="mermaid"
                value={localCode}
                onChange={(value: string | undefined) =>
                    setLocalCode(value || "")
                }
                onMount={handleEditorDidMount}
                theme={theme === "dark" ? "mermaid-dark" : "mermaid"}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 22,
                    wordWrap: "on",
                    lineNumbers: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    folding: true,
                    renderWhitespace: "selection",
                    tabSize: 4,
                    insertSpaces: true,
                    detectIndentation: false,
                    padding: { top: 12, bottom: 12 },
                    roundedSelection: false,
                    scrollbar: {
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                }}
            />
        </Box>
    );

    const renderPreview = () => (
        <Box
            sx={{
                height: "100%",
                minHeight: EDITOR_DEFAULT_HEIGHT,
                bgcolor: "grey.50",
            }}
        >
            <MermaidRenderer
                code={code}
                theme={theme}
                width={width}
                height={height}
                dict={dict}
            />
        </Box>
    );
    return (
        <Paper
            variant="outlined"
            sx={{
                m: 0,
                width: "100%",
                maxWidth: "100%",
                mx: "auto",
                borderRadius: "6px",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                    px: 2,
                    py: 1,
                    width: "100%",
                    minHeight: "42px",
                    position: "relative",
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                >
                    <Box
                        sx={{
                            display: "flex",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: "6px",
                            bgcolor: "white",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            component="button"
                            type="button"
                            onClick={() => onModeChange("edit")}
                            sx={{
                                px: 2,
                                py: 0.75,
                                border: "none",
                                bgcolor:
                                    mode === "edit"
                                        ? "primary.main"
                                        : "transparent",
                                color:
                                    mode === "edit" ? "white" : "text.primary",
                                fontSize: "14px",
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                "&:hover": {
                                    bgcolor:
                                        mode === "edit"
                                            ? "primary.dark"
                                            : "grey.100",
                                },
                                transition: "all 0.2s",
                            }}
                        >
                            <CodeIcon sx={{ fontSize: "16px" }} />
                            {dict.editor.editTitle}
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => onModeChange("preview")}
                            sx={{
                                px: 2,
                                py: 0.75,
                                border: "none",
                                borderLeft: "1px solid",
                                borderLeftColor: "divider",
                                bgcolor:
                                    mode === "preview"
                                        ? "primary.main"
                                        : "transparent",
                                color:
                                    mode === "preview"
                                        ? "white"
                                        : "text.primary",
                                fontSize: "14px",
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                "&:hover": {
                                    bgcolor:
                                        mode === "preview"
                                            ? "primary.dark"
                                            : "grey.100",
                                },
                                transition: "all 0.2s",
                            }}
                        >
                            <PreviewIcon sx={{ fontSize: "16px" }} />
                            {dict.editor.previewTitle}
                        </Box>
                    </Box>

                    {/* Right toolbar area */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                        {/* Theme selection */}
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel sx={{ fontSize: "12px" }}>
                                {dict.editor.theme}
                            </InputLabel>
                            <Select
                                value={theme || "default"}
                                label="Theme"
                                onChange={(e) =>
                                    onThemeChange?.(e.target.value)
                                }
                                sx={{
                                    height: "30px",
                                    fontSize: "12px",
                                    bgcolor: "white",
                                    "& .MuiSelect-select": {
                                        py: 0.5,
                                    },
                                }}
                                MenuProps={{
                                    disablePortal: false,
                                    container: getBlockEditorContainer(),
                                    sx: {
                                        zIndex: 1000,
                                    },
                                }}
                                startAdornment={
                                    <ThemeIcon
                                        sx={{ fontSize: "14px", mr: 0.5 }}
                                    />
                                }
                            >
                                <MenuItem value="default">
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "12px" }}
                                    >
                                        Default
                                    </Typography>
                                </MenuItem>
                                <MenuItem value="dark">
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "12px" }}
                                    >
                                        Dark
                                    </Typography>
                                </MenuItem>
                                <MenuItem value="forest">
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "12px" }}
                                    >
                                        Forest
                                    </Typography>
                                </MenuItem>
                                <MenuItem value="neutral">
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "12px" }}
                                    >
                                        Neutral
                                    </Typography>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* Template selection */}
                        <FormControl size="small" sx={{ width: 300 }}>
                            <InputLabel sx={{ fontSize: "12px" }}>
                                {dict.editor.selectTemplate}
                            </InputLabel>
                            <Select
                                value={selectedTemplate}
                                label="Template"
                                onChange={(e) =>
                                    handleTemplateSelect(e.target.value)
                                }
                                sx={{
                                    height: "30px",
                                    fontSize: "12px",
                                    bgcolor: "white",
                                    "& .MuiSelect-select": {
                                        py: 0.5,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    },
                                }}
                                MenuProps={{
                                    disablePortal: false,
                                    container: getBlockEditorContainer(),
                                    sx: {
                                        zIndex: 1000,
                                    },
                                }}
                                startAdornment={
                                    <TemplateIcon
                                        sx={{ fontSize: "14px", mr: 0.5 }}
                                    />
                                }
                            >
                                <MenuItem value="">
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "12px" }}
                                    >
                                        <em>Custom</em>
                                    </Typography>
                                </MenuItem>
                                {localizedTemplates.map((tmpl) => (
                                    <MenuItem
                                        key={tmpl.value}
                                        value={tmpl.value}
                                    >
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {tmpl.label}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: "block",
                                                    fontSize: "10px",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {tmpl.description}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ width: "100%" }}>
                {mode === "edit" && renderEditor()}
                {mode === "preview" && renderPreview()}
            </Box>
        </Paper>
    );
}

// Mermaid Block render component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MermaidBlockRender = ({ block }: { block: any }) => {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.mermaid_block;
    const handleCodeChange = (code: string) => {
        try {
            if (editor) {
                editor.updateBlock(block, {
                    props: {
                        ...block.props,
                        code,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to update block code:", error);
        }
    };

    const handleModeChange = (newMode: "edit" | "preview") => {
        try {
            if (editor) {
                editor.updateBlock(block, {
                    props: {
                        ...block.props,
                        mode: newMode,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to update block mode:", error);
        }
    };

    const handleThemeChange = (newTheme: string) => {
        try {
            if (editor) {
                editor.updateBlock(block, {
                    props: {
                        ...block.props,
                        theme: newTheme,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to update block theme:", error);
        }
    };
    return (
        <Box sx={{ my: 1, width: "100%", maxWidth: "100%" }}>
            <MermaidEditor
                code={block.props.code || ""}
                onChange={handleCodeChange}
                mode={block.props.mode || "edit"}
                onModeChange={handleModeChange}
                theme={block.props.theme}
                onThemeChange={handleThemeChange}
                width={block.props.width}
                height={block.props.height}
                dict={dict}
            />
        </Box>
    );
};

// Block specification
export const MermaidBlockSpec = createReactBlockSpec(
    {
        type: MERMAID_BLOCK_TYPE,
        propSchema: {
            code: {
                default: "",
                type: "string",
            },
            mode: {
                default: "edit",
                type: "string",
            },
            theme: {
                default: "default",
                type: "string",
            },
            width: {
                default: undefined,
                type: "number",
            },
            height: {
                default: undefined,
                type: "number",
            },
        },
        content: "none",
    },
    {
        render: (props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <MermaidBlockRender block={props.block as any} />
        ),
    }
)();

export const defaultNewMermaidBlock = {
    type: MERMAID_BLOCK_TYPE,
    props: {
        code: "",
        mode: "edit",
        theme: "default",
    },
};
