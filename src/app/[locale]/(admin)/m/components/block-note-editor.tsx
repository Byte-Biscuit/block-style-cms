"use client";

import React, { useState, useRef, useCallback } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import {
    SuggestionMenuController,
    useCreateBlockNote,
    FormattingToolbarController,
} from "@blocknote/react";
import type { Dictionary } from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { type LocalBlock as Block } from "@/block-note/schema";
import EnhanceSlashMenu, {
    getSlashMenuItems,
} from "@/block-note/slash-menu/enhanced-slash-menu";
import EnhancedFormattingToolbar from "@/block-note/toolbar/enhanced-formatting-toolbar";
import { useTranslations } from "next-intl";
import { schema } from "@/block-note/schema";
import EditorActionToolbar from "./editor-action-toolbar";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import "@/admin/m/components/block-note-editor.css";

interface BlockNoteEditorProps {
    value?: Block[];
    dictionary: Record<string, unknown>;
    onChange: (value: Block[]) => void;
    theme?: "light" | "dark";
}

const EnhancedBlockNoteEditor: React.FC<BlockNoteEditorProps> = ({
    value,
    dictionary,
    onChange,
    theme = "light",
}) => {
    const t = useTranslations("admin.block_note_editor");
    const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
    const [isMonitorFullscreen, setIsMonitorFullscreen] = useState(false);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const initialContent: Block[] =
        value && value.length > 0
            ? value
            : [
                  {
                      id: Math.random().toString(36).slice(2),
                      type: "paragraph",
                      props: {
                          textColor: "default",
                          backgroundColor: "default",
                          textAlignment: "left",
                      },
                      content: [],
                      children: [],
                  },
              ];

    const editor = useCreateBlockNote({
        schema,
        initialContent,
        dictionary: dictionary as Dictionary,
        heading: {
            levels: [1, 2, 3, 4, 5, 6],
        },
        tables: {
            splitCells: true,
            cellTextColor: true,
            cellBackgroundColor: true,
        },
        domAttributes: {
            editor: {
                class: "notion-like-editor",
                "data-theme": theme,
            },
            block: {
                class: "notion-block",
            },
            blockContent: {
                class: "notion-block-content",
            },
            inlineContent: {
                class: "notion-inline-content",
            },
        },
    });
    // Browser fullscreen functionality
    const toggleBrowserFullscreen = useCallback(() => {
        setIsBrowserFullscreen(!isBrowserFullscreen);
        if (isMonitorFullscreen) {
            setIsMonitorFullscreen(false);
        }
    }, [isBrowserFullscreen, isMonitorFullscreen]);

    // Monitor fullscreen functionality
    const toggleMonitorFullscreen = useCallback(async () => {
        if (!isMonitorFullscreen) {
            if (editorContainerRef.current) {
                try {
                    await editorContainerRef.current.requestFullscreen();
                    setIsMonitorFullscreen(true);
                    setIsBrowserFullscreen(false);
                } catch (err) {
                    console.error(t("errors.enableFullscreen"), err);
                }
            }
        } else {
            try {
                await document.exitFullscreen();
                setIsMonitorFullscreen(false);
            } catch (err) {
                console.error(t("errors.exitFullscreen"), err);
            }
        }
    }, [isMonitorFullscreen, t]);

    // Listen for fullscreen state changes
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsMonitorFullscreen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    return (
        <div
            id="id-block-note-editor"
            ref={editorContainerRef}
            className={`editor-container ${
                isBrowserFullscreen ? "browser-fullscreen" : ""
            } ${isMonitorFullscreen ? "monitor-fullscreen" : ""}`}
        >
            <EditorActionToolbar
                editor={editor}
                isBrowserFullscreen={isBrowserFullscreen}
                isMonitorFullscreen={isMonitorFullscreen}
                onToggleBrowserFullscreen={toggleBrowserFullscreen}
                onToggleMonitorFullscreen={toggleMonitorFullscreen}
            />

            <BlockNoteView
                editor={editor}
                theme={theme}
                block-stye-blog="true"
                slashMenu={false}
                onChange={() => {
                    onChange(editor.document);
                }}
                formattingToolbar={false}
            >
                <FormattingToolbarController
                    formattingToolbar={() => <EnhancedFormattingToolbar />}
                />
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) => {
                        return filterSuggestionItems(
                            getSlashMenuItems(editor),
                            query
                        );
                    }}
                    suggestionMenuComponent={EnhanceSlashMenu}
                />
            </BlockNoteView>
        </div>
    );
};

export default EnhancedBlockNoteEditor;
