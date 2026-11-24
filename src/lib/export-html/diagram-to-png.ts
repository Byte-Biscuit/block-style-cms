import { LRUCache } from "lru-cache";
import sharp, { type Sharp } from "sharp";
import { sha256Hex } from "@/lib/hash";
import { EXPORT_SVG_FONT } from "./export-font";
import { stripSvgForRaster } from "./strip-svg";

const MAX_EDGE = 1600;
const DENSITY = 150;
const MAX_SOURCE_BYTES = 200_000;

/** Soft in-memory PNG cache only (not persisted). */
const pngCache = new LRUCache<string, Buffer>({
    max: 64,
    maxSize: 24 * 1024 * 1024,
    sizeCalculation: (buf) => buf.byteLength,
    ttl: 1000 * 60 * 10,
});

export function getPngCache(key: string): Buffer | undefined {
    return pngCache.get(key);
}

export function setPngCache(key: string, buf: Buffer): void {
    pngCache.set(key, buf);
}

let mermaidReady: Promise<typeof import("mermaid")> | null = null;
let renderSeq = 0;

type SvgMeasureEl = {
    tagName?: string;
    textContent?: string | null;
    getAttribute: (name: string) => string | null;
};

function installSvgMeasurePolyfills(window: Window & typeof globalThis): void {
    const svgProto = window.SVGElement?.prototype as
        | (SVGElement & { getBBox?: () => DOMRect })
        | undefined;
    if (!svgProto) return;

    svgProto.getBBox = function getBBox(this: SvgMeasureEl) {
        const tag = this.tagName?.toLowerCase?.() || "";
        if (tag === "text" || tag === "tspan") {
            const t = this.textContent || "";
            const w = Math.max(10, t.length * 8);
            return {
                x: 0,
                y: -14,
                width: w,
                height: 18,
                top: -14,
                bottom: 4,
                left: 0,
                right: w,
            } as DOMRect;
        }
        if (tag === "rect" || tag === "image" || tag === "foreignObject") {
            const w = parseFloat(this.getAttribute("width") || "100") || 100;
            const h = parseFloat(this.getAttribute("height") || "40") || 40;
            return {
                x: 0,
                y: 0,
                width: w,
                height: h,
                top: 0,
                bottom: h,
                left: 0,
                right: w,
            } as DOMRect;
        }
        let w = 120;
        let h = 40;
        const tw = this.getAttribute("width");
        const th = this.getAttribute("height");
        if (tw) w = parseFloat(tw) || w;
        if (th) h = parseFloat(th) || h;
        return {
            x: 0,
            y: 0,
            width: w,
            height: h,
            top: 0,
            bottom: h,
            left: 0,
            right: w,
        } as DOMRect;
    };

    const measureText = function measureText(this: {
        textContent?: string | null;
    }) {
        return Math.max(10, (this.textContent || "").length * 8);
    };
    // Mermaid cluster labels call these on text nodes; jsdom often lacks them.
    for (const proto of [
        window.SVGTextContentElement?.prototype,
        window.SVGTextElement?.prototype,
        window.SVGTSpanElement?.prototype,
        svgProto,
    ]) {
        if (!proto) continue;
        const p = proto as {
            getComputedTextLength?: () => number;
            getSubStringLength?: () => number;
        };
        p.getComputedTextLength = measureText;
        p.getSubStringLength = measureText;
    }
}

function bindDomGlobals(window: Window & typeof globalThis): void {
    const keys = [
        "document",
        "DOMParser",
        "XMLSerializer",
        "HTMLElement",
        "SVGElement",
        "Element",
        "Node",
        "DocumentFragment",
        "Text",
        "CSSStyleSheet",
    ] as const;

    Object.defineProperty(globalThis, "window", {
        value: window,
        configurable: true,
        writable: true,
    });
    for (const key of keys) {
        const value = window[key as keyof typeof window];
        if (value === undefined) continue;
        try {
            Object.defineProperty(globalThis, key, {
                value,
                configurable: true,
                writable: true,
            });
        } catch {
            // already non-configurable
        }
    }
    Object.defineProperty(globalThis, "getComputedStyle", {
        value: window.getComputedStyle.bind(window),
        configurable: true,
        writable: true,
    });
    installSvgMeasurePolyfills(window);
}

async function ensureMermaid(): Promise<
    Awaited<typeof import("mermaid")>["default"]
> {
    if (!mermaidReady) {
        mermaidReady = (async () => {
            const { JSDOM } = await import("jsdom");
            const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
                pretendToBeVisual: true,
            });
            bindDomGlobals(dom.window as unknown as Window & typeof globalThis);
            const mod = await import("mermaid");
            mod.default.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                theme: "neutral",
                fontFamily: EXPORT_SVG_FONT,
                themeVariables: { fontFamily: EXPORT_SVG_FONT },
                flowchart: { htmlLabels: false, useMaxWidth: false },
                sequence: { useMaxWidth: false },
            });
            return mod;
        })();
    }
    const mod = await mermaidReady;
    return mod.default;
}

export async function svgToPngBuffer(svg: string): Promise<Buffer> {
    let instance: Sharp | null = null;
    try {
        instance = sharp(Buffer.from(svg), { density: DENSITY });
        const meta = await instance.metadata();
        const w = meta.width || 0;
        const h = meta.height || 0;
        if (w > MAX_EDGE || h > MAX_EDGE) {
            instance = instance.resize({
                width: w >= h ? MAX_EDGE : undefined,
                height: h > w ? MAX_EDGE : undefined,
                fit: "inside",
                withoutEnlargement: true,
            });
        }
        return await instance.png().toBuffer();
    } finally {
        if (instance) instance.destroy();
    }
}

function assertSourceSize(source: string): void {
    if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
        throw new Error("Diagram source too large");
    }
}

/** Mermaid source → PNG bytes in memory (optional soft LRU). */
export async function mermaidCodeToPngBuffer(code: string): Promise<Buffer> {
    const trimmed = code.trim();
    if (!trimmed) throw new Error("Empty mermaid code");
    assertSourceSize(trimmed);

    const cacheKey = `mmd:${sha256Hex(trimmed)}`;
    const hit = pngCache.get(cacheKey);
    if (hit) return hit;

    const mermaid = await ensureMermaid();
    const id = `mmd-${cacheKey.slice(4, 16)}-${++renderSeq}`;
    const { svg } = await mermaid.render(id, trimmed);
    const png = await svgToPngBuffer(svg);
    pngCache.set(cacheKey, png);
    return png;
}

/** SVG markup → PNG bytes in memory (optional soft LRU). */
export async function svgMarkupToPngBuffer(markup: string): Promise<Buffer> {
    const clean = stripSvgForRaster(markup);
    if (!clean) throw new Error("Invalid SVG markup");
    assertSourceSize(clean);

    const cacheKey = `svg:${sha256Hex(clean)}`;
    const hit = pngCache.get(cacheKey);
    if (hit) return hit;

    const png = await svgToPngBuffer(clean);
    pngCache.set(cacheKey, png);
    return png;
}
