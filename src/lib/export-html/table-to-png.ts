import { sha256Hex } from "@/lib/hash";
import { getPngCache, setPngCache, svgToPngBuffer } from "./diagram-to-png";
import { escapeHtml } from "./html-escape";

const TARGET_WIDTH = 1200;
const PAD_X = 12;
const PAD_Y = 10;
const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
const BORDER = "#d0d7de";
const HEADER_BG = "#f6f8fa";
const TEXT = "#24292f";
const FONT = "DejaVu Sans, Noto Sans CJK SC, Noto Sans SC, sans-serif";

type InlineLike = {
    type?: string;
    text?: string;
    content?: InlineLike[];
    props?: { text?: string; latex?: string };
};

type TableCell = {
    type?: string;
    content?: unknown;
    props?: { colspan?: number; rowspan?: number };
};

type TableRow = { cells?: unknown[] };

type TableContent = {
    type?: string;
    rows?: TableRow[];
    headerRows?: number;
    columnWidths?: Array<number | null>;
};

function contentAsInline(content: unknown): InlineLike[] {
    if (!Array.isArray(content)) return [];
    return content as InlineLike[];
}

function cellPlainText(cell: unknown): string {
    let inline: InlineLike[] = [];
    if (
        cell &&
        typeof cell === "object" &&
        !Array.isArray(cell) &&
        (cell as TableCell).type === "tableCell"
    ) {
        inline = contentAsInline((cell as TableCell).content);
    } else if (Array.isArray(cell)) {
        inline = contentAsInline(cell);
    }
    return inline
        .map((item) => {
            if (!item) return "";
            if (item.type === "text") return item.text ?? "";
            if (item.type === "link") {
                return contentAsInline(item.content)
                    .map((c) => c.text ?? "")
                    .join("");
            }
            if (item.type === "math") {
                return item.props?.latex ?? item.props?.text ?? item.text ?? "";
            }
            return "";
        })
        .join("")
        .trim();
}

function cellColspan(cell: unknown): number {
    if (
        cell &&
        typeof cell === "object" &&
        !Array.isArray(cell) &&
        (cell as TableCell).type === "tableCell"
    ) {
        const n = Number((cell as TableCell).props?.colspan ?? 1);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    }
    return 1;
}

/** CJK / fullwidth ≈ 1em; ASCII ≈ 0.55em. Ceiling: heuristic layout, not browser measure. */
function measureTextWidth(text: string): number {
    let w = 0;
    for (const ch of text) {
        const code = ch.codePointAt(0) ?? 0;
        if (
            (code >= 0x1100 && code <= 0x11ff) ||
            (code >= 0x2e80 && code <= 0x9fff) ||
            (code >= 0xf900 && code <= 0xfaff) ||
            (code >= 0xff00 && code <= 0xffef) ||
            (code >= 0x20000 && code <= 0x2fa1f)
        ) {
            w += FONT_SIZE;
        } else {
            w += FONT_SIZE * 0.55;
        }
    }
    return Math.max(w, FONT_SIZE * 0.5);
}

function wrapLine(text: string, maxWidth: number): string[] {
    if (!text) return [""];
    const lines: string[] = [];
    let current = "";
    let currentW = 0;

    const flush = () => {
        lines.push(current);
        current = "";
        currentW = 0;
    };

    const tokens = text.split(/(\s+)/);
    for (const token of tokens) {
        if (!token) continue;
        const tw = measureTextWidth(token);
        if (current && currentW + tw > maxWidth) {
            flush();
        }
        if (!current && tw > maxWidth) {
            // Long token / CJK run: wrap by character.
            for (const ch of token) {
                const cw = measureTextWidth(ch);
                if (current && currentW + cw > maxWidth) flush();
                current += ch;
                currentW += cw;
            }
            continue;
        }
        current += token;
        currentW += tw;
    }
    if (current || !lines.length) flush();
    return lines;
}

function parseTable(content: unknown): {
    rows: string[][];
    colspans: number[][];
    headerRows: number;
    colCount: number;
} {
    const table = content as TableContent | undefined;
    const rawRows = table?.rows ?? [];
    if (!rawRows.length) throw new Error("Empty table");

    const rows: string[][] = [];
    const colspans: number[][] = [];
    let colCount = 0;

    for (const row of rawRows) {
        const cells = row.cells ?? [];
        const texts: string[] = [];
        const spans: number[] = [];
        let spanSum = 0;
        for (const cell of cells) {
            texts.push(cellPlainText(cell));
            const span = cellColspan(cell);
            spans.push(span);
            spanSum += span;
        }
        rows.push(texts);
        colspans.push(spans);
        colCount = Math.max(colCount, spanSum);
    }

    if (colCount < 1) throw new Error("Empty table");
    const headerRows = Math.max(
        0,
        Math.min(Number(table?.headerRows ?? 1) || 0, rows.length)
    );
    return { rows, colspans, headerRows, colCount };
}

function estimateColWidths(
    rows: string[][],
    colspans: number[][],
    colCount: number
): number[] {
    const weights = Array.from({ length: colCount }, () => 1);
    for (let r = 0; r < rows.length; r++) {
        let col = 0;
        for (let c = 0; c < rows[r].length; c++) {
            const span = colspans[r][c] ?? 1;
            const w = measureTextWidth(rows[r][c]) + PAD_X * 2;
            const per = w / span;
            for (let i = 0; i < span && col + i < colCount; i++) {
                weights[col + i] = Math.max(weights[col + i], per);
            }
            col += span;
        }
    }
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    const usable = TARGET_WIDTH;
    return weights.map((w) => Math.max(48, Math.floor((w / sum) * usable)));
}

function buildTableSvg(content: unknown): string {
    const { rows, colspans, headerRows, colCount } = parseTable(content);
    let colWidths = estimateColWidths(rows, colspans, colCount);
    // Normalize to TARGET_WIDTH (floor drift).
    const widthSum = colWidths.reduce((a, b) => a + b, 0);
    if (widthSum !== TARGET_WIDTH && widthSum > 0) {
        const scale = TARGET_WIDTH / widthSum;
        colWidths = colWidths.map((w) => Math.max(48, Math.floor(w * scale)));
        const drift = TARGET_WIDTH - colWidths.reduce((a, b) => a + b, 0);
        colWidths[colWidths.length - 1] += drift;
    }

    const wrapped: string[][][] = rows.map((row, r) => {
        let col = 0;
        return row.map((text, c) => {
            const span = colspans[r][c] ?? 1;
            let cellW = 0;
            for (let i = 0; i < span && col + i < colCount; i++) {
                cellW += colWidths[col + i];
            }
            col += span;
            return wrapLine(text, Math.max(24, cellW - PAD_X * 2));
        });
    });

    const rowHeights = wrapped.map((row) => {
        const lines = Math.max(1, ...row.map((ls) => ls.length));
        return PAD_Y * 2 + lines * LINE_HEIGHT;
    });

    const height = rowHeights.reduce((a, b) => a + b, 0);
    const parts: string[] = [];
    parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${TARGET_WIDTH}" height="${height}" viewBox="0 0 ${TARGET_WIDTH} ${height}">`
    );
    parts.push(`<rect width="100%" height="100%" fill="#ffffff"/>`);

    let y = 0;
    for (let r = 0; r < rows.length; r++) {
        const rh = rowHeights[r];
        let x = 0;
        let col = 0;
        for (let c = 0; c < rows[r].length; c++) {
            const span = colspans[r][c] ?? 1;
            let cellW = 0;
            for (let i = 0; i < span && col + i < colCount; i++) {
                cellW += colWidths[col + i];
            }
            col += span;
            const isHeader = r < headerRows;
            parts.push(
                `<rect x="${x}" y="${y}" width="${cellW}" height="${rh}" fill="${isHeader ? HEADER_BG : "#ffffff"}" stroke="${BORDER}" stroke-width="1"/>`
            );
            const lines = wrapped[r][c];
            let ty = y + PAD_Y + FONT_SIZE;
            const weight = isHeader ? "700" : "400";
            for (const line of lines) {
                parts.push(
                    `<text x="${x + PAD_X}" y="${ty}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="${weight}" fill="${TEXT}">${escapeHtml(line)}</text>`
                );
                ty += LINE_HEIGHT;
            }
            x += cellW;
        }
        y += rh;
    }
    parts.push("</svg>");
    return parts.join("");
}

/** BlockNote table content → PNG bytes (soft LRU via diagram-to-png cache). */
export async function tableBlockToPngBuffer(content: unknown): Promise<Buffer> {
    const svg = buildTableSvg(content);
    const cacheKey = `tbl:${sha256Hex(svg)}`;
    const hit = getPngCache(cacheKey);
    if (hit) return hit;
    const png = await svgToPngBuffer(svg);
    setPngCache(cacheKey, png);
    return png;
}
