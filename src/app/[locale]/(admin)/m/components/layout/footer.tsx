import { Paper, Container, Typography, Box } from "@mui/material";
import { VERSION } from "@/config";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
    const t = await getTranslations("admin.footer");
    return (
        <Paper
            component="footer"
            elevation={3}
            sx={{
                mt: "auto",
                py: 2,
                px: 3,
                bgcolor: "background.paper",
                borderTop: 1,
                borderColor: "divider",
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        {t("copyright")}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {t("version", { version: VERSION })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            |
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("poweredBy")}
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Paper>
    );
}
