/**
 * Comment Service Layer
 * Handles all comment-related operations with in-memory cache and file persistence
 */

import fs from 'fs/promises';
import path from 'path';
import { COMMENT_DIR } from '@/settings';
import type { Comment, CommentSubmissionData } from '@/types/comment';
import type { CommentConfig } from '@/types/system-config';
import { v4 as uuidv4 } from 'uuid';
import { systemConfigService } from './system-config-service';
import { coerceNumber } from '@/lib/utils';

/**
 * Default comment configuration (fallback)
 */
const DEFAULT_COMMENT_CONFIG: CommentConfig = {
    enabled: true,
    maxTotalComments: 1000,
    limits: {
        contentMinLength: 10,
        contentMaxLength: 1000,
        maxLinksAllowed: 2,
    },
    moderation: {
        requireApproval: true,
    },
};

/**
 * Comment Service with in-memory cache
 */
class CommentService {
    private commentsFile: string;

    constructor() {
        this.commentsFile = path.join(COMMENT_DIR, 'comments.json');
    }

    /**
     * Get comment configuration from system config
     */
    private async getConfig(): Promise<CommentConfig> {
        try {
            const systemConfig = await systemConfigService.readConfig();
            return systemConfig?.basic?.comment || DEFAULT_COMMENT_CONFIG;
        } catch (error) {
            console.error('Failed to read comment config, using defaults:', error);
            return DEFAULT_COMMENT_CONFIG;
        }
    }

    /**
     * Get all comments
     */
    async getAllComments(): Promise<Comment[]> {
        try {
            const data = await fs.readFile(this.commentsFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to read comments file:', error);
            return [];
        }
    }


    /**
     * Write all comments to file
     */
    private async writeAllComments(comments: Comment[]): Promise<void> {
        await fs.writeFile(this.commentsFile, JSON.stringify(comments, null, 2), 'utf-8');
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
        const config = await this.getConfig();
        const comments = await this.getAllComments();

        // Check total comment limit
        if (comments.length >= coerceNumber(config.maxTotalComments, 0)) {
            throw new Error(`Comment limit reached (${config.maxTotalComments})`);
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

        comments.push(newComment);
        // Persist to file
        await this.writeAllComments(comments);
        return newComment;
    }

    /**
     * Approve a comment
     * Updates status, copies to article-specific file, and removes from pending pool
     */
    async approveComment(commentId: string): Promise<void> {
        const comments = await this.getAllComments();
        const commentIndex = comments.findIndex(c => c.id === commentId);

        if (commentIndex === -1) {
            throw new Error('Comment not found');
        }

        const comment = comments[commentIndex];

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

        // Remove from pending list
        comments.splice(commentIndex, 1);
        // Persist updated list
        await this.writeAllComments(comments);
    }

    /**
     * Reject a comment
     * Removes comment from list and persists
     */
    async rejectComment(commentId: string): Promise<void> {
        const comments = await this.getAllComments();
        const commentIndex = comments.findIndex(c => c.id === commentId);

        if (commentIndex === -1) {
            throw new Error('Comment not found');
        }

        // Remove from list
        comments.splice(commentIndex, 1);

        // Persist to file
        await this.writeAllComments(comments);
    }

    /**
     * Validate comment content
     * @throws Error if validation fails
     */
    async validateCommentContent(content: string): Promise<void> {
        const config = await this.getConfig();
        const { contentMinLength, contentMaxLength, maxLinksAllowed } = config.limits;

        // Check length
        if (content.length < coerceNumber(contentMinLength, 0)) {
            throw new Error(`Comment too short (minimum ${contentMinLength} characters)`);
        }

        if (content.length > coerceNumber(contentMaxLength, 0)) {
            throw new Error(`Comment too long (maximum ${contentMaxLength} characters)`);
        }

        // Check link count
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = content.match(urlRegex) || [];

        if (links.length > coerceNumber(maxLinksAllowed, 0)) {
            throw new Error(`Too many links (maximum ${maxLinksAllowed} allowed)`);
        }
    }

    /**
     * Get comment statistics
     */
    async getCommentCount(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }> {
        const comments = await this.getAllComments();

        return {
            total: comments.length,
            pending: comments.filter(c => c.status === 'pending').length,
            approved: comments.filter(c => c.status === 'approved').length,
            rejected: comments.filter(c => c.status === 'rejected').length,
        };
    }
}

// Export singleton instance
const commentService = new CommentService();
export default commentService;
