"use server";

import { revalidatePath } from "next/cache";
import { SiteInfoConfig } from "@/types/system-config";
import { systemConfigService } from "@/lib/services/system-config-service";
import { Result, HttpStatus } from "@/lib/response";

/**
 * Server Action: Update Site Information
 * 更新网站基本信息
 * 
 * @param data - Site information configuration
 * @returns Result object with status code
 */
export async function updateSiteInfo(data: SiteInfoConfig): Promise<Result<SiteInfoConfig>> {
    try {
        // Read current config
        const currentConfig = await systemConfigService.readConfig();
        
        if (!currentConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Configuration not found. Please complete installation first.",
                payload: {} as SiteInfoConfig,
            };
        }

        // Update site info
        const updatedConfig = {
            ...currentConfig,
            siteInfo: data,
            updatedAt: new Date().toISOString(),
        };

        // Save updated config
        await systemConfigService.writeConfig(updatedConfig);

        // Revalidate settings page and other relevant paths
        revalidatePath("/m/settings");
        revalidatePath("/");

        return {
            code: HttpStatus.OK,
            message: "Site information updated successfully",
            payload: data,
        };
    } catch (error) {
        console.error("Error updating site info:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error instanceof Error ? error.message : "Failed to update site information",
            payload: {} as SiteInfoConfig,
        };
    }
}

/**
 * Server Action: Get Site Information
 * 获取网站基本信息
 * 
 * @returns Result object with site information
 */
export async function getSiteInfo(): Promise<Result<SiteInfoConfig>> {
    try {
        const config = await systemConfigService.readConfig();
        const siteInfo = config?.siteInfo;
        
        if (!siteInfo) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Site information not found",
                payload: {} as SiteInfoConfig,
            };
        }
        
        return {
            code: HttpStatus.OK,
            message: "Site information retrieved successfully",
            payload: siteInfo,
        };
    } catch (error) {
        console.error("Error getting site info:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve site information",
            payload: {} as SiteInfoConfig,
        };
    }
}
