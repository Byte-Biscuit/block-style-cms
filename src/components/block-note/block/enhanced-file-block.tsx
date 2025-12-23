"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    CircularProgress,
    Paper,
    IconButton,
    FormControl,
    Select,
    MenuItem,
} from "@mui/material";
import {
    Upload as UploadIcon,
    Close as CloseIcon,
    AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import {
    createReactBlockSpec,
    useBlockNoteEditor,
    type DefaultReactSuggestionItem,
} from "@blocknote/react";
import type { BlockSchemaFromSpecs, PartialBlock } from "@blocknote/core";
import { BlockNoteEditor } from "@blocknote/core";
import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { schema } from "@/block-note/schema";
import FileIcon from "@/components/file-icon";
import { ADMIN_API_PREFIX, FILE_EXTENSIONS } from "@/settings";
import { getBlockEditorContainer } from "../block-editor-utils";
import { getFileCategory, formatBytes } from "@/lib/file-utils";
import EnhancedFileIcon from "./icons/enhanced-file-icon";
import EnhancedFile, {
    FileBlockProps,
} from "@/block-note/renderer/enhanced-file";
import ErrorDisplay from "../../../app/[locale]/(admin)/m/components/error-display";

export const ENHANCED_FILE_BLOCK_TYPE = "enhancedFile" as const;

function FileSelectionDialog({
    open,
    onClose,
    onSelect,
    initialData,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (attachmentData: FileBlockProps) => void;
    initialData?: FileBlockProps;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_file_block;

    const [isUploading, setIsUploading] = useState(false);
    const [alignment, setAlignment] = useState<"left" | "center" | "right">(
        initialData?.alignment || "center"
    );
    const [uploadedFile, setUploadedFile] = useState<{
        filename: string;
        originalName: string;
        size: number;
        fileExtension: string;
    } | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Check if in edit mode
    React.useEffect(() => {
        if (initialData?.filename) {
            setIsEditMode(true);
            setUploadedFile({
                filename: initialData.filename,
                originalName: initialData.originalName || "",
                size: initialData.size || 0,
                fileExtension: initialData.fileExtension || "",
            });
        } else {
            setIsEditMode(false);
            setUploadedFile(null);
        }
    }, [initialData]);

    // Upload file
    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Clear previous errors
        setError(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${ADMIN_API_PREFIX}/files`, {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                const result = await response.json();
                if (result.code === 200) {
                    // Save uploaded file information, don't close dialog immediately
                    const uploadedFileData = result.payload;
                    setUploadedFile(uploadedFileData);
                } else {
                    // Server returned error code
                    setError(
                        result.payload ||
                            dict?.upload?.uploadError ||
                            "Upload failed, please try again"
                    );
                }
            } else {
                // HTTP error
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 400) {
                    setError(
                        errorData.message ||
                            dict?.upload?.unsupportedFormat ||
                            "Unsupported file format, please upload supported file types"
                    );
                } else if (response.status === 413) {
                    setError(
                        dict?.upload?.fileTooLarge ||
                            "File size exceeds limit, please select a smaller file"
                    );
                } else {
                    setError(
                        dict?.upload?.uploadError ||
                            "Upload failed, please try again"
                    );
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            setError(
                dict?.upload?.networkError ||
                    "Network error, please check connection and try again"
            );
        } finally {
            setIsUploading(false);
            // Reset input
            if (event.target) {
                (event.target as HTMLInputElement).value = "";
            }
        }
    };

    // Confirm file selection
    const handleConfirm = () => {
        const fileData = uploadedFile || initialData;
        if (fileData) {
            onSelect({
                filename: fileData.filename,
                originalName: fileData.originalName,
                size: fileData.size,
                fileExtension: fileData.fileExtension,
                alignment: alignment,
            });
            onClose();
        }
    };

    // Check if file data is available
    const hasFileData = uploadedFile || (isEditMode && initialData?.filename);

    // Click upload area to trigger file selection
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            container={getBlockEditorContainer()}
            fullWidth
        >
            <DialogTitle>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h6">
                        {isEditMode
                            ? dict?.dialog?.editFile || "Edit File"
                            : dict?.dialog?.title || "Select File"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ p: 2 }}>
                    {/* Error display */}
                    {error && (
                        <ErrorDisplay
                            title={
                                dict?.upload?.uploadError ||
                                "File upload failed"
                            }
                            error={error}
                            severity="error"
                        />
                    )}

                    {/* Upload area */}
                    {hasFileData ? (
                        // Display selected file information
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                mb: 3,
                                textAlign: "center",
                                borderRadius: 2,
                                borderColor: "primary.main",
                                border: "1px solid",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <FileIcon
                                        category={getFileCategory(
                                            (uploadedFile || initialData)
                                                ?.fileExtension || ""
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: "primary.dark",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {
                                            (uploadedFile || initialData)
                                                ?.originalName
                                        }
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "primary.dark" }}
                                    >
                                        {(() => {
                                            const fileData =
                                                uploadedFile || initialData;
                                            return fileData?.size
                                                ? formatBytes(fileData.size)
                                                : "";
                                        })()}
                                    </Typography>
                                </Box>
                            </Box>
                            {initialData?.filename && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ mt: 2 }}
                                    onClick={handleUploadClick}
                                >
                                    {dict?.dialog?.reselect || "Reselect File"}
                                </Button>
                            )}
                        </Paper>
                    ) : (
                        // Display upload area
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 4,
                                mb: 3,
                                textAlign: "center",
                                border: "2px dashed",
                                borderColor: "divider",
                                borderRadius: 2,
                                transition: "all 0.2s ease-in-out",
                                "&:hover": !isUploading
                                    ? {
                                          borderColor: "primary.main",
                                      }
                                    : {},
                            }}
                            component="div"
                        >
                            {isUploading ? (
                                <Box sx={{ py: 2 }}>
                                    <CircularProgress size={32} />
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {dict?.upload?.uploading ||
                                            "Uploading..."}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        py: 1,
                                        cursor: "pointer",
                                        borderRadius: 1,
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                    onClick={handleUploadClick}
                                >
                                    <UploadIcon
                                        sx={{
                                            fontSize: 40,
                                            color: "primary.main",
                                            mb: 1,
                                            display: "block",
                                            mx: "auto",
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 0.5,
                                            fontWeight: 500,
                                            color: "text.primary",
                                        }}
                                    >
                                        {dict?.upload?.clickToSelect ||
                                            "Click to upload file"}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: "0.875rem" }}
                                    >
                                        {dict?.upload?.supportedFormats ||
                                            "Supports Office documents, PDF, archives and other formats"}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}

                    {/* Alignment settings */}
                    <Box
                        sx={{
                            mb: 3,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ minWidth: "fit-content" }}
                        >
                            {dict?.form?.alignment || "Alignment"}:
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={alignment}
                                onChange={(e) =>
                                    setAlignment(
                                        e.target.value as
                                            | "left"
                                            | "center"
                                            | "right"
                                    )
                                }
                                displayEmpty
                                MenuProps={{
                                    disablePortal: false,
                                    container: getBlockEditorContainer(),
                                }}
                            >
                                <MenuItem value="left">
                                    {dict?.form?.alignLeft || "Left"}
                                </MenuItem>
                                <MenuItem value="center">
                                    {dict?.form?.alignCenter || "Center"}
                                </MenuItem>
                                <MenuItem value="right">
                                    {dict?.form?.alignRight || "Right"}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={[...FILE_EXTENSIONS.FILES].join(",")}
                    onChange={handleFileUpload}
                    disabled={isUploading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    {dict?.dialog?.cancel || "Cancel"}
                </Button>
                {hasFileData && (
                    <Button variant="contained" onClick={handleConfirm}>
                        {dict?.dialog?.confirm || "Confirm"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

// Enhanced file block render component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EnhancedFileBlockRender = ({ block }: { block: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_file_block;

    const handleFileSelect = (fileData: FileBlockProps) => {
        if (editor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor as any).updateBlock(block, {
                type: ENHANCED_FILE_BLOCK_TYPE,
                props: fileData,
            });
        }
    };

    if (!block.props.filename) {
        return (
            <>
                <Box
                    sx={{
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 4,
                        textAlign: "center",
                        cursor: "pointer",
                        "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                        },
                    }}
                    onClick={() => setDialogOpen(true)}
                >
                    <AttachFileIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                        {dict?.placeholder?.clickToAdd || "Click to add file"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.supportText ||
                            "Supports Office documents, PDF, archives and other formats"}
                    </Typography>
                </Box>
                <FileSelectionDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSelect={handleFileSelect}
                    initialData={{ alignment: "center" }}
                />
            </>
        );
    }
    return (
        <Box
            sx={{
                my: 2,
                display: "flex",
                flexDirection: "column",
                alignItems:
                    block.props.alignment === "left"
                        ? "flex-start"
                        : block.props.alignment === "right"
                          ? "flex-end"
                          : "center",
                width: "100%",
            }}
        >
            <EnhancedFile
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

            <FileSelectionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSelect={handleFileSelect}
                initialData={block.props}
            />
        </Box>
    );
};

// Block specification
export const EnhancedFileBlockSpec = createReactBlockSpec(
    {
        type: ENHANCED_FILE_BLOCK_TYPE,
        propSchema: {
            filename: {
                default: "",
                type: "string",
            },
            originalName: {
                default: "",
                type: "string",
            },
            size: {
                default: 0,
                type: "number",
            },
            fileExtension: {
                default: "",
                type: "string",
            },
            alignment: {
                default: "center",
                type: "string",
            },
        },
        content: "none",
    },
    {
        render: (props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <EnhancedFileBlockRender block={props.block as any} />
        ),
    }
)();

/**
 * Creates a slash menu item for inserting an Enhanced File block
 */
export const getEnhancedFileSlashMenuItem = (
    editor: BlockNoteEditor<BlockSchemaFromSpecs<typeof schema.blockSpecs>>
): DefaultReactSuggestionItem => {
    const dict = editor.dictionary;
    const slashMenuDict = dict?.enhanced_slash_menu.enhanced_file;
    return {
        title: slashMenuDict?.title || "Enhanced File",
        icon: <EnhancedFileIcon />,
        subtext: slashMenuDict?.subtext || "Upload and attach a file",
        group: slashMenuDict?.group || "Media",
        onItemClick: () => {
            insertOrUpdateBlockForSlashMenu(editor, {
                type: ENHANCED_FILE_BLOCK_TYPE,
                props: {
                    filename: "",
                    originalName: "",
                    size: 0,
                    fileExtension: "",
                    alignment: "center",
                },
            } as unknown as PartialBlock<
                BlockSchemaFromSpecs<typeof schema.blockSpecs>
            >);
        },
        aliases: [
            "file",
            "attachment",
            "document",
            "download",
            ENHANCED_FILE_BLOCK_TYPE,
        ],
    };
};
