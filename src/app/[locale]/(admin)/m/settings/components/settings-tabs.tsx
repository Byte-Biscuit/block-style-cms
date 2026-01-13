"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, Tab, Box } from "@mui/material";
import {
    Language as LanguageIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
    CloudQueue as CloudIcon,
    ViewList as ViewListIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import { SystemConfig } from "@/types/system-config";
import SiteInfoTab from "./site-info-tab";
import UserManagementTab from "./user-management-tab";
import AuthenticationTab from "./authentication-tab";
import ServicesTab from "./services-tab";
import ChannelTab from "./channel-tab";
import BasicConfigTab from "./basic-config-tab";

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
    const t = useTranslations("configuration.settings.tabs");
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
                    icon={<SettingsIcon />}
                    iconPosition="start"
                    label={t("basicConfig")}
                    id="settings-tab-0"
                    aria-controls="settings-tabpanel-0"
                />
                <Tab
                    icon={<LanguageIcon />}
                    iconPosition="start"
                    label={t("websiteInfo")}
                    id="settings-tab-1"
                    aria-controls="settings-tabpanel-1"
                />
                <Tab
                    icon={<PeopleIcon />}
                    iconPosition="start"
                    label={t("userManagement")}
                    id="settings-tab-2"
                    aria-controls="settings-tabpanel-2"
                />
                <Tab
                    icon={<SecurityIcon />}
                    iconPosition="start"
                    label={t("authentication")}
                    id="settings-tab-3"
                    aria-controls="settings-tabpanel-3"
                />
                <Tab
                    icon={<CloudIcon />}
                    iconPosition="start"
                    label={t("externalServices")}
                    id="settings-tab-4"
                    aria-controls="settings-tabpanel-4"
                />
                <Tab
                    icon={<ViewListIcon />}
                    iconPosition="start"
                    label={t("channelManagement")}
                    id="settings-tab-5"
                    aria-controls="settings-tabpanel-5"
                />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
                <BasicConfigTab initialData={initialConfig.basic} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <SiteInfoTab initialData={initialConfig.siteInfo} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <UserManagementTab />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
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

            <TabPanel value={activeTab} index={4}>
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

            <TabPanel value={activeTab} index={5}>
                <ChannelTab initialData={initialConfig.channel || []} />
            </TabPanel>
        </Box>
    );
}
