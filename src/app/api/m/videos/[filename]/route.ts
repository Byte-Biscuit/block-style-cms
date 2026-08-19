import type { NextRequest } from "next/server";
import { badRequest, failure, success } from "@/lib/response";
import { deleteVideo, updateVideoMetadata } from "@/lib/services/video-service";
import { withTiming } from "@/lib/with-timing";

export const DELETE = withTiming(
    async (request: NextRequest, ...args: unknown[]) => {
        const context = args[0] as { params: { filename: string } };
        const params = await context.params;

        try {
            const { filename } = params;

            if (!filename) {
                return badRequest("Missing filename parameter");
            }

            // URL decode filename (handle special characters)
            const decodedFilename = decodeURIComponent(filename);

            await deleteVideo(decodedFilename);

            return success("Video deleted successfully");
        } catch (error) {
            console.error("Failed to delete video:", error);

            if (error instanceof Error) {
                return badRequest(error.message);
            }

            return failure("Failed to delete video");
        }
    }
);

export const PATCH = withTiming(
    async (request: NextRequest, ...args: unknown[]) => {
        const context = args[0] as { params: { filename: string } };
        const params = await context.params;

        try {
            const { filename } = params;

            if (!filename) {
                return badRequest("Missing filename parameter");
            }

            // URL decode filename (handle special characters)
            const decodedFilename = decodeURIComponent(filename);

            const updates = await request.json();

            // Validate update fields
            const allowedFields = ["title", "description", "tags"];
            const validUpdates = Object.keys(updates)
                .filter((key) => allowedFields.includes(key))
                .reduce(
                    (obj, key) => {
                        obj[key] = updates[key];
                        return obj;
                    },
                    {} as Record<string, unknown>
                );

            if (Object.keys(validUpdates).length === 0) {
                return badRequest("No valid fields to update");
            }

            const updatedVideo = await updateVideoMetadata(
                decodedFilename,
                validUpdates
            );

            return success("Video metadata updated successfully", updatedVideo);
        } catch (error) {
            console.error("Failed to update video metadata:", error);

            if (error instanceof Error) {
                return badRequest(error.message);
            }

            return failure("Failed to update video metadata");
        }
    }
);
