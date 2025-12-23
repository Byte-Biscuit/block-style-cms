/**
 * System Configuration Service
 * 系统配置服务 - 管理 data/settings.json'
 * 
 * 功能：
 * - 检查应用是否已初始化
 * - 读取/写入系统配置
 * - 更新认证和服务配置
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import { SystemConfig, DEFAULT_SYSTEM_CONFIG } from '@/types/system-config';
import { VERSION } from '@/settings';

class SystemConfigService {
    private readonly configFileName = 'settings.json';
    private readonly configFilePath = process.env.CMS_DATA_PATH;
    private _cachedConfig: SystemConfig | null = null;

    /**
     * Get the full path to settings.json
     * 获取配置文件完整路径
     */
    public getConfigPath(): string {
        if (!this.configFilePath) {
            throw new Error('CMS_DATA_PATH environment variable is not set');
        }
        const normalizedPath = this.configFilePath.endsWith('/') ? this.configFilePath : `${this.configFilePath}/`;
        return `${normalizedPath}${this.configFileName}`;
    }

    /**
     * Check if the application has been initialized
     * 
     * @returns true if initialized, false otherwise
     */
    public async isInitialized(): Promise<boolean> {
        try {
            const config = await this.readConfig();
            return !!(config && config.initializedAt);
        } catch (error) {
            console.error('Error checking initialization status:', error);
            return false;
        }
    }

    /**
     * Read configuration from settings.json
     * 读取配置文件
     * 
     * @returns System configuration object or null if file doesn't exist
     */
    public async readConfig(): Promise<SystemConfig | null> {
        if (this._cachedConfig) {
            return this._cachedConfig;
        }

        try {
            const configPath = this.getConfigPath();

            // Check if file exists first
            if (!fsSync.existsSync(configPath)) {
                return null;
            }

            const content = await fs.readFile(configPath, 'utf-8');
            this._cachedConfig = JSON.parse(content) as SystemConfig;
            return this._cachedConfig;
        } catch (error) {
            console.error('Error reading settings.json:', error);
            return null;
        }
    }

    /**
     * Write configuration to settings.json
     * 写入配置文件
     * 
     * @param config - System configuration to write
     */
    public async writeConfig(config: SystemConfig): Promise<void> {
        try {
            const configPath = this.getConfigPath();

            // Write config with pretty formatting
            await fs.writeFile(
                configPath,
                JSON.stringify(config, null, 4),
                'utf-8'
            );

            // Update cache
            this._cachedConfig = config;

            console.log('✅ System configuration saved to:', configPath);
        } catch (error) {
            console.error('Error writing settings.json:', error);
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
    public async initializeConfig(
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

        await this.writeConfig(config);
        return config;
    }

    /**
     * Update partial configuration
     * 更新部分配置
     * 
     * @param updates - Partial configuration updates
     * @returns Updated configuration
     */
    public async updateConfig(
        updates: Partial<SystemConfig>
    ): Promise<SystemConfig> {
        const currentConfig = await this.readConfig();
        if (!currentConfig) {
            throw new Error('Cannot update configuration: settings.json not found');
        }

        const updatedConfig: SystemConfig = {
            ...currentConfig,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await this.writeConfig(updatedConfig);
        return updatedConfig;
    }

    /**
     * Update authentication configuration
     * 更新认证配置
     * 
     * @param authConfig - Partial authentication configuration
     * @returns Updated configuration
     */
    public async updateAuthConfig(
        authConfig: Partial<SystemConfig['authentication']>
    ): Promise<SystemConfig> {
        const currentConfig = await this.readConfig();
        if (!currentConfig) {
            throw new Error('Cannot update auth configuration: settings.json not found');
        }

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

        await this.writeConfig(updatedConfig);
        return updatedConfig;
    }

    /**
     * Read configuration from settings.json (Synchronous)
     * 同步读取配置文件
     * 
     * @returns System configuration object or null if file doesn't exist
     */
    public readConfigSync(): SystemConfig | null {
        if (this._cachedConfig) {
            return this._cachedConfig;
        }

        try {
            const configPath = this.getConfigPath();
            if (!fsSync.existsSync(configPath)) {
                return null;
            }
            const content = fsSync.readFileSync(configPath, 'utf-8');
            this._cachedConfig = JSON.parse(content) as SystemConfig;
            return this._cachedConfig;
        } catch (error) {
            console.error('Error reading settings.json (sync):', error);
            return null;
        }
    }

    public getAllowedEmails(): string[] {
        const config = this.readConfigSync();
        return config?.authentication.accessControl.allowedEmails || [];
    }
}

export const systemConfigService = new SystemConfigService();

