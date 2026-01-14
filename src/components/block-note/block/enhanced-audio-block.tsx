"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    CircularProgress,
    Paper,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from "@mui/material";
import {
    Upload as UploadIcon,
    MusicNote as AudioIcon,
    Close as CloseIcon,
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
import { ADMIN_API_PREFIX } from "@/settings";
import { getBlockEditorContainer } from "../block-editor-utils";
import EnhancedAudioIcon from "./icons/enhanced-audio-icon";
import EnhancedAudio, {
    AudioBlockProps,
} from "@/block-note/renderer/enhanced-audio";

export const ENHANCED_AUDIO_BLOCK_TYPE = "enhancedAudio";

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
                        <Box
                            sx={{
                                display: "flex",
                                gap: 3,
                                alignItems: "flex-start",
                                mb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 200,
                                    height: 60,
                                    bgcolor: "white",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "grey.300",
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <audio
                                    controls
                                    src={selectedAudioUrl}
                                    style={{ width: "100%" }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
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
                            gap: 2,
                            minHeight: "120px",
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                            sx={{ textAlign: "center" }}
                        >
                            {dict?.dialog?.selectSource ||
                                "Select Audio Source"}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                justifyContent: "center",
                            }}
                        >
                            {/* Local upload option */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    textAlign: "center",
                                    minWidth: "140px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        bgcolor: "action.hover",
                                        transform: "translateY(-1px)",
                                        boxShadow: 1,
                                    },
                                }}
                                onClick={() => {
                                    setUploadDialogVisible(true);
                                    setUploadError(""); // Clear previous errors when opening
                                }}
                            >
                                <UploadIcon
                                    sx={{
                                        fontSize: 32,
                                        color: "primary.main",
                                        mb: 1,
                                    }}
                                />
                                <Typography variant="body1" gutterBottom>
                                    {dict?.upload?.title || "Local Upload"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {dict?.upload?.subtitle ||
                                        "Select Audio File"}
                                </Typography>
                            </Paper>
                            {/* URL embed option */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    textAlign: "center",
                                    minWidth: "140px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        bgcolor: "action.hover",
                                        transform: "translateY(-1px)",
                                        boxShadow: 1,
                                    },
                                }}
                                onClick={() => {
                                    setPlatform("url");
                                }}
                            >
                                <AudioIcon
                                    sx={{
                                        fontSize: 32,
                                        color: "primary.main",
                                        mb: 1,
                                    }}
                                />
                                <Typography variant="body1" gutterBottom>
                                    {dict?.embed?.title || "Embed Audio"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {dict?.embed?.subtitle || "Audio URL"}
                                </Typography>
                            </Paper>
                        </Box>
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
                                <Box
                                    sx={{
                                        pt: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 3,
                                    }}
                                >
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 4,
                                            textAlign: "center",
                                            border: "2px dashed",
                                            borderColor: "divider",
                                            width: "100%",
                                            cursor: "pointer",
                                            "&:hover": {
                                                borderColor: "primary.main",
                                                bgcolor: "action.hover",
                                            },
                                        }}
                                        component="label"
                                    >
                                        {isUploading ? (
                                            <CircularProgress />
                                        ) : (
                                            <>
                                                <UploadIcon
                                                    sx={{
                                                        fontSize: 48,
                                                        color: "text.secondary",
                                                        mb: 2,
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                >
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
                                                        "Supports MP3, WAV, OGG, AAC, M4A, FLAC, WEBM formats"}
                                                </Typography>
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="audio/*"
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
                    <AudioIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                        {dict?.placeholder?.clickToAdd || "Click to Add Audio"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.supportText ||
                            "Supports local upload or URL embedding"}
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
