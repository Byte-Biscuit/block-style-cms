export default function TagsLoading() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-16">
            <article className="flex items-center gap-8 lg:gap-12">
                {/* Left Side - Page Title Skeleton */}
                <header className="w-1/12 flex-shrink-0 lg:w-1/10">
                    <div className="h-20 w-32 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                </header>

                {/* Vertical Divider */}
                <div
                    className="h-32 w-px flex-shrink-0 bg-gray-300 dark:bg-gray-700"
                    role="separator"
                    aria-orientation="vertical"
                />

                {/* Right Side - Tags Cloud Skeleton */}
                <section className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-6">
                        {/* Generate multiple tag skeletons with varying widths */}
                        {[
                            "w-32", "w-24", "w-40", "w-28", "w-36", "w-20",
                            "w-44", "w-32", "w-24", "w-28", "w-36", "w-32",
                            "w-28", "w-40", "w-24", "w-32", "w-20", "w-36"
                        ].map((width, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center gap-2"
                            >
                                <div
                                    className={`h-8 ${width} rounded bg-gradient-to-r from-pink-200 to-pink-300 dark:from-pink-800 dark:to-pink-700 animate-pulse`}
                                />
                                <div className="h-6 w-10 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </section>
            </article>
        </div>
    );
}
