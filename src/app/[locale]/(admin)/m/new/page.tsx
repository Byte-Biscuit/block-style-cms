"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Container from "@mui/material/Container";
import { Paper, Typography, Alert } from "@mui/material";
import { $ZodError } from "zod/v4/core";
import ArticleForm from "@/admin/m/components/article-form";
import ErrorDisplay from "@/admin/m/components/error-display";
import { type Article, createArticleSchemas } from "@/types/article";
import { useTranslations } from "next-intl";
import { type Locale } from "@/i18n/config";
import { LOCALE_PARAM_NAME } from "@/constants";

export default function NewArticlePage() {
    const router = useRouter();
    const params = useParams<{ locale: Locale }>();
    const { locale } = params;
    const t = useTranslations();
    const [error, setError] = useState<string | null | $ZodError>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const initialData: Article = {
        title: "",
        slug: "",
        content: [],
        keywords: [] as string[],
        locale: locale,
        image: "",
        published: false,
        tags: [] as string[],
        summary: "",
    };

    const handleSubmit = async (formData: Article) => {
        setError(null);
        setSuccess(null);
        // Validate form data
        const { articleSchema } = createArticleSchemas(t);
        const validation = articleSchema.safeParse(formData);
        if (!validation.success) {
            setError(validation.error);
            return;
        }
        try {
            const response = await fetch("/api/m/articles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    [LOCALE_PARAM_NAME]: locale,
                }),
            });

            const result = await response.json();

            if (result?.code != 200) {
                setError(result?.payload);
                return;
            }

            setSuccess(t("admin.article.new.success.created"));

            // Redirect to the articles list after 2 seconds
            setTimeout(() => {
                router.push("/m/list");
            }, 2000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t("admin.article.new.error.createFailed")
            );
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, sm: 4, md: 6 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ mb: 4 }}
                >
                    {t("admin.article.new.title")}
                </Typography>

                {error && (
                    <ErrorDisplay
                        error={error}
                        title={t("admin.article.new.error.title")}
                    />
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <ArticleForm
                    onSubmit={handleSubmit}
                    initialData={initialData}
                ></ArticleForm>
            </Paper>
        </Container>
    );
}
