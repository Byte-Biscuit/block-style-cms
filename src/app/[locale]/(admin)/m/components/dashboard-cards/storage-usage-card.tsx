import {
    Box,
    Card,
    CardContent,
    LinearProgress,
    Typography,
} from "@mui/material";
import { getTranslations } from "next-intl/server";
import { formatBytes } from "@/lib/file-utils";
import StorageIcon from "@mui/icons-material/Storage";
import { systemInfoService } from "@/lib/services/system-info-service";

const StorageUsageCard = async () => {
    const storageData =
        await systemInfoService.getMountedDirectoryStorageStatus();
    const t = await getTranslations("admin.dashboard.storageUsage");
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
                        <Box sx={{ color: "info.main", mr: 2 }}>
                            <StorageIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" component="div">
                                {storageData.usedPercent}%
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t("title")}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {`${formatBytes(storageData.used)}/${formatBytes(storageData.total)}`}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={storageData.usedPercent}
                        sx={{ mt: 1 }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default StorageUsageCard;
