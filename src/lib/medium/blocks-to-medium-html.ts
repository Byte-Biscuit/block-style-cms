import {
    type BlocksToHtmlOptions,
    blocksToHtml,
    type ExportBlock,
} from "@/lib/export-html";

export type MediumBlock = ExportBlock;

export type BlocksToMediumHtmlOptions = Omit<
    BlocksToHtmlOptions,
    | "demoteHeadingsForShell"
    | "flattenNestedLists"
    | "stripDividers"
    | "stripCodeInHeadingsAndQuotes"
    | "rasterizeTables"
    | "preferStandardRasterImages"
>;

/**
 * Medium Import body HTML: shell owns h1/h2, so demote headings and flatten nested lists.
 */
export async function blocksToMediumHtml(
    blocks: ExportBlock[] | undefined | null,
    opts: BlocksToMediumHtmlOptions
): Promise<string> {
    return blocksToHtml(blocks, {
        ...opts,
        demoteHeadingsForShell: true,
        flattenNestedLists: true,
        stripDividers: true,
        stripCodeInHeadingsAndQuotes: true,
        rasterizeTables: true,
        preferStandardRasterImages: true,
    });
}
