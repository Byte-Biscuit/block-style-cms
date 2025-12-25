"use server";

/**
 * User Management Server Actions
 * 
 * 提供用户管理的服务端操作：
 * - 获取用户列表
 * - 创建新用户
 * - 更新用户信息
 * - 重置用户密码
 * - 删除用户
 * 
 * 所有操作需要登录认证
 */

import { Result, HttpStatus } from "@/lib/response";
import { UserManagementService, UserWithProvider, CreateUserData } from "@/lib/services/user-management-service";
import { requireAuthenticated, getCurrentSession } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { EMAIL_REGEX } from "@/constants";

// ==================== 类型定义 ====================

/**
 * 更新用户数据
 */
export interface UpdateUserData {
    name?: string;
}

/**
 * 重置密码数据
 */
export interface ResetPasswordData {
    userId: string;
    newPassword: string;
}

// ==================== 获取用户列表 ====================

/**
 * 获取所有用户列表
 * 
 * 需要登录认证
 * 
 * @returns 用户列表
 */
export async function getUsers(): Promise<Result<UserWithProvider[]>> {
    try {
        // 权限检查
        const permission = await requireAuthenticated();
        if (!permission.allowed) {
            return {
                code: permission.code!,
                message: permission.message!,
                payload: [],
            };
        }

        // 获取用户列表
        const users = await UserManagementService.getAllUsers();

        return {
            code: HttpStatus.OK,
            message: "Users retrieved successfully",
            payload: users,
        };
    } catch (error) {
        console.error("[UserManagement] Error getting users:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve users",
            payload: [],
        };
    }
}

/**
 * 获取单个用户信息
 * 
 * 需要登录认证
 * 
 * @param userId 用户 ID
 * @returns 用户信息
 */
export async function getUser(userId: string): Promise<Result<UserWithProvider | null>> {
    try {
        // 权限检查
        const permission = await requireAuthenticated();
        if (!permission.allowed) {
            return {
                code: permission.code!,
                message: permission.message!,
                payload: null,
            };
        }

        // 获取用户信息
        const user = await UserManagementService.getUserById(userId);

        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: null,
            };
        }

        return {
            code: HttpStatus.OK,
            message: "User retrieved successfully",
            payload: user,
        };
    } catch (error) {
        console.error("[UserManagement] Error getting user:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve user",
            payload: null,
        };
    }
}

// ==================== 创建用户 ====================

/**
 * 创建新的 Credential 用户
 * 
 * 需要登录认证
 * 
 * @param data 用户数据（姓名、邮箱、密码）
 * @returns 创建结果，包含新用户的 ID
 */
export async function createUser(
    data: CreateUserData
): Promise<Result<{ userId: string }>> {
    try {
        // 权限检查
        const permission = await requireAuthenticated();
        if (!permission.allowed) {
            return {
                code: permission.code!,
                message: permission.message!,
                payload: { userId: "" },
            };
        }

        // 验证输入
        if (!data.name || !data.email || !data.password) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Name, email and password are required",
                payload: { userId: "" },
            };
        }

        // 验证邮箱格式
        if (!EMAIL_REGEX.test(data.email)) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Invalid email format",
                payload: { userId: "" },
            };
        }

        // 验证密码长度
        if (data.password.length < 8) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Password must be at least 8 characters",
                payload: { userId: "" },
            };
        }

        // 检查邮箱是否已存在
        const emailExists = await UserManagementService.emailExists(data.email);
        if (emailExists) {
            return {
                code: HttpStatus.CONFLICT,
                message: "Email already exists",
                payload: { userId: "" },
            };
        }

        // 创建用户
        const result = await UserManagementService.createCredentialUser(data);

        // 重新验证设置页面
        revalidatePath("/m/settings");

        return {
            code: HttpStatus.CREATED,
            message: "User created successfully",
            payload: { userId: result.userId },
        };
    } catch (error) {
        console.error("[UserManagement] Error creating user:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error instanceof Error ? error.message : "Failed to create user",
            payload: { userId: "" },
        };
    }
}

// ==================== 更新用户 ====================

/**
 * 更新用户基本信息
 * 
 * 需要登录认证
 * 
 * @param userId 用户 ID
 * @param data 更新数据
 * @returns 更新结果
 */
export async function updateUser(
    userId: string,
    data: UpdateUserData
): Promise<Result<void>> {
    try {
        // 权限检查
        const permission = await requireAuthenticated();
        if (!permission.allowed) {
            return {
                code: permission.code!,
                message: permission.message!,
                payload: undefined,
            };
        }

        // 验证用户是否存在
        const user = await UserManagementService.getUserById(userId);
        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: undefined,
            };
        }

        // 更新用户名
        if (data.name) {
            if (data.name.trim().length === 0) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: "Name cannot be empty",
                    payload: undefined,
                };
            }
            await UserManagementService.updateUserName(userId, data.name);
        }

        // 重新验证设置页面
        revalidatePath("/m/settings");

        return {
            code: HttpStatus.OK,
            message: "User updated successfully",
            payload: undefined,
        };
    } catch (error) {
        console.error("[UserManagement] Error updating user:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error instanceof Error ? error.message : "Failed to update user",
            payload: undefined,
        };
    }
}

/**
 * 重置用户密码（仅限 Credential 用户）
 * 
 * 需要登录认证
 * 
 * @param data 重置密码数据
 * @returns 重置结果
 */
export async function resetUserPassword(
    data: ResetPasswordData
): Promise<Result<void>> {
    try {
        // 权限检查
        const permission = await requireAuthenticated();
        if (!permission.allowed) {
            return {
                code: permission.code!,
                message: permission.message!,
                payload: undefined,
            };
        }

        // 验证密码长度
        if (data.newPassword.length < 8) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Password must be at least 8 characters",
                payload: undefined,
            };
        }

        // 验证用户是否存在
        const user = await UserManagementService.getUserById(data.userId);
        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: undefined,
            };
        }

        // 检查用户是否有 credential 账户
        const hasCredential = user.providers.some(
            (p) => p.providerId === "credential"
        );
        if (!hasCredential) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "User does not have credential account",
                payload: undefined,
            };
        }

        // 重置密码
        await UserManagementService.updateUserPassword(data.userId, data.newPassword);

        // 重新验证设置页面
        revalidatePath("/m/settings");

        return {
            code: HttpStatus.OK,
            message: "Password reset successfully",
            payload: undefined,
        };
    } catch (error) {
        console.error("[UserManagement] Error resetting password:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error instanceof Error ? error.message : "Failed to reset password",
            payload: undefined,
        };
    }
}

// ==================== 删除用户 ====================

/**
 * 删除用户
 * 
 * 需要登录认证
 * 
 * 限制：
 * 1. 不能删除自己
 * 2. 不能删除最后一个用户
 * 
 * @param userId 用户 ID
 * @returns 删除结果
 */
export async function deleteUser(userId: string): Promise<Result<void>> {
    try {
        // 权限检查
        const permission = await requireAuthenticated();
        if (!permission.allowed) {
            return {
                code: permission.code!,
                message: permission.message!,
                payload: undefined,
            };
        }

        // 获取当前会话
        const session = await getCurrentSession();
        if (!session) {
            return {
                code: HttpStatus.UNAUTHORIZED,
                message: "Authentication required",
                payload: undefined,
            };
        }

        // 1. 不能删除自己
        if (session.user.id === userId) {
            return {
                code: HttpStatus.FORBIDDEN,
                message: "You cannot delete yourself",
                payload: undefined,
            };
        }

        // 2. 检查是否是最后一个用户
        const userCount = await UserManagementService.getUserCount();
        if (userCount <= 1) {
            return {
                code: HttpStatus.FORBIDDEN,
                message: "Cannot delete the last user",
                payload: undefined,
            };
        }

        // 3. 验证用户是否存在
        const user = await UserManagementService.getUserById(userId);
        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: undefined,
            };
        }

        // 4. 删除用户
        await UserManagementService.deleteUser(userId);

        // 重新验证设置页面
        revalidatePath("/m/settings");

        return {
            code: HttpStatus.OK,
            message: "User deleted successfully",
            payload: undefined,
        };
    } catch (error) {
        console.error("[UserManagement] Error deleting user:", error);
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error instanceof Error ? error.message : "Failed to delete user",
            payload: undefined,
        };
    }
}
