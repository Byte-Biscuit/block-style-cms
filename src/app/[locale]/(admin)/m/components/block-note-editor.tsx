"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import {
    SuggestionMenuController,
    useCreateBlockNote,
    DefaultReactSuggestionItem,
} from "@blocknote/react";
import type { BlockSchemaFromSpecs, Dictionary } from "@blocknote/core";
import {
    BlockNoteEditor,
    filterSuggestionItems,
    defaultBlockSpecs,
    getDefaultSlashMenuItems,
    insertOrUpdateBlock,
    BlockNoteSchema,
} from "@blocknote/core";
import {
    EnhancedImageBlockSpec,
    defaultNewEnhancedImageBlock,
    ENHANCED_IMAGE_BLOCK_TYPE,
    EnhancedVideoBlockSpec,
    defaultNewEnhancedVideoBlock,
    ENHANCED_VIDEO_BLOCK_TYPE,
    EnhancedAudioBlockSpec,
    defaultNewEnhancedAudioBlock,
    ENHANCED_AUDIO_BLOCK_TYPE,
    EnhancedFileBlockSpec,
    defaultNewEnhancedFileBlock,
    ENHANCED_FILE_BLOCK_TYPE,
    MermaidBlockSpec,
    defaultNewMermaidBlock,
    MERMAID_BLOCK_TYPE,
} from "@/blockn/index";
import EnhanceSlashMenu from "@/blockn/enhanced-slash-menu";
import type { EnhancedBlock, EnhancedPartialBlock } from "@/blockn/types";
import { useTranslations } from "next-intl";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import "@/admin/m/components/block-note-editor.css";

const schema = BlockNoteSchema.create().extend({
    blockSpecs: {
        ...defaultBlockSpecs,
        [ENHANCED_IMAGE_BLOCK_TYPE]: EnhancedImageBlockSpec,
        [ENHANCED_VIDEO_BLOCK_TYPE]: EnhancedVideoBlockSpec,
        [ENHANCED_AUDIO_BLOCK_TYPE]: EnhancedAudioBlockSpec,
        [ENHANCED_FILE_BLOCK_TYPE]: EnhancedFileBlockSpec,
        [MERMAID_BLOCK_TYPE]: MermaidBlockSpec,
    },
});

interface BlockNoteEditorProps {
    value?: EnhancedBlock[] | EnhancedPartialBlock[];
    dictionary: Record<string, unknown>;
    onChange: (value: EnhancedBlock[] | EnhancedPartialBlock[]) => void;
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

    const initialContent: EnhancedPartialBlock[] =
        value && value.length > 0
            ? value
            : [
                  {
                      id: Math.random().toString(36).slice(2),
                      type: "paragraph",
                      props: {},
                      content: [],
                  },
              ];

    const editor = useCreateBlockNote({
        schema,
        initialContent,
        dictionary: dictionary as Dictionary,
        heading: {
            levels: [1, 2, 3, 4, 5, 6],
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

    const getCustomSlashMenuItems = useMemo(
        () =>
            (
                editor: BlockNoteEditor<
                    BlockSchemaFromSpecs<typeof schema.blockSpecs>
                >
            ): DefaultReactSuggestionItem[] => {
                const defaultItems = getDefaultSlashMenuItems(editor);
                const enhancedImageItem = {
                    key: ENHANCED_IMAGE_BLOCK_TYPE,
                    onItemClick: () => {
                        insertOrUpdateBlock(
                            editor,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            defaultNewEnhancedImageBlock as any
                        );
                    },
                    ...editor.dictionary?.enhanced_slash_menu.enhanced_image,
                };
                const enhancedVideoItem = {
                    key: ENHANCED_VIDEO_BLOCK_TYPE,
                    onItemClick: () => {
                        insertOrUpdateBlock(
                            editor,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            defaultNewEnhancedVideoBlock as any
                        );
                    },
                    ...editor.dictionary?.enhanced_slash_menu.enhanced_video,
                };
                const enhancedAudioItem = {
                    key: ENHANCED_AUDIO_BLOCK_TYPE,
                    onItemClick: () => {
                        insertOrUpdateBlock(
                            editor,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            defaultNewEnhancedAudioBlock as any
                        );
                    },
                    ...editor.dictionary?.enhanced_slash_menu.enhanced_audio,
                };
                const enhancedFileItem = {
                    key: ENHANCED_FILE_BLOCK_TYPE,
                    onItemClick: () => {
                        insertOrUpdateBlock(
                            editor,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            defaultNewEnhancedFileBlock as any
                        );
                    },
                    ...editor.dictionary?.enhanced_slash_menu.enhanced_file,
                };

                const mermaidItem = {
                    key: MERMAID_BLOCK_TYPE,
                    onItemClick: () => {
                        insertOrUpdateBlock(
                            editor,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            defaultNewMermaidBlock as any
                        );
                    },
                    ...editor.dictionary?.enhanced_slash_menu.mermaid,
                };

                // Modify existing items instead of simply pushing new items
                const modifiedItems = defaultItems.map((item) => {
                    if (item.key === "image") {
                        return enhancedImageItem;
                    }
                    if (item.key === "video") {
                        return enhancedVideoItem;
                    }
                    if (item.key === "audio") {
                        return enhancedAudioItem;
                    }
                    if (item.key === "file") {
                        return enhancedFileItem;
                    }
                    return item;
                });

                // Find Advanced group position and insert Mermaid item
                const advancedGroupIndex = modifiedItems.findIndex(
                    (item) => item.key === "table"
                );
                if (advancedGroupIndex !== -1) {
                    // Insert after the first item in Advanced group
                    modifiedItems.splice(
                        advancedGroupIndex + 1,
                        0,
                        mermaidItem
                    );
                } else {
                    // If Advanced group not found, add to the end
                    modifiedItems.push(mermaidItem);
                }

                return modifiedItems;
            },
        []
    );

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
            >
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) => {
                        return filterSuggestionItems(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            getCustomSlashMenuItems(editor as any),
                            query
                        );
                    }}
                    suggestionMenuComponent={EnhanceSlashMenu}
                ></SuggestionMenuController>
            </BlockNoteView>
        </div>
    );
};

export default EnhancedBlockNoteEditor;
