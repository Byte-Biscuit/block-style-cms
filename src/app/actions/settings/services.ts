"use server";

import { revalidatePath } from "next/cache";
import { systemConfigService } from "@/lib/services/system-config-service";
import { Result, HttpStatus } from "@/lib/response";
import { ServicesFormData } from "@/components/configuration";

/**
 * Server Action: Update External Services Configuration
 * 更新外部服务配置
 *
 * Updates Algolia, Umami, AI, and Pexels service configurations.
 *
 * @param data - Services configuration data (ServicesFormData)
 * @returns Result object with status code
 */
export async function updateServices(
    data: ServicesFormData
): Promise<Result<ServicesFormData>> {
    try {
        // Read current config
        const currentConfig = await systemConfigService.readConfig();

        if (!currentConfig) {
            return {
                code: HttpStatus.NOT_FOUND,
                message:
                    "Configuration not found. Please complete installation first.",
                payload: {} as ServicesFormData,
            };
        }

        // Validate Algolia if enabled
        if (data.algolia.enabled) {
            if (!data.algolia.appId?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: "Algolia App ID is required when Algolia is enabled",
                    payload: {} as ServicesFormData,
                };
            }
            if (!data.algolia.apiKey?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "Algolia Admin API Key is required when Algolia is enabled",
                    payload: {} as ServicesFormData,
                };
            }
            if (!data.algolia.searchKey?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "Algolia Search API Key is required when Algolia is enabled",
                    payload: {} as ServicesFormData,
                };
            }
        }

        // Validate Umami if enabled
        if (data.umami.enabled) {
            if (!data.umami.websiteId?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "Umami Website ID is required when Umami is enabled",
                    payload: {} as ServicesFormData,
                };
            }
            if (!data.umami.src?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "Umami Script Source is required when Umami is enabled",
                    payload: {} as ServicesFormData,
                };
            }
        }

        // Validate AI services if enabled
        if (data.ai.enabled) {
            if (data.ai.provider === "openai") {
                if (!data.ai.openai.apiKey?.trim()) {
                    return {
                        code: HttpStatus.BAD_REQUEST,
                        message:
                            "OpenAI API Key is required when AI service is enabled with OpenAI provider",
                        payload: {} as ServicesFormData,
                    };
                }
            } else if (data.ai.provider === "gemini") {
                if (!data.ai.gemini.apiKey?.trim()) {
                    return {
                        code: HttpStatus.BAD_REQUEST,
                        message:
                            "Gemini API Key is required when AI service is enabled with Gemini provider",
                        payload: {} as ServicesFormData,
                    };
                }
            }
        }

        // Validate Pexels if enabled
        if (data.pexels.enabled) {
            if (!data.pexels.apiKey?.trim()) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message:
                        "Pexels API Key is required when Pexels is enabled",
                    payload: {} as ServicesFormData,
                };
            }
        }

        // Update services config
        const updatedConfig = {
            ...currentConfig,
            services: {
                algolia: {
                    enabled: data.algolia.enabled,
                    appId: data.algolia.appId || undefined,
                    apiKey: data.algolia.apiKey || undefined,
                    searchKey: data.algolia.searchKey || undefined,
                    indexName: data.algolia.indexName || "articles",
                },
                umami: {
                    enabled: data.umami.enabled,
                    websiteId: data.umami.websiteId || undefined,
                    src:
                        data.umami.src ||
                        "https://cloud.umami.is/script.js",
                },
                ai: {
                    enabled: data.ai.enabled,
                    provider: data.ai.provider,
                    openai: {
                        apiKey: data.ai.openai.apiKey || undefined,
                        baseUrl:
                            data.ai.openai.baseUrl ||
                            "https://api.openai.com/v1",
                        model: data.ai.openai.model || "gpt-4o-mini",
                    },
                    gemini: {
                        apiKey: data.ai.gemini.apiKey || undefined,
                        baseUrl:
                            data.ai.gemini.baseUrl ||
                            "https://generativelanguage.googleapis.com/v1beta",
                        model: data.ai.gemini.model || "gemini-2.0-flash",
                    },
                },
                pexels: {
                    enabled: data.pexels.enabled,
                    apiKey: data.pexels.apiKey || undefined,
                },
            },
            updatedAt: new Date().toISOString(),
        };

        // Save updated config
        await systemConfigService.writeConfig(updatedConfig);

        // Revalidate settings page and relevant paths
        revalidatePath("/m/settings");
        revalidatePath("/");

        return {
            code: HttpStatus.OK,
            message: "Services configuration updated successfully",
            payload: data,
        };
    } catch (error) {
        console.error("Error updating services config:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update services configuration",
            payload: {} as ServicesFormData,
        };
    }
}

/**
 * Server Action: Get External Services Configuration
 * 获取外部服务配置
 *
 * @returns Result object with services configuration
 */
export async function getServices(): Promise<Result<ServicesFormData>> {
    try {
        const config = await systemConfigService.readConfig();

        if (!config?.services) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "Services configuration not found",
                payload: {} as ServicesFormData,
            };
        }

        const servicesConfig: ServicesFormData = {
            algolia: {
                enabled: config.services.algolia?.enabled || false,
                appId: config.services.algolia?.appId || "",
                apiKey: config.services.algolia?.apiKey || "",
                searchKey: config.services.algolia?.searchKey || "",
                indexName: config.services.algolia?.indexName || "articles",
            },
            umami: {
                enabled: config.services.umami?.enabled || false,
                websiteId: config.services.umami?.websiteId || "",
                src:
                    config.services.umami?.src ||
                    "https://cloud.umami.is/script.js",
            },
            ai: {
                enabled: config.services.ai?.enabled || false,
                provider: config.services.ai?.provider || "openai",
                openai: {
                    apiKey: config.services.ai?.openai?.apiKey || "",
                    baseUrl:
                        config.services.ai?.openai?.baseUrl ||
                        "https://api.openai.com/v1",
                    model: config.services.ai?.openai?.model || "gpt-4o-mini",
                },
                gemini: {
                    apiKey: config.services.ai?.gemini?.apiKey || "",
                    baseUrl:
                        config.services.ai?.gemini?.baseUrl ||
                        "https://generativelanguage.googleapis.com/v1beta",
                    model:
                        config.services.ai?.gemini?.model ||
                        "gemini-2.0-flash",
                },
            },
            pexels: {
                enabled: config.services.pexels?.enabled || false,
                apiKey: config.services.pexels?.apiKey || "",
            },
        };

        return {
            code: HttpStatus.OK,
            message: "Services configuration retrieved successfully",
            payload: servicesConfig,
        };
    } catch (error) {
        console.error("Error getting services config:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve services configuration",
            payload: {} as ServicesFormData,
        };
    }
}
