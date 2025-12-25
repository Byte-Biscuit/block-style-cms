"use server";

import { revalidatePath } from "next/cache";
import { systemConfigService } from "@/lib/services/system-config-service";
import { Result, HttpStatus } from "@/lib/response";
import { AuthFormData } from "@/components/configuration";

/**
 * Server Action: Update Authentication Configuration
 * 更新认证配置
 *
 * Updates GitHub OAuth, Google OAuth, and allowed emails configuration.
 * Note: Email/Password, 2FA, and Passkey settings are preserved but not modified here.
 *
 * @param data - Authentication configuration data (AuthFormData)
 * @returns Result object with status code
 */
export async function updateAuthentication(
    data: AuthFormData
): Promise<Result<AuthFormData>> {
    try {
        // Read current config
        const currentConfig = await systemConfigService.readConfig();

        if (!currentConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message:
                    "Configuration not found. Please complete installation first.",
                payload: {} as AuthFormData,
            };
        }

        // Validate allowed emails
        if (!data.allowedEmails || data.allowedEmails.length === 0) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "At least one admin email is required",
                payload: {} as AuthFormData,
            };
        }

        // Validate GitHub credentials if enabled
        if (data.github.enabled) {
            if (
                !data.github.clientId?.trim() ||
                !data.github.clientSecret?.trim()
            ) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "GitHub Client ID and Client Secret are required when GitHub OAuth is enabled",
                    payload: {} as AuthFormData,
                };
            }
        }

        // Validate Google credentials if enabled
        if (data.google.enabled) {
            if (
                !data.google.clientId?.trim() ||
                !data.google.clientSecret?.trim()
            ) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "Google Client ID and Client Secret are required when Google OAuth is enabled",
                    payload: {} as AuthFormData,
                };
            }
        }

        // Update authentication config
        const updatedConfig = {
            ...currentConfig,
            authentication: {
                ...currentConfig.authentication,
                methods: {
                    // Preserve passkey settings
                    passkey:
                        currentConfig.authentication?.methods?.passkey || {
                            enabled: false,
                        },
                    // Update GitHub OAuth
                    github: {
                        enabled: data.github.enabled,
                        clientId: data.github.clientId || undefined,
                        clientSecret: data.github.clientSecret || undefined,
                    },
                    // Update Google OAuth
                    google: {
                        enabled: data.google.enabled,
                        clientId: data.google.clientId || undefined,
                        clientSecret: data.google.clientSecret || undefined,
                    },
                },
                accessControl: {
                    allowedEmails: data.allowedEmails,
                },
            },
            updatedAt: new Date().toISOString(),
        };

        // Save updated config
        await systemConfigService.writeConfig(updatedConfig);

        // Revalidate settings page and admin pages
        revalidatePath("/m/settings");
        revalidatePath("/m");

        return {
            code: HttpStatus.OK,
            message: "Authentication configuration updated successfully",
            payload: data,
        };
    } catch (error) {
        console.error("Error updating authentication config:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update authentication configuration",
            payload: {} as AuthFormData,
        };
    }
}

/**
 * Server Action: Get Authentication Configuration
 * 获取认证配置
 *
 * @returns Result object with authentication configuration
 */
export async function getAuthentication(): Promise<Result<AuthFormData>> {
    try {
        const config = await systemConfigService.readConfig();

        if (!config?.authentication) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Authentication configuration not found",
                payload: {} as AuthFormData,
            };
        }

        const authConfig: AuthFormData = {
            github: {
                enabled: config.authentication.methods.github?.enabled || false,
                clientId: config.authentication.methods.github?.clientId || "",
                clientSecret:
                    config.authentication.methods.github?.clientSecret || "",
            },
            google: {
                enabled: config.authentication.methods.google?.enabled || false,
                clientId: config.authentication.methods.google?.clientId || "",
                clientSecret:
                    config.authentication.methods.google?.clientSecret || "",
            },
            allowedEmails:
                config.authentication.accessControl?.allowedEmails || [],
        };

        return {
            code: HttpStatus.OK,
            message: "Authentication configuration retrieved successfully",
            payload: authConfig,
        };
    } catch (error) {
        console.error("Error getting authentication config:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve authentication configuration",
            payload: {} as AuthFormData,
        };
    }
}
