import { IconButton, Tooltip } from "@mui/material";
import { button } from "@/lib/style-classes";
import Link from "@/components/link";
import { systemConfigService } from "@/lib/services/system-config-service";

/** Medium three-ellipse logo icon */
const MediumIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1044 593"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
    >
        <ellipse cx="294.5" cy="296.5" rx="294.5" ry="296.5" />
        <ellipse cx="764.5" cy="296.5" rx="147.5" ry="279" />
        <ellipse cx="992" cy="296.5" rx="52" ry="250" />
    </svg>
);

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
