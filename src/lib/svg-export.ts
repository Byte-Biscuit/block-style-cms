/**
 * PNG export: SVG markup → natural size → 2× canvas (longest edge ≤ 1600)
 * with 10px padding → watermark → PNG download.
 *
 * Rebrand the lockup by changing SVG_EXPORT_WATERMARK only (letters + a
 * midline dot between each). "" disables the watermark. Do not put
 * punctuation in the string; the dots are drawn, not typed.
 */
export const SVG_EXPORT_PADDING = 10;
export const SVG_EXPORT_WATERMARK = "bsc";
const PIXEL_RATIO = 2;
const MAX_EDGE = 1600;
const WATERMARK_INSET = 16;

export type SvgSize = { width: number; height: number };

export type ExportCanvasSize = {
    canvasW: number;
    canvasH: number;
    scale: number;
};

/** Natural SVG size from viewBox, then numeric width/height. */
export function getSvgDimensions(svgContent: string): SvgSize | null {
    const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/[\s,]+/);
        if (parts.length === 4) {
            const w = parseFloat(parts[2]);
            const h = parseFloat(parts[3]);
            if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) {
                return { width: w, height: h };
            }
        }
    }
    const wMatch = svgContent.match(/\swidth=["']([0-9.]+)["']/);
    const hMatch = svgContent.match(/\sheight=["']([0-9.]+)["']/);
    if (wMatch && hMatch) {
        const w = parseFloat(wMatch[1]);
        const h = parseFloat(hMatch[1]);
        if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) {
            return { width: w, height: h };
        }
    }
    return null;
}

export function measureSvgElement(
    el: SVGSVGElement | null | undefined
): SvgSize | null {
    if (!el) return null;
    const vb = el.viewBox?.baseVal;
    if (vb && vb.width > 0 && vb.height > 0) {
        return { width: vb.width, height: vb.height };
    }
    try {
        const box = el.getBBox();
        if (box.width > 0 && box.height > 0) {
            return { width: box.width, height: box.height };
        }
    } catch {
        // getBBox throws if the node is not in the document
    }
    return null;
}

export function computeExportCanvasSize(
    naturalW: number,
    naturalH: number
): ExportCanvasSize {
    const paddedW = naturalW + SVG_EXPORT_PADDING * 2;
    const paddedH = naturalH + SVG_EXPORT_PADDING * 2;
    const scale = Math.min(PIXEL_RATIO, MAX_EDGE / Math.max(paddedW, paddedH));
    return {
        canvasW: Math.round(paddedW * scale),
        canvasH: Math.round(paddedH * scale),
        scale,
    };
}

function watermarkLetters(text: string): string[] {
    return Array.from(text.trim());
}

/** Bottom-right initialism lockup. Empty text skips drawing. */
export function drawExportWatermark(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    scale: number,
    text: string = SVG_EXPORT_WATERMARK
): void {
    const letters = watermarkLetters(text);
    if (letters.length === 0) return;

    const fontSize = Math.max(
        18,
        Math.min(28, Math.round(Math.min(canvasW, canvasH) * 0.032))
    );
    const inset = WATERMARK_INSET * scale;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#4b5563";
    ctx.font = `600 ${fontSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const widths = letters.map((ch) => ctx.measureText(ch).width);
    const letterGap = fontSize * 0.9;
    const totalW =
        widths.reduce((sum, w) => sum + w, 0) +
        letterGap * (letters.length - 1);
    const originX = canvasW - inset - totalW;
    const originY = canvasH - inset;

    // Probe "x" for x-height so the midline does not depend on watermark letters.
    const xMetrics = ctx.measureText("x");
    const xHeight =
        xMetrics.actualBoundingBoxAscent > 0
            ? xMetrics.actualBoundingBoxAscent
            : fontSize * 0.52;
    const dotY = originY - xHeight / 2;
    const dotR = Math.max(1.6, fontSize * 0.09);

    let x = originX;
    letters.forEach((letter, i) => {
        ctx.fillText(letter, x, originY);
        const w = widths[i] ?? 0;
        if (i < letters.length - 1) {
            ctx.beginPath();
            ctx.arc(x + w + letterGap / 2, dotY, dotR, 0, Math.PI * 2);
            ctx.fill();
            x += w + letterGap;
        }
    });
    ctx.restore();
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sourceSvgMarkup(
    svgMarkup: string,
    fallbackSvg?: SVGSVGElement | null
): string {
    if (fallbackSvg) {
        try {
            return new XMLSerializer().serializeToString(fallbackSvg);
        } catch {
            // mermaid innerHTML string is the fallback
        }
    }
    return svgMarkup;
}

/** Drop <script>/handlers and make marker urls document-local (#id only). */
export function stripSvgTaintSources(svg: string): string {
    return svg
        .replace(/<script\b[\s\S]*?<\/script>/gi, "")
        .replace(/\s+on\w+="[^"]*"/gi, "")
        .replace(/\s+on\w+='[^']*'/gi, "")
        .replace(/url\((['"]?)https?:\/\/[^)#]*#([^)'"]+)\1\)/gi, "url(#$2)");
}

/**
 * Prefix every id so url(#id) cannot resolve against the live page SVG.
 * Chrome taints the canvas when a blob/data image and the document share ids
 * (first mermaid on a page typically owns the flowchart marker ids).
 */
export function isolateSvgIds(svg: string, nonce: string): string {
    const ids = [
        ...new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])),
    ]
        .filter((id): id is string => Boolean(id))
        .sort((a, b) => b.length - a.length);
    let out = svg;
    for (const id of ids) {
        const next = `${id}-${nonce}`;
        const e = escapeRegExp(id);
        out = out
            .replace(new RegExp(`id="${e}"`, "g"), `id="${next}"`)
            .replace(new RegExp(`id='${e}'`, "g"), `id='${next}'`)
            .replace(new RegExp(`url\\(#${e}\\)`, "g"), `url(#${next})`)
            .replace(new RegExp(`url\\('#${e}'\\)`, "g"), `url('#${next}')`)
            .replace(new RegExp(`url\\("#${e}"\\)`, "g"), `url("#${next}")`)
            .replace(new RegExp(`href="#${e}"`, "g"), `href="#${next}"`)
            .replace(
                new RegExp(`xlink:href="#${e}"`, "g"),
                `xlink:href="#${next}"`
            );
        out = out.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (block) =>
            block.replace(new RegExp(`#${e}\\b`, "g"), `#${next}`)
        );
    }
    return out;
}

function prepareSvgMarkup(svgMarkup: string, dims: SvgSize): string {
    let svg = stripSvgTaintSources(svgMarkup.trim());
    svg = isolateSvgIds(
        svg,
        `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    );
    svg = svg.replace(/<svg\b([^>]*)>/i, (_match, rawAttrs: string) => {
        let attrs = rawAttrs
            .replace(/\swidth=(["']).*?\1/i, "")
            .replace(/\sheight=(["']).*?\1/i, "");
        if (!/\sxmlns=/.test(attrs)) {
            attrs += ' xmlns="http://www.w3.org/2000/svg"';
        }
        if (!/xmlns:xlink=/.test(attrs)) {
            attrs += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
        }
        if (!/font-family/i.test(attrs) && !/font-family/i.test(svgMarkup)) {
            attrs += ' font-family="sans-serif"';
        }
        return `<svg${attrs} width="${dims.width}" height="${dims.height}">`;
    });
    return svg;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load SVG for export"));
        img.src = url;
    }).then(async (img) => {
        if (typeof img.decode === "function") {
            await img.decode().catch(() => undefined);
        }
        return img;
    });
}

export async function svgMarkupToPngBlob(
    svgMarkup: string,
    fallbackSvg?: SVGSVGElement | null
): Promise<Blob> {
    const source = sourceSvgMarkup(svgMarkup, fallbackSvg);
    const dims = getSvgDimensions(source) ?? measureSvgElement(fallbackSvg);
    if (!dims) {
        throw new Error("Cannot determine SVG size");
    }

    const { canvasW, canvasH, scale } = computeExportCanvasSize(
        dims.width,
        dims.height
    );
    const prepared = prepareSvgMarkup(source, dims);
    // data: URI keeps url(#id) inside the image; blob: is same-origin as the
    // page so Chrome may resolve markers against the live mermaid SVG (taint).
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(prepared)}`;
    const img = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas is not available");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);
    const pad = SVG_EXPORT_PADDING * scale;
    ctx.drawImage(img, pad, pad, dims.width * scale, dims.height * scale);
    drawExportWatermark(ctx, canvasW, canvasH, scale);

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
            if (result) resolve(result);
            else reject(new Error("PNG encode failed"));
        }, "image/png");
    });
}

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.click();
    URL.revokeObjectURL(url);
}
