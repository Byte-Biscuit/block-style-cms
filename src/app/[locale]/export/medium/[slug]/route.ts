import { type ExportBlock, resolveExportBaseUrl } from "@/lib/export-html";
import { buildMediumExportHtml } from "@/lib/medium/build-export-html";
import { articleService } from "@/lib/services/article-service";

export const dynamic = "force-dynamic";

type RouteParams = {
    locale: string;
    slug: string;
};

const EXPORT_HEADERS = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Robots-Tag": "noindex, nofollow",
    "Cache-Control": "public, max-age=60",
} as const;

export async function GET(
    _request: Request,
    context: { params: Promise<RouteParams> }
) {
    const { locale, slug } = await context.params;

    const resolved = await articleService.resolveArticleBySlugLocale(
        slug,
        locale,
        true
    );

    if (!resolved.ok) {
        return new Response("Not Found", {
            status: 404,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Robots-Tag": "noindex, nofollow",
            },
        });
    }

    const article = resolved.article;
    const baseUrl = await resolveExportBaseUrl();

    if (!article.id) {
        return new Response("Not Found", {
            status: 404,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Robots-Tag": "noindex, nofollow",
            },
        });
    }

    const html = await buildMediumExportHtml(
        {
            id: article.id,
            title: article.title,
            summary: article.summary,
            image: article.image,
            content: (article.content ?? []) as ExportBlock[],
            locale: article.locale,
            slug: article.slug,
        },
        { baseUrl }
    );

    return new Response(html, {
        status: 200,
        headers: EXPORT_HEADERS,
    });
}
