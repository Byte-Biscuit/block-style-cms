import { describe, expect, it, vi } from "vitest";
import {
    computeExportCanvasSize,
    drawExportWatermark,
    getSvgDimensions,
    isolateSvgIds,
    resolveExportMarkText,
    SVG_EXPORT_PADDING,
    SVG_EXPORT_WATERMARK,
    stripSvgTaintSources,
} from "../svg-export";

function mockCtx() {
    const fillText = vi.fn();
    const measureText = vi.fn((text: string) => ({
        width: text.length * 10,
        actualBoundingBoxAscent: 10,
    }));
    const beginPath = vi.fn();
    const arc = vi.fn();
    const fill = vi.fn();
    const save = vi.fn();
    const restore = vi.fn();
    return {
        ctx: {
            globalAlpha: 1,
            fillStyle: "",
            font: "",
            textAlign: "left",
            textBaseline: "alphabetic",
            fillText,
            measureText,
            beginPath,
            arc,
            fill,
            save,
            restore,
        } as unknown as CanvasRenderingContext2D,
        fillText,
        measureText,
        arc,
    };
}

describe("getSvgDimensions", () => {
    it("reads viewBox", () => {
        expect(
            getSvgDimensions(
                '<svg viewBox="0 0 200 100"><rect width="1" height="1"/></svg>'
            )
        ).toEqual({ width: 200, height: 100 });
    });

    it("falls back to numeric width/height", () => {
        expect(
            getSvgDimensions(
                '<svg width="80" height="40"><circle r="1"/></svg>'
            )
        ).toEqual({ width: 80, height: 40 });
    });

    it("returns null when size is missing", () => {
        expect(getSvgDimensions("<svg><circle r='1'/></svg>")).toBeNull();
    });
});

describe("computeExportCanvasSize", () => {
    it("pads 10px per side and exports at 2x", () => {
        const size = computeExportCanvasSize(200, 100);
        expect(size.scale).toBe(2);
        expect(size.canvasW).toBe((200 + SVG_EXPORT_PADDING * 2) * 2);
        expect(size.canvasH).toBe((100 + SVG_EXPORT_PADDING * 2) * 2);
    });

    it("caps the longest padded edge at 1600", () => {
        const size = computeExportCanvasSize(3000, 2000);
        expect(Math.max(size.canvasW, size.canvasH)).toBe(1600);
        expect(size.scale).toBeLessThan(2);
    });
});

describe("drawExportWatermark", () => {
    it("draws each letter with midline dots in the gaps", () => {
        const { ctx, fillText, arc } = mockCtx();
        drawExportWatermark(ctx, 440, 240, 2, "bsc");

        expect(fillText.mock.calls.map((c) => c[0])).toEqual(["b", "s", "c"]);
        expect(arc).toHaveBeenCalledTimes(2);

        const baseline = fillText.mock.calls[0][2] as number;
        for (const call of arc.mock.calls) {
            expect(call[1]).toBe(baseline - 5);
        }
        expect(arc.mock.calls[0][0]).toBeGreaterThan(
            fillText.mock.calls[0][1] as number
        );
        expect(arc.mock.calls[0][0]).toBeLessThan(
            fillText.mock.calls[1][1] as number
        );
    });

    it("follows SVG_EXPORT_WATERMARK by default", () => {
        const { ctx, fillText, arc } = mockCtx();
        drawExportWatermark(ctx, 440, 240, 2);
        const letters = Array.from(SVG_EXPORT_WATERMARK.trim());
        expect(fillText.mock.calls.map((c) => c[0])).toEqual(letters);
        expect(arc).toHaveBeenCalledTimes(Math.max(0, letters.length - 1));
    });

    it("skips drawing when the mark is empty", () => {
        const { ctx, fillText, arc } = mockCtx();
        drawExportWatermark(ctx, 440, 240, 2, "  ");
        expect(fillText).not.toHaveBeenCalled();
        expect(arc).not.toHaveBeenCalled();
    });

    it("draws uppercase letters when resolved from settings", () => {
        const { ctx, fillText } = mockCtx();
        drawExportWatermark(
            ctx,
            440,
            240,
            2,
            resolveExportMarkText({ text: "bsc", uppercase: true })
        );
        expect(fillText.mock.calls.map((c) => c[0])).toEqual(["B", "S", "C"]);
    });
});

describe("resolveExportMarkText", () => {
    it("uppercases when the flag is set", () => {
        expect(resolveExportMarkText({ text: "bsc", uppercase: true })).toBe(
            "BSC"
        );
    });

    it("falls back to SVG_EXPORT_WATERMARK", () => {
        expect(resolveExportMarkText()).toBe(SVG_EXPORT_WATERMARK);
    });
});

describe("isolateSvgIds", () => {
    it("rewrites ids and url(#) / href references", () => {
        const src =
            '<svg id="m1"><defs><marker id="arr"/></defs><path marker-end="url(#arr)"/><use href="#arr"/></svg>';
        const out = isolateSvgIds(src, "n1");
        expect(out).toContain('id="m1-n1"');
        expect(out).toContain('id="arr-n1"');
        expect(out).toContain("url(#arr-n1)");
        expect(out).toContain('href="#arr-n1"');
        expect(out).not.toContain('id="m1"');
        expect(out).not.toContain("url(#arr)");
    });
});

describe("stripSvgTaintSources", () => {
    it("strips scripts, handlers, and absolute marker urls", () => {
        const src = `<svg onclick="alert(1)"><script>x()</script><path marker-end="url(http://localhost:3000/zh-TW/articles/x#arr)"/></svg>`;
        const out = stripSvgTaintSources(src);
        expect(out).not.toMatch(/<script/i);
        expect(out).not.toMatch(/onclick/);
        expect(out).toContain("url(#arr)");
        expect(out).not.toContain("http://localhost");
    });
});
