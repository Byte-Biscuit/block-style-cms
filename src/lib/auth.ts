import path from "path";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey"
import Database from "better-sqlite3";

/**
 * Better Auth Configuration
 * 
 * Supports 4 authentication methods (configured via system-config):
 * 1. Email/Password + Authenticator (2FA)
 * 2. GitHub OAuth
 * 3. Google OAuth
 * 4. Passkey (WebAuthn)
 * 
 * OAuth and service keys are stored in .env
 * Method enablement is controlled by data/config.json
 */

const databasePath = path.join(process.env.APPLICATION_DATA_PATH || "./data", 'better-auth.db');
console.log("Better Auth DB Path:", databasePath);

export const auth = betterAuth({
    database: new Database(databasePath),

    // Email and password authentication (always available)
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },

    // Social OAuth providers (controlled by .env configuration)
    socialProviders: {
        github: {
            // https://github.com/settings/apps
            clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID || '',
            clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET || '',
            enabled: !!(process.env.BETTER_AUTH_GITHUB_CLIENT_ID && process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET),
        },
        google: {
            // https://console.cloud.google.com/auth/clients
            prompt: "select_account",
            clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET || '',
            enabled: !!(process.env.BETTER_AUTH_GOOGLE_CLIENT_ID && process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET),
        }
    },

    // Plugins for additional authentication methods
    plugins: [
        // Two-Factor Authentication (TOTP/Authenticator)
        twoFactor({
            issuer: process.env.BETTER_AUTH_2FA_ISSUER || "Block Style CMS",
        }),

        // Passkey (WebAuthn) support
        passkey(),
    ],
});