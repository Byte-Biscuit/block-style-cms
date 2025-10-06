"use client";
import React from "react";
import Button from "@mui/material/Button";
import { useTranslations } from "next-intl";
import LogoutIcon from "@mui/icons-material/Logout";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton({
    returnTo = "/auth/sign-out",
}: {
    returnTo?: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const t = useTranslations();

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

    return (
        <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            size="small"
            onClick={handleSignOut}
            disabled={loading}
            sx={{ textTransform: "none", opacity: 0.9 }}
        >
            {t("web.auth.logout.label")}
        </Button>
    );
}
