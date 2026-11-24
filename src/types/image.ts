/**
 * Image related type definitions
 */
export interface ImageOptions {
    /** Original filename (used to generate SEO-friendly filenames) */
    originalName?: string;
    /** Maximum width */
    maxWidth?: number | string;
    /** Maximum height */
    maxHeight?: number | string;
    /** Whether to enable WebP format */
    enableWebP?: boolean;
    /** Width */
    width?: number | string;
    /** Height */
    height?: number | string;
    /** Image quality (1-100) */
    quality?: number | string;
    /** File type */
    format?: "jpeg" | "png" | "webp" | "avif" | "gif";
    /** Whether to enable auto compression */
    autoCompress?: boolean;
    /** Color space */
    colorSpace?: "srgb" | "tinysrgb";
    /** How to fit within dimensions while preserving aspect ratio */
    fit?: "cover" | "contain" | "fill" | "inside" | "outside" | "crop";
}

/**
 * Image upload related type definitions
 */
export interface ImageUploadOptions {
    /** Original filename (used to generate SEO-friendly filenames) */
    originalName?: string;
    /** Image quality (1-100) */
    quality?: number;
    /** Maximum width */
    maxWidth?: number;
    /** Maximum height */
    maxHeight?: number;
    /** Whether to enable WebP format */
    enableWebP?: boolean;
}

export interface ImageProcessOptions {
    /** Width */
    width?: number;
    /** Height */
    height?: number;
    /** Image quality (1-100) */
    quality?: number;
    /** Output format */
    format?: "jpeg" | "png" | "webp" | "avif";
    /** How to fit within dimensions while preserving aspect ratio */
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    /** Accept header for format negotiation */
    acceptHeader?: string;
}

export interface ImageMetaInfo {
    /** Filename */
    filename: string;
    /** Original filename */
    originalName: string;
    /** File size in bytes */
    size: number;
    /** Image width */
    width: number;
    /** Image height */
    height: number;
    /** MIME type */
    mimeType: string;
    /** Upload time */
    uploadedAt: string;
    /** Image title */
    title?: string;
    /** Image description */
    description?: string;
    /** Image tags */
    tags?: string[];
    /** Alternative text */
    altText?: string;
    fullUrl?: string;
    /** SHA-256 of processed file bytes; used to dedupe re-uploads */
    contentHash?: string;
}

export interface ImageServeOptions {
    /** Width */
    w?: number;
    /** Height */
    h?: number;
    /** Image quality */
    q?: number;
    /** Output format */
    f?: "jpeg" | "png" | "webp" | "avif";
    /** Fit mode */
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

/** Image list query options */
export interface ImageListOptions {
    /** Page number */
    page: number;
    /** Items per page */
    limit: number;
    /** Sort field */
    sortBy: "uploadedAt" | "size" | "filename";
    /** Sort direction */
    sortOrder: "asc" | "desc";
    /** Search keyword */
    searchTerm?: string | null;
}
