import { describe, expect, it } from "vitest";
import { isValidSvgMarkup, sanitizeSvg } from "../sanitize-svg";

describe("sanitizeSvg", () => {
    it("keeps a simple SVG", () => {
        const raw =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
        const clean = sanitizeSvg(raw);
        expect(clean).toBeTruthy();
        expect(clean).toContain("<svg");
        expect(clean).toContain("<circle");
    });

    it("strips script and event handlers", () => {
        const dirty = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
  <script>alert(2)</script>
  <circle cx="5" cy="5" r="4" onclick="alert(3)"/>
</svg>`;
        const clean = sanitizeSvg(dirty);
        expect(clean).toBeTruthy();
        expect(clean).not.toMatch(/<script/i);
        expect(clean).not.toMatch(/onload/i);
        expect(clean).not.toMatch(/onclick/i);
        expect(clean).toContain("<circle");
    });

    it("returns null for empty or non-svg markup", () => {
        expect(sanitizeSvg("")).toBeNull();
        expect(sanitizeSvg("   ")).toBeNull();
        expect(sanitizeSvg("<div>nope</div>")).toBeNull();
        expect(sanitizeSvg("<p>hi</p>")).toBeNull();
    });

    it("accepts XML declaration before svg", () => {
        const raw =
            '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>';
        expect(sanitizeSvg(raw)).toContain("<svg");
    });
});

describe("isValidSvgMarkup", () => {
    it("mirrors sanitizeSvg acceptance", () => {
        expect(
            isValidSvgMarkup(
                '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'
            )
        ).toBe(true);
        expect(isValidSvgMarkup("<div/>")).toBe(false);
    });
});
