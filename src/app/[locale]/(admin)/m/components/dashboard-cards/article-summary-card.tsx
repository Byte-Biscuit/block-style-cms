import { Box, Card, CardContent, Typography } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import { articleService } from "@/lib/services/article-service";
import { getTranslations } from "next-intl/server";

const ArticleSummaryCard = async () => {
    const articleCount = await articleService.getArtilcesCount();
    const t = await getTranslations("admin.dashboard.articleSummary");
    return (
        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
            <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Box sx={{ color: "primary.main", mr: 2 }}>
                            <ArticleIcon sx={{ fontSize: 30 }} />{" "}
                        </Box>
                        <Box>
                            <Typography variant="h4" component="div">
                                {articleCount.total}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t("title")}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {t("publishedDraft", {
                            published: articleCount.total - articleCount.draft,
                            draft: articleCount.draft,
                        })}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ArticleSummaryCard;
