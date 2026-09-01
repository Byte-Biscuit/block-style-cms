"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    TextField,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import {
    generateTwoFactorSecret,
    verifyAndEnableTwoFactor,
} from "@/app/actions/settings/user-management";
import { isSuccess } from "@/lib/response";
import type { UserWithProvider } from "@/lib/services/user-management-service";

type NotifySeverity = "success" | "error";

interface TwoFactorDialogProps {
    open: boolean;
    user: UserWithProvider | null;
    onClose: () => void;
    onDone: () => void;
    onNotify: (message: string, severity: NotifySeverity) => void;
}

export default function TwoFactorDialog({
    open,
    user,
    onClose,
    onDone,
    onNotify,
}: TwoFactorDialogProps) {
    const t = useTranslations("configuration.userManagement");
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    const [secret, setSecret] = useState("");
    const [otpauthUrl, setOtpauthUrl] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // ponytail: generate once when dialog opens for a user; startTransition is stable
    useEffect(() => {
        if (!open || !user) {
            return;
        }

        setStep(1);
        setSecret("");
        setOtpauthUrl("");
        setBackupCodes([]);
        setVerificationCode("");
        setError("");
        setCopied(false);

        startTransition(async () => {
            const result = await generateTwoFactorSecret(user.id);

            if (isSuccess(result)) {
                setSecret(result.payload.secret);
                setOtpauthUrl(result.payload.otpauthUrl);
                setBackupCodes(result.payload.backupCodes || []);
            } else {
                setError(result.message);
            }
        });
    }, [open, user]);

    const handleVerify = () => {
        if (!user) {
            return;
        }

        if (verificationCode.length !== 6) {
            setError(t("validation.verificationCodeRequired"));
            return;
        }

        startTransition(async () => {
            const result = await verifyAndEnableTwoFactor(
                user.id,
                verificationCode
            );

            if (isSuccess(result)) {
                setStep(3);
                setVerificationCode("");
                setError("");
            } else {
                setError(result.message);
            }
        });
    };

    const handleCopyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join("\n")).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleComplete = () => {
        onNotify(t("messages.enable2FASuccess"), "success");
        onDone();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {t("twoFactorDialog.title", {
                    userName: user?.name ?? "",
                })}
            </DialogTitle>
            <DialogContent>
                {step === 1 ? (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                        {isPending ? (
                            <CircularProgress />
                        ) : error ? (
                            <Alert severity="error">{error}</Alert>
                        ) : otpauthUrl ? (
                            <>
                                <DialogContentText sx={{ mb: 2 }}>
                                    {t("twoFactorDialog.step1.instruction")}
                                </DialogContentText>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        mb: 2,
                                    }}
                                >
                                    {/* biome-ignore lint/performance/noImgElement: remote QR from qrserver.com; next/image needs remotePatterns and can resample the code unreadably */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
                                        alt="2FA QR Code"
                                        style={{
                                            border: "1px solid #ddd",
                                            padding: "10px",
                                        }}
                                    />
                                </Box>

                                <DialogContentText
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t("twoFactorDialog.step1.manualEntry")}
                                </DialogContentText>
                                <TextField
                                    value={secret}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                    sx={{ mt: 1, mb: 2 }}
                                    size="small"
                                />

                                <DialogContentText sx={{ mt: 2 }}>
                                    {t("twoFactorDialog.step1.nextStep")}
                                </DialogContentText>
                            </>
                        ) : null}
                    </Box>
                ) : step === 2 ? (
                    <Box sx={{ py: 2 }}>
                        <DialogContentText sx={{ mb: 2 }}>
                            {t("twoFactorDialog.step2.instruction")}
                        </DialogContentText>
                        <TextField
                            label={t("twoFactorDialog.step2.label")}
                            value={verificationCode}
                            onChange={(e) => {
                                const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6);
                                setVerificationCode(value);
                                setError("");
                            }}
                            fullWidth
                            slotProps={{
                                htmlInput: {
                                    maxLength: 6,
                                    style: {
                                        textAlign: "center",
                                        fontSize: "24px",
                                        letterSpacing: "8px",
                                    },
                                },
                            }}
                            error={!!error}
                            helperText={error}
                            disabled={isPending}
                        />
                    </Box>
                ) : (
                    <Box sx={{ py: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <span
                                // biome-ignore lint/security/noDangerouslySetInnerHtml: 2FA backup-code warning is a trusted locale string, not user input
                                dangerouslySetInnerHTML={{
                                    __html: t("twoFactorDialog.step3.warning"),
                                }}
                            />
                        </Alert>

                        <DialogContentText sx={{ mb: 2, fontWeight: 600 }}>
                            {t("twoFactorDialog.step3.title")}
                        </DialogContentText>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 2,
                                bgcolor: "background.default",
                                fontFamily: "monospace",
                                fontSize: "14px",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 1,
                                }}
                            >
                                {backupCodes.map((code, index) => (
                                    <Box key={code}>
                                        {index + 1}. {code}
                                    </Box>
                                ))}
                            </Box>
                        </Paper>

                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleCopyBackupCodes}
                            startIcon={copied ? <CheckCircleIcon /> : undefined}
                            color={copied ? "success" : "primary"}
                        >
                            {copied
                                ? t("buttons.copied")
                                : t("buttons.copyBackupCodes")}
                        </Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {step === 3 ? (
                    <Button
                        onClick={handleComplete}
                        variant="contained"
                        fullWidth
                    >
                        {t("buttons.complete")}
                    </Button>
                ) : (
                    <>
                        <Button onClick={onClose} disabled={isPending}>
                            {t("buttons.cancel")}
                        </Button>
                        {step === 1 ? (
                            <Button
                                onClick={() => setStep(2)}
                                variant="contained"
                                disabled={isPending || !otpauthUrl}
                            >
                                {t("buttons.next")}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleVerify}
                                variant="contained"
                                disabled={
                                    isPending || verificationCode.length !== 6
                                }
                            >
                                {isPending ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    t("buttons.verifyEnable")
                                )}
                            </Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
