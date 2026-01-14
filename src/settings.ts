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
