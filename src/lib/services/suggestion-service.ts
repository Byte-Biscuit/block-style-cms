/**
 * Suggestion Service Layer
 * Handles all suggestion-related operations with in-memory cache and file persistence
 */

import fs from 'fs/promises';
import path from 'path';
import { SUGGESTION_DIR, SUGGESTION_CONFIG } from '@/settings';
import type { Suggestion, SuggestionSubmissionData } from '@/types/suggestion';
import { v4 as uuidv4 } from 'uuid';

/**
 * Suggestion Service with in-memory cache
 */
class SuggestionService {
    private suggestionsFile: string;

    constructor() {
        this.suggestionsFile = path.join(SUGGESTION_DIR, 'suggestions.json');
    }

    /**
     * Get all suggestions
     */
    async getAllSuggestions(): Promise<Suggestion[]> {
        try {
            const data = await fs.readFile(this.suggestionsFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to read suggestions file:', error);
            return [];
        }
    }

    /**
     * Write all suggestions to file
     */
    private async writeAllSuggestions(suggestions: Suggestion[]): Promise<void> {
        await fs.writeFile(
            this.suggestionsFile,
            JSON.stringify(suggestions, null, 2),
            'utf-8'
        );
    }

    /**
     * Add a new suggestion
     * @throws Error if total suggestion limit exceeded
     */
    async addSuggestion(
        submissionData: SuggestionSubmissionData,
        metadata: { ip: string; userAgent: string }
    ): Promise<Suggestion> {
        const suggestions = await this.getAllSuggestions();

        // Check total suggestion limit
        if (suggestions.length >= SUGGESTION_CONFIG.maxTotalSuggestions) {
            throw new Error(
                `Suggestion limit reached (${SUGGESTION_CONFIG.maxTotalSuggestions})`
            );
        }

        // Create new suggestion
        const newSuggestion: Suggestion = {
            id: uuidv4(),
            name: submissionData.name,
            email: submissionData.email,
            content: submissionData.content,
            createdAt: new Date().toISOString(),
            metadata,
        };

        suggestions.push(newSuggestion);

        // Persist to file
        await this.writeAllSuggestions(suggestions);

        return newSuggestion;
    }

    /**
     * Delete a suggestion permanently
     * @throws Error if suggestion not found
     */
    async deleteSuggestion(suggestionId: string): Promise<void> {
        const suggestions = await this.getAllSuggestions();

        const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
        if (suggestionIndex === -1) {
            throw new Error(`Suggestion ${suggestionId} not found`);
        }

        // Remove from list
        suggestions.splice(suggestionIndex, 1);

        // Persist to file
        await this.writeAllSuggestions(suggestions);
    }

    /**
     * Validate suggestion content
     * @throws Error if validation fails
     */
    validateSuggestionContent(content: string): void {
        const { contentMinLength, contentMaxLength, maxLinksAllowed } =
            SUGGESTION_CONFIG.limits;

        // Check length
        if (content.length < contentMinLength) {
            throw new Error(
                `Suggestion too short (minimum ${contentMinLength} characters)`
            );
        }

        if (content.length > contentMaxLength) {
            throw new Error(
                `Suggestion too long (maximum ${contentMaxLength} characters)`
            );
        }

        // Check link count
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = content.match(urlRegex) || [];

        if (links.length > maxLinksAllowed) {
            throw new Error(`Too many links (maximum ${maxLinksAllowed} allowed)`);
        }
    }

    /**
     * Get suggestion statistics
     */
    async getSuggestionCount(): Promise<{
        total: number;
    }> {
        const suggestions = await this.getAllSuggestions();

        return {
            total: suggestions.length,
        };
    }
}

// Export singleton instance
const suggestionService = new SuggestionService();
export default suggestionService;
