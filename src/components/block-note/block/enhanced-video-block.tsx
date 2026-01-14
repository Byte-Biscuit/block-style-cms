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
} from "@mui/material";
import {
    Upload as UploadIcon,
    VideoLibrary as VideoIcon,
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
import EnhancedVideoIcon from "./icons/enhanced-video-icon";
import EnhancedVideo, {
    VideoBlockProps,
} from "@/block-note/renderer/enhanced-video";

export const ENHANCED_VIDEO_BLOCK_TYPE = "enhancedVideo";

function VideoSelectionDialog({
    open,
    onClose,
    onSelect,
    initialData,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (videoData: VideoBlockProps) => void;
    initialData?: VideoBlockProps;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_video_block;

    const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(
        initialData?.content || ""
    );
    const [editableUrl, setEditableUrl] = useState(initialData?.content || "");
    const [platform, setPlatform] = useState<"upload" | "iframe" | "">(
        initialData?.platform || ""
    );
    const [width, setWidth] = useState(initialData?.width || "560");
    const [height, setHeight] = useState(initialData?.height || "315");
    const [title, setTitle] = useState(initialData?.title || "");
    const [alignment, setAlignment] = useState<"left" | "center" | "right">(
        initialData?.alignment || "center"
    );

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(`${ADMIN_API_PREFIX}/videos`, {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                const resp = await response.json();
                if (resp?.code === 200) {
                    const data = resp.payload;
                    const videoUrl = `/videos/embed/${data.filename}`;
                    // For locally uploaded videos, construct iframe content using src attribute directly
                    const iframeContent = `<iframe src="${videoUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen style="max-width: 100%; border-radius: 4px;"></iframe>`;
                    setSelectedVideoUrl(iframeContent);
                    setEditableUrl(iframeContent);
                    setPlatform("upload");
                    setUploadDialogVisible(false);
                }
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (editableUrl.trim()) {
            // Check if it's iframe content
            if (editableUrl.trim().startsWith("<iframe")) {
                setSelectedVideoUrl(editableUrl.trim());
                setPlatform("iframe");
            } else {
                // If not iframe, handle as regular video URL
                setSelectedVideoUrl(editableUrl.trim());
                setPlatform("upload");
            }
        }
    };

    const handleSaveVideo = () => {
        if (selectedVideoUrl) {
            onSelect({
                content: selectedVideoUrl,
                platform: platform as "upload" | "iframe",
                width,
                height,
                title,
                alignment,
            });
            onClose();
        }
    };

    const handleClearSelection = () => {
        setSelectedVideoUrl("");
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
                        {dict?.dialog?.title || "Select Video"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {selectedVideoUrl ? (
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
                                {dict?.dialog?.selectedVideo ||
                                    "✓ Video Selected"}
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
                                    height: 120,
                                    bgcolor: "white",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "grey.300",
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    "& iframe": {
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    },
                                }}
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: selectedVideoUrl,
                                    }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label={
                                        dict?.form?.videoContent ||
                                        "Video Content"
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
                                        "Title (optional)"
                                    }
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom color="primary">
                            🎨 {dict?.form?.styleSettings || "Style Settings"}
                        </Typography>
                        <Box
                            sx={{
                                mb: 3,
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <TextField
                                label={dict?.form?.width || "Width (px)"}
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                size="small"
                                variant="outlined"
                                type="number"
                                sx={{ minWidth: 120 }}
                            />
                            <TextField
                                label={dict?.form?.height || "Height (px)"}
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                size="small"
                                variant="outlined"
                                type="number"
                                sx={{ minWidth: 120 }}
                            />
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
                            minHeight: "200px",
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                            sx={{ textAlign: "center" }}
                        >
                            {dict?.dialog?.selectSource ||
                                "Select video source"}
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
                                onClick={() => setUploadDialogVisible(true)}
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
                                        "Select video file"}
                                </Typography>
                            </Paper>
                            {/* Iframe embed option */}
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
                                    setPlatform("iframe");
                                }}
                            >
                                <VideoIcon
                                    sx={{
                                        fontSize: 32,
                                        color: "primary.main",
                                        mb: 1,
                                    }}
                                />
                                <Typography variant="body1" gutterBottom>
                                    {dict?.embed?.title || "Embed Video"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {dict?.embed?.subtitle || "iframe code"}
                                </Typography>
                            </Paper>
                        </Box>
                        {platform === "iframe" && (
                            <Box sx={{ mt: 2, width: "100%" }}>
                                <TextField
                                    fullWidth
                                    label={
                                        dict?.embed?.urlLabel ||
                                        "Iframe embed code"
                                    }
                                    value={editableUrl}
                                    onChange={(e) =>
                                        setEditableUrl(e.target.value)
                                    }
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    placeholder='<iframe src="..." width="560" height="315" frameborder="0" allowfullscreen></iframe>'
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
                                    "Upload Video File"}
                            </DialogTitle>
                            <DialogContent>
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
                                                        "Supports MP4, WebM, Ogg formats"}
                                                </Typography>
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="video/*"
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
                                    onClick={() =>
                                        setUploadDialogVisible(false)
                                    }
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
                {selectedVideoUrl && (
                    <Button onClick={handleSaveVideo} variant="contained">
                        {dict?.dialog?.insertVideo || "Insert Video"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EnhancedVideoBlockRender = ({ block }: { block: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_video_block;
    const handleVideoSelect = (videoData: VideoBlockProps) => {
        if (editor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor as any).updateBlock(block, {
                type: ENHANCED_VIDEO_BLOCK_TYPE,
                props: videoData,
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
                    <VideoIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                        {dict?.placeholder?.clickToAdd || "Click to add video"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.supportText ||
                            "Supports local upload or iframe embedding"}
                    </Typography>
                </Box>
                <VideoSelectionDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSelect={handleVideoSelect}
                    initialData={{ content: "", platform: "upload" }}
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
            <EnhancedVideo
                data={block}
                controls={
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => setDialogOpen(true)}
                    >
                        {dict?.edit?.editButton || "Edit"}
                    </Button>
                }
            />
            <VideoSelectionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSelect={handleVideoSelect}
                initialData={block.props}
            />
        </Box>
    );
};

export const EnhancedVideoBlockSpec = createReactBlockSpec(
    {
        type: ENHANCED_VIDEO_BLOCK_TYPE,
        propSchema: {
            content: { default: "", type: "string" },
            platform: { default: "upload", type: "string" },
            width: { default: "560", type: "string" },
            height: { default: "315", type: "string" },
            title: { default: "", type: "string" },
            alignment: { default: "center", type: "string" },
        },
        content: "none",
    },
    {
        render: (props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <EnhancedVideoBlockRender block={props.block as any} />
        ),
    }
)();

/**
 * Creates a slash menu item for inserting an Enhanced Video block
 */
export const getEnhancedVideoSlashMenuItem = (
    editor: BlockNoteEditor<BlockSchemaFromSpecs<typeof schema.blockSpecs>>
): DefaultReactSuggestionItem => {
    const dict = editor.dictionary;
    const slashMenuDict = dict?.enhanced_slash_menu.enhanced_video;
    return {
        title: slashMenuDict?.title || "Enhanced Video",
        icon: <EnhancedVideoIcon />,
        subtext: slashMenuDict?.subtext || "Embed a video with custom controls",
        group: slashMenuDict?.group || "Media",
        onItemClick: () => {
            insertOrUpdateBlockForSlashMenu(editor, {
                type: ENHANCED_VIDEO_BLOCK_TYPE,
                props: {
                    content: "",
                    platform: "upload",
                    width: "560",
                    height: "315",
                    title: "",
                    alignment: "center",
                },
            } as unknown as PartialBlock<
                BlockSchemaFromSpecs<typeof schema.blockSpecs>
            >);
        },
        aliases: ["video", "movie", "embed", "mp4", ENHANCED_VIDEO_BLOCK_TYPE],
    };
};
