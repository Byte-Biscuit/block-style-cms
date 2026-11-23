import { renderDiagramBlockPng } from "@/lib/export-html/diagram-from-article";

export const dynamic = "force-dynamic";

type RouteParams = {
    articleId: string;
    blockId: string;
};

const PNG_HEADERS = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=300",
    "X-Robots-Tag": "noindex, nofollow",
} as const;

export async function GET(
    _request: Request,
    context: { params: Promise<RouteParams> }
) {
    try {
        const { articleId, blockId } = await context.params;
        const png = await renderDiagramBlockPng(articleId, blockId);
        return new Response(new Uint8Array(png), {
            status: 200,
            headers: PNG_HEADERS,
        });
    } catch (err) {
        console.warn("[export-diagram]", err);
        const message = err instanceof Error ? err.message : "Bad Request";
        const status =
            message === "Article not found" || message === "Block not found"
                ? 404
                : 400;
        return new Response(message, {
            status,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
    }
}
