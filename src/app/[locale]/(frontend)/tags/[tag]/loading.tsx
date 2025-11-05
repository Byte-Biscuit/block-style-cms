import { ArticleItemSkeleton } from "@/components/article-list-item";

export default function TagDetailLoading() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            {/* Breadcrumb & Header Skeleton */}
            <div className="mb-12">
                {/* Breadcrumb skeleton */}
                <nav className="mb-6 flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <span className="text-gray-400">/</span>
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </nav>

                {/* Title and count skeleton */}
                <div className="flex items-baseline gap-4">
                    <div className="h-14 w-48 rounded bg-gradient-to-r from-pink-200 to-pink-300 dark:from-pink-800 dark:to-pink-700 animate-pulse" />
                    <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
            </div>

            {/* Articles List Skeleton */}
            <div className="space-y-6">
                <ArticleItemSkeleton />
                <ArticleItemSkeleton />
                <ArticleItemSkeleton />
            </div>
        </div>
    );
}
