import { promises as fs } from "node:fs";
import path from "node:path";
import sharp, { type Metadata, type Sharp } from "sharp";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { sha256Hex } from "@/lib/hash";
import { optimizePexelsImageUrl } from "@/lib/pexels-utils";
import { systemConfigService } from "@/lib/services/system-config-service";
import { ALLOWED_IMAGE_MIME_TYPES, IMAGE_DIR, META_DIR } from "@/settings";
import type {
    ImageListOptions,
    ImageMetaInfo,
    ImageOptions,
    ImageProcessOptions,
    ImageUploadOptions,
} from "@/types/image";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function getSystemConfig() {
    return await systemConfigService.readConfig();
}

function getMetadataFile(): string {
    return path.join(META_DIR, "image_metadata.json");
}

/**
 * Load the image metadata map from disk.
 */
async function getMetadataMap(): Promise<Record<string, ImageMetaInfo>> {
    const metadataFile = getMetadataFile();
    let metadataMap: Record<string, ImageMetaInfo> = {};
    try {
        const content = await fs.readFile(metadataFile, "utf-8");
        metadataMap = JSON.parse(content);
    } catch {
        metadataMap = {};
    }
    return metadataMap;
}

async function findByContentHash(
    contentHash: string
): Promise<ImageMetaInfo | null> {
    const metadataMap = await getMetadataMap();
    for (const meta of Object.values(metadataMap)) {
        if (meta.contentHash === contentHash) return meta;
    }
    return null;
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
        console.warn(
            "Failed to generate SEO-friendly filename, falling back to UUID:",
            error
        );
        return `${uuidv4()}${extension}`;
    }
}

/**
 * Validate file MIME type and size.
 */
function validateFile(file: File): void {
    if (
        !new Set(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).has(file.type)
    ) {
        throw new Error(
            `Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
    }
}

async function uploadImage(
    file: File,
    options: ImageUploadOptions = {}
): Promise<ImageMetaInfo> {
    validateFile(file);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Read image metadata safely (dispose Sharp instance afterward).
    let metadataInstance: Sharp | null = null;
    let metadata: Metadata;
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
        maxHeight = 2048,
    } = options;

    // Keep SVG as-is; convert all other formats to WebP.
    const isSvg = file.type === "image/svg+xml";
    const outputFormat = isSvg ? "svg" : "webp";
    const extension = isSvg ? ".svg" : ".webp";

    let outputBuffer: Buffer;
    let finalMetadata: { width?: number; height?: number; format?: string };

    if (isSvg) {
        outputBuffer = buffer;
        finalMetadata = {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: "svg",
        };
    } else {
        let sharpInstance: Sharp | null = null;
        try {
            sharpInstance = sharp(buffer);
            if (file.type === "image/gif") {
                if (metadata.pages && metadata.pages > 1) {
                    console.log(
                        `Processing animated GIF: ${originalName}, frames: ${metadata.pages}`
                    );
                }
            }

            if (metadata.width && metadata.height) {
                if (metadata.width > maxWidth || metadata.height > maxHeight) {
                    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                        fit: "inside",
                        withoutEnlargement: true,
                    });
                }
            }

            sharpInstance = sharpInstance.webp({ quality });
            outputBuffer = await sharpInstance.toBuffer();
            finalMetadata = await sharp(outputBuffer).metadata();
        } finally {
            if (sharpInstance) {
                sharpInstance.destroy();
            }
        }
    }

    const contentHash = sha256Hex(outputBuffer);
    const existing = await findByContentHash(contentHash);
    if (existing) {
        return existing;
    }

    const filename = generateSEOFriendlyFilename(originalName, extension);
    const filePath = path.join(IMAGE_DIR, filename);
    await fs.writeFile(filePath, outputBuffer);

    const systemConfig = await getSystemConfig();
    const imageInfo: ImageMetaInfo = {
        filename,
        originalName,
        fullUrl: `${systemConfig?.siteInfo?.baseUrl}/images/${filename}`,
        size: outputBuffer.length,
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
        mimeType: `image/${outputFormat}`,
        uploadedAt: new Date().toISOString(),
        contentHash,
    };
    await saveMetadata(imageInfo);
    return imageInfo;
}

async function saveMetadata(imageMeta: ImageMetaInfo): Promise<void> {
    const metadataMap = await getMetadataMap();
    metadataMap[imageMeta.filename] = imageMeta;
    await fs.writeFile(getMetadataFile(), JSON.stringify(metadataMap, null, 2));
}

async function deleteMetadata(filename: string): Promise<void> {
    const metadataMap = await getMetadataMap();
    if (metadataMap[filename]) {
        delete metadataMap[filename];
        await fs.writeFile(
            getMetadataFile(),
            JSON.stringify(metadataMap, null, 2)
        );
    }
}

async function loadImageMetadata(
    filename: string
): Promise<ImageMetaInfo | null> {
    const imageMetadataMap = await getMetadataMap();
    if (imageMetadataMap[filename]) {
        return imageMetadataMap[filename];
    }
    return null;
}

/**
 * Process an image on the fly (used when serving with transform options).
 */
async function processImage(
    filename: string,
    options: ImageProcessOptions = {}
): Promise<Buffer> {
    const filePath = path.join(IMAGE_DIR, filename);
    try {
        await fs.access(filePath);
    } catch {
        throw new Error("Image file not found");
    }

    const {
        width,
        height,
        quality = 85,
        format = "jpeg",
        fit = "cover",
    } = options;

    let sharpInstance: Sharp | null = null;
    try {
        sharpInstance = sharp(filePath);

        if (width || height) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit,
                withoutEnlargement: true,
            });
        }

        switch (format) {
            case "webp":
                sharpInstance = sharpInstance.webp({ quality });
                break;
            case "png":
                sharpInstance = sharpInstance.png({ quality });
                break;
            case "avif":
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

async function deleteImage(filename: string): Promise<void> {
    const filePath = path.join(IMAGE_DIR, filename);

    try {
        try {
            await fs.access(filePath);
        } catch {
            // File missing — still clear metadata.
            await deleteMetadata(filename);
            return;
        }

        // Remove metadata first so a failed unlink does not leave stale entries.
        await deleteMetadata(filename);

        await deleteFileWithRetry(filePath, filename);
    } catch (error) {
        console.error(`Failed to delete image: ${filename}`, error);
        throw new Error(
            `Failed to delete image: ${error instanceof Error ? error.message : "unknown error"}`
        );
    }
}

/**
 * Unlink a file with retries (handles transient EBUSY).
 */
async function deleteFileWithRetry(
    filePath: string,
    filename: string,
    maxRetries: number = 5,
    delayMs: number = 200
): Promise<void> {
    if (global.gc) {
        global.gc();
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await fs.unlink(filePath);
            console.log(`Image deleted successfully: ${filename}`);
            return;
        } catch (error: unknown) {
            if (error && typeof error === "object" && "code" in error) {
                const fsError = error as { code: string; message: string };

                if (fsError.code === "ENOENT") {
                    console.log(
                        `Image file already missing, treating as deleted: ${filename}`
                    );
                    return;
                }

                if (fsError.code === "EBUSY" && attempt < maxRetries) {
                    console.warn(
                        `File busy, retry ${attempt}/${maxRetries} deleting: ${filename}`
                    );

                    if (global.gc) {
                        global.gc();
                    }

                    const delay = delayMs * 1.5 ** (attempt - 1);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }

                if (attempt === maxRetries) {
                    if (fsError.code === "EBUSY") {
                        await markFileForDeletion(filePath, filename);
                        return;
                    } else {
                        throw new Error(
                            `Failed to delete file: ${fsError.message}`
                        );
                    }
                }
            } else {
                throw new Error(`Failed to delete file: ${error}`);
            }
        }
    }
}

/**
 * Mark a locked file for later deletion by renaming to *.deleted.
 */
async function markFileForDeletion(
    filePath: string,
    filename: string
): Promise<void> {
    try {
        const deletedPath = `${filePath}.deleted`;
        await fs.rename(filePath, deletedPath);
        console.log(
            `File marked for deletion: ${filename} -> ${filename}.deleted`
        );

        setTimeout(async () => {
            try {
                await fs.unlink(deletedPath);
                console.log(`Deferred delete succeeded: ${filename}.deleted`);
            } catch (error) {
                console.warn(
                    `Deferred delete failed: ${filename}.deleted`,
                    error
                );
            }
        }, 5000);
    } catch (error) {
        console.error(
            `Failed to mark file for deletion: ${filename}`,
            error
        );
        throw new Error(
            `Unable to delete file; please remove manually: ${filename}`
        );
    }
}

/**
 * Get metadata for a single image.
 */
async function getImageInfo(filename: string): Promise<ImageMetaInfo | null> {
    return await loadImageMetadata(filename);
}

/**
 * List images with paging, sorting, and optional search.
 */
async function getImageList(
    options: ImageListOptions
): Promise<Record<string, ImageMetaInfo>> {
    const {
        page = 1,
        limit = 20,
        sortBy = "uploadedAt",
        sortOrder = "desc",
        searchTerm = null,
    } = options;
    const metadataMap = await getMetadataMap();

    let imageList = Object.values(metadataMap);
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        imageList = imageList.filter((image) => {
            return image.originalName.toLowerCase().includes(lowerSearchTerm);
        });
    }

    imageList.sort((a, b) => {
        const aValue = a[sortBy as keyof ImageMetaInfo];
        const bValue = b[sortBy as keyof ImageMetaInfo];

        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortOrder === "asc" ? -1 : 1;
        if (bValue === undefined) return sortOrder === "asc" ? 1 : -1;

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    imageList = imageList.slice(startIndex, endIndex);

    return imageList.reduce(
        (acc, item) => {
            acc[item.filename] = item;
            return acc;
        },
        {} as Record<string, ImageMetaInfo>
    );
}

function optimizeImageFromUrl(
    url: string | null | undefined,
    options: ImageOptions
) {
    if (!url) return null;
    if (url.toLowerCase().startsWith("https://images.pexels.com"))
        return optimizePexelsImageUrl(url, options);
    return url;
}

export const ImageService = {
    getMetadataFile,
    getMetadataMap,
    uploadImage,
    saveMetadata,
    deleteMetadata,
    processImage,
    deleteImage,
    getImageInfo,
    getImageList,
    optimizeImageFromUrl,
};
