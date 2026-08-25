import type { NextRequest } from "next/server";
import { z } from "zod";
import { badRequest, failure, success } from "@/lib/response";
import { getVideoList, uploadVideo } from "@/lib/services/video-service";
import { withTiming } from "@/lib/with-timing";

/**
 * Video upload request validation
 */
const uploadVideoSchema = z.object({
    file: z.instanceof(File),
    originalName: z.string().optional(),
    generateThumbnail: z.boolean().optional().default(true),
    thumbnailTime: z.number().optional().default(1),
    enableCompression: z.boolean().optional().default(false),
    maxResolution: z
        .enum(["480p", "720p", "1080p", "original"])
        .optional()
        .default("original"),
});

/**
 * Video list query validation
 */
const videoListSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z
        .enum(["uploadedAt", "size", "filename", "duration"])
        .default("uploadedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    searchTerm: z.string().optional(),
    processedOnly: z.coerce.boolean().optional().default(false),
});

/**
 * POST /api/m/videos — upload video
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return badRequest("File not found");
        }

        // Parse optional fields
        const options = {
            originalName: (formData.get("originalName") as string) || undefined,
            generateThumbnail: formData.get("generateThumbnail") === "true",
            thumbnailTime: formData.get("thumbnailTime")
                ? parseFloat(formData.get("thumbnailTime") as string)
                : 1,
            enableCompression: formData.get("enableCompression") === "true",
            maxResolution:
                (formData.get("maxResolution") as string) || "original",
        };

        // Validate input
        const validation = uploadVideoSchema.safeParse({
            file,
            ...options,
        });

        if (!validation.success) {
            return badRequest("Invalid request parameters");
        }

        // Handle video upload
        const videoInfo = await uploadVideo(file, validation.data);

        return success("Video uploaded successfully", videoInfo);
    } catch (error) {
        console.error("Video upload failed:", error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure("Video upload failed");
    }
});

/**
 * GET /api/m/videos — list videos
 */
export const GET = withTiming(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);

        const queryParams = {
            page: searchParams.get("page")
                ? parseInt(searchParams.get("page")!, 10)
                : 1,
            limit: searchParams.get("limit")
                ? parseInt(searchParams.get("limit")!, 10)
                : 20,
            sortBy:
                (searchParams.get("sortBy") as
                    | "uploadedAt"
                    | "size"
                    | "filename"
                    | "duration") || "uploadedAt",
            sortOrder:
                (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
            searchTerm: searchParams.get("searchTerm") || undefined,
            processedOnly:
                searchParams.get("processedOnly") === "true" || false,
        };

        // Validate query params
        const validation = videoListSchema.safeParse(queryParams);

        if (!validation.success) {
            return badRequest("Invalid query parameters");
        }

        // Fetch video list
        const result = await getVideoList(validation.data);

        return success("Video list retrieved successfully", result);
    } catch (error) {
        console.error("Failed to retrieve video list:", error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure("Failed to retrieve video list");
    }
});
