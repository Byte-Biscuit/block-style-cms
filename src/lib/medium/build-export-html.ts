import {
    absolutizeUrl,
    type BlocksToHtmlOptions,
    type ExportBlock,
    escapeAttr,
    escapeHtml,
    preferJpegImageUrl,
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
    | "demoteHeadingsForShell"
    | "flattenNestedLists"
    | "stripDividers"
    | "stripCodeInHeadingsAndQuotes"
    | "rasterizeTables"
    | "preferStandardRasterImages"
> & {
    author?: string;
};

function hostFromBaseUrl(baseUrl: string): string {
    try {
        return new URL(baseUrl).host || baseUrl;
    } catch {
        return baseUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    }
}

function coverFigure(
    image: string | undefined,
    baseUrl: string,
    title: string
): string {
    if (!image?.trim()) return "";
    let abs = absolutizeUrl(image, baseUrl);
    if (!abs || /\.svg(\?|#|$)/i.test(abs) || /^data:/i.test(abs)) return "";
    abs = preferJpegImageUrl(abs);
    return `<figure>
      <img src="${escapeAttr(abs)}" alt="${escapeAttr(title)}" />
      <figcaption>${escapeHtml(title)}</figcaption>
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
    const host = hostFromBaseUrl(baseUrl);

    const bodyHtml = await blocksToMediumHtml(article.content, {
        ...opts,
        articleId: article.id,
    });
    const cover = coverFigure(article.image, baseUrl, title);
    const subtitleHtml = subtitle ? `<h2>${escapeHtml(subtitle)}</h2>` : "";
    const coverAbs = article.image
        ? preferJpegImageUrl(absolutizeUrl(article.image, baseUrl))
        : "";
    const ogImage =
        coverAbs && !/\.svg(\?|#|$)/i.test(coverAbs)
            ? `<meta property="og:image" content="${escapeAttr(coverAbs)}" />`
            : "";

    // ponytail: no <link rel="canonical"> here — Medium Import follows it and
    // scrapes /articles/[slug] (React SSR) instead of this clean export page.
    // After import, set Canonical Link in Medium Story Settings to `canonical`.
    return `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
<head>
  <meta charset="UTF-8" />
  <meta name="robots" content="noindex, nofollow" />
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
    <p><em>Originally published at <a href="${escapeAttr(canonical)}">${escapeHtml(host)}</a>.</em></p>
  </article>
</body>
</html>
`;
}
