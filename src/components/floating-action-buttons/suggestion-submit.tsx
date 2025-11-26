"use client";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MessageIcon from "@mui/icons-material/Message";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslations } from "next-intl";
import { z } from "zod";

export default function SuggestionSubmit() {
    const t = useTranslations("web.floatingActions");
    const [dialogOpen, setDialogOpen] = useState(false);
    return (
        <>
            <IconButton
                aria-label={t("suggestion.ariaLabel")}
                onClick={() => setDialogOpen(true)}
                sx={{
                    bgcolor: "background.paper",
                    color: "primary.main",
                    border: 1,
                    borderColor: "divider",
                    "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                    },
                    boxShadow: 3,
                    width: 40,
                    height: 40,
                }}
                title={t("suggestion.title")}
            >
                <MessageIcon fontSize="small" />
            </IconButton>
            <SuggestionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />
        </>
    );
}

interface SuggestionDialogProps {
    open: boolean;
    onClose: () => void;
}

function SuggestionDialog({ open, onClose }: SuggestionDialogProps) {
    const t = useTranslations();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<
        "idle" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Create validation schema with translations
    const suggestionSubmissionSchema = z.object({
        name: z
            .string()
            .min(1, t("web.suggestion.validation.name.required"))
            .max(50, t("web.suggestion.validation.name.max", { max: "50" })),
        email: z.email(t("web.suggestion.validation.email.format")),
        content: z
            .string()
            .min(10, t("web.suggestion.validation.content.min", { min: "10" }))
            .max(
                2000,
                t("web.suggestion.validation.content.max", { max: "2000" })
            ),
    });

    // Load saved user info from localStorage
    useEffect(() => {
        if (open && typeof window !== "undefined") {
            const savedName = localStorage.getItem("suggestionName") || "";
            const savedEmail = localStorage.getItem("suggestionEmail") || "";
            setName(savedName);
            setEmail(savedEmail);
        }
    }, [open]);

    const handleClose = () => {
        if (!submitting) {
            setErrors({});
            setContent("");
            setSubmitStatus("idle");
            setErrorMessage("");
            onClose();
        }
    };

    const validateForm = (): boolean => {
        const result = suggestionSubmissionSchema.safeParse({
            name,
            email,
            content,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                if (issue.path[0]) {
                    fieldErrors[issue.path[0] as string] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const response = await fetch("/api/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, content }),
            });

            const data = await response.json();
            const { code, message } = data;
            if (code === 200) {
                // Save user info to localStorage
                if (typeof window !== "undefined") {
                    localStorage.setItem("suggestionName", name);
                    localStorage.setItem("suggestionEmail", email);
                }

                setSubmitStatus("success");
                setContent("");
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setSubmitStatus("error");
                setErrorMessage(message || t("web.suggestion.submitError"));
            }
        } catch {
            setSubmitStatus("error");
            setErrorMessage(t("web.suggestion.networkError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="suggestion-dialog-title"
        >
            <DialogTitle id="suggestion-dialog-title">
                {t("web.suggestion.dialogTitle")}
            </DialogTitle>
            <DialogContent>
                {submitStatus === "success" && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {t("web.suggestion.submitSuccess")}
                    </Alert>
                )}
                {submitStatus === "error" && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}

                <Alert severity="info" sx={{ mb: 2 }}>
                    {t("web.suggestion.description")}
                </Alert>

                <TextField
                    label={t("web.suggestion.nameLabel")}
                    fullWidth
                    margin="dense"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                            setErrors((prev) => ({ ...prev, name: "" }));
                        }
                    }}
                    error={!!errors.name}
                    helperText={errors.name || t("web.suggestion.nameHelper")}
                    disabled={submitting}
                    required
                />

                <TextField
                    label={t("web.suggestion.emailLabel")}
                    fullWidth
                    margin="dense"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: "" }));
                        }
                    }}
                    error={!!errors.email}
                    helperText={errors.email || t("web.suggestion.emailHelper")}
                    disabled={submitting}
                    required
                />

                <TextField
                    label={t("web.suggestion.contentLabel")}
                    fullWidth
                    margin="dense"
                    multiline
                    rows={6}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        if (errors.content) {
                            setErrors((prev) => ({ ...prev, content: "" }));
                        }
                    }}
                    error={!!errors.content}
                    helperText={
                        errors.content ||
                        t("web.suggestion.contentHelper", {
                            current: content.length,
                            max: 2000,
                        })
                    }
                    disabled={submitting}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    {t("web.suggestion.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting || submitStatus === "success"}
                    startIcon={
                        submitting ? <CircularProgress size={16} /> : null
                    }
                >
                    {submitting
                        ? t("web.suggestion.submitting")
                        : t("web.suggestion.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
