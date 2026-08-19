import { promises as fs } from "node:fs";
import path from "node:path";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import {
    ALLOWED_VIDEO_MIME_TYPES,
    FILE_EXTENSIONS,
    MAX_VIDEO_SIZE,
    META_DIR,
    VIDEO_DIR,
    VIDEO_THUMBNAIL_DIR,
} from "@/settings";
import type {
    VideoListOptions,
    VideoListResult,
    VideoMetaInfo,
    VideoUploadOptions,
} from "@/types/video";

function metadataPath(): string {
    return path.join(META_DIR, "video_metadata.json");
}

async function getMetadataMap(): Promise<Record<string, VideoMetaInfo>> {
    try {
        const content = await fs.readFile(metadataPath(), "utf-8");
        return JSON.parse(content);
    } catch {
        return {};
    }
}

async function saveMetadata(
    metadataMap: Record<string, VideoMetaInfo>
): Promise<void> {
    await fs.writeFile(
        metadataPath(),
        JSON.stringify(metadataMap, null, 2),
        "utf-8"
    );
}

function generateSEOFriendlyFilename(
    originalName: string,
    extension: string
): string {
    try {
        const nameWithoutExt = path.parse(originalName).name;
        const seoName = slugify(nameWithoutExt, {
            lower: true,
            strict: true,
            locale: "zh",
            replacement: "-",
        });
        if (seoName.length < 3) {
            return `${uuidv4()}${extension}`;
        }
        const maxLength = 50;
        const truncatedName =
            seoName.length > maxLength
                ? seoName.substring(0, maxLength)
                : seoName;
        const timestamp = Date.now().toString().slice(-6);
        return `${truncatedName}-${timestamp}${extension}`;
    } catch (error) {
        console.warn("SEO filename failed, falling back to UUID:", error);
        return `${uuidv4()}${extension}`;
    }
}

function validateFile(file: File): void {
    const ext = path.extname(file.name).toLowerCase();
    const mimeOk = (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(
        file.type
    );
    if (!mimeOk && !FILE_EXTENSIONS.VIDEO.has(ext)) {
        throw new Error(
            `Unsupported video type: ${file.type}. Allowed: ${ALLOWED_VIDEO_MIME_TYPES.join(", ")}`
        );
    }

    if (file.size > MAX_VIDEO_SIZE) {
        throw new Error(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`
        );
    }
}

export async function getVideoInfo(
    filename: string
): Promise<VideoMetaInfo | null> {
    const metadataMap = await getMetadataMap();
    return metadataMap[filename] || null;
}

export async function uploadVideo(
    file: File,
    options: VideoUploadOptions = {}
): Promise<VideoMetaInfo> {
    validateFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalExtension = path.extname(file.name);
    const filename = generateSEOFriendlyFilename(
        options.originalName || file.name,
        originalExtension
    );

    const filePath = path.join(VIDEO_DIR, filename);
    await fs.writeFile(filePath, buffer);

    try {
        const videoMetaInfo: VideoMetaInfo = {
            filename,
            originalName: file.name,
            size: file.size,
            width: 0,
            height: 0,
            duration: 0,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            bitrate: 0,
            framerate: 0,
            codec: "unknown",
            processed: false,
            variants: [],
        };

        const metadataMap = await getMetadataMap();
        metadataMap[filename] = videoMetaInfo;
        await saveMetadata(metadataMap);
        return videoMetaInfo;
    } catch (error) {
        try {
            await fs.unlink(filePath);
        } catch {
            // ignore cleanup failure
        }
        throw error;
    }
}

export async function getVideoList(
    options: VideoListOptions = {}
): Promise<VideoListResult> {
    const {
        page = 1,
        limit = 20,
        sortBy = "uploadedAt",
        sortOrder = "desc",
        searchTerm = null,
        processedOnly = false,
    } = options;

    const metadataMap = await getMetadataMap();
    let videos = Object.values(metadataMap);

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        videos = videos.filter(
            (video) =>
                video.originalName.toLowerCase().includes(searchLower) ||
                video.title?.toLowerCase().includes(searchLower) ||
                video.description?.toLowerCase().includes(searchLower) ||
                video.tags?.some((tag) =>
                    tag.toLowerCase().includes(searchLower)
                )
        );
    }

    if (processedOnly) {
        videos = videos.filter((video) => video.processed);
    }

    videos.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof VideoMetaInfo];
        let bValue: unknown = b[sortBy as keyof VideoMetaInfo];

        if (sortBy === "uploadedAt") {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
        }

        if (typeof aValue === "undefined") aValue = 0;
        if (typeof bValue === "undefined") bValue = 0;

        if (typeof aValue !== typeof bValue) {
            aValue = String(aValue);
            bValue = String(bValue);
        }

        const aVal = aValue as string | number;
        const bVal = bValue as string | number;

        if (sortOrder === "desc") {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });

    const total = videos.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedVideos = videos.slice(startIndex, startIndex + limit);

    return {
        videos: paginatedVideos,
        total,
        page,
        limit,
        totalPages,
    };
}

export async function deleteVideo(filename: string): Promise<void> {
    const metadataMap = await getMetadataMap();
    const videoMeta = metadataMap[filename];

    if (!videoMeta) {
        throw new Error("Video not found");
    }

    const videoPath = path.join(VIDEO_DIR, filename);
    try {
        await fs.unlink(videoPath);
    } catch (error) {
        console.warn("Failed to delete video file:", error);
    }

    if (videoMeta.thumbnail) {
        const thumbnailPath = path.join(
            VIDEO_THUMBNAIL_DIR,
            videoMeta.thumbnail
        );
        try {
            await fs.unlink(thumbnailPath);
        } catch (error) {
            console.warn("Failed to delete thumbnail:", error);
        }
    }

    if (videoMeta.variants) {
        for (const variant of videoMeta.variants) {
            const variantPath = path.join(VIDEO_DIR, variant.filename);
            try {
                await fs.unlink(variantPath);
            } catch (error) {
                console.warn("Failed to delete video variant:", error);
            }
        }
    }

    delete metadataMap[filename];
    await saveMetadata(metadataMap);
}

export async function updateVideoMetadata(
    filename: string,
    updates: Partial<Pick<VideoMetaInfo, "title" | "description" | "tags">>
): Promise<VideoMetaInfo> {
    const metadataMap = await getMetadataMap();
    const videoMeta = metadataMap[filename];

    if (!videoMeta) {
        throw new Error("Video not found");
    }

    Object.assign(videoMeta, updates);
    await saveMetadata(metadataMap);
    return videoMeta;
}
