"use client";

import { useBlockNoteEditor, useEditorChange } from "@blocknote/react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Divider, Paper, Typography } from "@mui/material";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import {
    CODE_BLOCK_LANGUAGES,
    CODE_LANGUAGE_GROUP_ORDER,
    type CodeLanguageGroup,
    getCodeLanguageName,
} from "./code-block-languages";

type Host = { blockId: string; host: HTMLElement };

const MENU_WIDTH = 240;
const MENU_MAX_HEIGHT = 320;

function portalRoot(): HTMLElement {
    return (document.fullscreenElement ?? document.body) as HTMLElement;
}

function filterLanguageIds(query: string): string[] {
    const q = query.trim().toLowerCase();
    return Object.entries(CODE_BLOCK_LANGUAGES)
        .filter(([id, def]) => {
            if (!q) return true;
            return (
                id.includes(q) ||
                def.name.toLowerCase().includes(q) ||
                (def.aliases ?? []).some((alias) =>
                    alias.toLowerCase().includes(q)
                )
            );
        })
        .map(([id]) => id);
}

function CodeLanguagePicker({ blockId }: { blockId: string }) {
    const editor = useBlockNoteEditor();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [pos, setPos] = useState({
        top: 0,
        left: 0,
        maxHeight: MENU_MAX_HEIGHT,
    });
    const [language, setLanguage] = useState("text");

    const syncLanguage = useCallback(() => {
        const block = editor.getBlock(blockId);
        if (block?.type === "codeBlock") {
            setLanguage(block.props.language);
        }
    }, [blockId, editor]);

    useEffect(() => {
        syncLanguage();
    }, [syncLanguage]);
    useEditorChange(syncLanguage, editor);

    const matches = useMemo(() => filterLanguageIds(query), [query]);
    const grouped = useMemo(() => {
        const groups: { group: CodeLanguageGroup; ids: string[] }[] = [];
        for (const group of CODE_LANGUAGE_GROUP_ORDER) {
            const ids = matches.filter(
                (id) => CODE_BLOCK_LANGUAGES[id].group === group
            );
            if (ids.length > 0) groups.push({ group, ids });
        }
        return groups;
    }, [matches]);

    const placeMenu = useCallback(() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const padding = 8;
        const spaceBelow = window.innerHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;
        const placeBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
        const maxHeight = Math.min(
            MENU_MAX_HEIGHT,
            Math.max(placeBelow ? spaceBelow : spaceAbove, 120)
        );
        const left = Math.min(
            rect.left,
            window.innerWidth - MENU_WIDTH - padding
        );
        setPos({
            top: placeBelow ? rect.bottom + 4 : rect.top - maxHeight - 4,
            left: Math.max(padding, left),
            maxHeight,
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        searchRef.current?.focus();
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current?.contains(target) ||
                buttonRef.current?.contains(target)
            ) {
                return;
            }
            setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        const onScroll = (event: Event) => {
            const target = event.target as Node | null;
            if (target && menuRef.current?.contains(target)) return;
            placeMenu();
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [open, placeMenu]);

    const selectLanguage = (id: string) => {
        editor.updateBlock(blockId, { props: { language: id } });
        setOpen(false);
        setQuery("");
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className="bn-code-language-picker-trigger"
                disabled={!editor.isEditable}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                    if (open) {
                        setOpen(false);
                        return;
                    }
                    placeMenu();
                    setQuery("");
                    setOpen(true);
                }}
            >
                <span>{getCodeLanguageName(language)}</span>
                <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
            </button>
            {open &&
                createPortal(
                    <Paper
                        ref={menuRef}
                        elevation={8}
                        sx={{
                            position: "fixed",
                            top: pos.top,
                            left: pos.left,
                            zIndex: 1400,
                            width: MENU_WIDTH,
                            maxHeight: pos.maxHeight,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <Box sx={{ px: 1, pt: 1, pb: 0.5 }}>
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search language"
                                className="bn-code-language-picker-search"
                            />
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                                py: 0.5,
                            }}
                        >
                            {grouped.length === 0 ? (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        px: 2,
                                        py: 1.5,
                                        color: "#6b7280",
                                    }}
                                >
                                    No matches
                                </Typography>
                            ) : (
                                grouped.map(({ group, ids }, groupIndex) => (
                                    <React.Fragment key={group}>
                                        {groupIndex > 0 && (
                                            <Divider sx={{ my: 0.5 }} />
                                        )}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "block",
                                                px: 1.5,
                                                py: 0.5,
                                                color: "#6b7280",
                                                fontWeight: 600,
                                                fontSize: "11px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            {group}
                                        </Typography>
                                        {ids.map((id) => (
                                            <button
                                                key={id}
                                                type="button"
                                                className={
                                                    id === language
                                                        ? "bn-code-language-picker-item is-active"
                                                        : "bn-code-language-picker-item"
                                                }
                                                onMouseDown={(event) =>
                                                    event.preventDefault()
                                                }
                                                onClick={() =>
                                                    selectLanguage(id)
                                                }
                                            >
                                                {CODE_BLOCK_LANGUAGES[id].name}
                                            </button>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </Box>
                    </Paper>,
                    portalRoot()
                )}
        </>
    );
}

function sameHosts(a: Host[], b: Host[]): boolean {
    return (
        a.length === b.length &&
        a.every(
            (item, i) =>
                item.blockId === b[i].blockId && item.host === b[i].host
        )
    );
}

export function CodeLanguagePickerOverlay() {
    const editor = useBlockNoteEditor();
    const [hosts, setHosts] = useState<Host[]>([]);

    useEffect(() => {
        let observer: MutationObserver | null = null;
        let cancelled = false;
        let raf = 0;

        const scan = () => {
            const root = editor.domElement;
            if (!root) return;
            const next: Host[] = [];
            root.querySelectorAll(
                '.bn-block-content[data-content-type="codeBlock"] > div[contenteditable="false"]'
            ).forEach((host) => {
                const blockEl = host.closest("[data-id]") as HTMLElement | null;
                const blockId = blockEl?.dataset.id;
                if (!blockId) return;
                const select = host.querySelector("select");
                if (select) select.hidden = true;
                next.push({ blockId, host: host as HTMLElement });
            });
            setHosts((prev) => (sameHosts(prev, next) ? prev : next));
        };

        const attach = () => {
            if (cancelled) return;
            const root = editor.domElement;
            if (!root) {
                raf = requestAnimationFrame(attach);
                return;
            }
            scan();
            observer = new MutationObserver(scan);
            observer.observe(root, { childList: true, subtree: true });
        };

        attach();
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            observer?.disconnect();
        };
    }, [editor]);

    return (
        <>
            {hosts.map(({ blockId, host }) =>
                createPortal(
                    <CodeLanguagePicker blockId={blockId} />,
                    host,
                    blockId
                )
            )}
        </>
    );
}
