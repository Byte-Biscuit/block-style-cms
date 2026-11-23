import { IconButton, Tooltip } from "@mui/material";
import MediumIcon from "@/components/icons/medium";
import Link from "@/components/link";
import { systemConfigService } from "@/lib/services/system-config-service";
import { button } from "@/lib/style-classes";

const MediumIconButton = async () => {
    const systemConfig = await systemConfigService.readConfig();
    const mediumUrl = systemConfig?.siteInfo.contact.medium;

    if (!mediumUrl) return null;

    return (
        <Tooltip title="Medium">
            <Link href={mediumUrl}>
                <IconButton color="inherit" className={button.icon}>
                    <MediumIcon />
                </IconButton>
            </Link>
        </Tooltip>
    );
};

export default MediumIconButton;
