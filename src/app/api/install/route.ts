import { NextRequest, NextResponse } from "next/server";
import { systemConfigService } from "@/lib/services/system-config-service";
import { getAuth } from "@/lib/auth/auth";

/**
 * POST /api/install
 * 
 * Initialize the CMS system:
 * 1. Create admin user account with email/password
 * 2. Save authentication methods configuration
 * 3. Save services configuration
 * 4. Create settings.json with initializedAt timestamp
 * 
 * Note: 2FA setup is moved to backend settings for better security and UX
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { siteInfo, admin, authMethods, services } = body;

        // Validate admin account data
        if (!admin?.email || !admin?.password) {
            return NextResponse.json(
                { error: "Admin email and password are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(admin.email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (admin.password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Step 1: Create admin user account using Better Auth
        try {
            // Better Auth will automatically hash the password
            const auth = await getAuth();
            const signUpResponse = await auth.api.signUpEmail({
                body: {
                    email: admin.email,
                    password: admin.password,
                    name: admin.name || "Administrator",
                },
            });
            const { user } = signUpResponse;

            if (!user) {
                throw new Error("Failed to create admin user");
            }

            console.log("Admin user created successfully:", user.email);

        } catch (error) {
            console.error("Error creating admin user:", error);
            return NextResponse.json(
                { error: "Failed to create admin account: " + (error instanceof Error ? error.message : String(error)) },
                { status: 500 }
            );
        }

        // Step 3: Initialize system configuration
        try {
            // Create base config with siteInfo, authentication methods, and services
            const config = await systemConfigService.initializeConfig({
                siteInfo: {
                    title: siteInfo?.title || "",
                    description: siteInfo?.description || "",
                    contact: {
                        email: siteInfo?.contact?.email || "",
                        wechat: siteInfo?.contact?.wechat || "",
                        x: siteInfo?.contact?.x || "",
                        telegram: siteInfo?.contact?.telegram || "",
                        discord: siteInfo?.contact?.discord || "",
                        whatsapp: siteInfo?.contact?.whatsapp || "",
                        linkedin: siteInfo?.contact?.linkedin || "",
                        github: siteInfo?.contact?.github || "",
                    },
                },
                authentication: {
                    methods: {
                        emailPassword: {
                            enabled: true,
                            requireEmailVerification: false,
                        },
                        twoFactor: {
                            enabled: authMethods?.twoFactor || false,
                            required: false,
                        },
                        github: {
                            enabled: authMethods?.github || false,
                            clientId: authMethods?.githubClientId,
                            clientSecret: authMethods?.githubClientSecret,
                        },
                        google: {
                            enabled: authMethods?.google || false,
                            clientId: authMethods?.googleClientId,
                            clientSecret: authMethods?.googleClientSecret,
                        },
                        passkey: {
                            enabled: authMethods?.passkey || false,
                        },
                    },
                    accessControl: {
                        allowedEmails: authMethods?.allowedEmails || [admin.email],
                    },
                },
                services: {
                    algolia: {
                        enabled: services?.algolia || false,
                        appId: services?.algoliaAppId,
                        apiKey: services?.algoliaApiKey,
                        searchKey: services?.algoliaSearchKey,
                        indexName: services?.algoliaIndexName || "articles",
                    },
                    umami: {
                        enabled: services?.umami || false,
                        websiteId: services?.umamiWebsiteId,
                        src: services?.umamiSrc || "https://cloud.umami.is/script.js",
                    },
                    ai: {
                        enabled: services?.ai || false,
                        provider: services?.aiProvider || "openai",
                        openai: {
                            apiKey: services?.openaiApiKey,
                            baseUrl: services?.openaiBaseUrl || "https://api.openai.com/v1",
                            model: services?.openaiModel || "gpt-4o-mini",
                        },
                        gemini: {
                            apiKey: services?.geminiApiKey,
                            baseUrl: services?.geminiBaseUrl || "https://generativelanguage.googleapis.com/v1beta",
                            model: services?.geminiModel || "gemini-2.0-flash",
                        },
                    },
                    pexels: {
                        enabled: services?.pexels || false,
                        apiKey: services?.pexelsApiKey,
                    },
                },
            });

            console.log("[Install API] Installation completed successfully");
            console.log("[Install API] Config initialized at:", config.initializedAt);

            return NextResponse.json({
                success: true,
                message: "Installation completed successfully",
                config,
            });

        } catch (error) {
            console.error("Error initializing configuration:", error);
            return NextResponse.json(
                { error: "Failed to initialize configuration: " + (error instanceof Error ? error.message : String(error)) },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Installation error:", error);
        return NextResponse.json(
            { error: "Installation failed: " + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}

/**
 * GET /api/install
 * 
 * Check if system is already initialized
 */
export async function GET() {
    try {
        const initialized = await systemConfigService.isInitialized();

        return NextResponse.json({
            initialized,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to check initialization status" },
            { status: 500 }
        );
    }
}
