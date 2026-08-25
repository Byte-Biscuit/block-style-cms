import { failure, success } from "@/lib/response";
import { systemConfigService } from "@/lib/services/system-config-service";

/**
 * GET /api/m/channels
 * Site channel (栏目) definitions from settings.json.
 */
export async function GET() {
    try {
        const channels = await systemConfigService.getChannels();
        return success("Success", channels);
    } catch (error) {
        console.error("Error fetching channels:", error);
        return failure("Internal server error");
    }
}
