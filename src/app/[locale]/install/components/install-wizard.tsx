"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
    InstallStep,
    AdminCredentials,
    SiteInfoConfig,
    InstallAuthMethodsConfig,
    InstallServicesConfig,
} from "@/types/system-config";
import WelcomeForm from "./welcome-form";
import EnvironmentCheckForm from "./environment-check-form";
import SiteInfoForm from "./site-info-form";
import AdminAccountForm from "./admin-account-form";
import AuthMethodsForm from "./auth-methods-form";
import ServicesForm from "./services-form";
import { useEffect } from "react";

interface InstallWizardProps {
    onComplete: () => void;
}

/**
 * Installation Wizard Component
 * 安装向导组件
 *
 * Guides users through the initialization process with multiple steps:
 * 1. Welcome
 * 2. Environment Check
 * 3. Website Information
 * 4. Admin Account Setup
 * 5. Authentication Methods Configuration
 * 6. External Services Configuration (Optional)
 * 7. Complete Installation
 */

export default function InstallWizard({ onComplete }: InstallWizardProps) {
    const locale = useLocale();
    const [currentStep, setCurrentStep] = useState<InstallStep>(
        InstallStep.Welcome
    );
    const [installData, setInstallData] = useState<{
        siteInfo?: SiteInfoConfig;
        admin?: AdminCredentials;
        authMethods?: InstallAuthMethodsConfig;
        services?: InstallServicesConfig;
        isComplete?: boolean;
    }>({ isComplete: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const steps = [
        { key: InstallStep.Welcome, title: "Welcome", icon: "🎉" },
        {
            key: InstallStep.Environment,
            title: "Environment Check",
            icon: "🔍",
        },
        { key: InstallStep.SiteInfo, title: "Website Info", icon: "🌐" },
        { key: InstallStep.AdminAccount, title: "Admin Account", icon: "👤" },
        { key: InstallStep.AuthMethods, title: "Authentication", icon: "🔐" },
        { key: InstallStep.Services, title: "Services", icon: "🔌" },
        { key: InstallStep.Complete, title: "Complete", icon: "✅" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

    const handleNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].key);
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].key);
        }
    };

    /**
     * Effect to handle installation submission when data is complete
     * 当数据收集完成时，触发安装提交的副作用
     */
    useEffect(() => {
        const submitData = async () => {
            // Only proceed if complete and not already installed
            if (!installData.isComplete) return;

            setError("");

            try {
                console.log(
                    "[Install] Submitting installation data:",
                    installData
                );
                const response = await fetch("/api/install", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(installData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Installation failed");
                }

                console.log("[Install] Installation successful");
                setCurrentStep(InstallStep.Complete);
            } catch (err) {
                console.error("[Install] Error during installation:", err);
                setError(
                    err instanceof Error ? err.message : "Installation failed"
                );
                // Reset states to allow retry
                setInstallData((prev) => ({ ...prev, isComplete: false }));
                setIsLoading(false);
            }
        };

        submitData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [installData.isComplete]);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div
                            key={step.key}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${
                                        index <= currentStepIndex
                                            ? "bg-blue-500 text-white shadow-lg"
                                            : "bg-gray-200 text-gray-400"
                                    }`}
                                >
                                    {step.icon}
                                </div>
                                <span className="mt-2 text-xs font-medium text-gray-600">
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`mx-2 h-1 flex-1 rounded transition-all ${
                                        index < currentStepIndex
                                            ? "bg-blue-500"
                                            : "bg-gray-200"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="rounded-lg bg-white p-8 shadow-xl">
                {/* Welcome Step */}
                {currentStep === InstallStep.Welcome && (
                    <WelcomeForm onNext={handleNext} />
                )}

                {/* Environment Check Step */}
                {currentStep === InstallStep.Environment && (
                    <EnvironmentCheckForm
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {/* Site Info Step */}
                {currentStep === InstallStep.SiteInfo && (
                    <SiteInfoForm
                        onNext={(data: SiteInfoConfig) => {
                            setInstallData({
                                ...installData,
                                siteInfo: data,
                            });
                            handleNext();
                        }}
                        onBack={handleBack}
                    />
                )}

                {/* Admin Account Step */}
                {currentStep === InstallStep.AdminAccount && (
                    <AdminAccountForm
                        onNext={(data: AdminCredentials) => {
                            setInstallData({
                                ...installData,
                                admin: data,
                            });
                            handleNext();
                        }}
                        onBack={handleBack}
                    />
                )}

                {/* Auth Methods Step */}
                {currentStep === InstallStep.AuthMethods && (
                    <AuthMethodsForm
                        adminEmail={installData.admin?.email || ""}
                        onNext={(data: InstallAuthMethodsConfig) => {
                            setInstallData({
                                ...installData,
                                authMethods: data,
                            });
                            handleNext();
                        }}
                        onBack={handleBack}
                    />
                )}

                {/* Services Step */}
                {currentStep === InstallStep.Services && (
                    <ServicesForm
                        onNext={(data: InstallServicesConfig) => {
                            if (isLoading) return;
                            setIsLoading(true);
                            setInstallData({
                                ...installData,
                                services: data,
                                isComplete: true,
                            });
                        }}
                        onBack={handleBack}
                        onSkip={() => {
                            if (isLoading) return;
                            setIsLoading(true);
                            setInstallData({
                                ...installData,
                                services: {
                                    algolia: false,
                                    umami: false,
                                    ai: false,
                                    aiProvider: "openai",
                                    pexels: false,
                                },
                                isComplete: true,
                            });
                        }}
                        isLoading={isLoading}
                    />
                )}

                {/* Complete Step */}
                {currentStep === InstallStep.Complete && (
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <span className="text-5xl">🎉</span>
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Installation Complete!
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Your Block Style CMS is now ready to use.
                        </p>
                        <button
                            onClick={onComplete}
                            className="mt-8 rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-600"
                        >
                            Go to Login →
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800">❌ {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
