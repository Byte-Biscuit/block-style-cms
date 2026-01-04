import { Login } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { button } from "@/lib/style-classes";
import Link from "@/components/link";
import { getTranslations, getLocale } from "next-intl/server";

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
