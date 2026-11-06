import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InstallPageClient from "./components/install-page-client";

type Props = {
    params: Promise<{ locale: string }>;
};

/**
 * Generate Metadata for the Installation Page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: "configuration.meta",
    });

    return {
        title: t("title"),
        description: t("description"),
    };
}

/**
 * Installation Page (Server Component)
 *
 * This page is only accessible when the system has not been initialized.
 * Handles metadata and initializes the client-side installation wizard.
 */
export default async function InstallPage(_props: Props) {
    return <InstallPageClient />;
}
