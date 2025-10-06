import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import type {
    AudioUploadOptions,
    AudioMetaInfo,
    AudioListOptions,
    AudioListResult,
} from '@/types/audio';
import { ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_SIZE } from '@/config';
import { AUDIO_DIR, META_DIR } from '@/config';

/**
 * 音频处理工具类
 */
export class AudioService {
    private static readonly MAX_FILE_SIZE = MAX_AUDIO_SIZE;

    static getMetadataFile(): string {
        return path.join(META_DIR, 'audio_metadata.json');
    }

    /**
     * 获取音频元数据映射
     */
    static async getMetadataMap(): Promise<Record<string, AudioMetaInfo>> {
        const metadataFile = this.getMetadataFile();
        let metadataMap: Record<string, AudioMetaInfo> = {};
        try {
            const content = await fs.readFile(metadataFile, 'utf-8');
            metadataMap = JSON.parse(content);
        } catch {
            metadataMap = {};
        }
        return metadataMap;
    }

    /**
     * 获取指定音频的元信息
     */
    static async getAudioInfo(filename: string): Promise<AudioMetaInfo | null> {
        const metadataMap = await this.getMetadataMap();
        return metadataMap[filename] || null;
    }

    /**
     * 保存音频元数据
     */
    private static async saveMetadata(metadataMap: Record<string, AudioMetaInfo>): Promise<void> {
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
        if (!(new Set(ALLOWED_AUDIO_MIME_TYPES as readonly string[])).has(file.type)) {
            const allowedTypes = ALLOWED_AUDIO_MIME_TYPES.map(type => type.split('/')[1]).join(', ');
            throw new Error(`不支持的音频格式。支持的格式: ${allowedTypes}`);
        }

        if (file.size > this.MAX_FILE_SIZE) {
            const maxSizeMB = Math.round(this.MAX_FILE_SIZE / (1024 * 1024));
            throw new Error(`文件过大。最大支持 ${maxSizeMB}MB`);
        }
    }

    /**
     * 上传音频文件
     */
    static async uploadAudio(
        file: File,
        options: AudioUploadOptions = {}
    ): Promise<AudioMetaInfo> {
        this.validateFile(file);

        const originalName = options.originalName || file.name;
        const extension = path.extname(originalName).toLowerCase();
        const filename = this.generateSEOFriendlyFilename(originalName, extension);
        const filePath = path.join(AUDIO_DIR, filename);

        // 保存文件
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // 获取音频基本信息
        const stats = await fs.stat(filePath);
        const audioInfo: AudioMetaInfo = {
            filename,
            originalName,
            size: stats.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            format: extension.slice(1),
            title: options.title || path.parse(originalName).name,
        };

        // 保存元数据
        const metadataMap = await this.getMetadataMap();
        metadataMap[filename] = audioInfo;
        await this.saveMetadata(metadataMap);

        return audioInfo;
    }

    /**
     * 获取音频列表
     */
    static async getAudioList(options: AudioListOptions = {}): Promise<AudioListResult> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'uploadedAt',
            sortOrder = 'desc',
            searchTerm,
        } = options;

        const metadataMap = await this.getMetadataMap();
        let audios = Object.values(metadataMap);

        // 搜索过滤
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            audios = audios.filter(audio =>
                audio.filename.toLowerCase().includes(searchLower) ||
                audio.originalName.toLowerCase().includes(searchLower) ||
                audio.title?.toLowerCase().includes(searchLower)
            );
        }

        // 排序
        audios.sort((a, b) => {
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
                default:
                    comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        // 分页
        const total = audios.length;
        const startIndex = (page - 1) * limit;
        const paginatedAudios = audios.slice(startIndex, startIndex + limit);

        return {
            audios: paginatedAudios,
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
     * 删除音频文件
     */
    static async deleteAudio(filename: string): Promise<void> {
        const metadataMap = await this.getMetadataMap();

        if (!metadataMap[filename]) {
            throw new Error('音频文件不存在');
        }

        // 删除文件
        const filePath = path.join(AUDIO_DIR, filename);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.warn('删除音频文件失败:', error);
        }

        // 删除元数据
        delete metadataMap[filename];
        await this.saveMetadata(metadataMap);
    }
}
