/**
 * Permission Control System
 * 
 * 提供权限控制功能：
 * - 获取当前登录会话
 * - Server Action 权限检查
 */

import { getAuth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { HttpStatus } from "@/lib/response";

// ==================== 类型定义 ====================

/**
 * 用户会话信息
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
 * 权限检查结果
 */
export interface PermissionCheckResult {
    allowed: boolean;
    code?: number;
    message?: string;
    session?: UserSession;
}

// ==================== 会话管理 ====================

/**
 * 获取当前登录用户的会话信息
 * 
 * @returns 会话信息，未登录返回 null
 */
export async function getCurrentSession(): Promise<UserSession | null> {
    try {
        const auth = await getAuth();
        const headersList = await headers();

        // 使用 Better-Auth API 获取会话
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

// ==================== 权限检查 ====================

/**
 * 要求已登录（任何用户）
 * 
 * 用于需要登录认证的操作
 * 
 * @returns 权限检查结果
 * 
 * @example
 * ```typescript
 * export async function updateUser(userId: string) {
 *     const permission = await requireAuthenticated();
 *     if (!permission.allowed) {
 *         return { code: permission.code, message: permission.message };
 *     }
 *     // ... 执行操作
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
