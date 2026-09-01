"use server";

import { systemConfigService } from "@/lib/services/system-config-service";
import {
    DEFAULT_EXPORT_MARK,
    type ExportMarkConfig,
} from "@/types/system-config";

/** Public read for article-page PNG export (no auth). */
export async function getExportMark(): Promise<ExportMarkConfig> {
    const config = await systemConfigService.readConfig();
    const mark = config?.basic?.other?.exportMark;
    return {
        text: mark?.text ?? DEFAULT_EXPORT_MARK.text,
        uppercase: mark?.uppercase ?? DEFAULT_EXPORT_MARK.uppercase,
    };
}
