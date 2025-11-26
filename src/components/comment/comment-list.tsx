"use client";

/**
 * CommentList Component
 * Displays a list of comments with nested replies
 */

import { useTranslations } from "next-intl";
import CommentItem from "./comment-item";
import { useCommentTree } from "@/lib/comment-hooks";
import type { Comment } from "@/types/comment";

interface CommentListProps {
    comments: Comment[];
    loading?: boolean;
    error?: string | null;
    onReply?: (comment: Comment) => void;
}

export default function CommentList({
    comments,
    loading = false,
    error = null,
    onReply,
}: CommentListProps) {
    const t = useTranslations("web.comment");
    const commentTree = useCommentTree(comments);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <svg
                    className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("noComments")}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t("title")} ({comments.length})
            </h3>
            <div className="mt-4">
                {commentTree.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onReply={onReply}
                    />
                ))}
            </div>
        </div>
    );
}
