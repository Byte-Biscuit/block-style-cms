import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Divider,
} from "@mui/material";
import {
    Add as AddIcon,
    List as ListIcon,
    Dashboard as DashboardIcon,
    Image as ImageIcon,
    Comment as CommentIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    Feedback as FeedbackIcon,
} from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import Link from "@/components/link";
import StorageUsageCard from "./components/dashboard-cards/storage-usage-card";
import ArticleSummaryCard from "./components/dashboard-cards/article-summary-card";
import CommentSummaryCard from "./components/dashboard-cards/comment-summary-card";
import SuggestionSummaryCard from "./components/dashboard-cards/suggestion-summary-card";
import SystemLoadCard from "./components/dashboard-cards/system-load-card";

export default async function AdminDashboard() {
    const t = await getTranslations("admin.dashboard");

    const quickActions = [
        {
            title: t("actions.writeArticle.title"),
            description: t("actions.writeArticle.description"),
            icon: <AddIcon sx={{ fontSize: 40 }} />,
            color: "primary",
            href: "/m/new",
        },
        {
            title: t("actions.articleManagement.title"),
            description: t("actions.articleManagement.description"),
            icon: <ListIcon sx={{ fontSize: 40 }} />,
            color: "info",
            href: "/m/list",
        },
        {
            title: t("actions.commentManagement.title"),
            description: t("actions.commentManagement.description"),
            icon: <CommentIcon sx={{ fontSize: 40 }} />,
            color: "warning",
            href: "/m/comment",
        },
        {
            title: t("actions.suggestionManagement.title"),
            description: t("actions.suggestionManagement.description"),
            icon: <FeedbackIcon sx={{ fontSize: 40 }} />,
            color: "info",
            href: "/m/suggestion",
        },
        {
            title: t("actions.systemSettings.title"),
            description: t("actions.systemSettings.description"),
            icon: <SettingsIcon sx={{ fontSize: 40 }} />,
            color: "grey",
            href: "/m/settings",
        },
        /*         {
            title: t("actions.mediaLibrary.title"),
            description: t("actions.mediaLibrary.description"),
            icon: <ImageIcon sx={{ fontSize: 40 }} />,
            color: "secondary",
            href: "#",
        }, */
        {
            title: t("actions.backToFrontend.title"),
            description: t("actions.backToFrontend.description"),
            icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
            color: "success",
            href: "/",
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 2,
                    mb: 4,
                }}
            >
                <DashboardIcon
                    sx={{
                        fontSize: { xs: 48, md: 60 },
                        color: "primary.main",
                        mr: 2,
                    }}
                    aria-hidden="true"
                />
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{ m: 0 }}
                >
                    {t("title")}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
                <StorageUsageCard />
                <ArticleSummaryCard />
                <CommentSummaryCard />
                <SuggestionSummaryCard />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                <Box
                    sx={{
                        flex: "2 1 600px",
                        minWidth: "400px",
                    }}
                >
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <DashboardIcon sx={{ mr: 1 }} />
                            {t("quickActions")}
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {quickActions.map((action, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        flex: "1 1 200px",
                                        minWidth: "180px",
                                    }}
                                >
                                    <Card
                                        elevation={1}
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            "&:hover": {
                                                elevation: 3,
                                                transform: "translateY(-2px)",
                                                transition:
                                                    "all 0.2s ease-in-out",
                                            },
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                flexGrow: 1,
                                                textAlign: "center",
                                                p: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    color: `${action.color}.main`,
                                                    mb: 1,
                                                }}
                                            >
                                                {action.icon}
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                component="h3"
                                                gutterBottom
                                            >
                                                {action.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {action.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions
                                            sx={{
                                                justifyContent: "center",
                                                pb: 2,
                                            }}
                                        >
                                            <Link
                                                href={action.href}
                                                style={{
                                                    textDecoration: "none",
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    color={
                                                        action.color as
                                                            | "primary"
                                                            | "secondary"
                                                            | "info"
                                                            | "warning"
                                                            | "success"
                                                    }
                                                    size="small"
                                                >
                                                    {t("enterButton")}
                                                </Button>
                                            </Link>
                                        </CardActions>
                                    </Card>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                    <SystemLoadCard />
                </Box>
            </Box>
        </Container>
    );
}
