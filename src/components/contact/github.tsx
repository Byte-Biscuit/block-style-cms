import { GitHub } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { button } from "@/lib/style-classes";
import Link from "@/components/link";
import { systemConfigService } from "@/lib/services/system-config-service";

const GitHubIconButton = async () => {
    const systemConfig = await systemConfigService.readConfig();
    return (
        <Tooltip title="GitHub">
            <Link
                href={`${systemConfig?.siteInfo.contact.github || "https://github.com/Byte-Biscuit/block-style-cms"}`}
            >
                <IconButton color="inherit" className={button.icon}>
                    <GitHub />
                </IconButton>
            </Link>
        </Tooltip>
    );
};

export default GitHubIconButton;
