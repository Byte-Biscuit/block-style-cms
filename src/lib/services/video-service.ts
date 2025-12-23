import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import type {
    VideoUploadOptions,
    VideoMetaInfo,
    VideoListOptions,
    VideoListResult,
} from '@/types/video';
import { ALLOWED_VIDEO_MIME_TYPES, MAX_VIDEO_SIZE, VIDEO_DIR, VIDEO_THUMBNAIL_DIR, META_DIR } from '@/settings';

/**
 * 视频处理工具类
 */
export class VideoService {
    private static readonly MAX_FILE_SIZE = MAX_VIDEO_SIZE;

    static getMetadataFile(): string {
        return path.join(META_DIR, 'video_metadata.json');
    }

    /**
     * 获取视频元数据映射
     */
    static async getMetadataMap(): Promise<Record<string, VideoMetaInfo>> {
        const metadataFile = this.getMetadataFile();
        let metadataMap: Record<string, VideoMetaInfo> = {};
        try {
            const content = await fs.readFile(metadataFile, 'utf-8');
            metadataMap = JSON.parse(content);
        } catch {
            metadataMap = {};
        }
        return metadataMap;
    }

    /**
     * 获取指定视频的元信息
     */
    static async getVideoInfo(filename: string): Promise<VideoMetaInfo | null> {
        const metadataMap = await this.getMetadataMap();
        return metadataMap[filename] || null;
    }

    /**
     * 保存视频元数据
     */
    private static async saveMetadata(metadataMap: Record<string, VideoMetaInfo>): Promise<void> {
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
        if (!(new Set(ALLOWED_VIDEO_MIME_TYPES as readonly string[]).has(file.type))) {
            throw new Error(`不支持的文件类型: ${file.type}。支持的类型: ${ALLOWED_VIDEO_MIME_TYPES.join(', ')}`);
        }

        if (file.size > this.MAX_FILE_SIZE) {
            throw new Error(`文件太大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
    }

    /**
     * 上传视频（基础版本，无压缩处理）
     */
    static async uploadVideo(
        file: File,
        options: VideoUploadOptions = {}
    ): Promise<VideoMetaInfo> {
        this.validateFile(file);

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalExtension = path.extname(file.name);
        const filename = this.generateSEOFriendlyFilename(
            options.originalName || file.name,
            originalExtension
        );

        const filePath = path.join(VIDEO_DIR, filename);

        // 保存原始文件
        await fs.writeFile(filePath, buffer);

        try {
            // 创建基础视频元数据（不包含详细视频信息）
            const videoMetaInfo: VideoMetaInfo = {
                filename,
                originalName: file.name,
                size: file.size,
                width: 0, // 需要视频处理库来获取
                height: 0, // 需要视频处理库来获取
                duration: 0, // 需要视频处理库来获取
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
                bitrate: 0,
                framerate: 0,
                codec: 'unknown',
                processed: false,
                variants: []
            };

            // 保存元数据
            const metadataMap = await this.getMetadataMap();
            metadataMap[filename] = videoMetaInfo;
            await this.saveMetadata(metadataMap);

            return videoMetaInfo;

        } catch (error) {
            // 如果处理失败，删除已上传的文件
            try {
                await fs.unlink(filePath);
            } catch {
                // 忽略删除失败
            }
            throw error;
        }
    }

    /**
     * 获取视频列表
     */
    static async getVideoList(options: VideoListOptions = {}): Promise<VideoListResult> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'uploadedAt',
            sortOrder = 'desc',
            searchTerm = null,
            processedOnly = false
        } = options;

        const metadataMap = await this.getMetadataMap();
        let videos = Object.values(metadataMap);

        // 搜索过滤
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            videos = videos.filter(video =>
                video.originalName.toLowerCase().includes(searchLower) ||
                video.title?.toLowerCase().includes(searchLower) ||
                video.description?.toLowerCase().includes(searchLower) ||
                video.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // 是否只显示已处理的视频
        if (processedOnly) {
            videos = videos.filter(video => video.processed);
        }

        // 排序
        videos.sort((a, b) => {
            let aValue: unknown = a[sortBy as keyof VideoMetaInfo];
            let bValue: unknown = b[sortBy as keyof VideoMetaInfo];

            if (sortBy === 'uploadedAt') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            }

            if (typeof aValue === 'undefined') aValue = 0;
            if (typeof bValue === 'undefined') bValue = 0;

            // 确保是可比较的类型
            if (typeof aValue !== typeof bValue) {
                aValue = String(aValue);
                bValue = String(bValue);
            }

            // 类型断言确保可以比较
            const aVal = aValue as string | number;
            const bVal = bValue as string | number;

            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });

        // 分页
        const total = videos.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedVideos = videos.slice(startIndex, endIndex);

        return {
            videos: paginatedVideos,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 删除视频及其相关文件
     */
    static async deleteVideo(filename: string): Promise<void> {
        const metadataMap = await this.getMetadataMap();
        const videoMeta = metadataMap[filename];

        if (!videoMeta) {
            throw new Error('视频不存在');
        }

        // 删除原始文件
        const videoPath = path.join(VIDEO_DIR, filename);
        try {
            await fs.unlink(videoPath);
        } catch (error) {
            console.warn('删除视频文件失败:', error);
        }

        // 删除缩略图
        if (videoMeta.thumbnail) {
            const thumbnailPath = path.join(VIDEO_THUMBNAIL_DIR, videoMeta.thumbnail);
            try {
                await fs.unlink(thumbnailPath);
            } catch (error) {
                console.warn('删除缩略图失败:', error);
            }
        }

        // 删除变体文件
        if (videoMeta.variants) {
            for (const variant of videoMeta.variants) {
                const variantPath = path.join(VIDEO_DIR, variant.filename);
                try {
                    await fs.unlink(variantPath);
                } catch (error) {
                    console.warn('删除变体文件失败:', error);
                }
            }
        }

        // 从元数据中删除
        delete metadataMap[filename];
        await this.saveMetadata(metadataMap);
    }

    /**
     * 更新视频元数据
     */
    static async updateVideoMetadata(
        filename: string,
        updates: Partial<Pick<VideoMetaInfo, 'title' | 'description' | 'tags'>>
    ): Promise<VideoMetaInfo> {
        const metadataMap = await this.getMetadataMap();
        const videoMeta = metadataMap[filename];

        if (!videoMeta) {
            throw new Error('视频不存在');
        }

        // 更新字段
        Object.assign(videoMeta, updates);

        // 保存更新
        await this.saveMetadata(metadataMap);

        return videoMeta;
    }
}
