import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { FILE_DIR } from "@/settings";
import { validateFileSecurity, getFileMimeType } from "@/lib/file-utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    const validation = validateFileSecurity(filename, {
        baseDirectory: FILE_DIR
    });

    if (!validation.isValid) {
        return new NextResponse(validation.error, { status: 400 });
    }

    const filePath = path.join(FILE_DIR, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    try {
        const stats = fs.statSync(filePath);

        // 使用公共方法获取 MIME 类型
        const mimeType = getFileMimeType(filename);

        // 读取文件
        const fileBuffer = fs.readFileSync(filePath);

        // 设置响应头
        const headers = new Headers({
            "Content-Type": mimeType,
            "Content-Length": stats.size.toString(),
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
        });

        return new NextResponse(fileBuffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Error serving attachment file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
