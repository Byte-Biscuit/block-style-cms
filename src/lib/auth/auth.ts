import path from "path";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
//import { passkey } from "@better-auth/passkey";
import Database from "better-sqlite3";
import { systemConfigService } from "../services/system-config-service";
import { BETTER_AUTH_SIGN_IN, BETTER_AUTH_ERROR_PAGE } from "@/constants";

/**
 * Better Auth Configuration
 * 
 * Supports 4 authentication methods (configured via system-config):
 * 1. Email/Password + Authenticator (2FA)
 * 2. GitHub OAuth
 * 3. Google OAuth
 * 4. Passkey (WebAuthn)
 * 
 * OAuth and service keys are stored in settings.json (preferred) or .env
 * Method enablement is controlled by CMS_DATA_PATH/settings.json
 */

const databasePath = path.join(process.env.CMS_DATA_PATH || "./data", 'better-auth.db');

/**
 * Global store to persist DB connection and Auth instance across HMR reloads in development.
 */
const globalStore = global as unknown as {
    _betterAuthDb?: Database.Database;
    _betterAuthInstance?: ReturnType<typeof betterAuth>;
    _lastAuthInitializedAt?: string | number;
};

// 🟢 1. Database Singleton Initialization
// Only create a new connection if it doesn't exist in the global store.
if (!globalStore._betterAuthDb) {
    console.log(`[Database] 🔌 Initializing connection to: ${databasePath}`);
    globalStore._betterAuthDb = new Database(databasePath);
    // Enable WAL mode for better concurrency performance
    globalStore._betterAuthDb.pragma('journal_mode = WAL');
}
const authDatabase = globalStore._betterAuthDb!;

/**
 * 🔵 2. Dynamic Auth Factory
 * This is an asynchronous function called by Next.js Route Handlers or Server Components.
 * It ensures the Auth instance is always in sync with the latest system settings.
 */
export async function getAuth() {
    // A. Read current system configuration
    const config = systemConfigService.readConfigSync();

    // B. Get the version identifier (initializedAt) of the current configuration
    const currentInitializedAt = config?.initializedAt;

    // C. Fast Cache Check (Singleton Pattern)
    // Check if an instance already exists in the global store and if the configuration version hasn't changed.
    if (globalStore._betterAuthInstance && globalStore._lastAuthInitializedAt === currentInitializedAt) {
        return globalStore._betterAuthInstance;
    }

    // D. Rebuild Instance (Only when timestamp differs or instance is null)
    console.log(`[Auth] ♻️ Config updated (Time: ${currentInitializedAt}). Rebuilding instance...`);

    const githubConfig = config?.authentication?.methods?.github;
    const googleConfig = config?.authentication?.methods?.google;
    
    // Get Better Auth Secret from settings.json (required)
    const authSecret = systemConfigService.getAuthSecret();

    const newInstance = betterAuth({
        appName: "Block Style CMS",
        database: authDatabase,
        secret: authSecret,

        // Custom pages for authentication
        pages: {
            signIn: BETTER_AUTH_SIGN_IN,
            error: BETTER_AUTH_ERROR_PAGE,
        },

        // Email and password authentication (always available)
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },

        // Social OAuth providers (controlled by settings.json configuration)
        socialProviders: {
            github: {
                // https://github.com/settings/apps
                clientId: githubConfig?.clientId || '',
                clientSecret: githubConfig?.clientSecret || '',
                // Use double negation to ensure boolean type
                enabled: !!(githubConfig?.enabled && githubConfig?.clientId && githubConfig?.clientSecret),
            },
            google: {
                // https://console.cloud.google.com/auth/clients
                prompt: "select_account",
                clientId: googleConfig?.clientId || '',
                clientSecret: googleConfig?.clientSecret || '',
                enabled: !!(googleConfig?.enabled && googleConfig?.clientId && googleConfig?.clientSecret),
            }
        },

        // Plugins for additional authentication methods
        plugins: [
            // Two-Factor Authentication (TOTP/Authenticator)
            // Configure backup codes to use encrypted storage
            twoFactor({
                backupCodeOptions: {
                    // encrypted|plain
                    storeBackupCodes: "encrypted"
                }
            }),

            // Passkey (WebAuthn) support
            //passkey(),
        ],
        // Database hooks
        databaseHooks: {
            user: {
                create: {
                    before: async (user, ctx) => {
                        const syncAllowedEmails = systemConfigService.getAllowedEmails();
                        const email = user.email?.toLowerCase() || '';
                        // Enforce allowed emails if configured
                        if (syncAllowedEmails.length > 0 && !syncAllowedEmails.includes(email)) {
                            console.error(`[Auth][Hook] Registration blocked for disallowed email: ${email}`);
                            return false;
                        }
                        console.log("[Auth][Hook] Creating user:", user);
                        return true;
                    }
                }
            },
            session: {
                create: {
                    before: async (session, ctx) => {
                        console.log("[Auth][Hook] Creating session:", session);
                        const syncAllowedEmails = systemConfigService.getAllowedEmails();
                        const user = await authDatabase
                            .prepare("SELECT email FROM user WHERE id = ?")
                            .get(session.userId) as { email: string };
                        if (user && !syncAllowedEmails.includes(user.email)) {
                            console.warn(`[Auth] 🚫 Blocked login attempt: ${user.email}`);
                            return false;
                        }
                        return true;
                    }
                }
            }
        }
    });

    // E. Automatic Database Schema Synchronization (Auto-Migration)
    // This runs only when the configuration changes (instance is rebuilt).
    try {
        const { getMigrations } = await import("better-auth/db");

        // Generate required SQL migrations (e.g., CREATE TABLE "two_factor"...)
        const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(newInstance.options);

        if (toBeCreated.length || toBeAdded.length) {
            console.log(`[Auth] 🛠️ Applying ${(toBeCreated.length + toBeAdded.length)} schema changes...`);
            await runMigrations();
            console.log("[Auth] ✅ Schema updated successfully.");
        } else {
            console.log("[Auth] Schema is up to date.");
        }
    } catch (err) {
        console.error("[Auth] ⚠️ Auto-migration failed:", err);
    }

    // F. Update Global Cache
    globalStore._betterAuthInstance = newInstance;
    globalStore._lastAuthInitializedAt = currentInitializedAt;

    return newInstance;
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;