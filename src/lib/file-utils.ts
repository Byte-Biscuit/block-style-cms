import path from 'path';
import { FILE_EXTENSIONS } from "@/config";

/**
 * File security validation result
 */
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * File security validation options
 */
export interface FileValidationOptions {
    allowedExtensions?: string[];
    maxFilenameLength?: number;
    baseDirectory?: string;
}

/**
 * Validate file name security to prevent path traversal attacks
 * @param filename The filename to validate
 * @param options Validation options
 * @returns Validation result
 */
export function validateFileSecurity(
    filename: string,
    options: FileValidationOptions = {}
): FileValidationResult {
    const {
        allowedExtensions = [],
        maxFilenameLength = 255,
    } = options;

    if (!filename || filename.trim().length === 0) {
        return { isValid: false, error: 'Missing file name!' };
    }


    // Length check
    if (filename.length > maxFilenameLength) {
        return { isValid: false, error: 'File name too long' };
    }

    // Path traversal check: prevent ../ and ..\ attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return { isValid: false, error: 'Invalid filename: contains path traversal characters' };
    }

    // Extension validation
    if (allowedExtensions.length > 0) {
        const ext = path.extname(filename).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return { isValid: false, error: `Unsupported file format: only supports ${allowedExtensions.join(', ')}` };
        }
    }
    return { isValid: true };
}

export const getFileExtension = (filename: string): string => {
    const ext = path.extname(filename).toLowerCase();
    return ext.startsWith('.') ? ext : `.${ext}`;
}

/**
 * Get the MIME type of a file
 * @param filename The filename
 * @param customMimeTypes Custom MIME type mappings
 * @returns MIME type string
 */
export function getFileMimeType(
    filename: string,
    customMimeTypes: Record<string, string> = {}
): string {
    const ext = path.extname(filename).toLowerCase();

    // Default MIME type mappings
    const defaultMimeTypes: Record<string, string> = {
        // Images
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.bmp': 'image/bmp',
        '.ico': 'image/x-icon',

        // Audio
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
        '.flac': 'audio/flac',
        '.webm': 'audio/webm',

        // Video
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.wmv': 'video/x-ms-wmv',

        // Documents
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',

        // Archive files
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.7z': 'application/x-7z-compressed',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip',
    };

    // Prioritize custom mappings, then use default mappings
    return customMimeTypes[ext] || defaultMimeTypes[ext] || 'application/octet-stream';
}

/**
 * Get file type category based on file extension
 */
export function getFileCategory(extension: string): string {
    const ext = extension.toLowerCase();

    if ([".doc", ".docx", ".pdf", ".txt", ".rtf"].includes(ext)) {
        return "document";
    }
    if ([".xls", ".xlsx", ".csv"].includes(ext)) {
        return "spreadsheet";
    }
    if ([".ppt", ".pptx"].includes(ext)) {
        return "presentation";
    }
    if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) {
        return "archive";
    }
    if ([".js", ".ts", ".jsx", ".tsx", ".css", ".html", ".json", ".xml", ".sql"].includes(ext)) {
        return "code";
    }
    if ([".epub", ".mobi"].includes(ext)) {
        return "ebook";
    }

    return "file";
}

// Format file size in bytes to a human-readable string
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Check if file type is supported
 */
export function isSupportedFileType(filename: string): boolean {
    const ext = filename.toLowerCase();
    const fileExt = ext.includes('.') ? ext.substring(ext.lastIndexOf('.')) : ext;
    return FILE_EXTENSIONS.FILES.has(fileExt);
}

export const ALLOWED_FILE_MIME_TYPES = [
    // Office documents
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // PDF
    "application/pdf",
    // Archive files
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
    // Text files
    "text/plain",
    "application/rtf",
    "text/csv",
    // Code files
    "text/javascript",
    "text/typescript",
    "text/css",
    "text/html",
    "application/json",
    "application/xml",
    "application/sql",
    // Others
    "application/epub+zip",
    "application/x-mobipocket-ebook"
];
