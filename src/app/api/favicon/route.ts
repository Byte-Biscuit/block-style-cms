import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CMS_DATA_PATH } from "@/settings";

export async function GET() {
    const dataDir = CMS_DATA_PATH || path.join(process.cwd(), "data");
    const publicDir = path.join(process.cwd(), "public");

    // 定义查找顺序和对应的 Content-Type
    const searchPaths = [
        { path: path.join(dataDir, "favicon.ico"), type: "image/x-icon" },
        { path: path.join(dataDir, "favicon.png"), type: "image/png" },
        { path: path.join(dataDir, "logo.png"), type: "image/png" },
        { path: path.join(publicDir, "favicon.ico"), type: "image/x-icon" },
        { path: path.join(publicDir, "logo.png"), type: "image/png" },
    ];

    for (const item of searchPaths) {
        if (fs.existsSync(item.path)) {
            try {
                const fileBuffer = fs.readFileSync(item.path);
                return new NextResponse(fileBuffer, {
                    headers: {
                        "Content-Type": item.type,
                        "Cache-Control": "public, max-age=3600, must-revalidate",
                    },
                });
            } catch (error) {
                console.error(`Error reading file at ${item.path}:`, error);
            }
        }
    }

    return new NextResponse("Favicon not found", { status: 404 });
}
