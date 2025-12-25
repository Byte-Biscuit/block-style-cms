"use client";

import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import {
    Language as LanguageIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
    CloudQueue as CloudIcon,
    AdminPanelSettings as AdminPanelIcon,
} from "@mui/icons-material";
import { SystemConfig } from "@/types/system-config";
import SiteInfoTab from "./site-info-tab";
import UserManagementTab from "./user-management-tab";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

interface SettingsTabsProps {
    initialConfig: SystemConfig;
}

/**
 * Settings Tabs Container Component
 * 设置页面Tab容器组件
 *
 * Manages the tabbed interface for different settings categories.
 * Each tab is independent and has its own save functionality.
 */
export default function SettingsTabs({ initialConfig }: SettingsTabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            {/* Tab Navigation */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="settings tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    mb: 2,
                }}
            >
                <Tab
                    icon={<LanguageIcon />}
                    iconPosition="start"
                    label="Website Info"
                    id="settings-tab-0"
                    aria-controls="settings-tabpanel-0"
                />
                <Tab
                    icon={<PeopleIcon />}
                    iconPosition="start"
                    label="User Management"
                    id="settings-tab-1"
                    aria-controls="settings-tabpanel-1"
                />
                <Tab
                    icon={<SecurityIcon />}
                    iconPosition="start"
                    label="Authentication"
                    id="settings-tab-2"
                    aria-controls="settings-tabpanel-2"
                    disabled
                />
                <Tab
                    icon={<CloudIcon />}
                    iconPosition="start"
                    label="External Services"
                    id="settings-tab-3"
                    aria-controls="settings-tabpanel-3"
                    disabled
                />
                <Tab
                    icon={<AdminPanelIcon />}
                    iconPosition="start"
                    label="Access Control"
                    id="settings-tab-4"
                    aria-controls="settings-tabpanel-4"
                    disabled
                />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
                <SiteInfoTab initialData={initialConfig.siteInfo} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <UserManagementTab />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <Box
                    sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
                >
                    Authentication settings - Coming soon
                </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <Box
                    sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
                >
                    External services configuration - Coming soon
                </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
                <Box
                    sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
                >
                    Access control settings - Coming soon
                </Box>
            </TabPanel>
        </Box>
    );
}
