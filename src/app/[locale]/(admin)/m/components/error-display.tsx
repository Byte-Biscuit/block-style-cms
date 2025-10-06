"use client";

import React from "react";
import {
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// ZodError V1
type SerializedZodIssueV1 = {
    origin?: string;
    code?: string;
    minimum?: number;
    inclusive?: boolean;
    path?: (string | number)[];
    message: string;
    keys?: string[];
};

type SerializedZodErrorV1 = {
    name: "ZodError";
    message: string;
};

function parseSerializedZodError(
    err: SerializedZodErrorV1
): SerializedZodIssueV1[] {
    if (!err || typeof err.message !== "string") return [];
    try {
        const parsed = JSON.parse(err.message);
        if (Array.isArray(parsed)) {
            // Ensure each entry has a message field
            return parsed.map((p) => ({
                ...p,
                message: typeof p.message === "string" ? p.message : String(p),
            })) as SerializedZodIssueV1[];
        }
    } catch {
        // 如果解析失败，尝试从多行文本中提取 message
        // fallback: 按行拆分并当作单条错误返回
    }
    return [{ message: err.message }];
}

function zodIssuesToStringsV1(issues: SerializedZodIssueV1[]): string[] {
    return issues.map((issue) => {
        const pathStr =
            issue.path && issue.path.length ? `${issue.path.join(".")}: ` : "";
        if (issue.code === "unrecognized_keys" && issue.keys?.length) {
            return `不识别的字段: ${issue.keys.map((k) => `"${k}"`).join(", ")}`;
        }
        return pathStr + (issue.message ?? "Unknown Zod issue");
    });
}

interface ErrorDisplayProps {
    title: string | null;
    error: string | string[] | null | unknown;
    severity?: "error" | "warning" | "info" | "success";
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title,
    error,
    severity = "error",
}) => {
    if (!error) return null;

    const processError = (error: unknown): string[] => {
        if (typeof error === "string") {
            const parts = error.split(/\s*→\s*|\s*->\s*/);
            if (parts.length > 1) {
                return parts.filter((part) => part.trim());
            }
            return [error];
        }
        // Zod issues error handling
        /*  V1 示例
            message: "[\n  {\n    \"origin\": \"string\",\n    \"code\": \"too_small\",\n    \"minimum\": 10,\n    \"inclusive\": true,\n    \"path\": [\n      \"slug\"\n    ],\n    \"message\": \"Slug内容不能满足要求\"\n  },\n  {\n    \"origin\": \"array\",\n    \"code\": \"too_small\",\n    \"minimum\": 1,\n    \"inclusive\": true,\n    \"path\": [\n      \"tags\"\n    ],\n    \"message\": \"至少需要一个标签\"\n  },\n  {\n    \"origin\": \"array\",\n    \"code\": \"too_small\",\n    \"minimum\": 1,\n    \"inclusive\": true,\n    \"path\": [\n      \"keywords\"\n    ],\n    \"message\": \"至少需要一个关键词\"\n  }\n]"
            name: "ZodError"
        */
        if (
            error instanceof Object &&
            "name" in error &&
            error.name === "ZodError" &&
            "message" in error
        ) {
            const serialized = error as SerializedZodErrorV1;
            const issues = parseSerializedZodError(serialized);
            return zodIssuesToStringsV1(issues);
        }
        return ["Unknown error occurred"];
    };
    const errorList = Array.isArray(error) ? error : processError(error);

    if (errorList.length === 1 && errorList[0].length < 50) {
        return (
            <Alert severity={severity} sx={{ mb: 2 }}>
                {title && <AlertTitle>{title}</AlertTitle>}
                {errorList[0]}
            </Alert>
        );
    }

    return (
        <Alert
            severity={severity}
            sx={{
                mb: 2,
                "& .MuiAlert-message": {
                    width: "100%",
                },
            }}
        >
            {title && <AlertTitle>{title}</AlertTitle>}
            <List dense sx={{ py: 0 }}>
                {errorList.map((errorItem, index) => (
                    <ListItem key={index} sx={{ py: 0.2, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                            <FiberManualRecordIcon
                                fontSize="inherit"
                                sx={{ fontSize: 8, color: "error.main" }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={errorItem}
                            sx={{
                                "& .MuiListItemText-primary": {
                                    fontSize: "0.875rem",
                                    wordBreak: "break-all",
                                },
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Alert>
    );
};

export default ErrorDisplay;
