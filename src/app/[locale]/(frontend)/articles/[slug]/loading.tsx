export default function ArticleLoading() {
    return (
        <>
            {/* Mobile TOC Skeleton */}
            <div className="fixed right-4 bottom-[35vh] z-50 lg:hidden">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            <article className="w-full">
                {/* Header Skeleton */}
                <header className="space-y-2 pt-4 pb-4 md:space-y-5">
                    {/* Title Skeleton */}
                    <div className="space-y-3">
                        <div className="h-10 w-3/4 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />
                        <div className="h-10 w-1/2 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />
                    </div>
                    {/* Date Skeleton */}
                    <div className="h-6 w-48 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />
                </header>

                {/* Cover Image Skeleton */}
                <section className="mb-6 md:mb-8">
                    <div className="relative aspect-video w-full animate-pulse overflow-hidden rounded-lg bg-gray-300 dark:bg-gray-700" />
                </section>

                {/* Summary Section Skeleton */}
                <section className="space-y-2 pb-4 md:space-y-5">
                    {/* Summary Title Skeleton */}
                    <div className="h-8 w-32 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />
                    {/* Summary Content Skeleton */}
                    <div className="mt-2 space-y-2 rounded-md border-l-4 border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="h-5 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-5 w-5/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-5 w-4/5 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>
                </section>

                {/* Content Skeleton */}
                <section className="space-y-4">
                    {/* Paragraph 1 */}
                    <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-11/12 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>

                    {/* Heading 1 */}
                    <div className="mt-8 h-7 w-2/3 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />

                    {/* Paragraph 2 */}
                    <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>

                    {/* Heading 2 */}
                    <div className="mt-8 h-7 w-1/2 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />

                    {/* Paragraph 3 */}
                    <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>

                    {/* Code Block Skeleton */}
                    <div className="mt-6 space-y-2 rounded-lg bg-gray-800 p-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-700" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-700" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-700" />
                    </div>

                    {/* Paragraph 4 */}
                    <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>

                    {/* Heading 3 */}
                    <div className="mt-8 h-7 w-3/5 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700" />

                    {/* Paragraph 5 */}
                    <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>
                </section>
            </article>

            {/* Desktop TOC Skeleton */}
            <aside className="fixed top-24 right-8 hidden max-h-[calc(100vh-200px)] w-64 lg:block">
                <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    {/* TOC Title */}
                    <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    {/* TOC Items */}
                    <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="ml-4 h-4 w-5/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="ml-4 h-4 w-4/5 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="ml-4 h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    </div>
                </div>
            </aside>
        </>
    );
}
