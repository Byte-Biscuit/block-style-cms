export interface FileMetadata {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    fileExtension: string;
    category: string;
}

export interface FileUploadOptions {
    originalName?: string;
}

export interface FileListOptions {
    page?: number;
    limit?: number;
    sortBy?: 'uploadedAt' | 'size' | 'filename' | 'originalName';
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    category?: string;
}

export interface FileListResult {
    files: FileMetadata[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}


