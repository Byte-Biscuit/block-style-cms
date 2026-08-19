"use client";

import type { Dictionary } from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import {
    FormattingToolbarController,
    SuggestionMenuController,
    useCreateBlockNote,
} from "@blocknote/react";
import { flip, offset, shift, size } from "@floating-ui/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useRef, useState } from "react";
import { CodeLanguagePickerOverlay } from "@/block-note/code-language-picker";
import {
    type LocalBlock as Block,
    extensions,
    schema,
} from "@/block-note/schema";
import EnhanceSlashMenu, {
    getSlashMenuItems,
} from "@/block-note/slash-menu/enhanced-slash-menu";
import EnhancedFormattingToolbar from "@/block-note/toolbar/enhanced-formatting-toolbar";
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
    // `null` tells BlockNote to portal onto document.body. An HTMLElement is
    // only needed when the editor is in native fullscreen (body is not visible).
    const [slashMenuPortal, setSlashMenuPortal] = useState<HTMLElement | null>(
        null
    );
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
        extensions,
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

    // Native fullscreen hides anything portaled to document.body, so retarget
    // the slash menu to the fullscreen element. Otherwise keep `null` (body).
    React.useEffect(() => {
        const syncPortalAndFullscreen = () => {
            const fullscreenEl =
                document.fullscreenElement as HTMLElement | null;
            setSlashMenuPortal(fullscreenEl);
            if (!fullscreenEl) {
                setIsMonitorFullscreen(false);
            }
        };

        syncPortalAndFullscreen();
        document.addEventListener("fullscreenchange", syncPortalAndFullscreen);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                syncPortalAndFullscreen
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
                <CodeLanguagePickerOverlay />
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
                    portalElement={slashMenuPortal}
                    floatingUIOptions={{
                        useFloatingOptions: {
                            strategy: "fixed",
                            middleware: [
                                offset(10),
                                flip({
                                    fallbackPlacements: ["top-start"],
                                    padding: 10,
                                }),
                                shift({ padding: 10 }),
                                size({
                                    padding: 10,
                                    apply({ availableHeight, elements }) {
                                        Object.assign(elements.floating.style, {
                                            maxHeight: `${Math.max(120, availableHeight)}px`,
                                            overflow: "hidden",
                                        });
                                    },
                                }),
                            ],
                        },
                        elementProps: {
                            style: { zIndex: 1300 },
                        },
                    }}
                />
            </BlockNoteView>
        </div>
    );
};

export default EnhancedBlockNoteEditor;
