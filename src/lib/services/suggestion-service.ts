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
    private suggestionsCache: Suggestion[] | null = null;

    constructor() {
        this.suggestionsFile = path.join(SUGGESTION_DIR, 'suggestions.json');
    }

    /**
     * Ensure suggestions file exists
     */
    private async ensureSuggestionsFile(): Promise<void> {
        try {
            await fs.access(this.suggestionsFile);
        } catch {
            // Create directory if not exists
            await fs.mkdir(SUGGESTION_DIR, { recursive: true });
            await fs.writeFile(this.suggestionsFile, JSON.stringify([], null, 2), 'utf-8');
        }
    }

    /**
     * Load suggestions from file into memory cache
     */
    private async loadSuggestions(): Promise<Suggestion[]> {
        await this.ensureSuggestionsFile();
        const data = await fs.readFile(this.suggestionsFile, 'utf-8');
        const suggestions: Suggestion[] = JSON.parse(data);
        this.suggestionsCache = suggestions;
        return suggestions;
    }

    /**
     * Get all suggestions (from cache if loaded, otherwise load from file)
     */
    async getAllSuggestions(): Promise<Suggestion[]> {
        // Return cached data if already loaded
        if (this.suggestionsCache !== null) {
            return this.suggestionsCache;
        }

        // Cache not loaded, load from file
        return await this.loadSuggestions();
    }

    /**
     * Write all suggestions to file and update cache
     */
    private async writeAllSuggestions(): Promise<void> {
        await this.ensureSuggestionsFile();
        await fs.writeFile(
            this.suggestionsFile,
            JSON.stringify(this.suggestionsCache, null, 2),
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
        // Ensure cache is loaded
        const suggestionsCache = await this.getAllSuggestions();

        // Check total suggestion limit
        if (suggestionsCache.length >= SUGGESTION_CONFIG.maxTotalSuggestions) {
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

        // Add to cache
        this.suggestionsCache!.push(newSuggestion);

        // Persist to file
        await this.writeAllSuggestions();

        return newSuggestion;
    }

    /**
     * Delete a suggestion permanently
     * @throws Error if suggestion not found
     */
    async deleteSuggestion(suggestionId: string): Promise<void> {
        const suggestionsCache = await this.getAllSuggestions();

        const suggestionIndex = suggestionsCache.findIndex(s => s.id === suggestionId);
        if (suggestionIndex === -1) {
            throw new Error(`Suggestion ${suggestionId} not found`);
        }

        // Remove from cache
        this.suggestionsCache!.splice(suggestionIndex, 1);

        // Persist to file
        await this.writeAllSuggestions();
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
