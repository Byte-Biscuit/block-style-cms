import { GitHub } from "@mui/icons-material";
import Link from "@/components/link";
import { systemConfigService } from "@/lib/services/system-config-service";
import { button } from "@/lib/style-classes";

const GitHubIconButton = async () => {
    const systemConfig = await systemConfigService.readConfig();
    return (
        <Link
            href={`${systemConfig?.siteInfo.contact.github || "https://github.com/Byte-Biscuit/block-style-cms"}`}
            aria-label="GitHub"
            title="GitHub"
            className={button.icon}
        >
            <GitHub />
        </Link>
    );
};

export default GitHubIconButton;
