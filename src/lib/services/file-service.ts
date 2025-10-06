import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import type {
    FileMetadata,
    FileUploadOptions,
    FileListOptions,
    FileListResult,
} from '@/types/file';
import { FILE_DIR, META_DIR, MAX_FILE_SIZE } from '@/config';
import { ALLOWED_FILE_MIME_TYPES, isSupportedFileType, getFileCategory } from '../file-utils';


/**
 * 文件处理工具类
 */
export class FileService {
    private static readonly MAX_FILE_SIZE = MAX_FILE_SIZE;

    static getMetadataFile(): string {
        return path.join(META_DIR, 'file_metadata.json');
    }

    /**
     * 获取文件元数据映射
     */
    static async getMetadataMap(): Promise<Record<string, FileMetadata>> {
        const metadataFile = this.getMetadataFile();
        let metadataMap: Record<string, FileMetadata> = {};
        try {
            const content = await fs.readFile(metadataFile, 'utf-8');
            metadataMap = JSON.parse(content);
        } catch {
            metadataMap = {};
        }
        return metadataMap;
    }

    /**
     * 获取指定文件的元信息
     */
    static async getFileInfo(filename: string): Promise<FileMetadata | null> {
        const metadataMap = await this.getMetadataMap();
        return metadataMap[filename] || null;
    }

    /**
     * 保存文件元数据
     */
    private static async saveMetadata(metadataMap: Record<string, FileMetadata>): Promise<void> {
        const metadataFile = this.getMetadataFile();
        await fs.writeFile(metadataFile, JSON.stringify(metadataMap, null, 2), 'utf-8');
    }

    private static generateSEOFriendlyFilename(
        originalName: string,
        extension: string
    ): string {
        try {
            const nameWithoutExt = path.parse(originalName).name;
            const seoName = slugify(nameWithoutExt, {
                lower: true,
                strict: true,
                locale: 'zh',
                replacement: '-'
            });
            if (seoName.length < 3) {
                return `${uuidv4()}${extension}`;
            }
            const maxLength = 50;
            const truncatedName = seoName.length > maxLength
                ? seoName.substring(0, maxLength)
                : seoName;
            const timestamp = Date.now().toString().slice(-6);
            return `${truncatedName}-${timestamp}${extension}`;

        } catch (error) {
            console.warn('生成SEO文件名失败，使用UUID:', error);
            return `${uuidv4()}${extension}`;
        }
    }

    /**
     * 验证文件类型和大小
     */
    private static validateFile(file: File): void {
        if (!ALLOWED_FILE_MIME_TYPES.includes(file.type) && !isSupportedFileType(file.name)) {
            throw new Error(`不支持的文件类型: ${file.type}。支持的类型包括 Office 文档、PDF、压缩文件等`);
        }

        if (file.size > this.MAX_FILE_SIZE) {
            const maxSizeMB = Math.round(this.MAX_FILE_SIZE / (1024 * 1024));
            throw new Error(`文件过大。最大支持 ${maxSizeMB}MB`);
        }
    }

    /**
     * 获取 MIME 类型
     */
    private static getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes: Record<string, string> = {
            // Office
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls": "application/vnd.ms-excel",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt": "application/vnd.ms-powerpoint",
            ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            // PDF
            ".pdf": "application/pdf",
            // 压缩文件
            ".zip": "application/zip",
            ".rar": "application/x-rar-compressed",
            ".7z": "application/x-7z-compressed",
            ".tar": "application/x-tar",
            ".gz": "application/gzip",
            // 文本
            ".txt": "text/plain",
            ".rtf": "application/rtf",
            ".csv": "text/csv",
            // 代码
            ".js": "text/javascript",
            ".ts": "text/typescript",
            ".jsx": "text/javascript",
            ".tsx": "text/typescript",
            ".css": "text/css",
            ".html": "text/html",
            ".json": "application/json",
            ".xml": "application/xml",
            ".sql": "application/sql",
            // 其他
            ".epub": "application/epub+zip",
            ".mobi": "application/x-mobipocket-ebook"
        };

        return mimeTypes[ext] || "application/octet-stream";
    }

    /**
     * 上传文件
     */
    static async uploadFile(
        file: File,
        options: FileUploadOptions = {}
    ): Promise<FileMetadata> {
        this.validateFile(file);

        const originalName = options.originalName || file.name;
        const extension = path.extname(originalName).toLowerCase();

        // 生成唯一文件名，防止重复
        let filename = this.generateSEOFriendlyFilename(originalName, extension);
        const metadataMap = await this.getMetadataMap();

        // 如果文件名已存在，添加随机后缀
        while (metadataMap[filename]) {
            const baseName = path.parse(filename).name;
            const suffix = uuidv4().substring(0, 8);
            filename = `${baseName}-${suffix}${extension}`;
        }

        const filePath = path.join(FILE_DIR, filename);

        // 保存文件
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // 获取文件基本信息
        const stats = await fs.stat(filePath);
        const fileInfo: FileMetadata = {
            filename,
            originalName,
            size: stats.size,
            mimeType: this.getMimeType(originalName),
            uploadedAt: new Date().toISOString(),
            fileExtension: extension,
            category: getFileCategory(extension),
        };

        // 保存元数据，filename 作为 key
        metadataMap[filename] = fileInfo;
        await this.saveMetadata(metadataMap);

        return fileInfo;
    }

    /**
     * 获取文件列表
     */
    static async getFileList(options: FileListOptions = {}): Promise<FileListResult> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'uploadedAt',
            sortOrder = 'desc',
            searchTerm,
            category,
        } = options;

        const metadataMap = await this.getMetadataMap();
        let Files = Object.values(metadataMap);

        // 搜索过滤
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            Files = Files.filter(File =>
                File.filename.toLowerCase().includes(searchLower) ||
                File.originalName.toLowerCase().includes(searchLower)
            );
        }

        // 分类过滤
        if (category) {
            Files = Files.filter(File => File.category === category);
        }

        // 排序
        Files.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'uploadedAt':
                    comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'filename':
                    comparison = a.filename.localeCompare(b.filename);
                    break;
                case 'originalName':
                    comparison = a.originalName.localeCompare(b.originalName);
                    break;
                default:
                    comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        // 分页
        const total = Files.length;
        const startIndex = (page - 1) * limit;
        const paginatedFiles = Files.slice(startIndex, startIndex + limit);

        return {
            files: paginatedFiles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: startIndex + limit < total,
                hasPrev: page > 1,
            },
        };
    }

    /**
     * 删除文件
     */
    static async deleteFile(filename: string): Promise<void> {
        const metadataMap = await this.getMetadataMap();

        if (!metadataMap[filename]) {
            throw new Error('文件不存在');
        }

        // 删除文件
        const filePath = path.join(FILE_DIR, filename);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.warn('删除文件失败:', error);
        }

        // 删除元数据
        delete metadataMap[filename];
        await this.saveMetadata(metadataMap);
    }
}
