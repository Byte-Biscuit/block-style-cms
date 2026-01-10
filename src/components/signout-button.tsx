"use client";
import React from "react";
import { Button, Box, Avatar, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import LogoutIcon from "@mui/icons-material/Logout";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton({
    returnTo = "/auth/sign-out",
}: {
    returnTo?: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const t = useTranslations();
    const { data: session } = authClient.useSession();

    async function handleSignOut(e: React.MouseEvent) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push(returnTo);
                    },
                },
            });
        } catch (err) {
            console.error("Sign out failed", err);
            router.push("/m/sign-in");
        } finally {
            setLoading(false);
        }
    }

    const userDisplay = session?.user?.name || session?.user?.email || "User";
    const avatarLetter = userDisplay.charAt(0).toUpperCase();

    return (
        <Box
            component="nav"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            <Avatar
                sx={{
                    width: 28,
                    height: 28,
                    fontSize: "0.875rem",
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    boxShadow: 1,
                }}
            >
                {avatarLetter}
            </Avatar>
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 700,
                    display: { xs: "none", sm: "block" },
                    color: "white",
                    opacity: 0.9,
                }}
            >
                {userDisplay}
            </Typography>
            <Button
                color="inherit"
                variant="text"
                startIcon={<LogoutIcon fontSize="small" />}
                size="small"
                onClick={handleSignOut}
                disabled={loading}
                sx={{
                    textTransform: "none",
                    color: "white",
                    opacity: 0.9,
                    "&:hover": { opacity: 1 },
                    minWidth: "auto",
                    px: 1,
                }}
                aria-label={`${t("web.auth.logout.label")}`}
            >
                {t("web.auth.logout.label")}
            </Button>
        </Box>
    );
}
