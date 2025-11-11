import { fileURLToPath } from "url";
import path from "path";
import { describe, it, expect, beforeEach, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock config before importing modules
vi.mock('@/config', () => ({
    ARTICLE_DIR: path.join(__dirname, "..", "..", "..", "data", "articles"),
    META_DIR: path.join(__dirname, "..", "..", "..", "data", "meta")
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
        expect(tagMap.size).toBeGreaterThan(0);
    });
});
