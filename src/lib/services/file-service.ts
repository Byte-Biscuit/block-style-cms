import { promises as fs } from "node:fs";
import path from "node:path";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { FILE_DIR, MAX_ATTACHMENT_SIZE, META_DIR } from "@/settings";
import type {
    FileListOptions,
    FileListResult,
    FileMetadata,
    FileUploadOptions,
} from "@/types/file";
import {
    ALLOWED_FILE_MIME_TYPES,
    getFileCategory,
    getFileMimeType,
    isSupportedFileType,
} from "../file-utils";

function metadataPath(): string {
    return path.join(META_DIR, "file_metadata.json");
}

async function getMetadataMap(): Promise<Record<string, FileMetadata>> {
    try {
        const content = await fs.readFile(metadataPath(), "utf-8");
        return JSON.parse(content);
    } catch {
        return {};
    }
}

async function saveMetadata(
    metadataMap: Record<string, FileMetadata>
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
    if (
        !ALLOWED_FILE_MIME_TYPES.includes(file.type) &&
        !isSupportedFileType(file.name)
    ) {
        throw new Error(
            `Unsupported file type: ${file.type}. Allowed types include Office documents, PDF, archives, and Markdown.`
        );
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
        const maxSizeMB = Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024));
        throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
    }
}

export async function getFileInfo(
    filename: string
): Promise<FileMetadata | null> {
    const metadataMap = await getMetadataMap();
    return metadataMap[filename] || null;
}

export async function uploadFile(
    file: File,
    options: FileUploadOptions = {}
): Promise<FileMetadata> {
    validateFile(file);

    const originalName = options.originalName || file.name;
    const extension = path.extname(originalName).toLowerCase();

    let filename = generateSEOFriendlyFilename(originalName, extension);
    const metadataMap = await getMetadataMap();

    while (metadataMap[filename]) {
        const baseName = path.parse(filename).name;
        const suffix = uuidv4().substring(0, 8);
        filename = `${baseName}-${suffix}${extension}`;
    }

    const filePath = path.join(FILE_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const stats = await fs.stat(filePath);
    const fileInfo: FileMetadata = {
        filename,
        originalName,
        size: stats.size,
        mimeType: getFileMimeType(originalName),
        uploadedAt: new Date().toISOString(),
        fileExtension: extension,
        category: getFileCategory(extension),
    };

    metadataMap[filename] = fileInfo;
    await saveMetadata(metadataMap);
    return fileInfo;
}

export async function getFileList(
    options: FileListOptions = {}
): Promise<FileListResult> {
    const {
        page = 1,
        limit = 20,
        sortBy = "uploadedAt",
        sortOrder = "desc",
        searchTerm,
        category,
    } = options;

    const metadataMap = await getMetadataMap();
    let files = Object.values(metadataMap);

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        files = files.filter(
            (item) =>
                item.filename.toLowerCase().includes(searchLower) ||
                item.originalName.toLowerCase().includes(searchLower)
        );
    }

    if (category) {
        files = files.filter((item) => item.category === category);
    }

    files.sort((a, b) => {
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
            case "originalName":
                comparison = a.originalName.localeCompare(b.originalName);
                break;
            default:
                comparison =
                    new Date(a.uploadedAt).getTime() -
                    new Date(b.uploadedAt).getTime();
        }
        return sortOrder === "desc" ? -comparison : comparison;
    });

    const total = files.length;
    const startIndex = (page - 1) * limit;
    const paginatedFiles = files.slice(startIndex, startIndex + limit);

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

export async function deleteFile(filename: string): Promise<void> {
    const metadataMap = await getMetadataMap();

    if (!metadataMap[filename]) {
        throw new Error("File not found");
    }

    const filePath = path.join(FILE_DIR, filename);
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.warn("Failed to delete file:", error);
    }

    delete metadataMap[filename];
    await saveMetadata(metadataMap);
}
