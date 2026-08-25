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
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import SvgFigure from "@/block-note/renderer/svg-figure";
import type { schema } from "@/block-note/schema";
import { useDebounce } from "@/lib/hooks";
import { isValidSvgMarkup, sanitizeSvg } from "@/lib/sanitize-svg";
import { getBlockEditorContainer } from "../block-editor-utils";
import SvgIcon from "./icons/svg-icon";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export const SVG_BLOCK_TYPE = "svg";

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

function SvgPreview({
    code,
    dict,
    onValidityChange,
}: {
    code: string;
    // biome-ignore lint/suspicious/noExplicitAny: dictionary shape is locale-driven
    dict?: any;
    onValidityChange?: (valid: boolean) => void;
}) {
    const sanitized = useMemo(() => sanitizeSvg(code), [code]);

    useEffect(() => {
        onValidityChange?.(Boolean(sanitized));
    }, [sanitized, onValidityChange]);

    if (!code.trim()) {
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
                        "Enter SVG markup to preview"}
                </Typography>
            </Box>
        );
    }

    if (!sanitized) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                <Typography variant="body2">
                    {dict?.renderer?.invalidSvg || "Invalid or unsafe SVG"}
                </Typography>
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                "& svg": {
                    maxWidth: "100%",
                    height: "auto",
                },
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG markup for editor preview
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
}

function SvgEditor({
    code,
    onChange,
    mode,
    onModeChange,
    onValidityChange,
}: {
    code: string;
    onChange: (value: string) => void;
    mode: "edit" | "preview";
    onModeChange: (mode: "edit" | "preview") => void;
    onValidityChange?: (valid: boolean) => void;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.svg_block;

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
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "6px",
                        bgcolor: "white",
                        overflow: "hidden",
                        width: "fit-content",
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
                            color: mode === "edit" ? "white" : "text.primary",
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
                                mode === "preview" ? "white" : "text.primary",
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
            </Box>

            <Box sx={{ width: "100%" }}>
                {mode === "edit" && (
                    <Box
                        sx={{
                            height: "100%",
                            minHeight: EDITOR_DEFAULT_HEIGHT,
                        }}
                    >
                        <Editor
                            height={EDITOR_DEFAULT_HEIGHT}
                            language="xml"
                            value={localCode}
                            onChange={(value: string | undefined) =>
                                setLocalCode(value || "")
                            }
                            theme="vs"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineHeight: 22,
                                wordWrap: "on",
                                lineNumbers: "on",
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                folding: true,
                                tabSize: 2,
                                insertSpaces: true,
                                padding: { top: 12, bottom: 12 },
                                scrollbar: {
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                },
                            }}
                        />
                    </Box>
                )}
                {mode === "preview" && (
                    <Box
                        sx={{
                            height: "100%",
                            minHeight: EDITOR_DEFAULT_HEIGHT,
                            bgcolor: "grey.50",
                        }}
                    >
                        <SvgPreview
                            code={debouncedCode}
                            dict={dict}
                            onValidityChange={onValidityChange}
                        />
                    </Box>
                )}
                {mode === "edit" && (
                    <Box sx={{ display: "none" }} aria-hidden>
                        <SvgPreview
                            code={debouncedCode}
                            dict={dict}
                            onValidityChange={onValidityChange}
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

function SvgEditDialog({
    open,
    onClose,
    initialCode,
    isEdit,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    initialCode: string;
    isEdit: boolean;
    onSave: (data: { code: string }) => void;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.svg_block;

    const [draftCode, setDraftCode] = useState(initialCode);
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const [previewValid, setPreviewValid] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDraftCode(initialCode);
            setMode("edit");
            setPreviewValid(isValidSvgMarkup(initialCode));
            setSaveError(null);
        }
    }, [open, initialCode]);

    const canSave = Boolean(draftCode.trim()) && previewValid;

    const handleConfirm = () => {
        if (!canSave) {
            setSaveError(
                dict?.dialog?.invalidCode ||
                    "Enter valid SVG markup before saving"
            );
            setMode("preview");
            return;
        }
        onSave({ code: draftCode.trim() });
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
                {dict?.editor?.title || "SVG Illustration Editor"}
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
                <SvgEditor
                    code={draftCode}
                    onChange={setDraftCode}
                    mode={mode}
                    onModeChange={setMode}
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
export const SvgBlockRender = ({ block }: { block: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.svg_block;
    const hasCode = Boolean(block.props.code?.trim());

    const handleSave = (data: { code: string }) => {
        if (!editor) return;
        try {
            editor.updateBlock(block, {
                props: {
                    ...block.props,
                    code: data.code,
                },
            });
        } catch (error) {
            console.error("Failed to update svg block:", error);
        }
    };

    if (!hasCode) {
        return (
            <>
                <Box sx={placeholderBarSx} onClick={() => setDialogOpen(true)}>
                    <Box sx={{ display: "flex", color: "text.secondary" }}>
                        <SvgIcon size={22} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.clickToAdd ||
                            "Add SVG illustration"}
                    </Typography>
                </Box>
                <SvgEditDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialCode=""
                    isEdit={false}
                    onSave={handleSave}
                />
            </>
        );
    }

    return (
        <>
            <Box sx={{ my: 1, width: "100%", maxWidth: "100%" }}>
                <SvgFigure
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
            <SvgEditDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                initialCode={block.props.code || ""}
                isEdit
                onSave={handleSave}
            />
        </>
    );
};

export const SvgBlockSpec = createReactBlockSpec(
    {
        type: SVG_BLOCK_TYPE,
        propSchema: {
            code: {
                default: "",
                type: "string",
            },
        },
        content: "none",
    },
    {
        render: (props) => (
            // biome-ignore lint/suspicious/noExplicitAny: BlockNote render props are loosely typed
            <SvgBlockRender block={props.block as any} />
        ),
    }
)();

export const getSvgSlashMenuItem = (
    editor: BlockNoteEditor<BlockSchemaFromSpecs<typeof schema.blockSpecs>>
): DefaultReactSuggestionItem => {
    const dict = editor.dictionary;
    const slashMenuDict = dict?.enhanced_slash_menu.svg;
    return {
        title: slashMenuDict?.title || "SVG",
        icon: <SvgIcon />,
        subtext: slashMenuDict?.subtext || "Insert an SVG illustration",
        group: slashMenuDict?.group || "Advanced",
        onItemClick: () => {
            insertOrUpdateBlockForSlashMenu(editor, {
                type: SVG_BLOCK_TYPE,
                props: {
                    code: "",
                },
            } as unknown as PartialBlock<
                BlockSchemaFromSpecs<typeof schema.blockSpecs>
            >);
        },
        aliases: ["svg", "illustration", "vector", "drawing", SVG_BLOCK_TYPE],
    };
};
