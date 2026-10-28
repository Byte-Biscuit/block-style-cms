import { failure, success } from "@/lib/response";
import { systemConfigService } from "@/lib/services/system-config-service";
import { withTiming } from "@/lib/with-timing";

/**
 * GET /api/m/giphy/config
 * Returns the Giphy API key to authenticated admins for client-side Giphy calls.
 * Does not proxy Giphy search (ToS: client-side only).
 */
export const GET = withTiming(async () => {
    try {
        const config = await systemConfigService.readConfig();
        const giphy = config?.services?.giphy;

        if (!giphy?.enabled || !giphy.apiKey?.trim()) {
            return failure("Giphy is not configured or not enabled");
        }

        return success("ok", { apiKey: giphy.apiKey.trim() });
    } catch (error) {
        console.error("Giphy config error:", error);
        return failure("Failed to load Giphy configuration");
    }
});
