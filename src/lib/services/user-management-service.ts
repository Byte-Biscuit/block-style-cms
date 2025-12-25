/**
 * User Management Service
 * 
 * 提供用户管理的底层服务，包括：
 * - 用户查询（所有用户、单个用户、Credential 用户）
 * - 用户创建（仅 Credential 方式）
 * - 用户更新（姓名、密码）
 * - 用户删除
 * - 密码加密和验证（使用 better-auth/crypto）
 */

import { getAuth } from "@/lib/auth/auth";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import crypto from "crypto";

// ==================== 类型定义 ====================

/**
 * 认证提供商类型
 */
export type ProviderId = "credential" | "github" | "google";

/**
 * 用户认证方式信息
 */
export interface UserProvider {
    providerId: ProviderId;
    hasPassword: boolean;
}

/**
 * 完整的用户信息（包含认证方式）
 */
export interface UserWithProvider {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    providers: UserProvider[];
}

/**
 * 创建用户的数据
 */
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
}

/**
 * 更新用户的数据
 */
export interface UpdateUserData {
    name?: string;
}

// ==================== 用户管理服务类 ====================

export class UserManagementService {
    /**
     * 获取所有用户及其认证方式
     * 
     * 注意：一个用户可以有多种登录方式（credential, github, google）
     * 因此需要聚合 user 和 account 表的数据
     */
    static async getAllUsers(): Promise<UserWithProvider[]> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 查询所有用户和他们的账户信息
            // LEFT JOIN: 一个用户可能有多个 account 记录（不同的 providerId）
            const rows = db
                .prepare(
                    `
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.emailVerified, 
                    u.createdAt,
                    a.providerId,
                    CASE WHEN a.password IS NOT NULL AND a.password != '' THEN 1 ELSE 0 END as hasPassword
                FROM user u
                LEFT JOIN account a ON u.id = a.userId
                ORDER BY u.createdAt DESC
            `
                )
                .all();

            // 按用户 ID 聚合数据
            // 示例：用户 A 有 credential + github 两种登录方式
            // 查询结果会有 2 行，需要合并成 1 个用户对象，providers 数组包含 2 个元素
            const userMap = new Map<string, UserWithProvider>();

            for (const row of rows) {
                if (!userMap.has(row.id)) {
                    userMap.set(row.id, {
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        emailVerified: !!row.emailVerified,
                        createdAt: row.createdAt,
                        providers: [],
                    });
                }

                const user = userMap.get(row.id)!;
                if (row.providerId) {
                    user.providers.push({
                        providerId: row.providerId as ProviderId,
                        hasPassword: !!row.hasPassword,
                    });
                }
            }

            return Array.from(userMap.values());
        } catch (error) {
            console.error("[UserManagementService] Error getting all users:", error);
            throw error;
        }
    }

    /**
     * 根据 ID 获取单个用户
     */
    static async getUserById(userId: string): Promise<UserWithProvider | null> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            const rows = db
                .prepare(
                    `
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.emailVerified, 
                    u.createdAt,
                    a.providerId,
                    CASE WHEN a.password IS NOT NULL AND a.password != '' THEN 1 ELSE 0 END as hasPassword
                FROM user u
                LEFT JOIN account a ON u.id = a.userId
                WHERE u.id = ?
            `
                )
                .all(userId);

            if (!rows || rows.length === 0) {
                return null;
            }

            const firstRow = rows[0];
            const user: UserWithProvider = {
                id: firstRow.id,
                name: firstRow.name,
                email: firstRow.email,
                emailVerified: !!firstRow.emailVerified,
                createdAt: firstRow.createdAt,
                providers: [],
            };

            for (const row of rows) {
                if (row.providerId) {
                    user.providers.push({
                        providerId: row.providerId as ProviderId,
                        hasPassword: !!row.hasPassword,
                    });
                }
            }

            return user;
        } catch (error) {
            console.error("[UserManagementService] Error getting user by ID:", error);
            throw error;
        }
    }

    /**
     * 获取所有拥有 Credential 账户的用户
     */
    static async getCredentialUsers(): Promise<UserWithProvider[]> {
        try {
            const allUsers = await this.getAllUsers();
            return allUsers.filter((user) =>
                user.providers.some((p) => p.providerId === "credential")
            );
        } catch (error) {
            console.error("[UserManagementService] Error getting credential users:", error);
            throw error;
        }
    }

    /**
     * 创建新的 Credential 用户
     * 
     * @param data 用户数据（姓名、邮箱、密码）
     * @returns 成功返回用户 ID，失败抛出异常
     */
    static async createCredentialUser(
        data: CreateUserData
    ): Promise<{ userId: string }> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 1. 检查邮箱是否已存在
            const existingUser = db
                .prepare("SELECT id FROM user WHERE email = ?")
                .get(data.email);

            if (existingUser) {
                throw new Error("Email already exists");
            }

            // 2. 生成用户 ID
            const userId = crypto.randomUUID();
            const accountId = crypto.randomUUID();

            // 3. 哈希密码（使用 better-auth/crypto）
            const hashedPassword = await hashPassword(data.password);

            // 4. 插入用户记录
            const now = new Date().toISOString();
            db.prepare(
                `
                INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt)
                VALUES (?, ?, ?, 0, ?, ?)
            `
            ).run(userId, data.name, data.email, now, now);

            // 5. 插入账户记录（credential 类型）
            db.prepare(
                `
                INSERT INTO account (id, userId, providerId, accountId, password, createdAt, updatedAt)
                VALUES (?, ?, 'credential', ?, ?, ?, ?)
            `
            ).run(accountId, userId, data.email, hashedPassword, now, now);

            console.log(`[UserManagementService] User created: ${userId} (${data.email})`);

            return { userId };
        } catch (error) {
            console.error("[UserManagementService] Error creating user:", error);
            throw error;
        }
    }

    /**
     * 更新用户姓名
     */
    static async updateUserName(
        userId: string,
        name: string
    ): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 检查用户是否存在
            const user = db.prepare("SELECT id FROM user WHERE id = ?").get(userId);
            if (!user) {
                throw new Error("User not found");
            }

            const now = new Date().toISOString();
            db.prepare(
                `
                UPDATE user 
                SET name = ?, updatedAt = ?
                WHERE id = ?
            `
            ).run(name, now, userId);

            console.log(`[UserManagementService] User name updated: ${userId}`);
        } catch (error) {
            console.error("[UserManagementService] Error updating user name:", error);
            throw error;
        }
    }

    /**
     * 更新用户密码（仅限 Credential 用户）
     * 
     * @param userId 用户 ID
     * @param newPassword 新密码（明文）
     */
    static async updateUserPassword(
        userId: string,
        newPassword: string
    ): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 1. 检查用户是否有 credential 账户
            const account = db
                .prepare(
                    `
                SELECT id FROM account 
                WHERE userId = ? AND providerId = 'credential'
            `
                )
                .get(userId);

            if (!account) {
                throw new Error("User does not have credential account");
            }

            // 2. 哈希新密码
            const hashedPassword = await hashPassword(newPassword);

            // 3. 更新密码
            const now = new Date().toISOString();
            db.prepare(
                `
                UPDATE account 
                SET password = ?, updatedAt = ?
                WHERE userId = ? AND providerId = 'credential'
            `
            ).run(hashedPassword, now, userId);

            console.log(`[UserManagementService] User password updated: ${userId}`);
        } catch (error) {
            console.error("[UserManagementService] Error updating password:", error);
            throw error;
        }
    }

    /**
     * 删除用户（级联删除所有关联的账户）
     * 
     * @param userId 用户 ID
     */
    static async deleteUser(userId: string): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 检查用户是否存在
            const user = db.prepare("SELECT id FROM user WHERE id = ?").get(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // 1. 删除所有关联的账户
            db.prepare("DELETE FROM account WHERE userId = ?").run(userId);

            // 2. 删除用户
            db.prepare("DELETE FROM user WHERE id = ?").run(userId);

            console.log(`[UserManagementService] User deleted: ${userId}`);
        } catch (error) {
            console.error("[UserManagementService] Error deleting user:", error);
            throw error;
        }
    }

    /**
     * 验证密码是否正确
     * 
     * @param plainPassword 明文密码
     * @param hashedPassword 哈希后的密码
     * @returns true 表示密码正确
     */
    static async verifyPassword(
        plainPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        try {
            return await verifyPassword({
                password: plainPassword,
                hash: hashedPassword,
            });
        } catch (error) {
            console.error("[UserManagementService] Error verifying password:", error);
            return false;
        }
    }

    /**
     * 检查邮箱是否已存在
     */
    static async emailExists(email: string): Promise<boolean> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            const user = db
                .prepare("SELECT id FROM user WHERE email = ?")
                .get(email);

            return !!user;
        } catch (error) {
            console.error("[UserManagementService] Error checking email:", error);
            throw error;
        }
    }

    /**
     * 获取用户总数
     */
    static async getUserCount(): Promise<number> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            const result = db
                .prepare("SELECT COUNT(*) as count FROM user")
                .get();

            return result?.count || 0;
        } catch (error) {
            console.error("[UserManagementService] Error getting user count:", error);
            throw error;
        }
    }
}
