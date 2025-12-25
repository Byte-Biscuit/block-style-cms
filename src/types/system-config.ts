/**
 * System Configuration Type Definitions
 * 系统配置类型定义 - 运行时配置（存储在 data/settings.json）
 * 
 * 注意：与 src/config.ts 的区别
 * - src/config.ts: 环境变量常量（编译时）
 * - system-config.ts: 运行时配置（可动态修改）
 */

/**
 * Contact Information Configuration
 * 联系方式配置
 */
export interface ContactInfo {
    /** Contact email */
    email?: string;
    /** WeChat ID */
    wechat?: string;
    /** X (Twitter) handle */
    x?: string;
    /** Telegram username */
    telegram?: string;
    /** Discord invite link or username */
    discord?: string;
    /** WhatsApp number */
    whatsapp?: string;
    /** LinkedIn profile URL */
    linkedin?: string;
    /** GitHub username */
    github?: string;
}

/**
 * Website Basic Information Configuration
 * 网站基本信息配置
 */
export interface SiteInfoConfig {
    /** Website title */
    title?: string;
    /** Website description */
    description?: string;
    /** Contact information */
    contact: ContactInfo;
}

/**
 * Authentication Methods Configuration
 * 认证方式配置
 */
export interface AuthenticationMethodsConfig {
    /** GitHub OAuth */
    github: {
        enabled: boolean;
        clientId?: string;
        clientSecret?: string;
    };

    /** Google OAuth */
    google: {
        enabled: boolean;
        clientId?: string;
        clientSecret?: string;
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
 * Algolia 搜索服务配置
 */
export interface AlgoliaServiceConfig {
    enabled: boolean;
    /** Algolia Application ID */
    appId?: string;
    /** Admin API Key (Server-side only) */
    apiKey?: string;
    /** Search-Only API Key (Client-side) */
    searchKey?: string;
    /** Index name */
    indexName?: string;
}

/**
 * Umami Analytics Service Configuration
 * Umami 分析服务配置
 */
export interface UmamiServiceConfig {
    enabled: boolean;
    /** Umami Website ID */
    websiteId?: string;
    /** Umami Script Source URL */
    src?: string;
}

/**
 * AI Provider Configuration
 */
export interface AIProviderConfig {
    /** API Key */
    apiKey?: string;
    /** API Base URL */
    baseUrl?: string;
    /** Model name */
    model?: string;
}

/**
 * AI Service Configuration
 * AI 服务配置
 */
export interface AIServiceConfig {
    enabled: boolean;
    /** AI provider selection */
    provider?: 'openai' | 'gemini';
    /** OpenAI specific configuration */
    openai?: AIProviderConfig;
    /** Gemini specific configuration */
    gemini?: AIProviderConfig;
}

/**
 * Pexels Stock Photos Service Configuration
 * Pexels 图库服务配置
 */
export interface PexelsServiceConfig {
    enabled: boolean;
    /** Pexels API Key */
    apiKey?: string;
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

    /** Website basic information */
    siteInfo: SiteInfoConfig;

    /** Authentication configuration */
    authentication: AuthenticationConfig;

    /** External services configuration */
    services: ServicesConfig;
}

/**
 * Admin Credentials for Installation
 * 管理员凭证（仅用于安装过程）
 */
export interface AdminCredentials {
    /** Admin email */
    email: string;
    /** Admin password */
    password: string;
    /** Admin name (optional) */
    name?: string;
}

/**
 * Authentication Methods Configuration for Installation
 * 安装过程中的认证方式配置
 * 
 * Note: Email/Password and 2FA are enabled by default and not configurable during installation.
 */
export interface InstallAuthMethodsConfig {
    github: boolean;
    githubClientId?: string;
    githubClientSecret?: string;
    google: boolean;
    googleClientId?: string;
    googleClientSecret?: string;
    passkey: boolean;
    allowedEmails: string[];
}

/**
 * Services Configuration for Installation
 * 安装过程中的服务配置
 */
export interface InstallServicesConfig {
    algolia: boolean;
    algoliaAppId?: string;
    algoliaApiKey?: string;
    algoliaSearchKey?: string;
    algoliaIndexName?: string;

    umami: boolean;
    umamiWebsiteId?: string;
    umamiSrc?: string;

    ai: boolean;
    aiProvider: "openai" | "gemini";
    openaiApiKey?: string;
    openaiBaseUrl?: string;
    openaiModel?: string;
    geminiApiKey?: string;
    geminiBaseUrl?: string;
    geminiModel?: string;

    pexels: boolean;
    pexelsApiKey?: string;
}

/**
 * Installation Step Status
 * 安装步骤状态
 */
export enum InstallStep {
    Welcome = 'welcome',
    Environment = 'environment',
    SiteInfo = 'site-info',
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
    siteInfo: {
        title: '',
        description: '',
        contact: {
            email: '',
            wechat: '',
            x: '',
            telegram: '',
            discord: '',
            whatsapp: '',
            linkedin: '',
            github: '',
        },
    },
    authentication: {
        methods: {
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
            appId: '',
            apiKey: '',
            searchKey: '',
            indexName: 'articles',
        },
        umami: {
            enabled: false,
            websiteId: '',
            src: 'https://cloud.umami.is/script.js',
        },
        ai: {
            enabled: false,
            provider: 'openai',
            openai: {
                apiKey: '',
                baseUrl: 'https://api.openai.com/v1',
                model: 'gpt-4o-mini',
            },
            gemini: {
                apiKey: '',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                model: 'gemini-2.0-flash',
            },
        },
        pexels: {
            enabled: false,
            apiKey: '',
        },
    },
};
