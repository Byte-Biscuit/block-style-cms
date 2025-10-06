"use client";

import React, { useState } from "react";
import Image from "next/image";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Divider,
    Paper,
} from "@mui/material";
import {
    Upload as UploadIcon,
    Link as LinkIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    Image as ImageIcon,
} from "@mui/icons-material";
import { createReactBlockSpec, useBlockNoteEditor } from "@blocknote/react";
import PexelsImagePicker from "../pexels-image-picker";
import { ADMIN_API_PREFIX, IMAGE_BASE_URL } from "@/config";
import { getBlockEditorContainer } from "./block-editor-utils";
import EnhancedImage, {
    ImageBlockProps,
} from "@/components/block-note/enhanced-image";

export const ENHANCED_IMAGE_BLOCK_TYPE = "enhancedImage";

// Image selection dialog component
function ImageSelectionDialog({
    open,
    onClose,
    onSelect,
    initialData,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (imageData: ImageBlockProps) => void;
    initialData?: ImageBlockProps;
}) {
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_image_block;

    const [urlInput, setUrlInput] = useState("");
    const [altInput, setAltInput] = useState(initialData?.alt || "");
    const [captionInput, setCaptionInput] = useState(
        initialData?.caption || ""
    );
    const [pexelsImagePickerVisible, setPexelsImagePickerVisible] =
        useState(false);
    const [urlDialogVisible, setUrlDialogVisible] = useState(false);
    const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(
        initialData?.src || ""
    );
    const [editableUrl, setEditableUrl] = useState(initialData?.src || "");
    const [alignment, setAlignment] = useState<"left" | "center" | "right">(
        initialData?.alignment || "center"
    );
    const [imageWidth, setImageWidth] = useState(initialData?.width || "800");
    const [imageHeight, setImageHeight] = useState(
        initialData?.height || "600"
    );
    const [objectFit, setObjectFit] = useState<
        "contain" | "cover" | "fill" | "scale-down" | "none"
    >(initialData?.objectFit || "cover");
    const [maxWidth, setMaxWidth] = useState(initialData?.maxWidth || "100%");

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${ADMIN_API_PREFIX}/images`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const resp = await response.json();
                if (resp?.code === 200) {
                    const data = resp.payload;
                    const imageUrl = `${IMAGE_BASE_URL}/${data.filename}`;
                    setSelectedImageUrl(imageUrl);
                    setEditableUrl(imageUrl);
                    setAltInput(altInput || data.altText || "");
                    setUploadDialogVisible(false); // Close upload dialog
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
        if (urlInput.trim()) {
            const imageUrl = urlInput.trim();
            setSelectedImageUrl(imageUrl);
            setEditableUrl(imageUrl);
            setUrlDialogVisible(false);
        }
    };

    const handlePexelsSelect = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setEditableUrl(imageUrl);
        setAltInput("Image from Pexels");
    };

    const handleSaveImage = () => {
        if (editableUrl.trim()) {
            onSelect({
                src: editableUrl.trim(),
                alt: altInput || "Image",
                caption: captionInput || "",
                source: selectedImageUrl.includes("pexels.com")
                    ? "pexels"
                    : selectedImageUrl.includes(IMAGE_BASE_URL)
                      ? "upload"
                      : "url",
                alignment: alignment,
                width: imageWidth,
                height: imageHeight,
                objectFit: objectFit,
                maxWidth: maxWidth,
            });
            onClose();
        }
    };

    const handleClearSelection = () => {
        setSelectedImageUrl("");
        setEditableUrl("");
        setUrlInput("");
        setAltInput("");
        setCaptionInput("");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            container={getBlockEditorContainer()}
            slotProps={{
                paper: {
                    sx: { minHeight: "600px" },
                },
            }}
        >
            <DialogTitle>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h6">
                        {dict?.dialog?.title || "Select Image"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ width: "100%" }}>
                    {/* Selected image information display and edit area */}
                    {selectedImageUrl ? (
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
                                    {dict?.dialog?.selectedImage ||
                                        "✓ Image Selected"}
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

                            {/* Image preview and basic information */}
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
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 120,
                                        height: 90,
                                        bgcolor: "white",
                                        borderRadius: 1,
                                        border: "1px solid",
                                        borderColor: "grey.300",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Image
                                        src={selectedImageUrl}
                                        alt="Selected"
                                        width={120}
                                        height={90}
                                        style={{
                                            objectFit: "contain",
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={
                                            dict?.dialog?.imageUrl ||
                                            "Image URL"
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
                                        key="main-alt-input"
                                        fullWidth
                                        label={
                                            dict?.dialog?.altDescription ||
                                            "Alt Description"
                                        }
                                        value={altInput}
                                        onChange={(e) =>
                                            setAltInput(e.target.value)
                                        }
                                        size="small"
                                        variant="outlined"
                                        placeholder={
                                            dict?.dialog?.altPlaceholder ||
                                            "Add alt description for the image"
                                        }
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        key="main-caption-input"
                                        fullWidth
                                        label={
                                            dict?.dialog?.captionLabel ||
                                            "Image Caption (displayed below image)"
                                        }
                                        value={captionInput}
                                        onChange={(e) =>
                                            setCaptionInput(e.target.value)
                                        }
                                        size="small"
                                        variant="outlined"
                                        placeholder={
                                            dict?.dialog?.captionPlaceholder ||
                                            "Add a caption to be displayed below the image"
                                        }
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Image style controls */}
                            <Typography
                                variant="h6"
                                gutterBottom
                                color="primary"
                            >
                                🎨{" "}
                                {dict?.dialog?.styleSettings ||
                                    "Style Settings"}
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="subtitle2"
                                    gutterBottom
                                    sx={{ mb: 1 }}
                                >
                                    {dict?.dialog?.layoutAlignment ||
                                        "Layout and Alignment"}
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <FormControl
                                        sx={{ minWidth: 140 }}
                                        size="small"
                                    >
                                        <InputLabel>
                                            {dict?.dialog?.alignment ||
                                                "Alignment"}
                                        </InputLabel>
                                        <Select
                                            value={alignment}
                                            label={
                                                dict?.dialog?.alignment ||
                                                "Alignment"
                                            }
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
                                                container:
                                                    getBlockEditorContainer(),
                                            }}
                                        >
                                            <MenuItem value="left">
                                                {dict?.dialog?.alignLeft ||
                                                    "Left Align"}
                                            </MenuItem>
                                            <MenuItem value="center">
                                                {dict?.dialog?.alignCenter ||
                                                    "Center"}
                                            </MenuItem>
                                            <MenuItem value="right">
                                                {dict?.dialog?.alignRight ||
                                                    "Right Align"}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label={
                                            dict?.dialog?.maxWidth ||
                                            "Max Width"
                                        }
                                        value={maxWidth}
                                        onChange={(e) =>
                                            setMaxWidth(e.target.value)
                                        }
                                        size="small"
                                        variant="outlined"
                                        placeholder={
                                            dict?.dialog?.maxWidthPlaceholder ||
                                            "e.g.: 100%, 500px"
                                        }
                                        sx={{ minWidth: 140 }}
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="subtitle2"
                                    gutterBottom
                                    sx={{ mb: 1 }}
                                >
                                    {dict?.dialog?.dimensionSettings ||
                                        "Dimension Settings"}
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <TextField
                                        label={
                                            dict?.dialog?.width || "Width (px)"
                                        }
                                        value={imageWidth}
                                        onChange={(e) =>
                                            setImageWidth(e.target.value)
                                        }
                                        size="small"
                                        variant="outlined"
                                        type="number"
                                        sx={{ minWidth: 120 }}
                                    />

                                    <TextField
                                        label={
                                            dict?.dialog?.height ||
                                            "Height (px)"
                                        }
                                        value={imageHeight}
                                        onChange={(e) =>
                                            setImageHeight(e.target.value)
                                        }
                                        size="small"
                                        variant="outlined"
                                        type="number"
                                        sx={{ minWidth: 120 }}
                                    />

                                    <FormControl
                                        sx={{ minWidth: 140 }}
                                        size="small"
                                    >
                                        <InputLabel>
                                            {dict?.dialog?.scalingStrategy ||
                                                "Scaling Strategy"}
                                        </InputLabel>
                                        <Select
                                            value={objectFit}
                                            label={
                                                dict?.dialog?.scalingStrategy ||
                                                "Scaling Strategy"
                                            }
                                            onChange={(e) =>
                                                setObjectFit(
                                                    e.target.value as
                                                        | "contain"
                                                        | "cover"
                                                        | "fill"
                                                        | "scale-down"
                                                        | "none"
                                                )
                                            }
                                            MenuProps={{
                                                disablePortal: false,
                                                container:
                                                    getBlockEditorContainer(),
                                            }}
                                        >
                                            <MenuItem value="contain">
                                                {dict?.dialog?.fitContain ||
                                                    "Fit Complete"}
                                            </MenuItem>
                                            <MenuItem value="cover">
                                                {dict?.dialog?.fitCover ||
                                                    "Fill Container"}
                                            </MenuItem>
                                            <MenuItem value="fill">
                                                {dict?.dialog?.fitFill ||
                                                    "Stretch Fill"}
                                            </MenuItem>
                                            <MenuItem value="scale-down">
                                                {dict?.dialog?.fitScaleDown ||
                                                    "Scale Down"}
                                            </MenuItem>
                                            <MenuItem value="none">
                                                {dict?.dialog?.fitNone ||
                                                    "Original Size"}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                                minHeight: "400px",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                gutterBottom
                            >
                                {dict?.dialog?.selectSource ||
                                    "Select image source"}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 3,
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                    maxWidth: "600px",
                                }}
                            >
                                {/* Local upload option */}
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 4,
                                        textAlign: "center",
                                        minWidth: "180px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            bgcolor: "action.hover",
                                            transform: "translateY(-2px)",
                                            boxShadow: 2,
                                        },
                                    }}
                                    onClick={() => setUploadDialogVisible(true)}
                                >
                                    <UploadIcon
                                        sx={{
                                            fontSize: 48,
                                            color: "primary.main",
                                            mb: 2,
                                        }}
                                    />
                                    <Typography variant="h6" gutterBottom>
                                        {dict?.upload?.title || "Local Upload"}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {dict?.upload?.subtitle ||
                                            "Select image file from device"}
                                    </Typography>
                                </Paper>

                                {/* URL link option */}
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 4,
                                        textAlign: "center",
                                        minWidth: "180px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            bgcolor: "action.hover",
                                            transform: "translateY(-2px)",
                                            boxShadow: 2,
                                        },
                                    }}
                                    onClick={() => setUrlDialogVisible(true)}
                                >
                                    <LinkIcon
                                        sx={{
                                            fontSize: 48,
                                            color: "primary.main",
                                            mb: 2,
                                        }}
                                    />
                                    <Typography variant="h6" gutterBottom>
                                        {dict?.embed?.title || "URL Link"}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {dict?.embed?.subtitle ||
                                            "Enter image URL"}
                                    </Typography>
                                </Paper>

                                {/* Pexels gallery option */}
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 4,
                                        textAlign: "center",
                                        minWidth: "180px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            bgcolor: "action.hover",
                                            transform: "translateY(-2px)",
                                            boxShadow: 2,
                                        },
                                    }}
                                    onClick={() =>
                                        setPexelsImagePickerVisible(true)
                                    }
                                >
                                    <SearchIcon
                                        sx={{
                                            fontSize: 48,
                                            color: "primary.main",
                                            mb: 2,
                                        }}
                                    />
                                    <Typography variant="h6" gutterBottom>
                                        {dict?.pexels?.title ||
                                            "Pexels Gallery"}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {dict?.pexels?.subtitle ||
                                            "Choose from free gallery"}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>{" "}
            <DialogActions>
                <Button onClick={onClose}>
                    {dict?.dialog?.cancel || "Cancel"}
                </Button>
                {selectedImageUrl && (
                    <Button
                        onClick={handleSaveImage}
                        variant="contained"
                        disabled={!editableUrl.trim()}
                    >
                        {dict?.dialog?.insertImage || "Insert Image"}
                    </Button>
                )}
            </DialogActions>
            {/* URL input dialog */}
            <Dialog
                open={urlDialogVisible}
                onClose={() => setUrlDialogVisible(false)}
                maxWidth="sm"
                fullWidth
                container={getBlockEditorContainer()}
            >
                <DialogTitle>
                    {dict?.embed?.urlLabel || "Enter Image URL"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label={dict?.embed?.imageUrl || "Image URL"}
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            variant="outlined"
                            autoFocus
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            key="url-alt-input"
                            fullWidth
                            label={
                                dict?.embed?.altDescription ||
                                "Alt Description (optional)"
                            }
                            value={altInput}
                            onChange={(e) => setAltInput(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            key="url-caption-input"
                            fullWidth
                            label={
                                dict?.embed?.captionLabel ||
                                "Image Caption (optional, displayed below image)"
                            }
                            value={captionInput}
                            onChange={(e) => setCaptionInput(e.target.value)}
                            variant="outlined"
                        />
                        {urlInput && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    {dict?.embed?.preview || "Preview:"}
                                </Typography>
                                <Image
                                    src={urlInput}
                                    alt="Preview"
                                    width={300}
                                    height={200}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "200px",
                                        objectFit: "contain",
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                    }}
                                    onError={(e) => {
                                        (
                                            e.target as HTMLImageElement
                                        ).style.display = "none";
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUrlDialogVisible(false)}>
                        {dict?.dialog?.cancel || "Cancel"}
                    </Button>
                    <Button
                        onClick={handleUrlSubmit}
                        variant="contained"
                        disabled={!urlInput.trim()}
                    >
                        {dict?.embed?.selectThisImage || "Select This Image"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* File upload dialog */}
            <Dialog
                open={uploadDialogVisible}
                onClose={() => setUploadDialogVisible(false)}
                maxWidth="sm"
                fullWidth
                container={getBlockEditorContainer()}
            >
                <DialogTitle>
                    {dict?.upload?.dialogTitle || "Upload Image File"}
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
                                    <Typography variant="h6" gutterBottom>
                                        {dict?.upload?.clickToSelect ||
                                            "Click to Select File"}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {dict?.upload?.supportedFormats ||
                                            "Supports JPG, PNG, GIF, WebP formats"}
                                    </Typography>
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                </>
                            )}
                        </Paper>
                        <TextField
                            key="upload-alt-input"
                            fullWidth
                            label={
                                dict?.upload?.altDescription ||
                                "Alt Description (optional)"
                            }
                            value={altInput}
                            onChange={(e) => setAltInput(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            key="upload-caption-input"
                            fullWidth
                            label={
                                dict?.upload?.captionLabel ||
                                "Image Caption (optional, displayed below image)"
                            }
                            value={captionInput}
                            onChange={(e) => setCaptionInput(e.target.value)}
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogVisible(false)}>
                        {dict?.dialog?.cancel || "Cancel"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Pexels image selector */}
            <PexelsImagePicker
                open={pexelsImagePickerVisible}
                onClose={() => setPexelsImagePickerVisible(false)}
                onSelect={handlePexelsSelect}
            />
        </Dialog>
    );
}

// Enhanced Image Block component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EnhancedImageBlockRender = ({ block }: { block: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editor = useBlockNoteEditor();
    const dict = editor?.dictionary?.enhanced_image_block;

    const handleImageSelect = (imageData: ImageBlockProps) => {
        if (editor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor as any).updateBlock(block, {
                type: ENHANCED_IMAGE_BLOCK_TYPE,
                props: imageData,
            });
        }
    };

    if (!block.props.src) {
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
                    <ImageIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                        {dict?.placeholder?.clickToAdd || "Click to Add Image"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {dict?.placeholder?.supportMethods ||
                            "Support local upload, URL link or Pexels selection"}
                    </Typography>
                </Box>

                <ImageSelectionDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSelect={handleImageSelect}
                    initialData={{
                        src: "",
                        alt: "",
                        caption: "",
                        source: "upload",
                    }}
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
            <EnhancedImage
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
            <ImageSelectionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSelect={handleImageSelect}
                initialData={block.props}
            />
        </Box>
    );
};

// Block specification
export const EnhancedImageBlockSpec = createReactBlockSpec(
    {
        type: ENHANCED_IMAGE_BLOCK_TYPE,
        propSchema: {
            src: {
                default: "",
                type: "string",
            },
            alt: {
                default: "",
                type: "string",
            },
            caption: {
                default: "",
                type: "string",
            },
            width: {
                default: "800",
                type: "string",
            },
            height: {
                default: "600",
                type: "string",
            },
            source: {
                default: "upload",
                type: "string",
            },
            alignment: {
                default: "center",
                type: "string",
            },
            objectFit: {
                default: "cover",
                type: "string",
            },
            maxWidth: {
                default: "100%",
                type: "string",
            },
        },
        content: "none",
    },
    {
        render: (props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <EnhancedImageBlockRender block={props.block as any} />
        ),
    }
)();

export const defaultNewEnhancedImageBlock = {
    type: ENHANCED_IMAGE_BLOCK_TYPE,
    props: {
        src: "",
        alt: "",
        caption: "",
        width: "800",
        height: "600",
        source: "upload",
        alignment: "center",
        objectFit: "cover",
        maxWidth: "100%",
    },
};
