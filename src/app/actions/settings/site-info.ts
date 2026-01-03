"use server";

import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';
import { SiteInfoConfig } from "@/types/system-config";
import { systemConfigService } from "@/lib/services/system-config-service";
import { Result, HttpStatus } from "@/lib/response";
import { withAuth } from "@/lib/auth/permissions";
import { CMS_DATA_PATH } from "@/settings";

/**
 * Server Action: Update Site Information
 * 
 * @param data - Site information configuration
 * @returns Result object with status code
 */
export const updateSiteInfo = withAuth(async (data: SiteInfoConfig): Promise<Result<SiteInfoConfig>> => {
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
});

/**
 * Server Action: Get Site Information
 * 
 * @returns Result object with site information
 */
export const getSiteInfo = withAuth(async (): Promise<Result<SiteInfoConfig>> => {
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
});

/**
 * Server Action: Upload Site Logo
 * 上传网站 Logo
 * 
 * @param formData - Form data containing the logo file
 * @returns Result object with logo URL
 */
export const uploadLogo = withAuth(async (formData: FormData): Promise<Result<string>> => {
    try {
        const file = formData.get('logo') as File;
        if (!file) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "No file uploaded",
                payload: "",
            };
        }

        // Validate file type
        if (file.type !== 'image/png') {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Only PNG files are allowed",
                payload: "",
            };
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure data directory exists
        const dataDir = CMS_DATA_PATH || 'data';
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }

        // Save logo.png
        const logoPath = path.join(dataDir, 'logo.png');
        await fs.writeFile(logoPath, buffer);

        // Revalidate layout to refresh logo
        revalidatePath("/", "layout");

        return {
            code: HttpStatus.OK,
            message: "Logo uploaded successfully",
            payload: `/api/logo?t=${Date.now()}`, // Add timestamp to bust cache
        };
    } catch (error) {
        console.error("Error uploading logo:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to upload logo",
            payload: "",
        };
    }
});
