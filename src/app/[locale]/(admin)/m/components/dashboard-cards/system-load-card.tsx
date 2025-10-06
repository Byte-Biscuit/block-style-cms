import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Chip,
} from "@mui/material";
import { getTranslations } from "next-intl/server";
import { Computer, Memory, Speed } from "@mui/icons-material";
import { formatBytes } from "@/lib/file-utils";
import { systemInfoService } from "@/lib/services/system-info-service";

// Types for system load data
interface SystemLoadData {
    cpu: {
        overall: number;
        user: number;
        system: number;
        idle: number;
    };
    systemMemory: {
        total: number;
        used: number;
        free: number;
        usedPercent: number;
    };
    nodeProcess: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
    };
}

// Helper function to get load status color
function getLoadStatusColor(
    percentage: number
): "success" | "warning" | "error" {
    if (percentage <= 50) return "success";
    if (percentage <= 75) return "warning";
    return "error";
}

// Get system load data
async function getSystemLoadData(): Promise<SystemLoadData> {
    try {
        // Get CPU load and memory info using systemInfoService
        const [cpuLoad, memInfo] = await Promise.all([
            systemInfoService.getCurrentLoad(),
            systemInfoService.getMemoryInfo(),
        ]);

        // Get Node.js process memory
        const processMemory = process.memoryUsage();

        return {
            cpu: {
                overall: Number(cpuLoad.currentLoad.toFixed(1)),
                user: Number(cpuLoad.currentLoadUser.toFixed(1)),
                system: Number(cpuLoad.currentLoadSystem.toFixed(1)),
                idle: Number(cpuLoad.currentLoadIdle.toFixed(1)),
            },
            systemMemory: {
                total: memInfo.total,
                used: memInfo.used,
                free: memInfo.free,
                usedPercent: Number(
                    ((memInfo.used / memInfo.total) * 100).toFixed(1)
                ),
            },
            nodeProcess: {
                rss: processMemory.rss,
                heapTotal: processMemory.heapTotal,
                heapUsed: processMemory.heapUsed,
                external: processMemory.external,
                arrayBuffers: processMemory.arrayBuffers,
            },
        };
    } catch (error) {
        console.error("Failed to get system load data:", error);
        // Return fallback data
        return {
            cpu: { overall: 0, user: 0, system: 0, idle: 100 },
            systemMemory: { total: 0, used: 0, free: 0, usedPercent: 0 },
            nodeProcess: {
                rss: 0,
                heapTotal: 0,
                heapUsed: 0,
                external: 0,
                arrayBuffers: 0,
            },
        };
    }
}

// Progress bar component with label
function LoadProgressBar({
    label,
    value,
    color,
    showDetails,
}: {
    label: string;
    value: number;
    color: "success" | "warning" | "error";
    showDetails?: string;
}) {
    return (
        <Box sx={{ mb: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {showDetails && (
                        <Typography variant="caption" color="text.secondary">
                            {showDetails}
                        </Typography>
                    )}
                    <Chip
                        label={`${value}%`}
                        size="small"
                        color={color}
                        variant="outlined"
                    />
                </Box>
            </Box>
            <LinearProgress
                variant="determinate"
                value={value}
                color={color}
                sx={{ height: 8, borderRadius: 4 }}
            />
        </Box>
    );
}

// Memory info component
function MemoryInfo({
    title,
    icon,
    label,
    used,
    total,
    percentage,
}: {
    title: string;
    icon: React.ReactNode;
    label: string;
    used: string;
    total: string;
    percentage: number;
}) {
    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                {icon}
                <Typography variant="subtitle2" color="text.primary">
                    {title}
                </Typography>
            </Box>
            <LoadProgressBar
                label={label}
                value={percentage}
                color={getLoadStatusColor(percentage)}
                showDetails={`${used} / ${total}`}
            />
        </Box>
    );
}

// Main system load card component
export default async function SystemLoadCard() {
    const loadData = await getSystemLoadData();
    const t = await getTranslations("admin.dashboard.systemLoad");

    // Calculate Node.js heap usage percentage
    const heapUsagePercent =
        loadData.nodeProcess.heapTotal > 0
            ? Number(
                  (
                      (loadData.nodeProcess.heapUsed /
                          loadData.nodeProcess.heapTotal) *
                      100
                  ).toFixed(1)
              )
            : 0;

    return (
        <Card>
            <CardContent>
                {/* Card Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                    }}
                >
                    <Computer color="primary" />
                    <Typography variant="h6" component="div">
                        {t("title")}
                    </Typography>
                </Box>

                {/* CPU Load Section */}
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                        }}
                    >
                        <Speed color="action" />
                        <Typography variant="subtitle1" color="text.primary">
                            {t("cpu.title")}
                        </Typography>
                    </Box>

                    <LoadProgressBar
                        label={t("cpu.overallUsage")}
                        value={loadData.cpu.overall}
                        color={getLoadStatusColor(loadData.cpu.overall)}
                        showDetails={t("cpu.userSystem", {
                            user: loadData.cpu.user,
                            system: loadData.cpu.system,
                        })}
                    />
                </Box>

                {/* System Memory Section */}
                <MemoryInfo
                    title={t("memory.systemMemory")}
                    icon={<Memory color="action" />}
                    label={t("memory.memoryUsage")}
                    used={formatBytes(loadData.systemMemory.used)}
                    total={formatBytes(loadData.systemMemory.total)}
                    percentage={loadData.systemMemory.usedPercent}
                />

                {/* Node.js Process Memory Section */}
                <MemoryInfo
                    title={t("memory.nodeProcess")}
                    icon={
                        <Box
                            component="span"
                            sx={{ fontSize: 20, color: "action.active" }}
                        >
                            ⚡
                        </Box>
                    }
                    label={t("memory.memoryUsage")}
                    used={formatBytes(loadData.nodeProcess.heapUsed)}
                    total={formatBytes(loadData.nodeProcess.heapTotal)}
                    percentage={heapUsagePercent}
                />

                {/* Additional Process Memory Details */}
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                    >
                        {t("processDetails.title")}
                    </Typography>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 1,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            {t("processDetails.rss", {
                                value: formatBytes(loadData.nodeProcess.rss),
                            })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t("processDetails.external", {
                                value: formatBytes(
                                    loadData.nodeProcess.external
                                ),
                            })}
                        </Typography>
                    </Box>
                </Box>

                {/* Status Footer */}
                <Box
                    sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {t("status.lastUpdated", {
                            time: new Date().toLocaleTimeString(),
                        })}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
