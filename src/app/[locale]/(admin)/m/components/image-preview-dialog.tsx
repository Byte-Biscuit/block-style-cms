"use client";

import React from "react";
import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ImagePreviewDialogProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    altText?: string;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
    open,
    onClose,
    imageUrl,
    altText = "Image Preview",
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        boxShadow: "none",
                    },
                },
            }}
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "flex-start",
                    paddingTop: "8vh",
                },
            }}
        >
            <DialogContent
                sx={{
                    p: 0,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "white",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                        },
                        zIndex: 1,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Box
                    component="img"
                    src={imageUrl}
                    alt={altText}
                    sx={{
                        maxWidth: "100%",
                        maxHeight: "80vh",
                        objectFit: "contain",
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreviewDialog;
