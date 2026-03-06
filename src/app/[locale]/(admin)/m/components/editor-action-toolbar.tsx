"use client";

import React from "react";
import { Box, IconButton, Tooltip, Stack, Divider } from "@mui/material";
import {
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    OpenInFull as OpenInFullIcon,
    ContentPaste as ContentPasteIcon,
    DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { BlockNoteEditor } from "@blocknote/core";

interface EditorActionToolbarProps {
    editor: BlockNoteEditor<any, any, any>;
    isBrowserFullscreen: boolean;
    isMonitorFullscreen: boolean;
    onToggleBrowserFullscreen: () => void;
    onToggleMonitorFullscreen: () => void;
}

const EditorActionToolbar: React.FC<EditorActionToolbarProps> = ({
    editor,
    isBrowserFullscreen,
    isMonitorFullscreen,
    onToggleBrowserFullscreen,
    onToggleMonitorFullscreen,
}) => {
    const t = useTranslations("admin.block_note_editor");

    const handleClear = () => {
        if (window.confirm(t("actions.confirmClear"))) {
            editor.replaceBlocks(editor.document, [
                {
                    type: "paragraph",
                    content: [],
                },
            ]);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            const blocks = await editor.tryParseMarkdownToBlocks(text);
            const selection = editor.getTextCursorPosition();

            if (selection) {
                editor.insertBlocks(blocks, selection.block, "after");
            } else {
                editor.insertBlocks(
                    blocks,
                    editor.document[editor.document.length - 1],
                    "after"
                );
            }
        } catch (err) {
            console.error("Paste failed:", err);
        }
    };

    return (
        <Box
            className="editor-action-toolbar"
            sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 100,
                // Fullscreen background enhancement
                backgroundColor:
                    isBrowserFullscreen || isMonitorFullscreen
                        ? "action.hover" // More distinct background in fullscreen
                        : "background.paper",
                backdropFilter: "blur(4px)", // Modern semi-transparent effect
                borderRadius: 2,
                boxShadow: 3,
                p: 0.5,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                ...(isBrowserFullscreen || isMonitorFullscreen
                    ? {
                          position: "sticky",
                          float: "right",
                          mr: 1,
                          mt: 1,
                          right: "auto", // Reset right when using float in sticky
                      }
                    : {}),
            }}
        >
            <Stack direction="row" spacing={0.5}>
                <Tooltip title={t("actions.paste")} arrow>
                    <IconButton
                        size="small"
                        onClick={handlePaste}
                        color="primary"
                    >
                        <ContentPasteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("actions.clear")} arrow>
                    <IconButton
                        size="small"
                        onClick={handleClear}
                        color="error"
                    >
                        <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title={t("fullscreen.browser")} arrow>
                    <IconButton
                        size="small"
                        onClick={onToggleBrowserFullscreen}
                        color={isBrowserFullscreen ? "primary" : "default"}
                    >
                        {isBrowserFullscreen ? (
                            <FullscreenExitIcon fontSize="small" />
                        ) : (
                            <FullscreenIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("fullscreen.monitor")} arrow>
                    <IconButton
                        size="small"
                        onClick={onToggleMonitorFullscreen}
                        color={isMonitorFullscreen ? "primary" : "default"}
                    >
                        <OpenInFullIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    );
};

export default EditorActionToolbar;
