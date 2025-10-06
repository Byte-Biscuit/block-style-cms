"use client";
import React from "react";
import {
    SuggestionMenuProps,
    DefaultReactSuggestionItem,
} from "@blocknote/react";
import {
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    Chip,
} from "@mui/material";
import {
    Title as TitleIcon,
    FormatQuote as QuoteIcon,
    FormatListNumbered as NumberedListIcon,
    FormatListBulleted as BulletListIcon,
    CheckBox as CheckListIcon,
    Article as HeadingIcon,
    Code as CodeIcon,
    TableChart as TableIcon,
    Image as ImageIcon,
    VideoFile as VideoIcon,
    AudioFile as AudioIcon,
    AttachFile as FileIcon,
    EmojiEmotions as EmojiIcon,
    TextFields as ParagraphIcon,
} from "@mui/icons-material";

// 扩展的 DefaultReactSuggestionItem 接口，包含 group 和其他字段
interface ExtendedSuggestionItem extends DefaultReactSuggestionItem {
    badge?: string;
    key?: string;
    group?: string;
    aliases?: string[];
}

// 图标映射 - 根据 key 或 title 匹配
const getItemIcon = (item: ExtendedSuggestionItem) => {
    const iconStyle = { fontSize: "18px", color: "#6b7280" };

    const key = item.key || item.title.toLowerCase().replace(/\s+/g, "_");

    switch (key) {
        case "heading":
        case "heading_2":
        case "heading_3":
        case "Heading 1":
        case "Heading 2":
        case "Heading 3":
            return <HeadingIcon sx={iconStyle} />;
        case "quote":
        case "Quote":
            return <QuoteIcon sx={iconStyle} />;
        case "numbered_list":
        case "Numbered List":
            return <NumberedListIcon sx={iconStyle} />;
        case "bullet_list":
        case "Bullet List":
            return <BulletListIcon sx={iconStyle} />;
        case "check_list":
        case "Check List":
            return <CheckListIcon sx={iconStyle} />;
        case "paragraph":
        case "Paragraph":
            return <ParagraphIcon sx={iconStyle} />;
        case "code_block":
        case "Code Block":
            return <CodeIcon sx={iconStyle} />;
        case "table":
        case "Table":
            return <TableIcon sx={iconStyle} />;
        case "image":
        case "Image":
            return <ImageIcon sx={iconStyle} />;
        case "video":
        case "Video":
            return <VideoIcon sx={iconStyle} />;
        case "audio":
        case "Audio":
            return <AudioIcon sx={iconStyle} />;
        case "file":
        case "File":
            return <FileIcon sx={iconStyle} />;
        case "emoji":
        case "Emoji":
            return <EmojiIcon sx={iconStyle} />;
        default:
            return <TitleIcon sx={iconStyle} />;
    }
};

// 获取快捷键 - 优先使用 badge 字段
const getShortcut = (item: ExtendedSuggestionItem) => {
    if (item.badge) {
        return item.badge;
    }

    // 兜底逻辑，基于 title 匹配
    switch (item.title) {
        case "Heading 1":
            return "Ctrl-Alt-1";
        case "Heading 2":
            return "Ctrl-Alt-2";
        case "Heading 3":
            return "Ctrl-Alt-3";
        case "Numbered List":
            return "Ctrl-Shift-7";
        case "Bullet List":
            return "Ctrl-Shift-8";
        case "Check List":
            return "Ctrl-Shift-9";
        case "Paragraph":
            return "Ctrl-Alt-0";
        case "Code Block":
            return "Ctrl-Alt-C";
        default:
            return null;
    }
};

const getDescription = (item: ExtendedSuggestionItem) => {
    return item.subtext || "";
};

const groupItems = (items: ExtendedSuggestionItem[]) => {
    const groups: { [key: string]: ExtendedSuggestionItem[] } = {};
    const groupOrder: string[] = [];

    items.forEach((item) => {
        const group = item.group || "Others";
        if (!groups[group]) {
            groups[group] = [];
            groupOrder.push(group);
        }
        groups[group].push(item);
    });

    return { groups, groupOrder };
};

const EnhancedSlashMenu = (
    props: SuggestionMenuProps<DefaultReactSuggestionItem>
) => {
    const extendedItems = props.items as ExtendedSuggestionItem[];
    const { groups, groupOrder } = groupItems(extendedItems);

    const flatItems: {
        item: ExtendedSuggestionItem;
        groupName: string;
        isGroupStart: boolean;
    }[] = [];
    groupOrder.forEach((groupName) => {
        groups[groupName].forEach((item, index) => {
            flatItems.push({
                item,
                groupName,
                isGroupStart: index === 0,
            });
        });
    });

    return (
        <Paper
            elevation={8}
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 400,
                maxHeight: 400,
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                boxShadow:
                    "0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)",
            }}
        >
            <List
                sx={{
                    py: 1,
                    px: 0,
                    width: "100%",
                    maxHeight: 400,
                    overflow: "auto",
                    overflowX: "hidden",
                    "& .MuiListItem-root": {
                        px: 1,
                        py: 0.5,
                        minHeight: "auto",
                        width: "100%",
                        boxSizing: "border-box",
                    },
                }}
            >
                {flatItems.map(({ item, groupName, isGroupStart }, index) => {
                    const shortcut = getShortcut(item);
                    const description = getDescription(item);

                    return (
                        <React.Fragment
                            key={`${groupName}-${
                                item.key || item.title
                            }-${index}`}
                        >
                            {isGroupStart && (
                                <>
                                    {index > 0 && <Divider sx={{ my: 1 }} />}
                                    <Box sx={{ px: 2, py: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#6b7280",
                                                fontWeight: 600,
                                                fontSize: "11px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            {groupName}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            <ListItem
                                component="div"
                                onClick={() => props.onItemClick?.(item)}
                                sx={{
                                    borderRadius: "6px",
                                    mx: 1,
                                    mb: 0.5,
                                    transition: "all 0.15s ease-in-out",
                                    cursor: "pointer",
                                    backgroundColor: "transparent",
                                    color: "inherit",
                                    "&:hover": {
                                        backgroundColor: "#f3f4f6",
                                    },
                                    "& .MuiListItemIcon-root": {
                                        color: "#6b7280",
                                    },
                                    "& .MuiTypography-root": {
                                        color: "inherit",
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: "32px" }}>
                                    {getItemIcon(item)}
                                </ListItemIcon>

                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: "14px",
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                lineHeight: 1.2,
                                                mt: 0.3,
                                            }}
                                        >
                                            {description}
                                        </Typography>
                                    }
                                    sx={{ margin: 0 }}
                                />

                                {/* 快捷键 */}
                                {shortcut && (
                                    <Box sx={{ ml: 1, flexShrink: 0 }}>
                                        <Chip
                                            label={shortcut}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height: "20px",
                                                fontSize: "10px",
                                                fontFamily: "monospace",
                                                maxWidth: "100px",
                                                backgroundColor: "#f9fafb",
                                                borderColor: "#e5e7eb",
                                                color: "#6b7280",
                                                "& .MuiChip-label": {
                                                    px: 1,
                                                    py: 0,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                },
                                            }}
                                        />
                                    </Box>
                                )}
                            </ListItem>
                        </React.Fragment>
                    );
                })}
            </List>
        </Paper>
    );
};

export default EnhancedSlashMenu;
