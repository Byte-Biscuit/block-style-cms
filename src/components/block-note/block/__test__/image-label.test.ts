import { describe, expect, it } from "vitest";
import { labelFromFilename } from "../image-label";

describe("labelFromFilename", () => {
    it("strips path, query, extension and humanizes separators", () => {
        expect(labelFromFilename("photos/my_photo-01.jpg?w=800")).toBe(
            "my photo 01"
        );
    });

    it("decodes URI components", () => {
        expect(labelFromFilename("https://cdn.example/a%20b.png")).toBe("a b");
    });

    it("returns empty for extension-only names", () => {
        expect(labelFromFilename(".png")).toBe("");
    });
});
