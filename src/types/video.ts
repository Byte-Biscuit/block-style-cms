/**
 * 视频上传相关类型定义
 */
export interface VideoUploadOptions {
    /** 原始文件名（用于生成SEO友好的文件名） */
    originalName?: string;
    /** 视频质量 (低质量/中等质量/高质量) */
    quality?: 'low' | 'medium' | 'high';
    /** 最大分辨率 */
    maxResolution?: '480p' | '720p' | '1080p' | 'original';
    /** 是否生成缩略图 */
    generateThumbnail?: boolean;
    /** 缩略图时间点（秒） */
    thumbnailTime?: number;
    /** 是否启用压缩 */
    enableCompression?: boolean;
}

/**
 * 视频服务选项
 */
export interface VideoServeOptions {
    /** 视频质量 */
    q?: 'low' | 'medium' | 'high' | 'original';
    /** 格式 */
    f?: 'mp4' | 'webm';
    /** 开始时间（秒） */
    t?: number;
    /** 持续时间（秒） */
    d?: number;
}

export interface VideoProcessOptions {
    /** 宽度 */
    width?: number;
    /** 高度 */
    height?: number;
    /** 比特率 */
    bitrate?: string;
    /** 帧率 */
    framerate?: number;
    /** 输出格式 */
    format?: 'mp4' | 'webm' | 'avi';
    /** 视频编码器 */
    codec?: 'h264' | 'h265' | 'vp9' | 'av1';
    /** 音频比特率 */
    audioBitrate?: string;
}

export interface VideoMetaInfo {
    /** 文件名 */
    filename: string;
    /** 原始文件名 */
    originalName: string;
    /** 文件大小（字节） */
    size: number;
    /** 视频宽度 */
    width: number;
    /** 视频高度 */
    height: number;
    /** 时长（秒） */
    duration: number;
    /** MIME类型 */
    mimeType: string;
    /** 上传时间 */
    uploadedAt: string;
    /** 视频标题 */
    title?: string;
    /** 视频描述 */
    description?: string;
    /** 视频标签 */
    tags?: string[];
    /** 缩略图文件名 */
    thumbnail?: string;
    /** 视频比特率 */
    bitrate?: number;
    /** 帧率 */
    framerate?: number;
    /** 编码格式 */
    codec?: string;
    /** 是否已处理 */
    processed?: boolean;
    /** 处理后的文件列表（不同质量/格式） */
    variants?: VideoVariant[];
}

export interface VideoVariant {
    /** 变体文件名 */
    filename: string;
    /** 质量标识 */
    quality: string;
    /** 分辨率 */
    resolution: string;
    /** 文件大小 */
    size: number;
    /** 比特率 */
    bitrate: number;
    /** 格式 */
    format: string;
}

export interface VideoListOptions {
    /** 页码 */
    page?: number;
    /** 每页数量 */
    limit?: number;
    /** 排序字段 */
    sortBy?: 'uploadedAt' | 'size' | 'duration' | 'filename';
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 搜索关键词 */
    searchTerm?: string | null;
    /** 是否只显示已处理的视频 */
    processedOnly?: boolean;
}

export interface VideoListResult {
    videos: VideoMetaInfo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
