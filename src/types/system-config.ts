/**
 * System Configuration Type Definitions
 * Runtime configuration (stored in CMS_DATA_PATH/settings.json)
 * 
 */

/**
 * Channel Item Configuration
 */
export interface ChannelItem {
    /** Unique channel identifier (also used as i18n key) */
    id: string;
    /** Channel type */
    type: 'tag' | 'page';
    /** Channel link path */
    href: string;
    /** Tag name (only for type="tag") */
    tag?: string;
    /** Optional icon identifier (e.g., icon name, emoji, or custom identifier) */
    icon?: string;
}

/**
 * Channel Configuration
 * Stored in CMS_DATA_PATH/settings.json under channel property
 */
export type ChannelConfig = ChannelItem[];

/**
 * Contact Information Configuration
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
 */
export interface SiteInfoConfig {
    /** Contact information */
    contact: ContactInfo;
}

/**
 * Authentication Methods Configuration
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
 */
export interface AccessControlConfig {
    /** Allowed admin emails (whitelist) */
    allowedEmails: string[];
}

/**
 * Authentication Configuration
 */
export interface AuthenticationConfig {
    methods: AuthenticationMethodsConfig;
    accessControl: AccessControlConfig;
}

/**
 * Algolia Search Service Configuration
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
 */
export interface PexelsServiceConfig {
    enabled: boolean;
    /** Pexels API Key */
    apiKey?: string;
}

/**
 * External Services Configuration
 */
export interface ServicesConfig {
    algolia: AlgoliaServiceConfig;
    umami: UmamiServiceConfig;
    ai: AIServiceConfig;
    pexels: PexelsServiceConfig;
}

/**
 * Comment System Configuration
 */
export interface CommentConfig {
    /** Comment feature enabled */
    enabled: boolean;
    /** Maximum total comments limit */
    maxTotalComments: number;
    /** Content constraints */
    limits: {
        /** Minimum content length */
        contentMinLength: number;
        /** Maximum content length */
        contentMaxLength: number;
        /** Maximum allowed links in comment */
        maxLinksAllowed: number;
    };
    /** Moderation settings */
    moderation: {
        /** Require manual approval before publishing */
        requireApproval: boolean;
    };
}

/**
 * Suggestion System Configuration
 */
export interface SuggestionConfig {
    /** Suggestion feature enabled */
    enabled: boolean;
    /** Maximum total suggestions limit */
    maxTotalSuggestions: number;
    /** Content constraints */
    limits: {
        /** Minimum content length */
        contentMinLength: number;
        /** Maximum content length */
        contentMaxLength: number;
        /** Maximum allowed links in suggestion */
        maxLinksAllowed: number;
    };
}

/**
 * Basic Configuration
 */
export interface BasicConfig {
    /** Comment system configuration */
    comment: CommentConfig;
    /** Suggestion system configuration */
    suggestion: SuggestionConfig;
}

/**
 * Complete System Configuration Structure
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

    /** Channel configuration */
    channel?: ChannelConfig;

    /** Basic configuration */
    basic?: BasicConfig;
}

/**
 * Admin Credentials for Installation
 * Used only during installation process
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
 * 
 * Uses nested structure aligned with ServicesFormData for easier conversion.
 */
export interface InstallServicesConfig {
    algolia: {
        enabled: boolean;
        appId?: string;
        apiKey?: string;
        searchKey?: string;
        indexName?: string;
    };
    umami: {
        enabled: boolean;
        websiteId?: string;
        src?: string;
    };
    ai: {
        enabled: boolean;
        provider: "openai" | "gemini";
        openai: {
            apiKey?: string;
            baseUrl?: string;
            model?: string;
        };
        gemini: {
            apiKey?: string;
            baseUrl?: string;
            model?: string;
        };
    };
    pexels: {
        enabled: boolean;
        apiKey?: string;
    };
}

/**
 * Installation Step Status
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
 */
export const DEFAULT_SYSTEM_CONFIG: Omit<SystemConfig, 'version' | 'updatedAt'> = {
    siteInfo: {
        contact: {
            email: 'biscuit_zhou@outlook.com',
            wechat: '',
            x: '',
            telegram: '',
            discord: '',
            whatsapp: '',
            linkedin: '',
            github: 'https://github.com/Byte-Biscuit/block-style-cms',
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
    basic: {
        comment: {
            enabled: true,
            maxTotalComments: 1000,
            limits: {
                contentMinLength: 10,
                contentMaxLength: 1000,
                maxLinksAllowed: 2,
            },
            moderation: {
                requireApproval: true,
            },
        },
        suggestion: {
            enabled: true,
            maxTotalSuggestions: 500,
            limits: {
                contentMinLength: 10,
                contentMaxLength: 2000,
                maxLinksAllowed: 3,
            },
        },
    },
};
