import React from "react";
import { formatBytes, getFileCategory } from "@/lib/file-utils";
import { getFileTypeColor } from "@/lib/style-classes";
import FileIcon from "@/components/file-icon";
import Link from "next/link";
import { IconButton } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";

export interface FileBlockProps {
    filename?: string;
    originalName?: string;
    size?: number;
    fileExtension?: string;
    alignment?: "left" | "center" | "right";
}

export interface EnhancedFileBlockData {
    id: string;
    type: "enhancedFile";
    props: FileBlockProps;
}

interface EnhancedFileProps {
    data: EnhancedFileBlockData;
    className?: string;
    controls?: React.ReactNode;
}

export const EnhancedFile: React.FC<EnhancedFileProps> = ({
    data,
    className = "",
    controls = null,
}) => {
    const { props } = data;

    if (!props?.filename) return null;
    const { filename, originalName, fileExtension } = props;

    const tagClasses = [
        props.alignment === "center" && "mx-auto",
        props.alignment === "right" && "ml-auto",
        props.alignment === "left" && "mr-auto",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const fileExt = fileExtension || "";
    const fileSize = props.size ? formatBytes(props.size) : "";
    const displayName = originalName || filename;

    return (
        <div className={tagClasses}>
            <div
                className={`group flex items-center rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${getFileTypeColor(fileExt)}`}
            >
                <div className="mr-3 flex-shrink-0">
                    <FileIcon category={getFileCategory(fileExt)} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {displayName}
                    </p>
                    <div className="mt-1 flex items-center text-xs opacity-75">
                        <span>{fileExt.toUpperCase().replace(".", "")}</span>
                        {fileSize && (
                            <>
                                <span className="mx-1">•</span>
                                <span>{fileSize}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="ml-3 flex-shrink-0">
                    <Link
                        href={`/files/${filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download"
                    >
                        <IconButton
                            className={
                                "text-gray-800 transition-colors hover:bg-gray-400 hover:text-gray-900 dark:bg-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            }
                            color="inherit"
                        >
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                    </Link>
                </div>
            </div>
            {controls && (
                <div className="absolute top-1 right-1 z-50">{controls}</div>
            )}
        </div>
    );
};

export default EnhancedFile;
