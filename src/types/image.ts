/**
 * Image related type definitions
 */
export interface ImageOptions {
    /** 原始文件名（用于生成SEO友好的文件名） */
    originalName?: string;
    /** 最大宽度 */
    maxWidth?: number | string;
    /** 最大高度 */
    maxHeight?: number | string;
    /** 是否启用WebP格式 */
    enableWebP?: boolean;
    /** 宽度 */
    width?: number | string;
    /** 高度 */
    height?: number | string;
    /** 图片质量 (1-100) */
    quality?: number | string;
    /**文件类型 */
    format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif';
    /** 是否启用自动压缩 */
    autoCompress?: boolean;
    /** 颜色空间 */
    colorSpace?: 'srgb' | 'tinysrgb';
    /** 是否保持宽高比 */
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | 'crop';
}


/**
 * 图片上传相关类型定义
 */
export interface ImageUploadOptions {
    /** 原始文件名（用于生成SEO友好的文件名） */
    originalName?: string;
    /** 图片质量 (1-100) */
    quality?: number;
    /** 最大宽度 */
    maxWidth?: number;
    /** 最大高度 */
    maxHeight?: number;
    /** 是否启用WebP格式 */
    enableWebP?: boolean;
}

export interface ImageProcessOptions {
    /** 宽度 */
    width?: number;
    /** 高度 */
    height?: number;
    /** 图片质量 (1-100) */
    quality?: number;
    /** 输出格式 */
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    /** 是否保持宽高比 */
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    /** Accept header for format negotiation */
    acceptHeader?: string;
}

export interface ImageMetaInfo {
    /** 文件名 */
    filename: string;
    /** 原始文件名 */
    originalName: string;
    /** 文件大小（字节） */
    size: number;
    /** 图片宽度 */
    width: number;
    /** 图片高度 */
    height: number;
    /** MIME类型 */
    mimeType: string;
    /** 上传时间 */
    uploadedAt: string;
    /** 图片标题 */
    title?: string;
    /** 图片描述 */
    description?: string;
    /** 图片标签 */
    tags?: string[];
    /** 替代文本 */
    altText?: string;
}

export interface ImageServeOptions {
    /** 宽度 */
    w?: number;
    /** 高度 */
    h?: number;
    /** 图片质量 */
    q?: number;
    /** 输出格式 */
    f?: 'jpeg' | 'png' | 'webp' | 'avif';
    /** 适应方式 */
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/** 图片列表查询选项 */
export interface ImageListOptions {
    /** 页码 */
    page: number;
    /** 每页数量 */
    limit: number;
    /** 排序字段 */
    sortBy: 'uploadedAt' | 'size' | 'filename';
    /** 排序方向 */
    sortOrder: 'asc' | 'desc';
    /** 搜索关键词 */
    searchTerm?: string | null;
}
