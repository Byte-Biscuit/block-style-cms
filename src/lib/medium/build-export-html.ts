import {
    absolutizeUrl,
    type BlocksToHtmlOptions,
    type ExportBlock,
    escapeAttr,
    escapeHtml,
} from "@/lib/export-html";
import { blocksToMediumHtml } from "./blocks-to-medium-html";

export type MediumExportArticle = {
    id: string;
    title: string;
    summary?: string;
    image?: string;
    content?: ExportBlock[];
    locale: string;
    slug: string;
};

export type BuildMediumExportHtmlOptions = Omit<
    BlocksToHtmlOptions,
    "demoteHeadingsForShell" | "flattenNestedLists"
> & {
    author?: string;
};

function coverFigure(
    image: string | undefined,
    baseUrl: string,
    title: string
): string {
    if (!image?.trim()) return "";
    const abs = absolutizeUrl(image, baseUrl);
    if (!abs || /\.svg(\?|#|$)/i.test(abs) || /^data:/i.test(abs)) return "";
    return `<figure>
      <img src="${escapeAttr(abs)}" alt="${escapeAttr(title)}" />
    </figure>`;
}

/**
 * Full HTML document for Medium Import crawler.
 */
export async function buildMediumExportHtml(
    article: MediumExportArticle,
    opts: BuildMediumExportHtmlOptions
): Promise<string> {
    const { baseUrl, author = "Nan Zhou" } = opts;
    const canonical = `${baseUrl}/${article.locale}/articles/${article.slug}`;
    const title = article.title || "Untitled";
    const subtitle = article.summary?.trim() || "";
    const lang = article.locale.startsWith("zh") ? article.locale : "en";

    const bodyHtml = await blocksToMediumHtml(article.content, {
        ...opts,
        articleId: article.id,
    });
    const cover = coverFigure(article.image, baseUrl, title);
    const subtitleHtml = subtitle ? `<h2>${escapeHtml(subtitle)}</h2>` : "";
    const coverAbs = article.image ? absolutizeUrl(article.image, baseUrl) : "";
    const ogImage =
        coverAbs && !/\.svg(\?|#|$)/i.test(coverAbs)
            ? `<meta property="og:image" content="${escapeAttr(coverAbs)}" />`
            : "";

    return `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
<head>
  <meta charset="UTF-8" />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="${escapeAttr(canonical)}" />
  <title>${escapeHtml(title)}</title>
  <meta name="author" content="${escapeAttr(author)}" />
  <meta name="description" content="${escapeAttr(subtitle)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(subtitle)}" />
  ${ogImage}
</head>
<body>
  <article>
    <h1>${escapeHtml(title)}</h1>
    ${subtitleHtml}
    ${cover}
    ${bodyHtml}
  </article>
</body>
</html>
`;
}
