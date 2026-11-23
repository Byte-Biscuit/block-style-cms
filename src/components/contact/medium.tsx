import MediumIcon from "@/components/icons/medium";
import Link from "@/components/link";
import { systemConfigService } from "@/lib/services/system-config-service";
import { button } from "@/lib/style-classes";

const MediumIconButton = async () => {
    const systemConfig = await systemConfigService.readConfig();
    const mediumUrl = systemConfig?.siteInfo.contact.medium;

    if (!mediumUrl) return null;

    return (
        <Link
            href={mediumUrl}
            aria-label="Medium"
            title="Medium"
            className={button.icon}
        >
            <MediumIcon />
        </Link>
    );
};

export default MediumIconButton;
