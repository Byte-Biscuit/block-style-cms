import { Suspense } from "react";
import {
    Container,
    Paper,
    Typography,
    CircularProgress,
    Box,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { systemConfigService } from "@/lib/services/system-config-service";
import SettingsTabs from "./components/settings-tabs";

/**
 * System Settings Page
 * 系统设置页面
 *
 * Provides a tabbed interface for managing various system configurations:
 * - Website information
 * - Authentication methods
 * - External services
 * - Access control
 */
export default async function SettingsPage() {
    const t = await getTranslations("admin.settings");

    // Load current configuration
    const config = await systemConfigService.readConfig();

    if (!config) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        Configuration Not Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Please complete the installation process first.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Page Header */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <SettingsIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        System Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure your website, authentication, and services
                    </Typography>
                </Box>
            </Box>

            {/* Settings Tabs */}
            <Paper sx={{ p: 3 }}>
                <Suspense
                    fallback={
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 4,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    }
                >
                    <SettingsTabs initialConfig={config} />
                </Suspense>
            </Paper>
        </Container>
    );
}

export const metadata = {
    title: "System Settings",
    description: "Configure system settings and preferences",
};
