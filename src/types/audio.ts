/**
 * 音频上传选项
 */
export interface AudioUploadOptions {
    originalName?: string;
    title?: string;
}

/**
 * 音频元信息
 */
export interface AudioMetaInfo {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    format: string;
    title?: string;
    duration?: number; // 音频时长（秒）
}

/**
 * 音频列表查询选项
 */
export interface AudioListOptions {
    page?: number;
    limit?: number;
    sortBy?: 'uploadedAt' | 'size' | 'filename' | 'duration';
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
}

/**
 * 音频列表结果
 */
export interface AudioListResult {
    audios: AudioMetaInfo[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * 音频播放器配置
 */
export interface AudioPlayerConfig {
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    volume?: number;
}
