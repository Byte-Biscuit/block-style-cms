import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import type {
    ImageUploadOptions,
    ImageProcessOptions,
    ImageMetaInfo,
    ImageListOptions,
} from '@/types/image';
import { ALLOWED_IMAGE_MIME_TYPES } from '@/settings';
import { IMAGE_DIR, META_DIR } from '@/settings';
import { ImageOptions } from '@/types/image';
import { optimizePexelsImageUrl } from '@/lib/pexels-utils'

/**
 * 图片处理工具类
 */
export class ImageService {
    private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

    static getMetadataFile(): string {
        return path.join(META_DIR, 'image_metadata.json');
    }

    /**
     * Post metadata map
     * @returns 
     */
    static async getMetadataMap(): Promise<Record<string, ImageMetaInfo>> {
        const metadataFile = this.getMetadataFile();
        let metadataMap: Record<string, ImageMetaInfo> = {};
        try {
            const content = await fs.readFile(metadataFile, 'utf-8');
            metadataMap = JSON.parse(content);
        } catch {
            metadataMap = {};
        }
        return metadataMap;
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
        if (!(new Set(ALLOWED_IMAGE_MIME_TYPES as readonly string[])).has(file.type)) {
            throw new Error(`不支持的文件类型: ${file.type}。支持的类型: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`);
        }

        if (file.size > this.MAX_FILE_SIZE) {
            throw new Error(`文件太大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
    }

    static async uploadImage(
        file: File,
        options: ImageUploadOptions = {}
    ): Promise<ImageMetaInfo> {
        this.validateFile(file);
        const buffer = Buffer.from(await file.arrayBuffer());

        // 安全地获取元数据
        let metadataInstance: sharp.Sharp | null = null;
        let metadata: sharp.Metadata;
        try {
            metadataInstance = sharp(buffer);
            metadata = await metadataInstance.metadata();
        } finally {
            if (metadataInstance) {
                metadataInstance.destroy();
            }
        }

        const {
            originalName = file.name,
            quality = 85,
            maxWidth = 2048,
            maxHeight = 2048
        } = options;

        // SVG 保持原格式，其他格式全部转换为 WebP
        const isSvg = file.type === 'image/svg+xml';
        const outputFormat = isSvg ? 'svg' : 'webp';
        const extension = isSvg ? '.svg' : '.webp';

        const filename = this.generateSEOFriendlyFilename(originalName, extension);
        const filePath = path.join(IMAGE_DIR, filename);

        let outputInfo: { size: number };
        let finalMetadata: { width?: number; height?: number; format?: string };

        if (isSvg) {
            // SVG 直接保存，不进行处理
            await fs.writeFile(filePath, buffer);
            outputInfo = { size: buffer.length };
            finalMetadata = {
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: 'svg'
            };
        } else {
            let sharpInstance: sharp.Sharp | null = null;
            try {
                sharpInstance = sharp(buffer);
                // 对于动画 GIF，sharp 会自动处理为 WebP 动画
                if (file.type === 'image/gif') {
                    // 检查是否为动画 GIF
                    if (metadata.pages && metadata.pages > 1) {
                        console.log(`处理动画 GIF: ${originalName}，帧数: ${metadata.pages}`);
                        // WebP 支持动画，sharp 会自动转换
                    }
                }

                if (metadata.width && metadata.height) {
                    if (metadata.width > maxWidth || metadata.height > maxHeight) {
                        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                            fit: 'inside',
                            withoutEnlargement: true
                        });
                    }
                }

                // 统一转换为 WebP（包括动画）
                sharpInstance = sharpInstance.webp({ quality });

                outputInfo = await sharpInstance.toFile(filePath);

                // 安全地获取最终元数据
                let metadataSharp: sharp.Sharp | null = null;
                try {
                    metadataSharp = sharp(filePath);
                    finalMetadata = await metadataSharp.metadata();
                } finally {
                    if (metadataSharp) {
                        metadataSharp.destroy();
                    }
                }
            } finally {
                if (sharpInstance) {
                    sharpInstance.destroy();
                }
            }
        }

        const imageInfo: ImageMetaInfo = {
            filename,
            originalName,
            size: outputInfo.size,
            width: finalMetadata.width || 0,
            height: finalMetadata.height || 0,
            mimeType: `image/${outputFormat}`,
            uploadedAt: new Date().toISOString()
        };
        await this.saveMetadata(imageInfo);
        return imageInfo;
    }


    static async saveMetadata(imageMeta: ImageMetaInfo): Promise<void> {
        const metadataMap = await this.getMetadataMap();
        metadataMap[imageMeta.filename] = imageMeta
        await fs.writeFile(this.getMetadataFile(), JSON.stringify(metadataMap, null, 2));
    }

    static async deleteMetadata(filename: string): Promise<void> {
        const metadataMap = await this.getMetadataMap();
        if (metadataMap[filename]) {
            delete metadataMap[filename];
            await fs.writeFile(this.getMetadataFile(), JSON.stringify(metadataMap, null, 2));
        }
    }

    private static async loadImageMetadata(filename: string): Promise<ImageMetaInfo | null> {
        const imageMetadataMap = await this.getMetadataMap();
        if (imageMetadataMap[filename]) {
            return imageMetadataMap[filename];
        }
        return null;
    }
    /**
     * 动态处理图片（用于访问时的实时处理）
     */
    static async processImage(
        filename: string,
        options: ImageProcessOptions = {}
    ): Promise<Buffer> {
        const filePath = path.join(IMAGE_DIR, filename);
        try {
            await fs.access(filePath);
        } catch {
            throw new Error('图片文件不存在');
        }

        const {
            width,
            height,
            quality = 85,
            format = 'jpeg',
            fit = 'cover'
        } = options;

        let sharpInstance: sharp.Sharp | null = null;
        try {
            sharpInstance = sharp(filePath);

            // 调整大小
            if (width || height) {
                sharpInstance = sharpInstance.resize(width, height, {
                    fit,
                    withoutEnlargement: true
                });
            }

            // 设置输出格式
            switch (format) {
                case 'webp':
                    sharpInstance = sharpInstance.webp({ quality });
                    break;
                case 'png':
                    sharpInstance = sharpInstance.png({ quality });
                    break;
                case 'avif':
                    sharpInstance = sharpInstance.avif({ quality });
                    break;
                default:
                    sharpInstance = sharpInstance.jpeg({ quality });
            }

            return await sharpInstance.toBuffer();
        } finally {
            if (sharpInstance) {
                sharpInstance.destroy();
            }
        }
    }

    static async deleteImage(filename: string): Promise<void> {
        const filePath = path.join(IMAGE_DIR, filename);

        try {
            // 首先检查文件是否存在
            try {
                await fs.access(filePath);
            } catch {
                // 文件不存在，只删除元数据
                await this.deleteMetadata(filename);
                return;
            }

            // 先删除元数据，即使文件删除失败也不影响元数据清理
            await this.deleteMetadata(filename);

            // 尝试删除文件，带重试机制
            await this.deleteFileWithRetry(filePath, filename);

        } catch (error) {
            console.error(`删除图片失败: ${filename}`, error);
            throw new Error(`删除图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 带重试机制的文件删除
     */
    private static async deleteFileWithRetry(
        filePath: string,
        filename: string,
        maxRetries: number = 5,
        delayMs: number = 200
    ): Promise<void> {
        // 尝试强制垃圾回收释放资源
        if (global.gc) {
            global.gc();
        }

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await fs.unlink(filePath);
                console.log(`图片删除成功: ${filename}`);
                return;
            } catch (error: unknown) {
                if (error && typeof error === 'object' && 'code' in error) {
                    const fsError = error as { code: string; message: string };

                    if (fsError.code === 'ENOENT') {
                        // 文件不存在，认为删除成功
                        console.log(`图片文件不存在，视为删除成功: ${filename}`);
                        return;
                    }

                    if (fsError.code === 'EBUSY' && attempt < maxRetries) {
                        console.warn(`文件被占用，第 ${attempt} 次重试删除: ${filename}`);

                        // 尝试强制垃圾回收
                        if (global.gc) {
                            global.gc();
                        }

                        // 使用指数退避策略
                        const delay = delayMs * Math.pow(1.5, attempt - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }

                    // 最后一次尝试失败，或者是其他类型的错误
                    if (attempt === maxRetries) {
                        if (fsError.code === 'EBUSY') {
                            // 作为最后的尝试，尝试重命名文件
                            await this.markFileForDeletion(filePath, filename);
                            return;
                        } else {
                            throw new Error(`删除文件失败: ${fsError.message}`);
                        }
                    }
                } else {
                    // 未知错误类型
                    throw new Error(`删除文件失败: ${error}`);
                }
            }
        }
    }

    /**
     * 将文件标记为待删除（重命名为 .deleted 扩展名）
     */
    private static async markFileForDeletion(filePath: string, filename: string): Promise<void> {
        try {
            const deletedPath = `${filePath}.deleted`;
            await fs.rename(filePath, deletedPath);
            console.log(`文件已标记为待删除: ${filename} -> ${filename}.deleted`);

            // 异步尝试删除重命名后的文件
            setTimeout(async () => {
                try {
                    await fs.unlink(deletedPath);
                    console.log(`延迟删除成功: ${filename}.deleted`);
                } catch (error) {
                    console.warn(`延迟删除失败: ${filename}.deleted`, error);
                }
            }, 5000); // 5秒后尝试删除
        } catch (error) {
            console.error(`标记文件为待删除失败: ${filename}`, error);
            throw new Error(`无法删除文件，请手动删除: ${filename}`);
        }
    }

    /**
     * 获取图片信息
     */
    static async getImageInfo(filename: string): Promise<ImageMetaInfo | null> {
        return await this.loadImageMetadata(filename);
    }

    /**
     * 获取图片列表
     */
    static async getImageList(options: ImageListOptions): Promise<Record<string, ImageMetaInfo>> {
        const { page = 1, limit = 20, sortBy = 'uploadedAt', sortOrder = 'desc', searchTerm = null } = options;
        const metadataMap = await this.getMetadataMap();

        let imageList = Object.values(metadataMap);
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            imageList = imageList.filter(image => {
                return (
                    image.originalName.toLowerCase().includes(lowerSearchTerm))
            });
        }

        imageList.sort((a, b) => {
            const aValue = a[sortBy as keyof ImageMetaInfo];
            const bValue = b[sortBy as keyof ImageMetaInfo];

            // Handle undefined values
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
            if (bValue === undefined) return sortOrder === 'asc' ? 1 : -1;

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        imageList = imageList.slice(startIndex, endIndex);

        return imageList.reduce((acc, item) => {
            acc[item.filename] = item;
            return acc;
        }, {} as Record<string, ImageMetaInfo>);

    }

    static optimizeImageFromUrl(url: string | null | undefined, options: ImageOptions) {
        if (!url) return null;
        if (url.toLowerCase().startsWith("https://images.pexels.com"))
            return optimizePexelsImageUrl(url, options);
        return url;
    }
}
