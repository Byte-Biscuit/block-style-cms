"use client";

/**
 * CommentItem Component
 * Displays a single comment with avatar, author info, timestamp, content, and reply button
 */

import { useTranslations, useLocale } from "next-intl";
import { getNickLetterAvatar } from "@/lib/gravatar-utils";
import I18NLocaleTime from "@/components/i18n-time";
import type { Comment } from "@/types/comment";

interface CommentItemProps {
    comment: Comment & { replies?: Comment[] };
    onReply?: (comment: Comment) => void;
    depth?: number;
    maxDepth?: number;
}

export default function CommentItem({
    comment,
    onReply,
    depth = 0,
    maxDepth = 3,
}: CommentItemProps) {
    const t = useTranslations("web.comment");
    const locale = useLocale();
    const avatarUrl = getNickLetterAvatar(comment.author.name);
    const canReply = depth < maxDepth;

    return (
        <div className={depth === 0 ? "mb-6" : "mb-4"}>
            <div
                className={`rounded-lg p-4 ${
                    depth === 0
                        ? "border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        : "border-l-2 border-blue-500 bg-gray-50 dark:border-blue-400 dark:bg-gray-700/50"
                }`}
            >
                {/* Author Info */}
                <div className="mb-3 flex items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={avatarUrl}
                        alt={comment.author.name}
                        className="mr-3 h-12 w-12 rounded-full"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {comment.author.name}
                            </span>
                            {comment.author.website && (
                                <a
                                    href={comment.author.website}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
                                    title={comment.author.website}
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                        />
                                    </svg>
                                </a>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <I18NLocaleTime
                                date={new Date(comment.createdAt)}
                                locale={locale}
                            />
                        </div>
                    </div>
                </div>

                {/* Comment Content */}
                <div className="wrap-break-words mb-2 pl-15 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {comment.content}
                </div>

                {/* Reply Button */}
                {canReply && onReply && (
                    <div className="pl-15">
                        <button
                            onClick={() => onReply(comment)}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                            </svg>
                            {t("reply")}
                        </button>
                    </div>
                )}
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className={`mt-4 ${depth === 0 ? "ml-8" : "ml-6"}`}>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
