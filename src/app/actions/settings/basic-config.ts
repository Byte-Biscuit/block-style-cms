"use server";

import { revalidatePath } from "next/cache";
import { BasicConfig } from "@/types/system-config";
import { systemConfigService } from "@/lib/services/system-config-service";
import { Result, HttpStatus } from "@/lib/response";
import { withAuth } from "@/lib/auth/permissions";

/**
 * Server Action: Update Basic Configuration
 * 
 * @param data - Basic configuration
 * @returns Result object with status code
 */
export const updateBasicConfig = withAuth(async (data: BasicConfig): Promise<Result<BasicConfig>> => {
    try {
        // Read current config
        const currentConfig = await systemConfigService.readConfig();

        if (!currentConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Configuration not found. Please complete installation first.",
                payload: {} as BasicConfig,
            };
        }

        // Update basic config
        const updatedConfig = {
            ...currentConfig,
            basic: data,
            updatedAt: new Date().toISOString(),
        };

        // Save updated config
        await systemConfigService.writeConfig(updatedConfig);

        // Revalidate settings page and other relevant paths
        revalidatePath("/m/settings");
        revalidatePath("/");

        return {
            code: HttpStatus.OK,
            message: "Basic configuration updated successfully",
            payload: data,
        };
    } catch (error) {
        console.error("Error updating basic config:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error instanceof Error ? error.message : "Failed to update basic configuration",
            payload: {} as BasicConfig,
        };
    }
});

/**
 * Server Action: Get Basic Configuration
 * 
 * @returns Result object with basic configuration
 */
export const getBasicConfig = withAuth(async (): Promise<Result<BasicConfig>> => {
    try {
        const config = await systemConfigService.readConfig();
        const basicConfig = config?.basic;

        if (!basicConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Basic configuration not found",
                payload: {} as BasicConfig,
            };
        }

        return {
            code: HttpStatus.OK,
            message: "Basic configuration retrieved successfully",
            payload: basicConfig,
        };
    } catch (error) {
        console.error("Error getting basic config:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve basic configuration",
            payload: {} as BasicConfig,
        };
    }
});
