import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/language-toggle";
import Link from "@/components/link";
import SignOutButton from "@/components/signout-button";
import { BETTER_AUTH_SIGN_IN } from "@/constants";
import { getAuth } from "@/lib/auth/auth";
import Footer from "./components/layout/footer";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = await getTranslations();
    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect(BETTER_AUTH_SIGN_IN);
    }
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <AppBar position="static" color="primary" elevation={2}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Link
                        href="/m"
                        className="flex items-center gap-2 text-inherit"
                    >
                        <Image
                            src="/api/logo"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                            priority
                        />
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            {t("web.title")}
                        </Typography>
                    </Link>
                    <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                        <Link
                            href="/m"
                            aria-label={t("admin.dashboard.title")}
                            title={t("admin.dashboard.title")}
                            className="inline-flex size-8 items-center justify-center rounded-full text-inherit hover:bg-white/10"
                        >
                            <DashboardIcon fontSize="small" />
                        </Link>
                        <LanguageToggle className="h-8 w-8 rounded-full text-white hover:bg-white/10" />
                        <SignOutButton />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: "grey.50" }}>
                {children}
            </Box>
            <Footer />
        </Box>
    );
}
