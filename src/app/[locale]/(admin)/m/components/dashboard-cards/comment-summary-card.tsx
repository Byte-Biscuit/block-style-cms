import { Box, Card, CardContent, Typography } from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import commentService from "@/lib/services/comment-service";
import { getTranslations } from "next-intl/server";

const CommentSummaryCard = async () => {
    const commentCount = await commentService.getCommentCount();
    const t = await getTranslations("admin.dashboard.commentSummary");
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
                        <Box sx={{ color: "secondary.main", mr: 2 }}>
                            <CommentIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" component="div">
                                {commentCount.total}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t("title")}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {t("statusBreakdown", {
                            pending: commentCount.pending,
                            approved: commentCount.approved,
                            rejected: commentCount.rejected,
                        })}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CommentSummaryCard;
