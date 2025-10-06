import React from "react";
import {
    Description as DocumentIcon,
    TableChart as SpreadsheetIcon,
    Slideshow as PresentationIcon,
    Archive as ArchiveIcon,
    Code as CodeIcon,
    MenuBook as EbookIcon,
    InsertDriveFile as DefaultFileIcon,
} from "@mui/icons-material";

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
