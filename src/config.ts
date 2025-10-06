/**
 * 应用程序配置管理
 * 统一管理所有环境变量和配置项
 */

import path from 'path';

// 判断是否在服务端环境
const isServer = typeof window === 'undefined';

// ================================
// 服务端专用配置
// ================================
let META_DIR: string;
let ARTICLE_DIR: string;
let IMAGE_DIR: string;
let VIDEO_DIR: string;
let VIDEO_THUMBNAIL_DIR: string;
let AUDIO_DIR: string;
let FILE_DIR: string;

const APPLICATION_DATA_PATH = process.env.APPLICATION_DATA_PATH;
if (isServer) {
    if (!APPLICATION_DATA_PATH) {
        console.error('❌ 缺少必需的环境变量: APPLICATION_DATA_PATH');
        console.error('请在 .env.local 文件中设置: APPLICATION_DATA_PATH=your_data_path');
        process.exit(1);
    }

    // 服务端文件系统路径配置
    META_DIR = path.join(APPLICATION_DATA_PATH, 'meta');

    ARTICLE_DIR = path.join(APPLICATION_DATA_PATH, 'articles');

    IMAGE_DIR = path.join(APPLICATION_DATA_PATH, 'images');

    VIDEO_DIR = path.join(APPLICATION_DATA_PATH, 'videos');
    VIDEO_THUMBNAIL_DIR = path.join(VIDEO_DIR, 'thumbnails');

    AUDIO_DIR = path.join(APPLICATION_DATA_PATH, 'audios');

    FILE_DIR = path.join(APPLICATION_DATA_PATH, 'files');
} else {
    // 客户端环境下的默认值（不会被使用，但避免编译错误）
    ARTICLE_DIR = '';
    META_DIR = '';
    IMAGE_DIR = '';
    VIDEO_DIR = '';
    VIDEO_THUMBNAIL_DIR = '';
    AUDIO_DIR = '';
    FILE_DIR = '';
}

// 导出服务端配置
export {
    APPLICATION_DATA_PATH,
    ARTICLE_DIR,
    META_DIR,
    IMAGE_DIR,
    VIDEO_DIR,
    VIDEO_THUMBNAIL_DIR,
    AUDIO_DIR,
    FILE_DIR,
};

//Version
export const VERSION = '0.0.1';

// ================================
// 通用配置 - 服务端和客户端都可以使用
// ================================
export const ADMIN_PAGE_PREFIX = "/m";
export const ADMIN_API_PREFIX = "/api/m";

// ================================
// 客户端可用的环境变量 (NEXT_PUBLIC_)
// ================================
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:3000/images';
export const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_BASE_URL || 'http://localhost:3000/videos';
export const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_BASE_URL || 'http://localhost:3000/audios';
export const FILE_BASE_URL = process.env.NEXT_PUBLIC_FILE_BASE_URL || 'http://localhost:3000/files';

// ================================
// 文件类型和大小限制配置
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

// 文件大小限制
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * 常用文件扩展名常量
 */
export const FILE_EXTENSIONS = {
    IMAGES: new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']),
    AUDIO: new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm']),
    VIDEO: new Set(['.mp4', '.avi', '.mov', '.wmv', '.webm']),
    FILES: new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip', '.rar', '.7z', '.tar', '.gz']),
} as const;

// ================================
// 类型定义
// ================================
export type AllowedImageMimeType = typeof ALLOWED_IMAGE_MIME_TYPES[number];
export type AllowedVideoMimeType = typeof ALLOWED_VIDEO_MIME_TYPES[number];
export type AllowedAudioMimeType = typeof ALLOWED_AUDIO_MIME_TYPES[number];

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
// Better Auth allowed emails
export const BETTER_AUTH_ALLOWED_EMAILS = (process.env.BETTER_AUTH_ALLOWED_EMAILS || "").split(",").map(email => email.trim().toLowerCase()).filter(email => email.length > 0);





