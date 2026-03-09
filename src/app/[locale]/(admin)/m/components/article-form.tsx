"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    FormControl,
    InputLabel,
    TextField,
    Select,
    MenuItem,
    Button,
    Typography,
    Switch,
    FormControlLabel,
    Chip,
    CircularProgress,
    Card,
    Tabs,
    Tab,
    Tooltip,
} from "@mui/material";
import {
    Add as AddIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Psychology as PsychologyIcon,
    Summarize as SummarizeIcon,
    Key as KeyIcon,
    RocketLaunch as RocketLaunchIcon,
    InsertPhoto as InsertPhotoIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Article } from "@/types/article";
import type { PartialBlock, Block, Dictionary } from "@blocknote/core";
import { getBlockNoteSelfDictionary } from "@/block-note/block-editor-utils";
import { ADMIN_API_PREFIX } from "@/settings";
import { localeMap as LANGUAGE_OPTIONS, defaultLocale } from "@/i18n/config";
import { useTranslations, useLocale } from "next-intl";

const BlockNoteEditor = dynamic(
    () => import("@/admin/m/components/block-note-editor"),
    {
        ssr: false,
        loading: () => (
            <Box
                sx={{
                    minHeight: "400px",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        ),
    }
);

const CoverImageSelector = dynamic(
    () => import("@/admin/m/components/cover-image-selector"),
    { ssr: false }
);

const ArticleFormTags = dynamic(
    () => import("@/admin/m/components/article-form-tags"),
    { ssr: false }
);

interface ArticleFormProps {
    initialData?: Partial<Article>;
    onSubmit: (data: Article) => Promise<void>;
    submitText?: string;
    isEditing?: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
    initialData = {},
    onSubmit,
    submitText,
    isEditing = false,
}) => {
    const t = useTranslations("admin.article_form");
    const locale = useLocale();
    const router = useRouter();
    const [formData, setFormData] = useState<Article>({
        title: initialData.title || "",
        slug: initialData.slug || "",
        image: initialData.image || "",
        content: initialData.content || [],
        summary: initialData.summary || "",
        keywords: initialData.keywords || [],
        tags: initialData.tags || [],
        locale: initialData.locale || defaultLocale,
        published: initialData.published ?? false,
    });

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState<{
        slug: boolean;
        summary: boolean;
        keywords: boolean;
    }>({
        slug: false,
        summary: false,
        keywords: false,
    });

    const [keywordInput, setKeywordInput] = useState("");
    const [sidebarTab, setSidebarTab] = useState(0);

    const [blockNoteDictionary, setBlockNoteDictionary] =
        useState<Dictionary | null>(null);

    useEffect(() => {
        getBlockNoteSelfDictionary(locale)
            .then((dict) => {
                if (dict) {
                    setBlockNoteDictionary(dict);
                } else {
                    console.warn(
                        `No locale found for ${locale}, using default locale.`
                    );
                }
            })
            .catch((err) => {
                console.error("Failed to set locale for BlockNote:", err);
            });
    }, [locale]);

    const handleChange = (field: keyof Article, value: unknown) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            return newData;
        });
    };

    const generateSlug = async () => {
        if (!formData.title.trim()) return;

        setAiLoading((prev) => ({ ...prev, slug: true }));

        try {
            const response = await fetch(`${ADMIN_API_PREFIX}/ai`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    genType: "slug",
                    input: formData.title,
                }),
            });

            const result = await response.json();

            if (result.code === 200 && result.payload?.slug) {
                handleChange("slug", result.payload.slug);
            } else {
                console.error("Slug generation failed:", result.message);
            }
        } catch (error) {
            console.error("Error generating slug:", error);
        } finally {
            setAiLoading((prev) => ({ ...prev, slug: false }));
        }
    };

    const addKeyword = () => {
        const kw = keywordInput.trim();
        if (kw && !formData.keywords.includes(kw)) {
            handleChange("keywords", [...formData.keywords, kw]);
            setKeywordInput("");
        }
    };
    const removeKeyword = (kw: string) => {
        handleChange(
            "keywords",
            formData.keywords.filter((k) => k !== kw)
        );
    };

    const generateKeywords = async (
        _title: string,
        _content: Article["content"]
    ) => {
        if (!_title.trim() || !_content || _content.length === 0) return;

        setAiLoading((prev) => ({ ...prev, keywords: true }));

        try {
            // Extract text content for generating keywords
            const textContent = _content
                .map((block: Block | PartialBlock) => {
                    if (
                        block.type === "paragraph" &&
                        Array.isArray(block.content)
                    ) {
                        return block.content
                            .map((item: unknown) => {
                                if (typeof item === "string") return item;
                                if (
                                    item &&
                                    typeof item === "object" &&
                                    "text" in item
                                ) {
                                    return (
                                        (item as { text?: string }).text || ""
                                    );
                                }
                                return "";
                            })
                            .join("");
                    }
                    return "";
                })
                .join(" ");

            const inputText = `${_title}\n\n${textContent}`.trim();

            const response = await fetch(`${ADMIN_API_PREFIX}/ai`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    genType: "keywords",
                    input: inputText,
                    language: formData.locale,
                }),
            });

            const result = await response.json();

            if (result.code === 200 && result.payload?.keywords) {
                // Ensure English commas are used and trim whitespace
                const newKeywords = result.payload.keywords
                    .replace(/，/g, ",") // Replace Chinese commas with English commas
                    .split(",")
                    .map((k: string) => k.trim())
                    .filter(Boolean);

                setFormData((prev) => ({
                    ...prev,
                    keywords: [
                        ...prev.keywords,
                        ...newKeywords.filter(
                            (k: string) => !prev.keywords.includes(k)
                        ),
                    ],
                }));
            } else {
                console.error("Keywords generation failed:", result.message);
            }
        } catch (error) {
            console.error("Error generating keywords:", error);
        } finally {
            setAiLoading((prev) => ({ ...prev, keywords: false }));
        }
    };

    const handleGenerateKeywords = () => {
        generateKeywords(formData.title, formData.content);
    };

    const generateSummary = async (
        title: string,
        content: Article["content"]
    ) => {
        if (!title.trim() || !content || content.length === 0) return;

        setAiLoading((prev) => ({ ...prev, summary: true }));

        try {
            const textContent = content
                .map((block: Block | PartialBlock) => {
                    if (
                        block.type === "paragraph" &&
                        Array.isArray(block.content)
                    ) {
                        return block.content
                            .map((item: unknown) => {
                                if (typeof item === "string") return item;
                                if (
                                    item &&
                                    typeof item === "object" &&
                                    "text" in item
                                ) {
                                    return (
                                        (item as { text?: string }).text || ""
                                    );
                                }
                                return "";
                            })
                            .join("");
                    }
                    return "";
                })
                .join(" ");

            const inputText = `${title}\n\n${textContent}`.trim();

            const response = await fetch(`${ADMIN_API_PREFIX}/ai`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    genType: "summary",
                    input: inputText,
                    language: formData.locale,
                }),
            });

            const result = await response.json();

            if (result.code === 200 && result.payload?.summary) {
                setFormData((prev) => ({
                    ...prev,
                    summary: result.payload.summary,
                }));
            } else {
                console.error("Summary generation failed:", result.message);
            }
        } catch (error) {
            console.error("Error generating summary:", error);
        } finally {
            setAiLoading((prev) => ({ ...prev, summary: false }));
        }
    };

    const handleGenerateSummary = () => {
        generateSummary(formData.title, formData.content);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (error) {
            console.error(
                "An error occurred while submitting the form:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                mx: "auto",
                backgroundColor: "background.default",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                    flexDirection: { xs: "column", lg: "row" },
                }}
            >
                {/* LEFT: Language + Slug + Title + Editor */}
                <Box
                    sx={{
                        flex: "1 1 0",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        height: { lg: "calc(100vh - 260px)" },
                        minHeight: { lg: 580 },
                    }}
                >
                    {/* Row 1: Language + Title */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            mb: 2,
                            alignItems: "flex-start",
                        }}
                    >
                        <FormControl sx={{ flex: "0 0 140px" }}>
                            <InputLabel>{t("labels.language")}</InputLabel>
                            <Select
                                value={formData.locale}
                                label={t("labels.language")}
                                size="small"
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        locale: e.target.value,
                                    }))
                                }
                                sx={{ borderRadius: 2 }}
                                MenuProps={{ disableScrollLock: true }}
                            >
                                {Object.values(LANGUAGE_OPTIONS).map((lang) => (
                                    <MenuItem key={lang.code} value={lang.code}>
                                        {lang.nativeName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label={t("labels.title")}
                            size="small"
                            value={formData.title}
                            onChange={(e) =>
                                handleChange("title", e.target.value)
                            }
                            required
                            fullWidth
                            sx={{
                                flex: 1,
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                            }}
                            placeholder={t("placeholders.title")}
                        />
                    </Box>
                    {/* Row 2: Slug + AI button */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            mb: 2,
                            alignItems: "flex-start",
                        }}
                    >
                        <TextField
                            label={t("labels.slug")}
                            size="small"
                            value={formData.slug}
                            onChange={(e) =>
                                handleChange("slug", e.target.value)
                            }
                            required
                            fullWidth
                            disabled={isEditing}
                            helperText={
                                isEditing
                                    ? t("helper.slugEditingDisabled")
                                    : t("helper.slugUse")
                            }
                            sx={{
                                flex: 1,
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                            }}
                        />
                        {!isEditing && (
                            <Button
                                variant="contained"
                                startIcon={
                                    aiLoading.slug ? (
                                        <CircularProgress
                                            size={16}
                                            color="inherit"
                                        />
                                    ) : (
                                        <PsychologyIcon />
                                    )
                                }
                                onClick={generateSlug}
                                sx={{
                                    flexShrink: 0,
                                    height: 40,
                                    borderRadius: 2,
                                    whiteSpace: "nowrap",
                                }}
                                disabled={
                                    !formData.title.trim() || aiLoading.slug
                                }
                            >
                                {aiLoading.slug
                                    ? t("buttons.generating")
                                    : t("buttons.generateSlug")}
                            </Button>
                        )}
                    </Box>
                    {/* Post content */}
                    <Card
                        sx={{
                            flex: 1,
                            mb: 2,
                            p: 0,
                            boxShadow: "none",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <PsychologyIcon color="action" />
                                {t("sections.content")}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5, ml: 4 }}
                            >
                                {t("helper.contentTip")}
                            </Typography>
                        </Box>
                        <Card
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                borderRadius: 2,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                "& .bn-container": {
                                    borderRadius: 0,
                                    border: "none",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    "& .editor-container": {
                                        flex: 1,
                                        minHeight: 0,
                                    },
                                    "& .bn-container": {
                                        flex: 1,
                                        minHeight: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 0,
                                    },
                                }}
                            >
                                {blockNoteDictionary != null ? (
                                    <BlockNoteEditor
                                        value={formData.content}
                                        dictionary={blockNoteDictionary}
                                        onChange={(content) =>
                                            handleChange("content", content)
                                        }
                                    />
                                ) : (
                                    <div className="p-4">Loading...</div>
                                )}
                            </Box>
                        </Card>
                    </Card>
                </Box>

                {/* RIGHT: sidebar */}
                <Box
                    sx={{
                        width: { xs: "100%", lg: 360 },
                        flexShrink: 0,
                        height: { lg: "calc(100vh - 260px)" },
                        minHeight: { lg: 580 },
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Tab navigation */}
                    <Tabs
                        value={sidebarTab}
                        onChange={(_, v) => setSidebarTab(v)}
                        variant="fullWidth"
                        sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            flexShrink: 0,
                        }}
                    >
                        <Tooltip title={t("sections.cover")} placement="bottom">
                            <Tab
                                icon={<InsertPhotoIcon />}
                                sx={{ minHeight: 48 }}
                            />
                        </Tooltip>
                        <Tooltip
                            title={t("sections.summary").replace(" *", "")}
                            placement="bottom"
                        >
                            <Tab
                                icon={<SummarizeIcon />}
                                sx={{ minHeight: 48 }}
                            />
                        </Tooltip>
                        <Tooltip title="SEO" placement="bottom">
                            <Tab icon={<KeyIcon />} sx={{ minHeight: 48 }} />
                        </Tooltip>
                        <Tooltip
                            title={t("sections.publish")}
                            placement="bottom"
                        >
                            <Tab
                                icon={<RocketLaunchIcon />}
                                sx={{ minHeight: 48 }}
                            />
                        </Tooltip>
                    </Tabs>

                    {/* Scrollable tab content area */}
                    <Box
                        sx={{ flex: 1, overflowY: "auto", minHeight: 0, py: 2 }}
                    >
                        {/* Tab 0: Cover image only */}
                        {sidebarTab === 0 && (
                            <CoverImageSelector
                                imageUrl={formData.image || ""}
                                onImageChange={(imageUrl) =>
                                    handleChange("image", imageUrl)
                                }
                            />
                        )}

                        {/* Tab 1: Summary */}
                        {sidebarTab === 1 && (
                            <Card sx={{ mb: 2, p: 0, boxShadow: "none" }}>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 600,
                                        mb: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <SummarizeIcon color="action" />
                                    {t("sections.summary")}
                                </Typography>
                                <TextField
                                    label={t("labels.summary")}
                                    placeholder={t("placeholders.summary")}
                                    value={formData.summary}
                                    onChange={(e) =>
                                        handleChange("summary", e.target.value)
                                    }
                                    multiline
                                    rows={6}
                                    required={formData.published}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    variant="outlined"
                                />
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={
                                        aiLoading.summary ? (
                                            <CircularProgress
                                                size={16}
                                                color="inherit"
                                            />
                                        ) : (
                                            <PsychologyIcon />
                                        )
                                    }
                                    onClick={handleGenerateSummary}
                                    sx={{
                                        height: "fit-content",
                                        borderRadius: 2,
                                    }}
                                    disabled={
                                        !formData.title.trim() ||
                                        !formData.content ||
                                        formData.content.length === 0 ||
                                        aiLoading.summary
                                    }
                                >
                                    {aiLoading.summary
                                        ? t("buttons.generating")
                                        : t("buttons.generateSummary")}
                                </Button>
                            </Card>
                        )}

                        {/* Tab 2: SEO — Keywords + Tags */}
                        {sidebarTab === 2 && (
                            <>
                                <Card sx={{ mb: 2, p: 0, boxShadow: "none" }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            mb: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <KeyIcon />
                                        {t("sections.keywords")}
                                    </Typography>
                                    <Box
                                        sx={{ display: "flex", gap: 1, mb: 2 }}
                                    >
                                        <TextField
                                            label={t("labels.addKeyword")}
                                            value={keywordInput}
                                            onChange={(e) =>
                                                setKeywordInput(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(),
                                                addKeyword())
                                            }
                                            size="small"
                                            sx={{ flex: 1 }}
                                            placeholder={t(
                                                "placeholders.keyword"
                                            )}
                                        />
                                        <Button
                                            variant="outlined"
                                            onClick={addKeyword}
                                            startIcon={<AddIcon />}
                                            disabled={!keywordInput.trim()}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {t("buttons.add")}
                                        </Button>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleGenerateKeywords}
                                        startIcon={
                                            aiLoading.keywords ? (
                                                <CircularProgress
                                                    size={16}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <PsychologyIcon />
                                            )
                                        }
                                        disabled={
                                            !formData.title.trim() ||
                                            !formData.content ||
                                            formData.content.length === 0 ||
                                            aiLoading.keywords
                                        }
                                        sx={{ borderRadius: 2, mb: 2 }}
                                    >
                                        {aiLoading.keywords
                                            ? t("buttons.generating")
                                            : t("buttons.generateKeywords")}
                                    </Button>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 1,
                                            minHeight: 40,
                                        }}
                                    >
                                        {formData.keywords.length > 0 ? (
                                            formData.keywords.map((kw) => (
                                                <Chip
                                                    key={kw}
                                                    label={kw}
                                                    onDelete={() =>
                                                        removeKeyword(kw)
                                                    }
                                                    color="secondary"
                                                    variant="filled"
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            ))
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ py: 1 }}
                                            >
                                                {t("helper.noKeywords")}
                                            </Typography>
                                        )}
                                    </Box>
                                </Card>
                                <ArticleFormTags
                                    tags={formData.tags}
                                    locale={formData.locale || locale}
                                    onTagsChange={(newTags) =>
                                        handleChange("tags", newTags)
                                    }
                                />
                            </>
                        )}

                        {/* Tab 3: Publish settings */}
                        {sidebarTab === 3 && (
                            <Card sx={{ mb: 2, p: 0, boxShadow: "none" }}>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 600,
                                        mb: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <RocketLaunchIcon /> {t("sections.publish")}
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.published}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    published: e.target.checked,
                                                }))
                                            }
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography
                                                variant="body1"
                                                fontWeight={500}
                                            >
                                                {t("labels.publishNow")}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formData.published
                                                    ? t(
                                                          "helper.publish.published"
                                                      )
                                                    : t("helper.publish.draft")}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ mb: 3 }}
                                />
                            </Card>
                        )}
                    </Box>

                    {/* Submit buttons — always visible at the bottom */}
                    <Card
                        sx={{
                            flexShrink: 0,
                            p: 0,
                            pt: 1,
                            boxShadow: "none",
                            borderTop: 1,
                            borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1.5,
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={
                                    loading ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : formData.published ? (
                                        <RocketLaunchIcon />
                                    ) : (
                                        <SaveIcon />
                                    )
                                }
                                disabled={loading}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: 2,
                                }}
                            >
                                {loading
                                    ? t("buttons.creating")
                                    : formData.published
                                      ? t("buttons.publishArticle")
                                      : isEditing
                                        ? t("buttons.saveChanges")
                                        : t("buttons.saveDraft")}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={() => router.push("/m/list")}
                                disabled={loading}
                                startIcon={<CloseIcon />}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: 2,
                                }}
                            >
                                {t("buttons.cancel")}
                            </Button>
                        </Box>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default ArticleForm;
