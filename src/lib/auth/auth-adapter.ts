import { NextRequest } from "next/server";

/**
 * Minimal interface for the Auth instance.
 * We only need it to expose a handler method.
 */
interface AuthInstance {
    handler: (request: Request) => Promise<Response>;
}

/**
 * Type definition for the dynamic getter function.
 * It must return a Promise that resolves to an Auth instance.
 */
type AuthGetter = () => Promise<AuthInstance>;

/**
 * Dynamic Next.js Handler Generator
 * 
 * Unlike the official `toNextJsHandler`, this factory accepts an async getter function.
 * The getter is executed on every request to ensure the latest Auth instance is used
 * (e.g., after a configuration hot-reload).
 */
export function toDynamicNextJsHandler(authGetter: AuthGetter) {
    const handler = async (request: NextRequest) => {
        // 1. Key Point: Re-fetch the instance on every request.
        // This triggers the `getAuth()` logic in `lib/auth.ts`, which checks the 
        // `initializedAt` timestamp to decide whether to return a cached instance or rebuild it.
        const auth = await authGetter();

        // 2. Forward the request to the Better Auth core handler.
        return auth.handler(request);
    };

    return {
        GET: handler,
        POST: handler,
        // Include additional methods for compatibility with various plugin operations:
        PATCH: handler,  // Often used for Session updates
        PUT: handler,    // Often used for user profile modifications
        DELETE: handler, // Often used for sign-out or account deletion
    };
}