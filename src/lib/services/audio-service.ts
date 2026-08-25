import { promises as fs } from "node:fs";
import path from "node:path";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import {
    ALLOWED_AUDIO_MIME_TYPES,
    AUDIO_DIR,
    FILE_EXTENSIONS,
    MAX_AUDIO_SIZE,
    META_DIR,
} from "@/settings";
import type {
    AudioListOptions,
    AudioListResult,
    AudioMetaInfo,
    AudioUploadOptions,
} from "@/types/audio";

function metadataPath(): string {
    return path.join(META_DIR, "audio_metadata.json");
}

async function getMetadataMap(): Promise<Record<string, AudioMetaInfo>> {
    try {
        const content = await fs.readFile(metadataPath(), "utf-8");
        return JSON.parse(content);
    } catch {
        return {};
    }
}

async function saveMetadata(
    metadataMap: Record<string, AudioMetaInfo>
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
    const mimeOk = (ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(
        file.type
    );
    if (!mimeOk && !FILE_EXTENSIONS.AUDIO.has(ext)) {
        const allowedTypes = ALLOWED_AUDIO_MIME_TYPES.map(
            (type) => type.split("/")[1]
        ).join(", ");
        throw new Error(`Unsupported audio format. Allowed: ${allowedTypes}`);
    }

    if (file.size > MAX_AUDIO_SIZE) {
        const maxSizeMB = Math.round(MAX_AUDIO_SIZE / (1024 * 1024));
        throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
    }
}

export async function getAudioInfo(
    filename: string
): Promise<AudioMetaInfo | null> {
    const metadataMap = await getMetadataMap();
    return metadataMap[filename] || null;
}

export async function uploadAudio(
    file: File,
    options: AudioUploadOptions = {}
): Promise<AudioMetaInfo> {
    validateFile(file);

    const originalName = options.originalName || file.name;
    const extension = path.extname(originalName).toLowerCase();
    const filename = generateSEOFriendlyFilename(originalName, extension);
    const filePath = path.join(AUDIO_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

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

    const metadataMap = await getMetadataMap();
    metadataMap[filename] = audioInfo;
    await saveMetadata(metadataMap);
    return audioInfo;
}

export async function getAudioList(
    options: AudioListOptions = {}
): Promise<AudioListResult> {
    const {
        page = 1,
        limit = 20,
        sortBy = "uploadedAt",
        sortOrder = "desc",
        searchTerm,
    } = options;

    const metadataMap = await getMetadataMap();
    let audios = Object.values(metadataMap);

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        audios = audios.filter(
            (audio) =>
                audio.filename.toLowerCase().includes(searchLower) ||
                audio.originalName.toLowerCase().includes(searchLower) ||
                audio.title?.toLowerCase().includes(searchLower)
        );
    }

    audios.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "uploadedAt":
                comparison =
                    new Date(a.uploadedAt).getTime() -
                    new Date(b.uploadedAt).getTime();
                break;
            case "size":
                comparison = a.size - b.size;
                break;
            case "filename":
                comparison = a.filename.localeCompare(b.filename);
                break;
            default:
                comparison =
                    new Date(a.uploadedAt).getTime() -
                    new Date(b.uploadedAt).getTime();
        }
        return sortOrder === "desc" ? -comparison : comparison;
    });

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

export async function deleteAudio(filename: string): Promise<void> {
    const metadataMap = await getMetadataMap();

    if (!metadataMap[filename]) {
        throw new Error("Audio file not found");
    }

    const filePath = path.join(AUDIO_DIR, filename);
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.warn("Failed to delete audio file:", error);
    }

    delete metadataMap[filename];
    await saveMetadata(metadataMap);
}
