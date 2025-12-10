/**
 * System Configuration Service
 * 系统配置服务 - 管理 data/config.json
 * 
 * 功能：
 * - 检查应用是否已初始化
 * - 读取/写入系统配置
 * - 更新认证和服务配置
 */

import fs from 'fs/promises';
import * as fsSync from 'fs';
import path from 'path';
import { SystemConfig, DEFAULT_SYSTEM_CONFIG } from '@/types/system-config';
import { VERSION } from '@/config';

const CONFIG_FILE_NAME = 'config.json';

/**
 * Get the full path to config.json
 * 获取配置文件完整路径
 */
export function getConfigPath(): string {
    const dataPath = process.env.CMS_DATA_PATH;
    if (!dataPath) {
        throw new Error('CMS_DATA_PATH environment variable is not set');
    }
    return path.join(dataPath, CONFIG_FILE_NAME);
}

/**
 * Check if the application has been initialized
 * 检查应用是否已初始化
 * 
 * @returns true if initialized, false otherwise
 */
export async function isInitialized(): Promise<boolean> {
    try {
        const configPath = getConfigPath();

        // Check if config file exists
        const configExists = await fs.access(configPath)
            .then(() => true)
            .catch(() => false);

        if (!configExists) {
            return false;
        }

        // Check if initializedAt field exists
        const config = await readConfig();
        return !!config.initializedAt;
    } catch (error) {
        console.error('Error checking initialization status:', error);
        return false;
    }
}

/**
 * Check if config.json exists (synchronous version for middleware)
 * 同步检查配置文件是否存在（用于 middleware）
 */
export function isInitializedSync(): boolean {
    try {
        const dataPath = process.env.CMS_DATA_PATH;
        if (!dataPath) {
            console.warn('CMS_DATA_PATH not set, skipping initialization check');
            return true; // Skip check if env var not set
        }

        const configPath = path.join(dataPath, CONFIG_FILE_NAME);
        if (!fsSync.existsSync(configPath)) {
            return false;
        }

        const configContent = fsSync.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);

        return !!config.initializedAt;
    } catch (error) {
        console.error('Error checking initialization status (sync):', error);
        return false;
    }
}

/**
 * Read configuration from config.json
 * 读取配置文件
 * 
 * @returns System configuration object
 * @throws Error if config file cannot be read
 */
export async function readConfig(): Promise<SystemConfig> {
    try {
        const configPath = getConfigPath();
        const content = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(content) as SystemConfig;
        return config;
    } catch (error) {
        console.error('Error reading config.json:', error);
        throw new Error('Failed to read configuration file');
    }
}

/**
 * Write configuration to config.json
 * 写入配置文件
 * 
 * @param config - System configuration to write
 * @throws Error if config file cannot be written
 */
export async function writeConfig(config: SystemConfig): Promise<void> {
    try {
        const configPath = getConfigPath();
        const configDir = path.dirname(configPath);

        // Ensure directory exists
        await fs.mkdir(configDir, { recursive: true });

        // Write config with pretty formatting
        await fs.writeFile(
            configPath,
            JSON.stringify(config, null, 4),
            'utf-8'
        );

        console.log('✅ System configuration saved to:', configPath);
    } catch (error) {
        console.error('Error writing config.json:', error);
        throw new Error('Failed to write configuration file');
    }
}

/**
 * Initialize configuration with default values
 * 使用默认值初始化配置
 * 
 * @param customConfig - Optional custom configuration to override defaults
 * @returns Initialized configuration
 */
export async function initializeConfig(
    customConfig?: Partial<SystemConfig>
): Promise<SystemConfig> {
    const now = new Date().toISOString();

    const config: SystemConfig = {
        ...DEFAULT_SYSTEM_CONFIG,
        ...customConfig,
        version: VERSION,
        initializedAt: now,
        updatedAt: now,
    };

    await writeConfig(config);
    return config;
}

/**
 * Update partial configuration
 * 更新部分配置
 * 
 * @param updates - Partial configuration updates
 * @returns Updated configuration
 */
export async function updateConfig(
    updates: Partial<SystemConfig>
): Promise<SystemConfig> {
    const currentConfig = await readConfig();

    const updatedConfig: SystemConfig = {
        ...currentConfig,
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    await writeConfig(updatedConfig);
    return updatedConfig;
}

/**
 * Update authentication configuration
 * 更新认证配置
 * 
 * @param authConfig - Partial authentication configuration
 * @returns Updated configuration
 */
export async function updateAuthConfig(
    authConfig: Partial<SystemConfig['authentication']>
): Promise<SystemConfig> {
    const currentConfig = await readConfig();

    const updatedConfig: SystemConfig = {
        ...currentConfig,
        authentication: {
            ...currentConfig.authentication,
            ...authConfig,
            methods: {
                ...currentConfig.authentication.methods,
                ...authConfig.methods,
            },
            accessControl: {
                ...currentConfig.authentication.accessControl,
                ...authConfig.accessControl,
            },
        },
        updatedAt: new Date().toISOString(),
    };

    await writeConfig(updatedConfig);
    return updatedConfig;
}

/**
 * Update services configuration
 * 更新服务配置
 * 
 * @param servicesConfig - Partial services configuration
 * @returns Updated configuration
 */
export async function updateServicesConfig(
    servicesConfig: Partial<SystemConfig['services']>
): Promise<SystemConfig> {
    const currentConfig = await readConfig();

    const updatedConfig: SystemConfig = {
        ...currentConfig,
        services: {
            ...currentConfig.services,
            ...servicesConfig,
            algolia: {
                ...currentConfig.services.algolia,
                ...servicesConfig.algolia,
            },
            umami: {
                ...currentConfig.services.umami,
                ...servicesConfig.umami,
            },
            ai: {
                ...currentConfig.services.ai,
                ...servicesConfig.ai,
            },
            pexels: {
                ...currentConfig.services.pexels,
                ...servicesConfig.pexels,
            },
        },
        updatedAt: new Date().toISOString(),
    };

    await writeConfig(updatedConfig);
    return updatedConfig;
}

/**
 * Check if OAuth provider is configured in environment variables
 * 检查 OAuth 提供商是否在环境变量中配置
 * 
 * @param provider - OAuth provider name
 * @returns true if configured, false otherwise
 */
export function isOAuthProviderConfigured(provider: 'github' | 'google'): boolean {
    if (provider === 'github') {
        return !!(
            process.env.BETTER_AUTH_GITHUB_CLIENT_ID &&
            process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET
        );
    }

    if (provider === 'google') {
        return !!(
            process.env.BETTER_AUTH_GOOGLE_CLIENT_ID &&
            process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
        );
    }

    return false;
}

/**
 * Get OAuth configuration status for all providers
 * 获取所有 OAuth 提供商的配置状态
 * 
 * @returns Object with provider configuration status
 */
export function getOAuthConfigStatus() {
    return {
        github: {
            configured: isOAuthProviderConfigured('github'),
            hasClientId: !!process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
            hasClientSecret: !!process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
        },
        google: {
            configured: isOAuthProviderConfigured('google'),
            hasClientId: !!process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
            hasClientSecret: !!process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
        },
    };
}

/**
 * Check if external service API keys are configured
 * 检查外部服务 API 密钥是否配置
 */
export function getServicesConfigStatus() {
    return {
        algolia: {
            configured: !!(
                process.env.NEXT_PUBLIC_ALGOLIA_APP_ID &&
                process.env.ALGOLIA_ADMIN_API_KEY &&
                process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
            ),
            hasAppId: !!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
            hasAdminKey: !!process.env.ALGOLIA_ADMIN_API_KEY,
            hasSearchKey: !!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
        },
        umami: {
            configured: !!(
                process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID &&
                process.env.NEXT_PUBLIC_UMAMI_SRC
            ),
            hasWebsiteId: !!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
            hasSrc: !!process.env.NEXT_PUBLIC_UMAMI_SRC,
        },
        ai: {
            openai: {
                configured: !!process.env.OPENAI_API_KEY,
                hasApiKey: !!process.env.OPENAI_API_KEY,
            },
            gemini: {
                configured: !!process.env.GEMINI_API_KEY,
                hasApiKey: !!process.env.GEMINI_API_KEY,
            },
        },
        pexels: {
            configured: !!process.env.PEXELS_API_KEY,
            hasApiKey: !!process.env.PEXELS_API_KEY,
        },
    };
}
