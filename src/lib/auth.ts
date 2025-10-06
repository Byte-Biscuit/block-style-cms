import path from "path";
import { betterAuth } from "better-auth";
import Database from "better-sqlite3"
//import { createAuthMiddleware } from "better-auth/api";
/**
 * Make sure to export the auth instance with the variable name auth or as a default export
 */
const databasePath = path.join(process.env.APPLICATION_DATA_PATH || "./data", 'better-auth.db');
console.log("Better Auth DB Path:", databasePath);
export const auth = betterAuth({
    database: new Database(databasePath),
    socialProviders: {
        github: {
            // https://github.com/settings/apps
            clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID || '',
            clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET || '',
        },
        google: {
            // https://console.cloud.google.com/auth/clients
            prompt: "select_account",
            clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
        }
    },
    /*     hooks: {
            before: createAuthMiddleware(async (ctx) => {
                // Unable to meet the restrictions for logged-in users in the mailing list, handled in the layout.
            }),
        } */
});