import { ArticleItemSkeleton } from "@/components/article-list-item";

export default function Loading() {
    return (
        <div className="space-y-12">
            <section>
                <div className="mb-8">
                    <div className="mb-2 h-9 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                </div>

                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <ArticleItemSkeleton key={index} />
                    ))}
                </div>
            </section>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                    <div className="h-5 w-24 rounded bg-gray-200 px-4 dark:bg-gray-700"></div>
                </div>
            </div>

            <section>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <ArticleItemSkeleton key={`other-${index}`} />
                    ))}
                </div>
            </section>
        </div>
    );
}
