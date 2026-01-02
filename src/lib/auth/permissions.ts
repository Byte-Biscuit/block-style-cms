/**
 * Permission Control System
 * 
 * Provides permission control functions:
 * - Get current login session
 * - Server Action permission check
 */

import { getAuth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { HttpStatus, Result } from "@/lib/response";
import { systemConfigService } from "@/lib/services/system-config-service";

// ==================== Type Definitions ====================

/**
 * User session information
 */
export interface UserSession {
    user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image?: string;
    };
    session: {
        id: string;
        expiresAt: Date;
        token: string;
        userId: string;
    };
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
    allowed: boolean;
    code?: number;
    message?: string;
    session?: UserSession;
}

// ==================== Session Management ====================

/**
 * Get current logged-in user's session information
 * 
 * @returns Session information, or null if not logged in
 */
export async function getCurrentSession(): Promise<UserSession | null> {
    try {
        const auth = await getAuth();
        const headersList = await headers();

        // Use Better-Auth API to get session
        const session = await auth.api.getSession({
            headers: headersList,
        });

        if (!session || !session.user) {
            return null;
        }

        return session as UserSession;
    } catch (error) {
        console.error("[Permissions] Error getting current session:", error);
        return null;
    }
}

// ==================== Permission Check ====================

/**
 * Requires being logged in (any user)
 * 
 * Used for operations requiring authentication
 * 
 * @returns Permission check result
 * 
 * @example
 * ```typescript
 * export async function updateUser(userId: string) {
 *     const permission = await requireAuthenticated();
 *     if (!permission.allowed) {
 *         return { code: permission.code, message: permission.message };
 *     }
 *     // ... perform operation
 * }
 * ```
 */
export async function requireAuthenticated(): Promise<PermissionCheckResult> {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return {
                allowed: false,
                code: HttpStatus.UNAUTHORIZED,
                message: "Authentication required",
            };
        }

        return {
            allowed: true,
            session,
        };
    } catch (error) {
        console.error("[Permissions] Error in requireAuthenticated:", error);
        return {
            allowed: false,
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Authentication check failed",
        };
    }
}

/**
 * Server Action Wrapper: Automatically handles installation mode bypass and admin mode authentication
 * 
 * @param action - Original Server Action function
 * @returns Wrapped Server Action function
 */
export function withAuth<T extends any[], R>(
    action: (...args: T) => Promise<Result<R>>
) {
    return async (...args: T): Promise<Result<R>> => {
        // 1. Check if the system is initialized
        const isInitialized = await systemConfigService.isInitialized();

        // 2. If initialized, authentication is required
        if (isInitialized) {
            const permission = await requireAuthenticated();
            if (!permission.allowed) {
                return {
                    code: permission.code || HttpStatus.UNAUTHORIZED,
                    message: permission.message || "Unauthorized",
                    payload: {} as R,
                };
            }
        }

        // 3. Not initialized (installation mode) or logged in, execute original Action
        return action(...args);
    };
}

