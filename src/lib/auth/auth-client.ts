import { createAuthClient } from "better-auth/react";
//import { passkeyClient } from "@better-auth/passkey/client"
import { twoFactorClient } from "better-auth/client/plugins";

/**
 * Better Auth Client Configuration
 * 
 * Supports 4 authentication methods:
 * 1. Email/Password + Authenticator (2FA)
 * 2. GitHub OAuth
 * 3. Google OAuth
 * 4. Passkey (WebAuthn)
 */
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,

    // Client-side plugins
    plugins: [
        twoFactorClient(),
        //passkeyClient(),
    ],
});