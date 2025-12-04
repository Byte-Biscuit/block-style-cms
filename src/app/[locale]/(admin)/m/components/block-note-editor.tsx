"use client";

import React, { useState, useRef, useCallback} from "react";
import { BlockNoteView } from "@blocknote/mantine";
import {
    SuggestionMenuController,
    useCreateBlockNote,
    FormattingToolbarController,
} from "@blocknote/react";
import type { Dictionary } from "@blocknote/core";
import {
    filterSuggestionItems,
} from "@blocknote/core";
import { type LocalBlock as Block } from "@/block-note/schema";
import EnhanceSlashMenu,{getSlashMenuItems} from "@/block-note/slash-menu/enhanced-slash-menu";
import EnhancedFormattingToolbar from "@/block-note/toolbar/enhanced-formatting-toolbar";
import { useTranslations } from "next-intl";
import {schema} from "@/block-note/schema"
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
            {/* Fullscreen control buttons */}
            <div className="fullscreen-controls">
                <button
                    onClick={toggleBrowserFullscreen}
                    className={`fullscreen-btn ${
                        isBrowserFullscreen ? "active" : ""
                    }`}
                    title={t("fullscreen.browser")}
                    type="button"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                </button>
                <button
                    onClick={toggleMonitorFullscreen}
                    className={`fullscreen-btn ${
                        isMonitorFullscreen ? "active" : ""
                    }`}
                    title={t("fullscreen.monitor")}
                    type="button"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <rect
                            x="2"
                            y="3"
                            width="20"
                            height="14"
                            rx="2"
                            ry="2"
                        />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                </button>
            </div>

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
                <FormattingToolbarController formattingToolbar={()=><EnhancedFormattingToolbar />} />
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) => {
                        return filterSuggestionItems(
                            getSlashMenuItems(editor),
                            query
                        );
                    }}
                    suggestionMenuComponent={EnhanceSlashMenu }
                />
            </BlockNoteView>
        </div>
    );
};

export default EnhancedBlockNoteEditor;
