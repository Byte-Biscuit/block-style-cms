import { localeMap } from "@/i18n/config";
import { failure, success } from "@/lib/response";

/**
 * GET /api/m/locales
 * Site-supported article languages.
 */
export async function GET() {
    try {
        return success("Success", Object.values(localeMap));
    } catch (error) {
        console.error("Error fetching locales:", error);
        return failure("Internal server error");
    }
}
