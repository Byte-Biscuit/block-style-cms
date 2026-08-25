import {
    Archive as ArchiveIcon,
    Code as CodeIcon,
    InsertDriveFile as DefaultFileIcon,
    Description as DocumentIcon,
    MenuBook as EbookIcon,
    Slideshow as PresentationIcon,
    TableChart as SpreadsheetIcon,
} from "@mui/icons-material";
import React from "react";

interface FileIconProps {
    category: string;
    className?: string;
    size?: number;
}

export function FileIcon({ category, className, size = 24 }: FileIconProps) {
    const iconProps = {
        sx: { fontSize: size },
        className: className,
    };

    switch (category) {
        case "document":
            return <DocumentIcon {...iconProps} />;
        case "spreadsheet":
            return <SpreadsheetIcon {...iconProps} />;
        case "presentation":
            return <PresentationIcon {...iconProps} />;
        case "archive":
            return <ArchiveIcon {...iconProps} />;
        case "code":
            return <CodeIcon {...iconProps} />;
        case "ebook":
            return <EbookIcon {...iconProps} />;
        default:
            return <DefaultFileIcon {...iconProps} />;
    }
}

export default FileIcon;
