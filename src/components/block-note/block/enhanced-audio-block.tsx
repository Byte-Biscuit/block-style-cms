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
    MusicNote as AudioIcon,
    Close as CloseIcon,
    Upload as UploadIcon,
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
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import EnhancedAudio, {
    type AudioBlockProps,
} from "@/block-note/renderer/enhanced-audio";
import type { schema } from "@/block-note/schema";
import { ADMIN_API_PREFIX, FILE_EXTENSIONS } from "@/settings";
import { getBlockEditorContainer } from "../block-editor-utils";
import EnhancedAudioIcon from "./icons/enhanced-audio-icon";
import { labelFromFilename } from "./image-label";

export const ENHANCED_AUDIO_BLOCK_TYPE = "enhancedAudio";

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

const sourceRowSx = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    px: 2,
    py: 1.5,
    width: "100%",
    cursor: "pointer",
    "&:hover": {
        borderColor: "primary.main",
        bgcolor: "action.hover",
    },
};

function AudioSelectionDialog({
    open,
    onClose,
    onSelect,
    initialData,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (audioData: AudioBlockProps) => void;
    initialData?: AudioBlockProps;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_audio_block || {};

    const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");
    const [selectedAudioUrl, setSelectedAudioUrl] = useState(
        initialData?.content || ""
    );
    const [editableUrl, setEditableUrl] = useState(initialData?.content || "");
    const [platform, setPlatform] = useState<"upload" | "url" | "">(
        initialData?.platform || ""
    );
    const [title, setTitle] = useState(initialData?.title || "");
    const [artist, setArtist] = useState(initialData?.artist || "");
    const [alignment, setAlignment] = useState<"left" | "center" | "right">(
        initialData?.alignment || "center"
    );

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(""); // Clear previous errors

        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(`${ADMIN_API_PREFIX}/audios`, {
                method: "POST",
                body: formData,
            });

            const resp = await response.json();

            if (response.ok && resp?.code === 200) {
                const data = resp.payload;
                const audioUrl = `/audios/${data.filename}`;
                setSelectedAudioUrl(audioUrl);
                setEditableUrl(audioUrl);
                setPlatform("upload");
                setTitle((prev) => prev || labelFromFilename(file.name));
                setUploadDialogVisible(false);
            } else {
                // Handle business errors (such as unsupported format)
                const errorMessage =
                    resp?.message ||
                    dict?.upload?.uploadError ||
                    "Upload failed, please try again";
                setUploadError(errorMessage);
            }
        } catch (error) {
            // Handle network errors
            console.error("Upload error:", error);
            setUploadError(
                dict?.upload?.networkError ||
                    "Network error, please check connection and try again"
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (editableUrl.trim()) {
            setSelectedAudioUrl(editableUrl.trim());
            setPlatform("url");
        }
    };

    const handleSaveAudio = () => {
        if (selectedAudioUrl) {
            onSelect({
                content: selectedAudioUrl,
                platform: platform as "upload" | "url",
                title,
                artist,
                alignment,
            });
            onClose();
        }
    };

    const handleClearSelection = () => {
        setSelectedAudioUrl("");
        setEditableUrl("");
        setPlatform("");
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
                        {dict?.dialog?.title || "Select Audio"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {selectedAudioUrl ? (
                    <Box
                        sx={{
                            p: 3,
                            bgcolor: "grey.50",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "grey.300",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 3,
                            }}
                        >
                            <Typography variant="h6" color="primary">
                                {dict?.dialog?.selectedAudio ||
                                    "✓ Audio Selected"}
                            </Typography>
                            <Button
                                size="small"
                                onClick={handleClearSelection}
                                color="error"
                                variant="outlined"
                            >
                                {dict?.dialog?.reselect || "Reselect"}
                            </Button>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    width: "100%",
                                    mb: 2,
                                    "& audio": {
                                        display: "block",
                                        width: "100%",
                                    },
                                }}
                            >
                                <audio
                                    controls
                                    preload="metadata"
                                    src={selectedAudioUrl}
                                >
                                    <track
                                        kind="captions"
                                        srcLang="en"
                                        label="Captions"
                                    />
                                </audio>
                            </Box>
                            <Box>
                                <TextField
                                    fullWidth
                                    label={
                                        dict?.form?.audioContent ||
                                        "Audio Content"
                                    }
                                    value={editableUrl}
                                    onChange={(e) =>
                                        setEditableUrl(e.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={
                                        dict?.form?.titleOptional ||
                                        "Title (Optional)"
                                    }
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={
                                        dict?.form?.artistOptional ||
                                        "Artist (Optional)"
                                    }
                                    value={artist}
                                    onChange={(e) => setArtist(e.target.value)}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom color="primary">
                            {dict?.form?.styleSettings || "🎨 Style Settings"}
                        </Typography>
                        <Box
                            sx={{
                                mb: 3,
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>
                                    {dict?.form?.alignment || "Alignment"}
                                </InputLabel>
                                <Select
                                    value={alignment}
                                    label={dict?.form?.alignment || "Alignment"}
                                    onChange={(e) =>
                                        setAlignment(
                                            e.target.value as
                                                | "left"
                                                | "center"
                                                | "right"
                                        )
                                    }
                                    MenuProps={{
                                        disablePortal: false,
                                        container: getBlockEditorContainer(),
                                    }}
                                >
                                    <MenuItem value="left">
                                        {dict?.form?.alignLeft || "Left Align"}
                                    </MenuItem>
                                    <MenuItem value="center">
                                        {dict?.form?.alignCenter || "Center"}
                                    </MenuItem>
                                    <MenuItem value="right">
                                        {dict?.form?.alignRight ||
                                            "Right Align"}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            {dict?.dialog?.selectSource ||
                                "Select Audio Source"}
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={sourceRowSx}
                            onClick={() => {
                                setUploadDialogVisible(true);
                                setUploadError("");
                            }}
                        >
                            <UploadIcon color="primary" />
                            <Box>
                                <Typography variant="subtitle2">
                                    {dict?.upload?.title || "Local Upload"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {dict?.upload?.subtitle ||
                                        "Select Audio File"}
                                </Typography>
                            </Box>
                        </Paper>
                        <Paper
                            variant="outlined"
                            sx={sourceRowSx}
                            onClick={() => {
                                setPlatform("url");
                            }}
                        >
                            <AudioIcon color="primary" />
                            <Box>
                                <Typography variant="subtitle2">
                                    {dict?.embed?.title || "Embed Audio"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {dict?.embed?.subtitle || "Audio URL"}
                                </Typography>
                            </Box>
                        </Paper>
                        {platform === "url" && (
                            <Box sx={{ mt: 2, width: "100%" }}>
                                <TextField
                                    fullWidth
                                    label={dict?.embed?.urlLabel || "Audio URL"}
                                    value={editableUrl}
                                    onChange={(e) =>
                                        setEditableUrl(e.target.value)
                                    }
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Button
                                        onClick={handleUrlSubmit}
                                        variant="contained"
                                        disabled={!editableUrl.trim()}
                                        size="small"
                                    >
                                        {dict?.embed?.parseAndPreview ||
                                            "Parse and Preview"}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                        {/* File upload dialog */}
                        <Dialog
                            open={uploadDialogVisible}
                            onClose={() => setUploadDialogVisible(false)}
                            maxWidth="sm"
                            container={getBlockEditorContainer()}
                            fullWidth
                        >
                            <DialogTitle>
                                {dict?.upload?.dialogTitle ||
                                    "Upload Audio File"}
                            </DialogTitle>
                            <DialogContent>
                                {uploadError && (
                                    <Alert
                                        severity="error"
                                        sx={{ mb: 2 }}
                                        onClose={() => setUploadError("")}
                                    >
                                        {uploadError}
                                    </Alert>
                                )}
                                <Box sx={{ pt: 2 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            ...sourceRowSx,
                                            cursor: isUploading
                                                ? "default"
                                                : "pointer",
                                        }}
                                        component="label"
                                    >
                                        {isUploading ? (
                                            <>
                                                <CircularProgress size={22} />
                                                <Typography variant="body2">
                                                    {dict?.upload?.uploading ||
                                                        "Uploading..."}
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <UploadIcon color="primary" />
                                                <Box>
                                                    <Typography variant="subtitle2">
                                                        {dict?.upload
                                                            ?.clickToSelect ||
                                                            "Click to Select File"}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {dict?.upload
                                                            ?.supportedFormats ||
                                                            "MP3, WAV, OGG, AAC, M4A, FLAC, WEBM, Opus — max 50MB"}
                                                    </Typography>
                                                </Box>
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept={[
                                                        ...FILE_EXTENSIONS.AUDIO,
                                                    ].join(",")}
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                />
                                            </>
                                        )}
                                    </Paper>
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={() => {
                                        setUploadDialogVisible(false);
                                        setUploadError(""); // Clear errors when closing
                                    }}
                                >
                                    {dict?.dialog?.cancel || "Cancel"}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    {dict?.dialog?.cancel || "Cancel"}
                </Button>
                {selectedAudioUrl && (
                    <Button onClick={handleSaveAudio} variant="contained">
                        {dict?.dialog?.insertAudio || "Insert Audio"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EnhancedAudioBlockRender = ({ block }: { block: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_audio_block || {};

    const handleAudioSelect = (audioData: AudioBlockProps) => {
        if (editor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor as any).updateBlock(block, {
                type: ENHANCED_AUDIO_BLOCK_TYPE,
                props: audioData,
            });
        }
    };
    if (!block.props.content) {
        return (
            <>
                <Box sx={placeholderBarSx} onClick={() => setDialogOpen(true)}>
                    <AudioIcon sx={{ fontSize: 22, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.clickToAdd || "Add audio"}
                    </Typography>
                </Box>
                <AudioSelectionDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSelect={handleAudioSelect}
                    initialData={{ content: "", platform: "upload" }}
                />
            </>
        );
    }

    return (
        <>
            <EnhancedAudio
                data={block}
                controls={
                    <Button
                        className="edit-button"
                        variant="contained"
                        size="small"
                        onClick={() => setDialogOpen(true)}
                    >
                        {dict?.edit?.editButton || "Edit"}
                    </Button>
                }
            />
            <AudioSelectionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSelect={handleAudioSelect}
                initialData={block.props}
            />
        </>
    );
};

export const EnhancedAudioBlockSpec = createReactBlockSpec(
    {
        type: ENHANCED_AUDIO_BLOCK_TYPE,
        propSchema: {
            content: { default: "", type: "string" },
            platform: { default: "upload", type: "string" },
            title: { default: "", type: "string" },
            artist: { default: "", type: "string" },
            alignment: { default: "center", type: "string" },
            autoplay: { default: false, type: "boolean" },
            loop: { default: false, type: "boolean" },
            controls: { default: true, type: "boolean" },
        },
        content: "none",
    },
    {
        render: (props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <EnhancedAudioBlockRender block={props.block as any} />
        ),
    }
)();

/**
 * Creates a slash menu item for inserting an Enhanced Audio block
 */
export const getEnhancedAudioSlashMenuItem = (
    editor: BlockNoteEditor<BlockSchemaFromSpecs<typeof schema.blockSpecs>>
): DefaultReactSuggestionItem => {
    const dict = editor.dictionary;
    const slashMenuDict = dict?.enhanced_slash_menu.enhanced_audio;
    return {
        title: slashMenuDict?.title || "Enhanced Audio",
        icon: <EnhancedAudioIcon />,
        subtext: slashMenuDict?.subtext || "Add an audio player",
        group: slashMenuDict?.group || "Media",
        onItemClick: () => {
            insertOrUpdateBlockForSlashMenu(editor, {
                type: ENHANCED_AUDIO_BLOCK_TYPE,
                props: {
                    content: "",
                    platform: "upload",
                    title: "",
                    alignment: "center",
                    autoplay: false,
                    loop: false,
                    controls: true,
                },
            } as unknown as PartialBlock<
                BlockSchemaFromSpecs<typeof schema.blockSpecs>
            >);
        },
        aliases: ["audio", "music", "sound", "mp3", ENHANCED_AUDIO_BLOCK_TYPE],
    };
};
