import Image from "next/image";
import Link from "@/components/link";
import { ArticleMetadata } from "@/types/article";
import I18NLocaleTime from "@/components/i18n-time";
import { ImageService } from "@/lib/services/image-service";

const gradientVariants = [
    "from-orange-200 via-orange-300 to-rose-300",
    "from-orange-300 via-amber-300 to-fuchsia-400",
    "from-rose-200 via-fuchsia-300 to-indigo-500",
    "from-purple-300 via-pink-400 to-orange-300",
    "from-amber-200 via-orange-300 to-purple-400",
    "from-sky-200 via-indigo-300 to-rose-300",
];

const aspect_w = "w-[356px]";
const aspect_w_val = "356";
const aspect_h = "h-50";
const aspect_h_val = "200";

export default function ArticleItem({
    slug,
    title,
    summary,
    tags,
    image,
    locale: language = "zh-CN",
    createdAt,
    updatedAt,
    className = "",
}: ArticleMetadata & { className?: string }) {
    const gradientIndex =
        Math.abs(slug.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
        gradientVariants.length;
    const gradientClass = gradientVariants[gradientIndex];
    const locale = language;
    const filteredTags = tags
        .map((tag) => tag.trim())
        .filter((tag) => !(tag.startsWith("_") || tag.endsWith("_")))
        .map((tag) => tag.toUpperCase());
    const imageUrl =
        ImageService.optimizeImageFromUrl(image || null, {
            width: aspect_w_val,
            height: aspect_h_val,
            fit: "contain",
        }) || null;
    return (
        <Link
            href={`/${language}/articles/${slug}`}
            className={`group block ${className}`}
        >
            <article
                className={`flex ${aspect_h} overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-gray-900 dark:shadow-gray-800/10`}
            >
                <div
                    className={`relative hidden aspect-video sm:block ${aspect_w} flex-shrink-0 bg-gradient-to-br ${gradientClass}`}
                >
                    {imageUrl && (
                        <div className="absolute inset-0 opacity-40">
                            <Image
                                src={imageUrl}
                                alt={title}
                                fill
                                className="object-cover"
                                sizes="256px"
                                loading="lazy"
                            />
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col px-6 py-2">
                    <div className="mb-2 flex flex-wrap gap-3">
                        {filteredTags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="text-xs font-semibold tracking-wide text-orange-500 uppercase hover:text-orange-600"
                                title={tag}
                            >
                                {tag}
                            </span>
                        ))}
                        {filteredTags.length > 3 && (
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                +{filteredTags.length - 3} more
                            </span>
                        )}
                    </div>

                    <h2
                        title={title}
                        className="mb-2 line-clamp-1 text-xl leading-tight font-bold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
                    >
                        {title}
                    </h2>

                    {summary && (
                        <p
                            title={summary}
                            className="mb-2 line-clamp-2 text-base leading-8 text-gray-600 dark:text-gray-300"
                        >
                            {summary}
                        </p>
                    )}

                    <div className="mt-auto border-t border-gray-200 pt-2 dark:border-gray-700">
                        <I18NLocaleTime
                            date={updatedAt || createdAt!}
                            locale={locale}
                        />
                    </div>
                </div>
            </article>
        </Link>
    );
}

export function ArticleItemSkeleton() {
    return (
        <div
            className={`${aspect_h} flex overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-900`}
        >
            <div
                className={`${aspect_w} flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800`}
            ></div>
            <div className="flex min-w-0 flex-1 flex-col px-6 py-2">
                {/* Tags */}
                <div className="mb-3 flex gap-3">
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                {/* title */}
                <div className="mb-3 space-y-3">
                    <div className="h-8 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                {/* Summary */}
                <div className="mb-4 space-y-2">
                    <div className="h-5 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* time */}
                <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="mr-2 h-5 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
        </div>
    );
}
