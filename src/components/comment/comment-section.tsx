"use client";

/**
 * CommentSection Component
 * Main container that combines CommentForm and CommentList
 */

import { useState } from "react";
import CommentForm from "./comment-form";
import CommentList from "./comment-list";
import { useComments } from "@/lib/comment-hooks";
import type { Comment } from "@/types/comment";

interface CommentSectionProps {
    articleId: string;
    articleTitle: string;
}

export default function CommentSection({
    articleId,
    articleTitle,
}: CommentSectionProps) {
    const { comments, loading, error, refetch } = useComments(articleId);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    const handleReply = (comment: Comment) => {
        setReplyTo(comment);
        // Scroll to form
        setTimeout(() => {
            document.getElementById("comment-form")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
    };

    const handleCancelReply = () => {
        setReplyTo(null);
    };

    const handleSuccess = () => {
        refetch();
    };

    return (
        <section className="mt-12 flex flex-col" id="comments">
            <hr className="mb-4 border-gray-200 dark:border-gray-700" />

            <CommentForm
                articleId={articleId}
                articleTitle={articleTitle}
                replyTo={replyTo}
                onCancelReply={handleCancelReply}
                onSuccess={handleSuccess}
            />

            <CommentList
                comments={comments}
                loading={loading}
                error={error}
                onReply={handleReply}
            />
        </section>
    );
}
