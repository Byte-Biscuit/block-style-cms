/**
 * Comment Service Layer
 * Handles all comment-related operations with in-memory cache and file persistence
 */

import fs from 'fs/promises';
import path from 'path';
import { COMMENT_DIR, COMMENT_CONFIG } from '@/config';
import type { Comment, CommentSubmissionData } from '@/types/comment';
import { v4 as uuidv4 } from 'uuid';

/**
 * Comment Service with in-memory cache
 */
class CommentService {
    private commentsFile: string;
    private commentsCache: Comment[] | null = null;

    constructor() {
        this.commentsFile = path.join(COMMENT_DIR, 'comments.json');
    }

    /**
     * Ensure comments file exists
     */
    private async ensureCommentsFile(): Promise<void> {
        try {
            await fs.access(this.commentsFile);
        } catch {
            await fs.writeFile(this.commentsFile, JSON.stringify([], null, 2), 'utf-8');
        }
    }

    /**
     * Load comments from file into memory cache
     */
    private async loadComments(): Promise<Comment[]> {
        await this.ensureCommentsFile();
        const data = await fs.readFile(this.commentsFile, 'utf-8');
        const comments: Comment[] = JSON.parse(data);
        this.commentsCache = comments;
        return comments;
    }

    /**
     * Get all comments (from cache if loaded, otherwise load from file)
     */
    async getAllComments(): Promise<Comment[]> {
        // Return cached data if already loaded
        if (this.commentsCache !== null) {
            return this.commentsCache;
        }

        // Cache not loaded, load from file
        return await this.loadComments();
    }


    /**
     * Write all comments to file and update cache
     */
    private async writeAllComments(): Promise<void> {
        await this.ensureCommentsFile();
        await fs.writeFile(this.commentsFile, JSON.stringify(this.commentsCache, null, 2), 'utf-8');
    }

    /**
     * Get approved comments for a specific article
     */
    async getArticleComments(articleId: string): Promise<Comment[]> {
        const articleFile = path.join(COMMENT_DIR, `article_${articleId}.json`);
        try {
            const data = await fs.readFile(articleFile, 'utf-8');
            return JSON.parse(data);
        } catch {
            // File doesn't exist, return empty array
            return [];
        }
    }

    /**
     * Add a new pending comment
     * @throws Error if total comment limit exceeded
     */
    async addComment(
        submissionData: CommentSubmissionData,
        metadata: { ip: string; userAgent: string }
    ): Promise<Comment> {
        // Ensure cache is loaded
        const commentsCache = await this.getAllComments();

        // Check total comment limit
        if (commentsCache.length >= COMMENT_CONFIG.maxTotalComments) {
            throw new Error(`Comment limit reached (${COMMENT_CONFIG.maxTotalComments})`);
        }

        // Create new comment
        const newComment: Comment = {
            id: uuidv4(),
            articleId: submissionData.articleId,
            articleTitle: submissionData.articleTitle,
            content: submissionData.content,
            createdAt: new Date().toISOString(),
            author: submissionData.author,
            status: 'pending',
            replyToId: submissionData.replyToId,
            metadata,
        };
        // Update cache directly
        commentsCache.push(newComment);
        // Persist to file
        await this.writeAllComments();
        return newComment;
    }

    /**
     * Approve a comment
     * Updates status, copies to article-specific file, and removes from pending pool
     */
    async approveComment(commentId: string): Promise<void> {
        // Ensure cache is loaded
        const commentsCache = await this.getAllComments();
        const commentIndex = commentsCache.findIndex(c => c.id === commentId);

        if (commentIndex === -1) {
            throw new Error('Comment not found');
        }

        const comment = commentsCache[commentIndex];

        if (comment.status === 'approved') {
            throw new Error('Comment already approved');
        }

        // Update status to approved
        comment.status = 'approved';

        // Copy to article-specific file (prepend for reverse chronological order)
        const articleFile = path.join(COMMENT_DIR, `article_${comment.articleId}.json`);
        let articleComments: Comment[] = [];

        try {
            const data = await fs.readFile(articleFile, 'utf-8');
            articleComments = JSON.parse(data);
        } catch {
            // File doesn't exist, use empty array
        }

        // Prepend to maintain reverse chronological order (newest first)
        articleComments.unshift(comment);
        await fs.writeFile(articleFile, JSON.stringify(articleComments, null, 2), 'utf-8');
        // Remove from cache after distributing to article file
        commentsCache.splice(commentIndex, 1);
        // Persist updated cache
        await this.writeAllComments();
    }

    /**
     * Reject a comment
     * Removes comment from cache and persists
     */
    async rejectComment(commentId: string): Promise<void> {
        // Ensure cache is loaded
        const commentsCache = await this.getAllComments();
        const commentIndex = commentsCache.findIndex(c => c.id === commentId);

        if (commentIndex === -1) {
            throw new Error('Comment not found');
        }

        // Remove from cache
        commentsCache.splice(commentIndex, 1);

        // Persist to file
        await this.writeAllComments();
    }

    /**
     * Validate comment content
     * @throws Error if validation fails
     */
    validateCommentContent(content: string): void {
        const { contentMinLength, contentMaxLength, maxLinksAllowed } = COMMENT_CONFIG.limits;

        // Check length
        if (content.length < contentMinLength) {
            throw new Error(`Comment too short (minimum ${contentMinLength} characters)`);
        }

        if (content.length > contentMaxLength) {
            throw new Error(`Comment too long (maximum ${contentMaxLength} characters)`);
        }

        // Check link count
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = content.match(urlRegex) || [];

        if (links.length > maxLinksAllowed) {
            throw new Error(`Too many links (maximum ${maxLinksAllowed} allowed)`);
        }
    }
}

// Export singleton instance
const commentService = new CommentService();
export default commentService;
