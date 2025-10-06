import Link from "@/components/link";
import { getTranslations } from "next-intl/server";
import { type TranslationFunction } from "@/i18n/config";
import { BETTER_AUTH_SIGN_IN } from "@/constants";
import { sanitize } from "@/lib/security";
import { container, button } from "@/lib/classes";

interface AuthErrorPageProps {
    error?: string;
    error_description?: string;
}

const formatMessage = (
    error: string,
    errorDescription: string | null | undefined,
    t: TranslationFunction
): { errorCode: string; errorMessage: string } => {
    const errorMessages: Record<string, string> = {
        invalid_code: t("messages.invalid_code"),
        access_denied: t("messages.access_denied"),
        invalid_request: t("messages.invalid_request"),
        server_error: t("messages.server_error"),
        temporarily_unavailable: t("messages.temporarily_unavailable"),
    };
    let errorMessage = sanitize(errorDescription);
    errorMessage =
        errorMessage || errorMessages[error] || t("messages.unknown");
    const errorCode = sanitize(error) || "unknown";
    return { errorCode, errorMessage };
};

export const generateMetadata = async ({
    searchParams,
}: {
    searchParams: Promise<AuthErrorPageProps>;
}) => {
    const t = await getTranslations("web.auth");
    const { error, error_description } = await searchParams;
    const { errorMessage } = formatMessage(
        error || "unknown",
        error_description,
        t
    );
    return {
        title: t("title"),
        description: errorMessage,
    };
};
export default async function AuthErrorPage({
    searchParams,
}: {
    searchParams: Promise<AuthErrorPageProps>;
}) {
    const t = await getTranslations("web.auth");
    const { error, error_description } = await searchParams;
    const { errorCode, errorMessage } = formatMessage(
        error || "unknown",
        error_description,
        t
    );
    return (
        <section className={`${container.messagePage} space-y-6 pt-10`}>
            <div className="text-5xl">⚠️</div>

            <h1 className="text-2xl font-semibold text-red-500">
                {t("heading")}
            </h1>

            <p className="leading-relaxed text-gray-600">
                {errorMessage} {t("description")}
            </p>

            {/* Return Button */}
            <Link
                href={BETTER_AUTH_SIGN_IN}
                className={`${button.primary} mx-auto max-w-xs`}
            >
                {t("button")}
            </Link>

            {/* Error Code */}
            <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                    {t("errorCodeLabel")}:{" "}
                    <span className="font-mono">{errorCode}</span>
                </p>
            </div>
        </section>
    );
}
