import { Card, CardContent, Typography, Box } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { getTranslations } from "next-intl/server";
import Link from "@/components/link";
import suggestionService from "@/lib/services/suggestion-service";

export default async function SuggestionSummaryCard() {
    const t = await getTranslations("admin.dashboard");
    let suggestionCount = 0;
    try {
        const stats = await suggestionService.getSuggestionCount();
        suggestionCount = stats.total;
    } catch (err) {
        console.error("Failed to fetch suggestion count:", err);
    }

    return (
        <Card
            sx={{
                minWidth: 250,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
                transition: "box-shadow 0.3s",
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Box sx={{ color: "secondary.main", mr: 2 }}>
                        <FeedbackIcon color="info" sx={{ fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Link
                            href="/m/suggestion"
                            style={{ textDecoration: "none" }}
                        >
                            <Typography variant="h4" component="div">
                                {suggestionCount}
                            </Typography>
                        </Link>
                        <Typography variant="body2" color="text.secondary">
                            {t("suggestionSummary.totalSuggestions")}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {t("suggestionSummary.viewAllLink")}
                </Typography>
            </CardContent>
        </Card>
    );
}
