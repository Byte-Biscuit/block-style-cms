/**
 * System Configuration Type Definitions
 * 系统配置类型定义 - 运行时配置（存储在 data/config.json）
 * 
 * 注意：与 src/config.ts 的区别
 * - src/config.ts: 环境变量常量（编译时）
 * - system-config.ts: 运行时配置（可动态修改）
 */

/**
 * Authentication Methods Configuration
 * 认证方式配置
 */
export interface AuthenticationMethodsConfig {
    /** Email/Password Authentication */
    emailPassword: {
        enabled: boolean;
        requireEmailVerification: boolean;
    };

    /** Two-Factor Authentication (TOTP) */
    twoFactor: {
        enabled: boolean;
        /** Whether to require all users to enable 2FA */
        required: boolean;
    };

    /** GitHub OAuth (密钥存储在 .env) */
    github: {
        enabled: boolean;
    };

    /** Google OAuth (密钥存储在 .env) */
    google: {
        enabled: boolean;
    };

    /** Passkey (WebAuthn) Authentication */
    passkey: {
        enabled: boolean;
    };
}

/**
 * Access Control Configuration
 * 访问控制配置
 */
export interface AccessControlConfig {
    /** Allowed admin emails (whitelist) */
    allowedEmails: string[];
}

/**
 * Authentication Configuration
 * 认证配置
 */
export interface AuthenticationConfig {
    methods: AuthenticationMethodsConfig;
    accessControl: AccessControlConfig;
}

/**
 * Algolia Search Service Configuration
 * Algolia 搜索服务配置（密钥存储在 .env）
 */
export interface AlgoliaServiceConfig {
    enabled: boolean;
    /** Index name (non-sensitive) */
    indexName?: string;
}

/**
 * Umami Analytics Service Configuration
 * Umami 分析服务配置（密钥存储在 .env）
 */
export interface UmamiServiceConfig {
    enabled: boolean;
}

/**
 * AI Service Configuration
 * AI 服务配置（密钥存储在 .env）
 */
export interface AIServiceConfig {
    enabled: boolean;
    /** AI provider selection */
    provider?: 'openai' | 'gemini';
}

/**
 * Pexels Stock Photos Service Configuration
 * Pexels 图库服务配置（密钥存储在 .env）
 */
export interface PexelsServiceConfig {
    enabled: boolean;
}

/**
 * External Services Configuration
 * 外部服务配置
 */
export interface ServicesConfig {
    algolia: AlgoliaServiceConfig;
    umami: UmamiServiceConfig;
    ai: AIServiceConfig;
    pexels: PexelsServiceConfig;
}

/**
 * Complete System Configuration Structure
 * 完整的系统配置结构
 */
export interface SystemConfig {
    /** System version */
    version: string;

    /** Initialization timestamp */
    initializedAt?: string;

    /** Last updated timestamp */
    updatedAt: string;

    /** Authentication configuration */
    authentication: AuthenticationConfig;

    /** External services configuration */
    services: ServicesConfig;
}

/**
 * Installation Configuration (for initialization wizard)
 * 安装配置（用于初始化向导）
 */
export interface InstallConfig {
    /** Admin account setup */
    admin: {
        email: string;
        password: string;
        confirmPassword: string;
        enableTwoFactor: boolean;
        totpSecret?: string;
        totpToken?: string;
    };

    /** Authentication methods to enable */
    authMethods: {
        emailPassword: boolean;
        twoFactor: boolean;
        github: boolean;
        google: boolean;
        passkey: boolean;
    };

    /** Admin emails whitelist */
    allowedEmails: string[];

    /** Optional services */
    services?: {
        algolia?: boolean;
        umami?: boolean;
        ai?: boolean;
        pexels?: boolean;
    };
}

/**
 * Installation Step Status
 * 安装步骤状态
 */
export enum InstallStep {
    Welcome = 'welcome',
    Environment = 'environment',
    AdminAccount = 'admin-account',
    AuthMethods = 'auth-methods',
    Services = 'services',
    Complete = 'complete',
}

/**
 * Default System Configuration
 * 默认系统配置
 */
export const DEFAULT_SYSTEM_CONFIG: Omit<SystemConfig, 'version' | 'updatedAt'> = {
    authentication: {
        methods: {
            emailPassword: {
                enabled: true,
                requireEmailVerification: false,
            },
            twoFactor: {
                enabled: true,
                required: false,
            },
            github: {
                enabled: true,
            },
            google: {
                enabled: true,
            },
            passkey: {
                enabled: true,
            },
        },
        accessControl: {
            allowedEmails: [],
        },
    },
    services: {
        algolia: {
            enabled: false,
            indexName: 'articles',
        },
        umami: {
            enabled: false,
        },
        ai: {
            enabled: false,
            provider: 'openai',
        },
        pexels: {
            enabled: false,
        },
    },
};
