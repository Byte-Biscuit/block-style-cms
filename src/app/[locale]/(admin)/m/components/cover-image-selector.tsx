"use client";

import React, { useState, useRef } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardMedia,
    Menu,
    MenuItem as MenuItemComponent,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from "@mui/material";
import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
    OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import dynamic from "next/dynamic";
import {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_FILE_SIZE,
    IMAGE_BASE_URL,
    API_BASE_URL,
} from "@/settings";
import { useTranslations } from "next-intl";

const ImagePreviewDialog = dynamic(
    () => import("@/admin/m/components/image-preview-dialog"),
    { ssr: false }
);

const PexelsImagePicker = dynamic(
    () => import("@/admin/m/components/pexels-image-picker"),
    { ssr: false }
);

interface CoverImageSelectorProps {
    imageUrl: string;
    onImageChange: (imageUrl: string) => void;
}

const CoverImageSelector: React.FC<CoverImageSelectorProps> = ({
    imageUrl,
    onImageChange,
}) => {
    const t = useTranslations("admin.cover_image_selector");
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [pexelsOpen, setPexelsOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(
        null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    // Show message
    const showMessage = (
        message: string,
        severity: "success" | "error" | "warning" | "info" = "success"
    ) => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    // Close message
    const closeMessage = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Handle local image upload
    const handleLocalImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (
            !new Set(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).has(
                file.type
            )
        ) {
            showMessage(t("messages.unsupportedType"), "error");
            return;
        }

        // Validate file size (5MB)
        if (file.size > MAX_FILE_SIZE) {
            showMessage(t("messages.fileTooLarge"), "error");
            return;
        }

        setUploading(true);
        try {
            const formDataToUpload = new FormData();
            formDataToUpload.append("file", file);
            formDataToUpload.append(
                "options",
                JSON.stringify({
                    quality: 85,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    enableWebP: true,
                })
            );

            console.log("Uploading image:", file.name, "size:", file.size);

            const response = await fetch(`${API_BASE_URL}/m/images`, {
                method: "POST",
                body: formDataToUpload,
            });

            // Check response status
            if (!response.ok) {
                throw new Error(
                    `HTTP error: ${response.status} ${response.statusText}`
                );
            }

            const result = await response.json();
            console.log("Upload response:", result);

            if (result && result.code === 200) {
                const { filename } = result.payload;
                const newImageUrl = `${IMAGE_BASE_URL}/images/${filename}`;
                console.log("Generated image URL:", newImageUrl);
                onImageChange(newImageUrl);
                setImageMenuAnchor(null);
                showMessage(t("messages.uploadSuccess"), "success");
            } else {
                const errorMessage =
                    result?.message || t("messages.uploadFailed");
                console.error("Upload failed:", result);
                showMessage(errorMessage, "error");
            }
        } catch (error) {
            console.error("Upload image failed:", error);
            const errorMessage =
                error instanceof Error
                    ? `${t("messages.uploadFailed")}: ${error.message}`
                    : t("messages.uploadFailed");
            showMessage(errorMessage, "error");
        } finally {
            setUploading(false);
            // Clear input value to allow re-selecting the same file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Handle Pexels image select
    const handlePexelsImageSelect = (selectedImageUrl: string) => {
        onImageChange(selectedImageUrl);
        setPexelsOpen(false);
    };

    // Handle image preview
    const handleImagePreview = () => {
        if (imageUrl) {
            setPreviewOpen(true);
        }
    };

    // Handle image menu
    const handleImageMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setImageMenuAnchor(event.currentTarget);
    };

    const handleImageMenuClose = () => {
        setImageMenuAnchor(null);
    };

    // Handle image remove - show confirmation dialog
    const handleImageRemoveClick = () => {
        setConfirmDeleteOpen(true);
    };

    /**
     * Image deletion may fail (e.g., if the file is locked).
     * Deletion functionality is temporarily disabled due to implementation difficulties.
     * @returns
     */
    const handleConfirmDelete = async () => {
        setConfirmDeleteOpen(false);

        if (!imageUrl) return;

        try {
            /* Current deletion may fail due to file lock; deletion disabled.
            // Check if the image was uploaded locally
            if (imageUrl.startsWith(`${IMAGE_BASE_URL}/images/`)) {
                // Extract filename
                const filename = imageUrl.replace(
                    `${IMAGE_BASE_URL}/images/`,
                    ""
                );

                // Call delete API
                const response = await fetch(
                    `${API_BASE_URL}/m/images/${filename}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Delete request failed: ${response.status} ${response.statusText}`
                    );
                }

                const result = await response.json();

                if (result && result.code === 200) {
                    showMessage("Image deleted successfully", "success");
                } else {
                    throw new Error(result?.message || "Delete failed");
                }
            } else {
                // For external images (e.g., Pexels), only remove the reference
                showMessage("Image reference removed", "info");
            }
            */
            // Clear image URL
            onImageChange("");
        } catch (error) {
            console.error("Remove image failed:", error);
            const errorMessage =
                error instanceof Error
                    ? `${t("messages.removeFailed")}: ${error.message}`
                    : t("messages.removeFailed");
            showMessage(errorMessage, "error");
        }
    };

    // Cancel delete
    const handleCancelDelete = () => {
        setConfirmDeleteOpen(false);
    };

    return (
        <Card sx={{ mb: 2, p: 0, boxShadow: "none" }}>
            <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <PhotoLibraryIcon color="action" />
                {t("title")}
            </Typography>

            {/* Input and action buttons area */}
            <Card variant="outlined" sx={{ p: 2.5, mb: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                    }}
                >
                    <TextField
                        label={t("input.label")}
                        size="small"
                        value={imageUrl}
                        onChange={(e) => onImageChange(e.target.value)}
                        fullWidth
                        placeholder={t("input.placeholder")}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleImageMenuClick}
                        startIcon={
                            uploading ? (
                                <CircularProgress size={16} />
                            ) : (
                                <AddIcon />
                            )
                        }
                        disabled={uploading}
                        sx={{
                            minWidth: 120,
                            height: 40,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {uploading
                            ? t("buttons.uploading")
                            : t("buttons.select")}
                    </Button>
                </Box>

                {/* Quick buttons */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        mt: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {t("buttons.uploadLocal")}
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<PhotoLibraryIcon />}
                        onClick={() => setPexelsOpen(true)}
                    >
                        {t("buttons.fromPexels")}
                    </Button>
                </Box>
            </Card>

            {/* Image preview area */}
            {imageUrl && (
                <Card
                    variant="outlined"
                    sx={{
                        p: 3,
                        backgroundColor: "background.paper",
                        border: "2px solid",
                        borderColor: "success.light",
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="success.main"
                        sx={{
                            mb: 2.5,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <VisibilityIcon fontSize="small" />
                        {t("notes.preview")}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center", // Vertically centered
                            gap: 3,
                            flexDirection: { xs: "column", sm: "row" },
                        }}
                    >
                        {/* Thumbnail */}
                        <Card
                            elevation={3}
                            sx={{
                                width: { xs: "100%", sm: 200 },
                                height: 150,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.03)",
                                    boxShadow: 6,
                                },
                                flexShrink: 0,
                                borderRadius: 2,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "grey.50",
                            }}
                            onClick={handleImagePreview}
                        >
                            <CardMedia
                                component="img"
                                image={imageUrl}
                                alt={t("notes.preview")}
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain", // Maintain aspect ratio and fully display the image
                                    display: "block",
                                }}
                                onError={(e) => {
                                    console.error(
                                        "Image failed to load:",
                                        imageUrl
                                    );
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                }}
                                onLoad={() => {
                                    console.log(
                                        "Image loaded successfully:",
                                        imageUrl
                                    );
                                }}
                            />
                        </Card>
                        {/* Image info and action buttons */}{" "}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    <strong>{t("notes.imageUrlLabel")}</strong>
                                </Typography>
                                <Box
                                    component="div"
                                    sx={{
                                        wordBreak: "break-all",
                                        fontSize: "0.8rem",
                                        fontFamily:
                                            "Monaco, 'Consolas', monospace",
                                        backgroundColor: "grey.100",
                                        border: "1px solid",
                                        borderColor: "grey.300",
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 1,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {imageUrl}
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1.5,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={handleImagePreview}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t("buttons.viewLarge")}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNewIcon />}
                                    onClick={() => {
                                        window.open(imageUrl, "_blank");
                                    }}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t("buttons.openNewWindow")}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={handleImageRemoveClick}
                                    startIcon={<DeleteIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t("buttons.remove")}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Card>
            )}

            {/* Image selection menu */}
            <Menu
                anchorEl={imageMenuAnchor}
                open={Boolean(imageMenuAnchor)}
                onClose={handleImageMenuClose}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            border: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                <MenuItemComponent
                    onClick={() => {
                        fileInputRef.current?.click();
                        handleImageMenuClose();
                    }}
                    disabled={uploading}
                    sx={{ py: 1.5, px: 2 }}
                >
                    <CloudUploadIcon sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {uploading
                                ? t("buttons.uploading") + "..."
                                : t("buttons.uploadLocal")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t("notes.supportedTypes")}
                        </Typography>
                    </Box>
                </MenuItemComponent>
                <MenuItemComponent
                    onClick={() => {
                        setPexelsOpen(true);
                        handleImageMenuClose();
                    }}
                    sx={{ py: 1.5, px: 2 }}
                >
                    <PhotoLibraryIcon sx={{ mr: 2, color: "secondary.main" }} />
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {t("buttons.fromPexels")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t("notes.supportedTypes")}
                        </Typography>
                    </Box>
                </MenuItemComponent>
            </Menu>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
                onChange={handleLocalImageUpload}
                style={{ display: "none" }}
            />

            {/* Image preview dialog */}
            <ImagePreviewDialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                imageUrl={imageUrl || ""}
                altText={t("notes.preview")}
            />

            {/* Pexels image picker */}
            <PexelsImagePicker
                open={pexelsOpen}
                onClose={() => setPexelsOpen(false)}
                onSelect={handlePexelsImageSelect}
            />

            {/* Message snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={closeMessage}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={closeMessage}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Confirm delete dialog */}
            <Dialog
                open={confirmDeleteOpen}
                onClose={handleCancelDelete}
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-description"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            minWidth: 400,
                        },
                    },
                }}
                sx={{
                    "& .MuiDialog-container": {
                        alignItems: "flex-start",
                        paddingTop: "15vh", // distance from top: 15% of viewport height
                    },
                }}
            >
                <DialogTitle
                    id="confirm-delete-title"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        pb: 1,
                    }}
                >
                    <WarningIcon color="warning" />
                    {t("buttons.delete")}
                </DialogTitle>
                <DialogContent sx={{ pb: 3 }}>
                    <DialogContentText
                        id="confirm-delete-description"
                        sx={{ lineHeight: 1.6 }}
                    >
                        {t("messages.removeConfirm")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCancelDelete}
                        color="inherit"
                        sx={{ borderRadius: 2 }}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        autoFocus
                        sx={{ borderRadius: 2 }}
                    >
                        {imageUrl?.startsWith(`${IMAGE_BASE_URL}/images/`)
                            ? t("buttons.delete")
                            : t("buttons.remove")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default CoverImageSelector;
