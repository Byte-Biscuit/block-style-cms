import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CMS_DATA_PATH } from "@/settings";

export async function GET() {
    const dataLogoPath = path.join(CMS_DATA_PATH || '', "logo.png");
    const publicLogoPath = path.join(process.cwd(), "public", "logo.png");

    let logoPath = dataLogoPath;

    // 优先检查 data 目录下的 logo.png
    if (!fs.existsSync(dataLogoPath)) {
        // 如果不存在，则回退到 public 目录
        logoPath = publicLogoPath;
    }

    try {
        if (!fs.existsSync(logoPath)) {
            return new NextResponse("Logo not found", { status: 404 });
        }

        const fileBuffer = fs.readFileSync(logoPath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "image/png",
                // 设置缓存，提高性能。浏览器缓存 1 小时，且允许中间缓存
                "Cache-Control": "public, max-age=3600, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Error reading logo file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
