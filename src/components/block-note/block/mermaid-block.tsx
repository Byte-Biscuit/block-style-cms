"use client";

import type {
    BlockNoteEditor,
    BlockSchemaFromSpecs,
    PartialBlock,
} from "@blocknote/core";
import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import {
    createReactBlockSpec,
    type DefaultReactSuggestionItem,
    useBlockNoteEditor,
} from "@blocknote/react";
import {
    Code as CodeIcon,
    Visibility as PreviewIcon,
    InsertDriveFile as TemplateIcon,
    Palette as ThemeIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Mermaid from "@/block-note/renderer/mermaid";
import type { schema } from "@/block-note/schema";
import mermaidMonacoEditor from "@/components/block-note/block/monaco-editor-mermaid";
import { useDebounce } from "@/lib/hooks";
import { localizeMermaidTemplates } from "@/types/mermaid";
import { getBlockEditorContainer } from "../block-editor-utils";
import MermaidIcon from "./icons/mermaid-icon";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export const MERMAID_BLOCK_TYPE = "mermaid";

const EDITOR_DEFAULT_HEIGHT = "300px";

const placeholderBarSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    width: "100%",
    px: 2,
    py: 1.25,
    borderRadius: 1,
    bgcolor: "action.hover",
    cursor: "pointer",
    "&:hover": {
        bgcolor: "action.selected",
    },
};

let monacoInitialized = false;
let monacoInitPromise: Promise<void> | null = null;

let mermaidModule: typeof import("mermaid") | null = null;
let mermaidImportPromise: Promise<typeof import("mermaid")> | null = null;

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

function MermaidRenderer({
    code,
    theme = "default",
    width,
    height,
    dict,
    onValidityChange,
}: {
    code: string;
    theme?: string;
    width?: number;
    height?: number;
    // biome-ignore lint/suspicious/noExplicitAny: dictionary shape is locale-driven
    dict?: any;
    onValidityChange?: (valid: boolean) => void;
}) {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!code.trim()) {
            setSvg("");
            setError(null);
            onValidityChange?.(false);
            return;
        }

        setLoading(true);
        setError(null);
        setSvg("");
        onValidityChange?.(false);

        getMermaid().then(async (mermaid) => {
            try {
                mermaid.default.initialize({
                    suppressErrorRendering: false,
                    startOnLoad: false,
                    theme: theme === "dark" ? "dark" : "default",
                    themeVariables: {
                        background: "#ffffff",
                        mainBkg: "#ffffff",
                        secondBkg: "#f4f4f4",
                        tertiaryBkg: "#f0f0f0",
                    },
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
                    onValidityChange?.(false);
                    return;
                }
                const id = `mermaid-block-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 11)}`;
                try {
                    const { svg } = await mermaid.default.render(id, code);
                    setSvg(svg);
                    onValidityChange?.(true);
                } catch (err: unknown) {
                    setError(
                        `Mermaid rendering error: ${
                            err instanceof Error ? err.message : "Unknown error"
                        }`
                    );
                    onValidityChange?.(false);
                } finally {
                    setLoading(false);
                }
            } catch (err: unknown) {
                setSvg("");
                setLoading(false);
                onValidityChange?.(false);
                throw new Error(
                    `Initialization error: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`
                );
            }
        });
    }, [code, theme, onValidityChange]);

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
                "& > *": {
                    maxWidth: "100%",
                },
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid emits SVG as an HTML string; required for chart preview
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

function MermaidEditor({
    code,
    onChange,
    mode,
    onModeChange,
    theme,
    onThemeChange,
    width,
    height,
    onValidityChange,
}: {
    code: string;
    onChange: (value: string) => void;
    mode: "edit" | "preview";
    onModeChange: (mode: "edit" | "preview") => void;
    theme?: string;
    onThemeChange?: (theme: string) => void;
    width?: number;
    height?: number;
    onValidityChange?: (valid: boolean) => void;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.mermaid_block;

    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [localCode, setLocalCode] = useState(code);
    const debouncedCode = useDebounce(localCode, 300);

    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    useEffect(() => {
        if (debouncedCode !== code) {
            onChange(debouncedCode);
        }
    }, [debouncedCode, code, onChange]);

    const handleEditorDidMount = async (_editor: unknown, monaco: unknown) => {
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

    const localizedTemplates = React.useMemo(
        () => localizeMermaidTemplates(dict?.templates),
        [dict]
    );

    const handleTemplateSelect = (templateValue: string) => {
        const selected = localizedTemplates.find(
            (t) => t.value === templateValue
        );
        if (selected) {
            setLocalCode(selected.code);
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
                code={debouncedCode}
                theme={theme}
                width={width}
                height={height}
                dict={dict}
                onValidityChange={onValidityChange}
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
                    flexWrap="wrap"
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
                            {dict?.editor?.editTitle || "Edit"}
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
                            {dict?.editor?.previewTitle || "Preview"}
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel sx={{ fontSize: "12px" }}>
                                {dict?.editor?.theme || "Theme"}
                            </InputLabel>
                            <Select
                                value={theme || "default"}
                                label={dict?.editor?.theme || "Theme"}
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
                                        zIndex: 1400,
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

                        <FormControl size="small" sx={{ width: 220 }}>
                            <InputLabel sx={{ fontSize: "12px" }}>
                                {dict?.editor?.selectTemplate || "Template"}
                            </InputLabel>
                            <Select
                                value={selectedTemplate}
                                label={
                                    dict?.editor?.selectTemplate || "Template"
                                }
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
                                        zIndex: 1400,
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
                {/* Keep validation running while editing (hidden preview) */}
                {mode === "edit" && (
                    <Box sx={{ display: "none" }} aria-hidden>
                        <MermaidRenderer
                            code={debouncedCode}
                            theme={theme}
                            dict={dict}
                            onValidityChange={onValidityChange}
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

function MermaidEditDialog({
    open,
    onClose,
    initialCode,
    initialTheme,
    isEdit,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    initialCode: string;
    initialTheme: string;
    isEdit: boolean;
    onSave: (data: { code: string; theme: string }) => void;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.mermaid_block;

    const [draftCode, setDraftCode] = useState(initialCode);
    const [draftTheme, setDraftTheme] = useState(initialTheme || "default");
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const [previewValid, setPreviewValid] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDraftCode(initialCode);
            setDraftTheme(initialTheme || "default");
            setMode("edit");
            setPreviewValid(false);
            setSaveError(null);
        }
    }, [open, initialCode, initialTheme]);

    const canSave = Boolean(draftCode.trim()) && previewValid;

    const handleConfirm = () => {
        if (!canSave) {
            setSaveError(
                dict?.dialog?.invalidCode ||
                    "Enter valid Mermaid code before saving"
            );
            setMode("preview");
            return;
        }
        onSave({ code: draftCode.trim(), theme: draftTheme });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            container={getBlockEditorContainer()}
        >
            <DialogTitle>
                {dict?.editor?.title || "Mermaid Diagram Editor"}
            </DialogTitle>
            <DialogContent dividers>
                {dict?.placeholder?.supportText && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                    >
                        {dict.placeholder.supportText}
                    </Typography>
                )}
                <MermaidEditor
                    code={draftCode}
                    onChange={setDraftCode}
                    mode={mode}
                    onModeChange={setMode}
                    theme={draftTheme}
                    onThemeChange={setDraftTheme}
                    onValidityChange={setPreviewValid}
                />
                {saveError && (
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                        {saveError}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    {dict?.dialog?.cancel || "Cancel"}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canSave}
                >
                    {isEdit
                        ? dict?.dialog?.save || "Save"
                        : dict?.dialog?.insert || "Insert"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// biome-ignore lint/suspicious/noExplicitAny: BlockNote render props are loosely typed
export const MermaidBlockRender = ({ block }: { block: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.mermaid_block;
    const hasCode = Boolean(block.props.code?.trim());

    const handleSave = (data: { code: string; theme: string }) => {
        if (!editor) return;
        try {
            editor.updateBlock(block, {
                props: {
                    ...block.props,
                    code: data.code,
                    theme: data.theme,
                    mode: "preview",
                },
            });
        } catch (error) {
            console.error("Failed to update mermaid block:", error);
        }
    };

    if (!hasCode) {
        return (
            <>
                <Box sx={placeholderBarSx} onClick={() => setDialogOpen(true)}>
                    <Box sx={{ display: "flex", color: "text.secondary" }}>
                        <MermaidIcon size={22} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.clickToAdd || "Add Mermaid diagram"}
                    </Typography>
                </Box>
                <MermaidEditDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialCode=""
                    initialTheme={block.props.theme || "default"}
                    isEdit={false}
                    onSave={handleSave}
                />
            </>
        );
    }

    return (
        <>
            <Box sx={{ my: 1, width: "100%", maxWidth: "100%" }}>
                <Mermaid
                    data={block}
                    controls={
                        <Button
                            className="edit-button"
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDialogOpen(true);
                            }}
                        >
                            {dict?.edit?.editButton || "Edit"}
                        </Button>
                    }
                />
            </Box>
            <MermaidEditDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                initialCode={block.props.code || ""}
                initialTheme={block.props.theme || "default"}
                isEdit
                onSave={handleSave}
            />
        </>
    );
};

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
            // biome-ignore lint/suspicious/noExplicitAny: BlockNote render props are loosely typed
            <MermaidBlockRender block={props.block as any} />
        ),
    }
)();

/**
 * Creates a slash menu item for inserting a Mermaid diagram block
 */
export const getMermaidSlashMenuItem = (
    editor: BlockNoteEditor<BlockSchemaFromSpecs<typeof schema.blockSpecs>>
): DefaultReactSuggestionItem => {
    const dict = editor.dictionary;
    const slashMenuDict = dict?.enhanced_slash_menu.mermaid;
    return {
        title: slashMenuDict?.title || "Mermaid Diagram",
        icon: <MermaidIcon />,
        subtext:
            slashMenuDict?.subtext || "Create flowcharts, diagrams and more",
        group: slashMenuDict?.group || "Advanced",
        onItemClick: () => {
            insertOrUpdateBlockForSlashMenu(editor, {
                type: MERMAID_BLOCK_TYPE,
                props: {
                    code: "",
                    mode: "preview",
                    theme: "default",
                },
            } as unknown as PartialBlock<
                BlockSchemaFromSpecs<typeof schema.blockSpecs>
            >);
        },
        aliases: [
            "mermaid",
            "diagram",
            "flowchart",
            "chart",
            "graph",
            "sequence",
            MERMAID_BLOCK_TYPE,
        ],
    };
};
