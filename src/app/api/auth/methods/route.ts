/**
 * Public API: Get Authentication Methods Configuration
 * 
 * This endpoint provides information about enabled authentication methods
 * without exposing sensitive credentials.
 */

import { NextResponse } from "next/server";
import { systemConfigService } from "@/lib/services/system-config-service";

export async function GET() {
    try {
        const config = systemConfigService.readConfigSync();

        if (!config?.authentication) {
            return NextResponse.json(
                {
                    github: { enabled: false },
                    google: { enabled: false },
                    passkey: { enabled: false },
                },
                { status: 200 }
            );
        }

        // Return only enabled status, no sensitive credentials
        const authMethods = {
            github: {
                enabled: config.authentication.methods.github?.enabled || false,
            },
            google: {
                enabled: config.authentication.methods.google?.enabled || false,
            },
            passkey: {
                enabled: config.authentication.methods.passkey?.enabled || false,
            },
        };

        return NextResponse.json(authMethods, {
            status: 200,
            headers: {
                // Disable caching to ensure real-time configuration updates
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });
    } catch (error) {
        console.error("Error fetching auth methods:", error);
        return NextResponse.json(
            {
                github: { enabled: false },
                google: { enabled: false },
                passkey: { enabled: false },
            },
            { status: 200 } // Return default config on error
        );
    }
}
