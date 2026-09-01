import { describe, expect, it } from "vitest";
import { keywordsFromTags } from "@/types/article";

describe("keywordsFromTags", () => {
    it("returns keywords unchanged when non-empty", () => {
        expect(keywordsFromTags(["react", "_AI_"], ["custom"])).toEqual([
            "custom",
        ]);
    });

    it("copies tags minus channel tags when keywords empty", () => {
        expect(keywordsFromTags(["react", "_AI_", "next"], [])).toEqual([
            "react",
            "next",
        ]);
    });

    it("returns empty when only channel tags", () => {
        expect(keywordsFromTags(["_AI_", "_EDUCATION_"], [])).toEqual([]);
    });

    it("drops single-character tags", () => {
        expect(keywordsFromTags(["a", "ab", "_X_"], [])).toEqual(["ab"]);
    });

    it("truncates to 20 keywords", () => {
        const tags = Array.from({ length: 25 }, (_, i) => `tag${i}`);
        expect(keywordsFromTags(tags, [])).toHaveLength(20);
        expect(keywordsFromTags(tags, [])).toEqual(tags.slice(0, 20));
    });
});
