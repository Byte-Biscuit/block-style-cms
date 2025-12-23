"use client";

import { useMemo } from "react";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
    InstantSearch,
    SearchBox,
    Hits,
    Highlight,
    Configure,
    Stats,
} from "react-instantsearch";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslations, useLocale } from "next-intl";
import Link from "@/components/link";
import type { Hit as AlgoliaHit } from "instantsearch.js";
import I18NLocaleTime from "@/components/i18n-time";

// Algolia article hit type
interface ArticleHit {
    objectID: string;
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    locale: string;
    updatedAt: Date;
}

interface AlgoliaSearchDialogProps {
    open: boolean;
    onClose: () => void;
    config?: {
        appId: string;
        searchKey: string;
        indexName: string;
    };
}

// Article hit component
function ArticleHitComponent({ hit }: { hit: AlgoliaHit<ArticleHit> }) {
    //const formattedDate = hit.updatedAt;
    const locale = useLocale();
    return (
        <Link
            href={`/${hit.locale}/articles/${hit.slug}`}
            className="block rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-400"
        >
            <div className="flex gap-4">
                <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <Highlight attribute="title" hit={hit} />
                    </h3>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        <Highlight attribute="summary" hit={hit} />
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <I18NLocaleTime date={hit.updatedAt} locale={locale} />
                        {hit.tags && hit.tags.length > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex flex-wrap gap-1">
                                    {hit.tags
                                        .filter(
                                            (tag) =>
                                                !(
                                                    tag.endsWith("_") &&
                                                    tag.startsWith("_")
                                                )
                                        )
                                        .slice(0, 3)
                                        .map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Empty state component
function EmptyQueryBoundary({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export default function AlgoliaSearchDialog({
    open,
    onClose,
    config,
}: AlgoliaSearchDialogProps) {
    const t = useTranslations("web.search");

    // Initialize Algolia search client
    const searchClient = useMemo(() => {
        if (config?.appId && config?.searchKey) {
            return algoliasearch(config.appId, config.searchKey);
        }
        return null;
    }, [config?.appId, config?.searchKey]);

    // Check if Algolia is configured
    const isConfigured = !!(searchClient && config?.indexName);

    if (!isConfigured) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    className: "bg-white dark:bg-gray-900 rounded-lg",
                },
            }}
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "flex-start",
                    paddingTop: "5vh",
                },
            }}
        >
            <DialogTitle className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 dark:text-gray-100">
                <span>{t("title")}</span>
                <IconButton
                    onClick={onClose}
                    size="small"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent className="p-4">
                <InstantSearch
                    searchClient={searchClient}
                    indexName={config.indexName}
                    future={{
                        preserveSharedStateOnUnmount: true,
                    }}
                >
                    <Configure hitsPerPage={10} />
                    <div className="mb-4">
                        <SearchBox
                            placeholder={t("placeholder")}
                            autoFocus
                            classNames={{
                                root: "w-full",
                                form: "relative",
                                input: "w-full rounded-lg border border-gray-300 px-4 py-2 pr-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400",
                                submit: "absolute right-2 top-1/2 -translate-y-1/2 hidden",
                                submitIcon: "h-5 w-5 text-gray-400",
                                reset: "hidden",
                                loadingIndicator:
                                    "absolute right-2 top-1/2 -translate-y-1/2",
                                loadingIcon: "h-5 w-5 text-blue-500",
                            }}
                        />
                    </div>
                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        <Stats
                            translations={{
                                rootElementText({ nbHits, processingTimeMS }) {
                                    return `${nbHits} ${t("resultsFound")} (${processingTimeMS}ms)`;
                                },
                            }}
                        />
                    </div>
                    <div className="max-h-96 space-y-3 overflow-y-auto">
                        <EmptyQueryBoundary>
                            <Hits
                                hitComponent={ArticleHitComponent}
                                classNames={{
                                    root: "space-y-3",
                                    list: "space-y-3",
                                    item: "",
                                }}
                            />
                        </EmptyQueryBoundary>
                    </div>
                </InstantSearch>
            </DialogContent>
        </Dialog>
    );
}

