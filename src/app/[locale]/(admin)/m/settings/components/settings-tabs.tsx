"use client";

import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import {
    Language as LanguageIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
    CloudQueue as CloudIcon,
    ViewList as ViewListIcon,
} from "@mui/icons-material";
import { SystemConfig } from "@/types/system-config";
import SiteInfoTab from "./site-info-tab";
import UserManagementTab from "./user-management-tab";
import AuthenticationTab from "./authentication-tab";
import ServicesTab from "./services-tab";
import ChannelTab from "./channel-tab";

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
                />
                <Tab
                    icon={<CloudIcon />}
                    iconPosition="start"
                    label="External Services"
                    id="settings-tab-3"
                    aria-controls="settings-tabpanel-3"
                />
                <Tab
                    icon={<ViewListIcon />}
                    iconPosition="start"
                    label="Channel Management"
                    id="settings-tab-4"
                    aria-controls="settings-tabpanel-4"
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
                <AuthenticationTab
                    initialData={{
                        github: {
                            enabled:
                                initialConfig.authentication?.methods?.github
                                    ?.enabled || false,
                            clientId:
                                initialConfig.authentication?.methods?.github
                                    ?.clientId || "",
                            clientSecret:
                                initialConfig.authentication?.methods?.github
                                    ?.clientSecret || "",
                        },
                        google: {
                            enabled:
                                initialConfig.authentication?.methods?.google
                                    ?.enabled || false,
                            clientId:
                                initialConfig.authentication?.methods?.google
                                    ?.clientId || "",
                            clientSecret:
                                initialConfig.authentication?.methods?.google
                                    ?.clientSecret || "",
                        },
                        allowedEmails:
                            initialConfig.authentication?.accessControl
                                ?.allowedEmails || [],
                    }}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <ServicesTab
                    initialData={{
                        algolia: {
                            enabled:
                                initialConfig.services?.algolia?.enabled ||
                                false,
                            appId: initialConfig.services?.algolia?.appId || "",
                            apiKey:
                                initialConfig.services?.algolia?.apiKey || "",
                            searchKey:
                                initialConfig.services?.algolia?.searchKey ||
                                "",
                            indexName:
                                initialConfig.services?.algolia?.indexName ||
                                "articles",
                        },
                        umami: {
                            enabled:
                                initialConfig.services?.umami?.enabled || false,
                            websiteId:
                                initialConfig.services?.umami?.websiteId || "",
                            src:
                                initialConfig.services?.umami?.src ||
                                "https://cloud.umami.is/script.js",
                        },
                        ai: {
                            enabled:
                                initialConfig.services?.ai?.enabled || false,
                            provider:
                                initialConfig.services?.ai?.provider ||
                                "openai",
                            openai: {
                                apiKey:
                                    initialConfig.services?.ai?.openai
                                        ?.apiKey || "",
                                baseUrl:
                                    initialConfig.services?.ai?.openai
                                        ?.baseUrl ||
                                    "https://api.openai.com/v1",
                                model:
                                    initialConfig.services?.ai?.openai?.model ||
                                    "gpt-4o-mini",
                            },
                            gemini: {
                                apiKey:
                                    initialConfig.services?.ai?.gemini
                                        ?.apiKey || "",
                                baseUrl:
                                    initialConfig.services?.ai?.gemini
                                        ?.baseUrl ||
                                    "https://generativelanguage.googleapis.com/v1beta",
                                model:
                                    initialConfig.services?.ai?.gemini?.model ||
                                    "gemini-2.0-flash",
                            },
                        },
                        pexels: {
                            enabled:
                                initialConfig.services?.pexels?.enabled ||
                                false,
                            apiKey:
                                initialConfig.services?.pexels?.apiKey || "",
                        },
                    }}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
                <ChannelTab initialData={initialConfig.channel || []} />
            </TabPanel>
        </Box>
    );
}
