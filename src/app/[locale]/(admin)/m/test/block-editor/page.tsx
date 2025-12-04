"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, Alert } from "@mui/material";
import dynamic from "next/dynamic";
import type { Dictionary } from "@blocknote/core";
import { getBlockNoteSelfDictionary } from "@/block-note/block-editor-utils";
import {LocalBlock as Block} from "@/block-note/schema";
import { useLocale } from "next-intl";

const BlockNoteEditor = dynamic(
    () => import("@/admin/m/components/block-note-editor"),
    { ssr: false }
);

const BlockEditorTestPage: React.FC = () => {
    const locale = useLocale();
    const [showJson, setShowJson] = useState(false);
    const [content, setContent] = useState<Block[]>([]);

    const [blockNoteDictionary, setBlockNoteDictionary] =
        useState<Dictionary | null>(null);

    useEffect(() => {
        getBlockNoteSelfDictionary(locale)
            .then((dict) => {
                if (dict) {
                    setBlockNoteDictionary(dict as Dictionary);
                } else {
                    console.warn(
                        `No locale found for ${locale}, using default locale.`
                    );
                }
            })
            .catch((err) => {
                console.error("Failed to set locale for BlockNote:", err);
            });
    }, [locale]);

    const generateId = () =>
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 9);

    // 初始化内容
    const initialContent: Block[] = [
        {
            id: generateId(),
            type: "paragraph",
            props: {}, // 添加 props 属性
            content: [
                {
                    type: "link",
                    href: "https://github.com/Byte-Biscuit/proxy-switch-craft",
                    content: [{ type: "text", text: "Byte-Biscuit / " }], // link 的 content 应该是 InlineContent[]
                },
                {
                    type: "text",
                    text: "proxy-switch-craft",
                    styles: { bold: true },
                },
            ],
        },
        {
            id: generateId(),
            type: "paragraph",
            props: {},
            content: [], // 空段落应该是空数组，不是空字符串
        },
        {
            id: generateId(),
            type: "paragraph",
            props: {},
            content: [
                {
                    type: "text",
                    text: "It includes a comprehensive collection of prebuilt components that are ready for use in production right out of the box and features a suite of customization options that make it easy to implement your own custom design system on top of our components.",
                },
            ], // 纯文本内容需要包装在 text 对象中
        },
        {
            id: generateId(),
            type: "paragraph",
            props: {},
            content: [],
        },
        {
            id: generateId(),
            type: "paragraph",
            props: {},
            content: [
                {
                    type: "text",
                    text: "Material UI supports Material Design 2. You can follow ",
                },
                {
                    type: "link",
                    href: "https://github.com/mui/material-ui/issues/29345",
                    content: [{ type: "text", text: "this GitHub issue" }], // 修正 link 内容格式
                },
                {
                    type: "text",
                    text: " for future design-related updates.",
                },
            ],
        },
        {
            id: generateId(),
            type: "paragraph",
            props: {},
            content: [
                {
                    type: "text",
                    text: "本书由人民邮电出版社有限公司授权微信读书进行制作与发行",
                },
            ], // 纯文本内容需要包装在 text 对象中
        },
    ] as Block[];

    const handleContentChange = (
        newContent: Block[]
    ) => {
        setContent(newContent);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Block Note Editor 调测页面
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                在编辑器中输入 &quot;/&quot; 来使用
                SlashMenu，支持自定义图片功能
            </Alert>

            <Box
                sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    mb: 3,
                }}
            >
                {blockNoteDictionary != null ? (
                    <BlockNoteEditor
                        value={initialContent}
                        dictionary={blockNoteDictionary}
                        onChange={handleContentChange}
                    />
                ) : (
                    <div>...</div>
                )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => setShowJson(!showJson)}
                >
                    {showJson ? "隐藏" : "显示"} JSON 数据
                </Button>
            </Box>

            {showJson && (
                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        编辑器内容 (JSON):
                    </Typography>
                    <pre style={{ fontSize: "12px", overflow: "auto" }}>
                        {JSON.stringify(content, null, 2)}
                    </pre>
                </Box>
            )}
        </Container>
    );
};

export default BlockEditorTestPage;
