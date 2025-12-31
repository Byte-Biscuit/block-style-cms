"use server";

import { revalidatePath } from "next/cache";
import { systemConfigService } from "@/lib/services/system-config-service";
import { Result, HttpStatus } from "@/lib/response";
import { ChannelConfig } from "@/types/system-config";

/**
 * Server Action: Update Channel Configuration
 * 更新频道配置
 *
 * Updates the channel navigation configuration in settings.json.
 *
 * @param data - Channel configuration data (ChannelConfig)
 * @returns Result object with status code
 */
export async function updateChannel(
    data: ChannelConfig
): Promise<Result<ChannelConfig>> {
    try {
        // Read current config
        const currentConfig = await systemConfigService.readConfig();

        if (!currentConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message:
                    "Configuration not found. Please complete installation first.",
                payload: [],
            };
        }

        // Validate data
        if (!Array.isArray(data)) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Invalid channel data format",
                payload: [],
            };
        }

        // Validate each channel item
        const usedIds = new Set<string>();
        for (const channel of data) {
            // Validate ID
            if (!channel.id?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: "Channel ID is required",
                    payload: [],
                };
            }

            // Check for duplicate IDs
            if (usedIds.has(channel.id)) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: `Duplicate channel ID: ${channel.id}`,
                    payload: [],
                };
            }
            usedIds.add(channel.id);

            // Validate type
            if (!["tag", "page"].includes(channel.type)) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: `Invalid channel type: ${channel.type}. Must be "tag" or "page"`,
                    payload: [],
                };
            }

            // Validate href
            if (!channel.href?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: `Channel ${channel.id}: href is required`,
                    payload: [],
                };
            }

            // Validate tag for type=tag
            if (channel.type === "tag" && !channel.tag?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: `Channel ${channel.id}: tag is required for type "tag"`,
                    payload: [],
                };
            }
        }

        // Update channel config in settings.json
        await systemConfigService.updateConfig({
            channel: data,
        });

        // Revalidate relevant pages
        revalidatePath("/", "layout");
        revalidatePath("/[locale]", "layout");

        return {
            code: HttpStatus.OK,
            message: "Channel configuration updated successfully",
            payload: data,
        };
    } catch (error) {
        console.error("Failed to update channel configuration:", error);

        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update channel configuration",
            payload: [],
        };
    }
}

/**
 * Server Action: Get Channel Configuration
 * 获取频道配置
 *
 * Reads the current channel configuration from settings.json.
 *
 * @returns Result object with channel configuration
 */
export async function getChannel(): Promise<Result<ChannelConfig>> {
    try {
        // Read current config
        const currentConfig = await systemConfigService.readConfig();

        if (!currentConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Configuration not found",
                payload: [],
            };
        }

        // Return channel configuration (or empty array if not set)
        const channels = currentConfig.channel || [];

        return {
            code: HttpStatus.OK,
            message: "Channel configuration retrieved successfully",
            payload: channels,
        };
    } catch (error) {
        console.error("Failed to read channel configuration:", error);

        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to read channel configuration",
            payload: [],
        };
    }
}
