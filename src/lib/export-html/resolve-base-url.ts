import { systemConfigService } from "@/lib/services/system-config-service";

/** Prefer NEXT_PUBLIC_BASE_URL, then siteInfo.baseUrl. Trailing slash stripped. */
export async function resolveExportBaseUrl(explicit?: string): Promise<string> {
    if (explicit?.trim()) {
        return explicit.trim().replace(/\/+$/, "");
    }
    const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    if (fromEnv) {
        return fromEnv.replace(/\/+$/, "");
    }
    const config = await systemConfigService.readConfig();
    return (config?.siteInfo?.baseUrl ?? "").replace(/\/+$/, "");
}

/** Turn /images/... or site-relative paths into absolute https URLs. */
export function absolutizeUrl(src: string, baseUrl: string): string {
    const trimmed = src.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (!baseUrl) return trimmed;
    if (trimmed.startsWith("/")) return `${baseUrl}${trimmed}`;
    return `${baseUrl}/${trimmed}`;
}
