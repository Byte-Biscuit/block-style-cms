import { fileURLToPath } from "url";
import path from "path";
import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables before importing modules
beforeAll(() => {
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = "test-app-id";
    process.env.ALGOLIA_ADMIN_API_KEY = "test-api-key";
    process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME = "test-index";
});

// Mock config before importing modules
vi.mock('@/config', () => ({
    ARTICLE_DIR: path.join(__dirname, "..", "..", "..", "data", "articles"),
    META_DIR: path.join(__dirname, "..", "..", "..", "data", "meta")
}));

// Mock algolia-search-service to prevent actual API calls
vi.mock('../algolia-search-service', () => ({
    algoliaSearchService: {
        saveArticle: vi.fn().mockResolvedValue(undefined),
        deleteArticle: vi.fn().mockResolvedValue(undefined),
        search: vi.fn().mockResolvedValue([]),
    }
}));

// Import after mocking
const { tagService } = await import("../tag-service");
const { lruCacheService } = await import("../lru-cache-service");

describe("TagService - getTagsWithArticles", () => {

    beforeEach(() => {
        // Clear cache before each test
        lruCacheService.clear();
    });

    it("should return a Map with tags and articles on first call", async () => {
        const locale = "zh-CN";
        const tagMap = await tagService.getTagsWithArticles(locale, true);

        console.log("First call - Type:", tagMap.constructor.name);
        console.log("First call - Is Map:", tagMap instanceof Map);
        console.log("First call - Size:", tagMap.size);
        console.log("First call - Entries:", Array.from(tagMap.entries()).slice(0, 3));
        expect(tagMap).toBeInstanceOf(Map);
    });
});
