import { Login } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "@/components/link";
import { button } from "@/lib/style-classes";

const ManageIconButton = async () => {
    const t = await getTranslations("web");
    const locale = await getLocale();

    return (
        <Tooltip title={t("manage")}>
            <Link href={`/${locale}/m`}>
                <IconButton color="inherit" className={button.icon}>
                    <Login />
                </IconButton>
            </Link>
        </Tooltip>
    );
};

export default ManageIconButton;
