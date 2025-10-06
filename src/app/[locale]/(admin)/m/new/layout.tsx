import React from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("admin.article.meta");
    return {
        title: t("title"),
        description: t("description"),
        robots: {
            index: false,
            follow: false,
        },
    };
}

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return <>{children}</>;
};

export default Layout;
