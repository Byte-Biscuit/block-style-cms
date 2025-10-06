import { NextRequest, NextResponse } from "next/server";
import { FileService } from "@/lib/services/file-service";
import { success, failure, badRequest } from "@/lib/response";
import { withTiming } from "@/lib/with-timing";

// GET - 获取附件列表
async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const sortBy = (searchParams.get("sortBy") || "uploadedAt") as "uploadedAt" | "size" | "filename" | "originalName";
        const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
        const searchTerm = searchParams.get("searchTerm") || undefined;
        const category = searchParams.get("category") || undefined;

        const result = await FileService.getFileList({
            page,
            limit,
            sortBy,
            sortOrder,
            searchTerm,
            category
        });

        return success("File list retrieved successfully", result);
    } catch (error) {
        console.error("Error fetching file list:", error);
        return failure("Failed to fetch file list");
    }
}

// POST - 上传附件
async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return badRequest("No file provided")
        }

        const metadata = await FileService.uploadFile(file);

        return success("File uploaded successfully", metadata);
    } catch (error: unknown) {
        console.error("Error uploading file:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
        return failure("Error uploading file", errorMessage);
    }
}

// DELETE - 删除文件
async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get("filename");

        if (!filename) {
            return NextResponse.json(
                { code: 400, message: "Filename is required", payload: {} },
                { status: 400 }
            );
        }

        await FileService.deleteFile(filename);

        return success("File deleted successfully", { message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete file";
        return NextResponse.json(
            { code: 500, message: errorMessage, payload: {} },
            { status: 500 }
        );
    }
}

const wrappedGET = withTiming(GET);
const wrappedPOST = withTiming(POST);
const wrappedDELETE = withTiming(DELETE);

export {
    wrappedGET as GET,
    wrappedPOST as POST,
    wrappedDELETE as DELETE
};
