import { useState, useEffect, useCallback } from "react";
import type { Comment } from '@/types/comment';
import { API_BASE_URL } from "@/config";

/**
 * Generic debounce hook
 * @param value The value to debounce
 * @param delay Debounce delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debounced;
}

// Comment Hooks
/**
 * Fetch comments for a specific article
 */
export function useComments(articleId: string) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/comments?articleId=${articleId}`);
            const data = await response.json();

            if (data.code === 200) {
                setComments(data.payload.comments || []);
            } else {
                setError(data.message || 'Failed to load comments');
            }
        } catch (err) {
            setError('Failed to load comments');
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return { comments, loading, error, refetch: fetchComments };
}

/**
 * Build nested comment tree structure
 */
export function useCommentTree(comments: Comment[]) {
    const buildTree = useCallback((comments: Comment[]): Comment[] => {
        const commentMap = new Map<string, Comment & { replies?: Comment[] }>();
        const rootComments: Comment[] = [];

        // First pass: create a map of all comments
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: build the tree structure
        comments.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.id)!;

            if (comment.replyToId) {
                const parent = commentMap.get(comment.replyToId);
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(commentWithReplies);
                } else {
                    // If parent not found, treat as root comment
                    rootComments.push(commentWithReplies);
                }
            } else {
                rootComments.push(commentWithReplies);
            }
        });

        return rootComments;
    }, []);

    return buildTree(comments);
}

/**
 * Hook for comment submission
 */
export function useCommentSubmission() {
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const submitComment = useCallback(async (data: {
        articleId: string;
        articleTitle: string;
        content: string;
        author: {
            name: string;
            email: string;
            website?: string;
        };
        replyToId?: string;
        locale?: string;
    }) => {
        try {
            setSubmitting(true);
            setSubmitError(null);

            const response = await fetch(`${API_BASE_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.code === 200) {
                return { success: true, data: result.payload };
            } else {
                setSubmitError(result.message || 'Failed to submit comment');
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = 'Failed to submit comment';
            setSubmitError(errorMessage);
            console.error('Error submitting comment:', err);
            return { success: false, error: errorMessage };
        } finally {
            setSubmitting(false);
        }
    }, []);

    return { submitComment, submitting, submitError };
}
