"use client";

import { useState, useEffect } from "react";

interface EnvironmentCheckFormProps {
    onNext: () => void;
    onBack: () => void;
}

interface CheckResult {
    passed: boolean;
    message: string;
}

interface EnvironmentChecks {
    dataPath: CheckResult;
    database: CheckResult;
    writePermission: CheckResult;
    readPermission: CheckResult;
}

/**
 * Environment Check Form Component
 * 环境检查表单组件
 *
 * Performs comprehensive system environment validation:
 * - Data directory accessibility
 * - Database connectivity (Better Auth SQLite)
 * - File write/read permissions
 */
export default function EnvironmentCheckForm({
    onNext,
    onBack,
}: EnvironmentCheckFormProps) {
    const [isChecking, setIsChecking] = useState(false);
    const [checks, setChecks] = useState<EnvironmentChecks | null>(null);
    const [allPassed, setAllPassed] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        performChecks();
    }, []);

    const performChecks = async () => {
        setIsChecking(true);
        setError("");

        try {
            const response = await fetch("/api/install/check-environment");
            
            if (!response.ok) {
                throw new Error("Environment check failed");
            }

            const data = await response.json();
            setChecks(data.checks);
            setAllPassed(data.allPassed);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to perform environment checks"
            );
        } finally {
            setIsChecking(false);
        }
    };

    const getCheckIcon = (passed: boolean) => {
        return passed ? "✅" : "❌";
    };

    const getCheckColor = (passed: boolean) => {
        return passed
            ? "border-green-200 bg-green-50 text-green-900"
            : "border-red-200 bg-red-50 text-red-900";
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900">
                Environment Check
            </h2>
            <p className="mt-2 text-gray-600">
                Verifying your system configuration and permissions...
            </p>

            {isChecking && (
                <div className="mt-6 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Running checks...</p>
                </div>
            )}

            {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-800">❌ {error}</p>
                    <button
                        onClick={performChecks}
                        className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                        Retry Checks
                    </button>
                </div>
            )}

            {checks && !isChecking && (
                <div className="mt-6 space-y-3">
                    {/* Data Path Check */}
                    <div
                        className={`flex items-start gap-3 rounded-lg border p-4 ${getCheckColor(
                            checks.dataPath.passed
                        )}`}
                    >
                        <span className="text-xl">
                            {getCheckIcon(checks.dataPath.passed)}
                        </span>
                        <div className="flex-1">
                            <h3 className="font-semibold">
                                Data Directory Access
                            </h3>
                            <p className="mt-1 text-sm">
                                {checks.dataPath.message}
                            </p>
                        </div>
                    </div>

                    {/* Database Check */}
                    <div
                        className={`flex items-start gap-3 rounded-lg border p-4 ${getCheckColor(
                            checks.database.passed
                        )}`}
                    >
                        <span className="text-xl">
                            {getCheckIcon(checks.database.passed)}
                        </span>
                        <div className="flex-1">
                            <h3 className="font-semibold">
                                Database Connectivity
                            </h3>
                            <p className="mt-1 text-sm">
                                {checks.database.message}
                            </p>
                        </div>
                    </div>

                    {/* Write Permission Check */}
                    <div
                        className={`flex items-start gap-3 rounded-lg border p-4 ${getCheckColor(
                            checks.writePermission.passed
                        )}`}
                    >
                        <span className="text-xl">
                            {getCheckIcon(checks.writePermission.passed)}
                        </span>
                        <div className="flex-1">
                            <h3 className="font-semibold">Write Permissions</h3>
                            <p className="mt-1 text-sm">
                                {checks.writePermission.message}
                            </p>
                        </div>
                    </div>

                    {/* Read Permission Check */}
                    <div
                        className={`flex items-start gap-3 rounded-lg border p-4 ${getCheckColor(
                            checks.readPermission.passed
                        )}`}
                    >
                        <span className="text-xl">
                            {getCheckIcon(checks.readPermission.passed)}
                        </span>
                        <div className="flex-1">
                            <h3 className="font-semibold">Read Permissions</h3>
                            <p className="mt-1 text-sm">
                                {checks.readPermission.message}
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    {allPassed && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="font-semibold text-green-900">
                                ✅ All environment checks passed! Ready to
                                continue.
                            </p>
                        </div>
                    )}

                    {!allPassed && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <p className="font-semibold text-yellow-900">
                                ⚠️ Some checks failed. Please fix the issues
                                before continuing.
                            </p>
                            <button
                                onClick={performChecks}
                                className="mt-3 rounded bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                            >
                                Re-run Checks
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!allPassed || isChecking}
                    className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}
