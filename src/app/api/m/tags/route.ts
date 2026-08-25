import type { NextRequest } from "next/server";
import { type Locale, locales } from "@/i18n/config";
import { badRequest, failure, success } from "@/lib/response";
import { systemConfigService } from "@/lib/services/system-config-service";
import { tagService } from "@/lib/services/tag-service";

/**
 * GET /api/m/tags
 * Query params:
 * - locale: target locale (required)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const locale = searchParams.get("locale") as Locale;

        if (!locale || !locales.includes(locale)) {
            return badRequest("Invalid or missing locale parameter");
        }

        const channels = await systemConfigService.getChannels();
        const channelTagSet = new Set(
            channels.flatMap((ch) =>
                ch.type === "tag" && ch.tag ? [ch.tag] : []
            )
        );
        const articleTags = (
            await tagService.getTagsByLocale(locale, false)
        ).filter((item) => !channelTagSet.has(item));
        const tags = [...Array.from(channelTagSet), ...articleTags];
        return success("Success", tags);
    } catch (error) {
        console.error("Error fetching tag suggestions:", error);
        return failure("Internal server error");
    }
}
