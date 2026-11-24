import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { validateFileSecurity } from "@/lib/file-utils";
import { ImageService } from "@/lib/services/image-service";
import { IMAGE_DIR } from "@/settings";
import type { ImageServeOptions } from "@/types/image";

type ResolvedImageRequest = {
    sourceFilename: string;
    options: ImageServeOptions;
};

/**
 * Virtual crawler-friendly alias: `photo.webp.jpg` → source `photo.webp`, format jpeg.
 * Also parses `?w=&h=&q=&f=&fit=` query params.
 */
function resolveImageRequest(
    filename: string,
    searchParams: URLSearchParams
): ResolvedImageRequest | { error: string } {
    const validation = validateFileSecurity(filename);
    if (!validation.isValid) {
        return { error: validation.error || "Invalid filename" };
    }

    let sourceFilename = filename;
    const options: ImageServeOptions = {};

    const alias = filename.match(/^(.+\.(?:webp|avif))\.(jpe?g|png)$/i);
    if (alias) {
        sourceFilename = alias[1];
        const sourceValidation = validateFileSecurity(sourceFilename);
        if (!sourceValidation.isValid) {
            return {
                error: sourceValidation.error || "Invalid source filename",
            };
        }
        const ext = alias[2].toLowerCase();
        options.f = ext === "png" ? "png" : "jpeg";
    }

    const width = searchParams.get("w");
    if (width) {
        const w = parseInt(width, 10);
        if (!Number.isNaN(w) && w > 0 && w <= 4096) {
            options.w = w;
        }
    }

    const height = searchParams.get("h");
    if (height) {
        const h = parseInt(height, 10);
        if (!Number.isNaN(h) && h > 0 && h <= 4096) {
            options.h = h;
        }
    }

    const quality = searchParams.get("q");
    if (quality) {
        const q = parseInt(quality, 10);
        if (!Number.isNaN(q) && q >= 1 && q <= 100) {
            options.q = q;
        }
    }

    const format = searchParams.get("f");
    if (format && ["jpeg", "png", "webp", "avif"].includes(format)) {
        options.f = format as "jpeg" | "png" | "webp" | "avif";
    }

    const fit = searchParams.get("fit");
    if (
        fit &&
        ["cover", "contain", "fill", "inside", "outside"].includes(fit)
    ) {
        options.fit = fit as
            | "cover"
            | "contain"
            | "fill"
            | "inside"
            | "outside";
    }

    return { sourceFilename, options };
}

function normalizeMime(mime: string): string {
    return mime.replace(/\s+/g, "");
}

function etagFor(
    filename: string,
    size: number,
    options: ImageServeOptions
): string {
    const variant = [
        options.f || "",
        options.w ?? "",
        options.h ?? "",
        options.q ?? "",
        options.fit || "",
    ].join(":");
    return `"${filename}-${size}-${variant}"`;
}

function needsProcessing(options: ImageServeOptions): boolean {
    return Boolean(
        options.w || options.h || options.q || options.f || options.fit
    );
}

function contentTypeFor(
    mimeType: string,
    options: ImageServeOptions,
    processed: boolean
): string {
    if (processed) {
        return normalizeMime(`image/${options.f || "jpeg"}`);
    }
    return normalizeMime(mimeType);
}

/**
 * Image GET API route.
 * Supports dynamic processing params:
 * - w: width
 * - h: height
 * - q: quality (1-100)
 * - f: format (jpeg|png|webp|avif)
 * - fit: fit mode (cover|contain|fill|inside|outside)
 * Also supports virtual suffix `/images/foo.webp.jpg` → source foo.webp, output jpeg.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        const resolved = resolveImageRequest(
            filename,
            new URL(request.url).searchParams
        );
        if ("error" in resolved) {
            return NextResponse.json(
                { error: resolved.error },
                { status: 400 }
            );
        }

        const { sourceFilename, options } = resolved;

        const imageInfo = await ImageService.getImageInfo(sourceFilename);
        if (!imageInfo) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const process = needsProcessing(options);
        let imageBuffer: Buffer;
        let contentType: string;

        if (process && imageInfo.mimeType !== "image/svg") {
            try {
                imageBuffer = await ImageService.processImage(sourceFilename, {
                    width: options.w,
                    height: options.h,
                    quality: options.q || 85,
                    format: options.f || "jpeg",
                    fit: options.fit || "cover",
                });
                contentType = contentTypeFor(imageInfo.mimeType, options, true);
            } catch (error) {
                console.error("Image processing failed:", error);
                return NextResponse.json(
                    { error: "Image processing failed" },
                    { status: 500 }
                );
            }
        } else {
            try {
                const filePath = path.join(IMAGE_DIR, sourceFilename);
                imageBuffer = await fs.readFile(filePath);
                contentType = contentTypeFor(
                    imageInfo.mimeType,
                    options,
                    false
                );
            } catch (error) {
                console.error("Failed to read image file:", error);
                return NextResponse.json(
                    { error: "Failed to read image file" },
                    { status: 500 }
                );
            }
        }

        const etag = etagFor(imageInfo.filename, imageInfo.size, options);
        const headers = new Headers({
            "Content-Type": contentType,
            "Content-Length": String(imageBuffer.byteLength),
            "Cache-Control": "public, max-age=31536000, immutable",
            ETag: etag,
            "Last-Modified": new Date(imageInfo.uploadedAt).toUTCString(),
        });

        const ifNoneMatch = request.headers.get("if-none-match");
        if (ifNoneMatch?.includes(etag)) {
            return new NextResponse(null, { status: 304, headers });
        }

        const ifModifiedSince = request.headers.get("if-modified-since");
        if (ifModifiedSince) {
            const modifiedTime = new Date(imageInfo.uploadedAt).getTime();
            const requestTime = new Date(ifModifiedSince).getTime();
            if (modifiedTime <= requestTime) {
                return new NextResponse(null, { status: 304, headers });
            }
        }

        return new NextResponse(imageBuffer as BodyInit, { headers });
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Image metadata HEAD API.
 * Same resolution as GET: honors ?f= and .webp.jpg virtual suffix, returns real Content-Type.
 */
export async function HEAD(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        if (!filename) {
            return new NextResponse(null, { status: 400 });
        }

        const resolved = resolveImageRequest(
            filename,
            new URL(request.url).searchParams
        );
        if ("error" in resolved) {
            return new NextResponse(null, { status: 400 });
        }

        const { sourceFilename, options } = resolved;
        const imageInfo = await ImageService.getImageInfo(sourceFilename);
        if (!imageInfo) {
            return new NextResponse(null, { status: 404 });
        }

        const process =
            needsProcessing(options) && imageInfo.mimeType !== "image/svg";
        const contentType = contentTypeFor(
            imageInfo.mimeType,
            options,
            process
        );
        const etag = etagFor(imageInfo.filename, imageInfo.size, options);

        const headers = new Headers({
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            ETag: etag,
            "Last-Modified": new Date(imageInfo.uploadedAt).toUTCString(),
            "X-Image-Width": imageInfo.width.toString(),
            "X-Image-Height": imageInfo.height.toString(),
        });

        // Processed bodies have unknown length without rendering; omit Content-Length.
        if (!process) {
            headers.set("Content-Length", imageInfo.size.toString());
        }

        return new NextResponse(null, { headers });
    } catch (error) {
        console.error("Error fetching image metadata:", error);
        return new NextResponse(null, { status: 500 });
    }
}
