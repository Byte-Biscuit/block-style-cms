import { redirect } from "next/navigation";
import Image from "next/image";
import { headers } from "next/headers";
import { Box, Typography, AppBar, Toolbar } from "@mui/material";
import { getAuth } from "@/lib/auth/auth";
import { BETTER_AUTH_SIGN_IN, BETTER_AUTH_ERROR_PAGE } from "@/constants";
import { systemConfigService } from "@/lib/services/system-config-service";
import Link from "@/components/link";
import Footer from "./components/layout/footer";
import { getTranslations } from "next-intl/server";
import SignOutButton from "@/components/signout-button";

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
    const { user } = session;
    const email = user.email.toLowerCase();
    const allowedEmails = systemConfigService
        .getAllowedEmails()
        .map((e) => e.toLowerCase());
    if (allowedEmails.length == 0 && !allowedEmails.includes(email)) {
        redirect(
            `${BETTER_AUTH_ERROR_PAGE}?error=access_denied&error_description=Your email (${email}) is not authorized to access this application.`
        );
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
                        color="inherit"
                        className="flex items-center gap-2"
                    >
                        <Image
                            src="/logo.png"
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
                    <SignOutButton />
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
