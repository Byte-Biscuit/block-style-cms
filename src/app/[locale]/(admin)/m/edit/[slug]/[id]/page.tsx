"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { $ZodError } from "zod/v4/core";
import ArticleForm from "@/admin/m/components/article-form";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Container,
    Typography,
    Alert,
} from "@mui/material";
import { type Article, createArticleSchemas } from "@/types/article";
import type { Result } from "@/types/response";
import { ADMIN_API_PREFIX, ADMIN_PAGE_PREFIX } from "@/settings";
import { LOCALE_PARAM_NAME } from "@/constants";
import { useTranslations } from "next-intl";
import ErrorDisplay from "@/admin/m/components/error-display";

const translationPrefix = "admin.article.edit.";

export default function EditPostPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const { slug, id, locale } = params as {
        slug: string;
        id: string;
        locale: string;
    };
    const [loading, setLoading] = useState(true);
    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState<string | null | $ZodError>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${ADMIN_API_PREFIX}/articles/${slug}/${id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((result) => {
                const apiResponse = result as Result;
                if (apiResponse?.code !== 200) {
                    setError(t(`${translationPrefix}messages.fetchError`));
                    setArticle(null);
                    return;
                }

                if (apiResponse?.payload) {
                    setArticle(apiResponse.payload as Article);
                } else {
                    setArticle(null);
                    setError(t(`${translationPrefix}messages.notFound`));
                }
            })
            .catch((err) => {
                console.error("Failed to fetch article data:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : t(`${translationPrefix}messages.fetchDataError`)
                );
                setArticle(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [slug, id, t]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 300,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!article) {
        return (
            <Container
                maxWidth="xl"
                sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}
            >
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                    <ErrorDisplay
                        error={error}
                        title={t(`${translationPrefix}errors.title`)}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={() =>
                                router.push(`${ADMIN_PAGE_PREFIX}/list`)
                            }
                        >
                            {t(`${translationPrefix}actions.backToList`)}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, sm: 4, md: 6 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                <Typography variant="h4" gutterBottom>
                    {t(`${translationPrefix}title`)}
                </Typography>

                {error && (
                    <ErrorDisplay
                        error={error}
                        title={t(`${translationPrefix}errors.title`)}
                    />
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                <ArticleForm
                    isEditing={true}
                    initialData={article}
                    submitText={t(`${translationPrefix}actions.update`)}
                    onSubmit={async (formData) => {
                        setError(null);
                        setSuccess(null);
                        // Validate form data
                        const requestBody = { ...formData, id: article.id };
                        const { updateArticleSchema } = createArticleSchemas(t);
                        const validation =
                            updateArticleSchema.safeParse(requestBody);
                        if (!validation.success) {
                            setError(validation.error);
                            return;
                        }

                        try {
                            const response = await fetch(
                                `${ADMIN_API_PREFIX}/articles`,
                                {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        ...requestBody,
                                        [LOCALE_PARAM_NAME]: locale,
                                    }),
                                }
                            );

                            const result = await response.json();

                            if (result?.code !== 200) {
                                setError(
                                    result?.payload ||
                                        t(
                                            `${translationPrefix}messages.updateError`
                                        )
                                );
                                return;
                            }

                            setSuccess(
                                t(`${translationPrefix}messages.updateSuccess`)
                            );

                            // Redirect to article list after 2 seconds
                            setTimeout(() => {
                                router.push(`${ADMIN_PAGE_PREFIX}/list`);
                            }, 2000);
                        } catch (err) {
                            console.error("Failed to update article:", err);
                            setError(
                                err instanceof Error
                                    ? err.message
                                    : t(
                                          `${translationPrefix}messages.updateError`
                                      )
                            );
                        }
                    }}
                />
            </Paper>
        </Container>
    );
}
