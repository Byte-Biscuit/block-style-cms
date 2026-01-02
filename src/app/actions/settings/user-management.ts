"use server";

/**
 * User Management Server Actions
 * 
 * Provides server-side operations for user management:
 * - Get user list
 * - Create new user
 * - Update user information
 * - Reset user password
 * - Delete user
 * 
 * All operations require authentication
 */

import { Result, HttpStatus } from "@/lib/response";
import { UserManagementService, UserWithProvider, CreateUserData } from "@/lib/services/user-management-service";
import { requireAuthenticated, getCurrentSession, withAuth } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { EMAIL_REGEX } from "@/constants";

// ==================== Type Definitions ====================

/**
 * Update user data
 */
export interface UpdateUserData {
    name?: string;
}

/**
 * Reset password data
 */
export interface ResetPasswordData {
    userId: string;
    newPassword: string;
}

// ==================== Get User List ====================

/**
 * Get all users list
 * 
 * Requires authentication
 * 
 * @returns User list
 */
export const getUsers = withAuth(async (): Promise<Result<UserWithProvider[]>> => {
    try {
        // Get user list
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
});

/**
 * Get single user information
 * 
 * Requires authentication
 * 
 * @param userId User ID
 * @returns User information
 */
export const getUser = withAuth(async (userId: string): Promise<Result<UserWithProvider | null>> => {
    try {
        // Get user information
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
});

// ==================== Create User ====================

/**
 * Create a new Credential user
 * 
 * Requires authentication
 * 
 * @param data User data (name, email, password)
 * @returns Creation result, including the new user's ID
 */
export const createUser = withAuth(async (
    data: CreateUserData
): Promise<Result<{ userId: string }>> => {
    try {
        // Validate input
        if (!data.name || !data.email || !data.password) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Name, email and password are required",
                payload: { userId: "" },
            };
        }

        // Validate email format
        if (!EMAIL_REGEX.test(data.email)) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Invalid email format",
                payload: { userId: "" },
            };
        }

        // Validate password length
        if (data.password.length < 8) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Password must be at least 8 characters",
                payload: { userId: "" },
            };
        }

        // Check if email already exists
        const emailExists = await UserManagementService.emailExists(data.email);
        if (emailExists) {
            return {
                code: HttpStatus.CONFLICT,
                message: "Email already exists",
                payload: { userId: "" },
            };
        }

        // Create user
        const result = await UserManagementService.createCredentialUser(data);

        // Revalidate settings page
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
});

// ==================== Update User ====================

/**
 * Update basic user information
 * 
 * Requires authentication
 * 
 * @param userId User ID
 * @param data Update data
 * @returns Update result
 */
export const updateUser = withAuth(async (
    userId: string,
    data: UpdateUserData
): Promise<Result<void>> => {
    try {
        // Validate if user exists
        const user = await UserManagementService.getUserById(userId);
        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: undefined,
            };
        }

        // Update user name
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

        // Revalidate settings page
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
});

/**
 * Reset user password (Credential users only)
 * 
 * Requires authentication
 * 
 * @param data Reset password data
 * @returns Reset result
 */
export const resetUserPassword = withAuth(async (
    data: ResetPasswordData
): Promise<Result<void>> => {
    try {
        // Validate password length
        if (data.newPassword.length < 8) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: "Password must be at least 8 characters",
                payload: undefined,
            };
        }

        // Validate if user exists
        const user = await UserManagementService.getUserById(data.userId);
        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: undefined,
            };
        }

        // Check if user has a credential account
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

        // Reset password
        await UserManagementService.updateUserPassword(data.userId, data.newPassword);

        // Revalidate settings page
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
});

// ==================== Delete User ====================

/**
 * Delete user
 * 
 * Requires authentication
 * 
 * Restrictions:
 * 1. Cannot delete yourself
 * 2. Cannot delete the last user
 * 
 * @param userId User ID
 * @returns Deletion result
 */
export const deleteUser = withAuth(async (userId: string): Promise<Result<void>> => {
    try {
        // Get current session
        const session = await getCurrentSession();
        if (!session) {
            return {
                code: HttpStatus.UNAUTHORIZED,
                message: "Authentication required",
                payload: undefined,
            };
        }

        // 1. Cannot delete yourself
        if (session.user.id === userId) {
            return {
                code: HttpStatus.FORBIDDEN,
                message: "You cannot delete yourself",
                payload: undefined,
            };
        }

        // 2. Check if it's the last user
        const userCount = await UserManagementService.getUserCount();
        if (userCount <= 1) {
            return {
                code: HttpStatus.FORBIDDEN,
                message: "Cannot delete the last user",
                payload: undefined,
            };
        }

        // 3. Validate if user exists
        const user = await UserManagementService.getUserById(userId);
        if (!user) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: "User not found",
                payload: undefined,
            };
        }

        // 4. Delete user
        await UserManagementService.deleteUser(userId);

        // Revalidate settings page
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
});
