import { NextRequest } from "next/server";
import { tagService } from "@/lib/services/tag-service";
import { channelService } from "@/lib/services/channel-service";
import { Locale, locales } from "@/i18n/config";
import { success, failure, badRequest } from "@/lib/response";

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

        const channels = await channelService.getChannels();
        const channelTagSet = new Set(
            channels
                .filter((ch) => ch.type === "tag" && ch.tag)
                .map((ch) => ch.tag!)
        );
        const articleTags = (await tagService.getTagsByLocale(locale, false)).filter(item => !channelTagSet.has(item));
        const tags = [...Array.from(channelTagSet), ...articleTags];
        return success("Success", tags);
    } catch (error) {
        console.error("Error fetching tag suggestions:", error);
        return failure("Internal server error");
    }
}
