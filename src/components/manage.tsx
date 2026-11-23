import { Login } from "@mui/icons-material";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "@/components/link";
import { button } from "@/lib/style-classes";

const ManageIconButton = async () => {
    const t = await getTranslations("web");
    const locale = await getLocale();

    return (
        <Link
            href={`/${locale}/m`}
            aria-label={t("manage")}
            title={t("manage")}
            className={button.icon}
        >
            <Login />
        </Link>
    );
};

export default ManageIconButton;
