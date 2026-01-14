import { NextRequest, NextResponse } from "next/server";
import { systemConfigService } from "@/lib/services/system-config-service";
import { getAuth } from "@/lib/auth/auth";
import { EMAIL_REGEX } from "@/constants";

/**
 * POST /api/install
 * 
 * Initialize the CMS system:
 * 1. Save authentication configuration (including secret) to settings.json
 * 2. Create admin user account with email/password
 * 3. Return success response
 * 
 * Note: Configuration must be saved BEFORE creating user account,
 * because Better Auth needs to read the secret from settings.json
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
        if (!EMAIL_REGEX.test(admin.email)) {
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

        // Step 1: Initialize system configuration (must save secret before creating user)
        let config;
        try {
            // Create base config with siteInfo, authentication methods, and services
            config = await systemConfigService.initializeConfig({
                siteInfo: {
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
                    secret: authMethods?.secret || '',
                    baseURL: authMethods?.baseURL || '',
                    methods: {
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
                        enabled: services?.algolia?.enabled || false,
                        appId: services?.algolia?.appId,
                        apiKey: services?.algolia?.apiKey,
                        searchKey: services?.algolia?.searchKey,
                        indexName: services?.algolia?.indexName || "articles",
                    },
                    umami: {
                        enabled: services?.umami?.enabled || false,
                        websiteId: services?.umami?.websiteId,
                        src: services?.umami?.src || "https://cloud.umami.is/script.js",
                    },
                    ai: {
                        enabled: services?.ai?.enabled || false,
                        provider: services?.ai?.provider || "openai",
                        openai: {
                            apiKey: services?.ai?.openai?.apiKey,
                            baseUrl: services?.ai?.openai?.baseUrl || "https://api.openai.com/v1",
                            model: services?.ai?.openai?.model || "gpt-4o-mini",
                        },
                        gemini: {
                            apiKey: services?.ai?.gemini?.apiKey,
                            baseUrl: services?.ai?.gemini?.baseUrl || "https://generativelanguage.googleapis.com/v1beta",
                            model: services?.ai?.gemini?.model || "gemini-2.0-flash",
                        },
                    },
                    pexels: {
                        enabled: services?.pexels?.enabled || false,
                        apiKey: services?.pexels?.apiKey,
                    },
                },
            });

            console.log("[Install API] Configuration saved successfully");
            console.log("[Install API] Config initialized at:", config.initializedAt);

        } catch (error) {
            console.error("Error initializing configuration:", error);
            return NextResponse.json(
                { error: "Failed to initialize configuration: " + (error instanceof Error ? error.message : String(error)) },
                { status: 500 }
            );
        }

        // Step 2: Create admin user account using Better Auth
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

            console.log("[Install API] Admin user created successfully:", user.email);

        } catch (error) {
            console.error("Error creating admin user:", error);
            return NextResponse.json(
                { error: "Failed to create admin account: " + (error instanceof Error ? error.message : String(error)) },
                { status: 500 }
            );
        }

        // Step 3: Return success response
        return NextResponse.json({
            success: true,
            message: "Installation completed successfully",
            config,
        });

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
