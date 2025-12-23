/**
 * Application Configuration Management
 * Server-side Only Configuration
 * Centralized management of all environment variables and configuration items
 */
import pkg from "../package.json"

//Version
export const VERSION = pkg.version;

/**
 * Server-side Only Configuration
 * These variables are only available on the server.
 * On the client, they will be undefined or empty strings.
 */
export const CMS_DATA_PATH = process.env.CMS_DATA_PATH;

// Helper to join paths safely without requiring Node.js 'path' module at top level
// This ensures the file is safe for both server and client environments.
const normalizePath = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '');
const BASE_DATA_PATH = CMS_DATA_PATH ? normalizePath(CMS_DATA_PATH) : '';

// Server-side file system path configuration
export const META_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/meta` : '';

export const ARTICLE_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/articles` : '';

export const IMAGE_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/images` : '';

export const VIDEO_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/videos` : '';
export const VIDEO_THUMBNAIL_DIR = VIDEO_DIR ? `${VIDEO_DIR}/thumbnails` : '';

export const AUDIO_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/audios` : '';

export const FILE_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/files` : '';

export const COMMENT_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/comments` : '';

export const SUGGESTION_DIR = BASE_DATA_PATH ? `${BASE_DATA_PATH}/suggestions` : '';

// ================================
// Common Configuration - Available for both server and client
// ================================
export const ADMIN_PAGE_PREFIX = "/m";
export const ADMIN_API_PREFIX = "/api/m";

// ================================
// Client-accessible Environment Variables (NEXT_PUBLIC_)
// ================================
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:3000/images';
export const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL || 'http://localhost:3000/videos';
export const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_BASE_URL || 'http://localhost:3000/audios';
export const FILE_BASE_URL = process.env.NEXT_PUBLIC_FILE_BASE_URL || 'http://localhost:3000/files';

// ================================
// File Type and Size Limit Configuration
// ================================
export const ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo',
    'video/3gpp',
    'video/x-ms-wmv'
] as const;

export const ALLOWED_AUDIO_MIME_TYPES = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a',
    'audio/flac',
    'audio/x-flac',
    'audio/webm'
] as const;

// File size limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Common file extension constants
 */
export const FILE_EXTENSIONS = {
    IMAGES: new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']),
    AUDIO: new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm']),
    VIDEO: new Set(['.mp4', '.avi', '.mov', '.wmv', '.webm']),
    FILES: new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip', '.rar', '.7z', '.tar', '.gz']),
} as const;

// ================================
// Type Definitions
// ================================
export type AllowedImageMimeType = typeof ALLOWED_IMAGE_MIME_TYPES[number];
export type AllowedVideoMimeType = typeof ALLOWED_VIDEO_MIME_TYPES[number];
export type AllowedAudioMimeType = typeof ALLOWED_AUDIO_MIME_TYPES[number];

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
// ================================
// Comment System Configuration
// ================================
export const COMMENT_CONFIG = {
    /** Comment feature enabled */
    enabled: true,
    /** Maximum total comments limit */
    maxTotalComments: 1000,
    /** Content constraints */
    limits: {
        /** Minimum content length */
        contentMinLength: 10,
        /** Maximum content length */
        contentMaxLength: 1000,
        /** Maximum allowed links in comment */
        maxLinksAllowed: 2,
    },
    /** Moderation settings */
    moderation: {
        /** Require manual approval before publishing */
        requireApproval: true,
    },
} as const;

// ================================
// Suggestion System Configuration
// ================================
export const SUGGESTION_CONFIG = {
    /** Suggestion feature enabled */
    enabled: true,
    /** Maximum total suggestions limit */
    maxTotalSuggestions: 500,
    /** Content constraints */
    limits: {
        /** Minimum content length */
        contentMinLength: 10,
        /** Maximum content length */
        contentMaxLength: 2000,
        /** Maximum allowed links in suggestion */
        maxLinksAllowed: 3,
    },
} as const;




