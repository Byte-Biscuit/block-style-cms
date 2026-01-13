/**
 * User Management Service
 * 
 * Provides low-level services for user management, including:
 * - User queries (all users, single user, Credential users)
 * - User creation (Credential method only)
 * - User updates (name, password)
 * - User deletion
 * - Password encryption and verification (using better-auth/crypto)
 * - 2FA management (generation, enabling, disabling)
 */

import { getAuth } from "@/lib/auth/auth";
import { hashPassword, verifyPassword, symmetricEncrypt, symmetricDecrypt, generateRandomString } from "better-auth/crypto";
import { createOTP } from "@better-auth/utils/otp";
import crypto from "crypto";
import { systemConfigService } from "./system-config-service";

// ==================== Type Definitions ====================

/**
 * Authentication provider types
 */
export type ProviderId = "credential" | "github" | "google";

/**
 * User authentication method information
 */
export interface UserProvider {
    providerId: ProviderId;
    hasPassword: boolean;
}

/**
 * Complete user information (including authentication methods)
 */
export interface UserWithProvider {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    providers: UserProvider[];
    twoFactorEnabled?: boolean;
}

/**
 * Data for creating a user
 */
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
}

/**
 * Data for updating a user
 */
export interface UpdateUserData {
    name?: string;
}
/**
 * Options for generating backup codes
 * From: better-auth/plugins/two-factor/backup-codes/index.ts
 */
export interface BackupCodeOptions {
    /**
     * The amount of backup codes to generate
     *
     * @default 10
     */
    amount?: number | undefined;
    /**
     * The length of the backup codes
     *
     * @default 10
     */
    length?: number | undefined;
    /**
     * An optional custom function to generate backup codes
     */
    customBackupCodesGenerate?: (() => string[]) | undefined;
    /**
     * How to store the backup codes in the database, whether encrypted or plain.
     */
    storeBackupCodes?:
    | (
        | "plain"
        | "encrypted"
        | {
            encrypt: (token: string) => Promise<string>;
            decrypt: (token: string) => Promise<string>;
        }
    )
    | undefined;
}
interface TwoFactorPluginWithOptions {
    id: string;
    options?: {
        backupCodeOptions?: {
            storeBackupCodes?: BackupCodeOptions['storeBackupCodes'];
        };
    };
}


// ==================== User Management Service Class ====================

export class UserManagementService {
    /**
     * Get all users and their authentication methods
     * 
     * Note: A user can have multiple login methods (credential, github, google)
     * Therefore, it is necessary to aggregate data from the user and account tables
     */
    static async getAllUsers(): Promise<UserWithProvider[]> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // Query all users and their account information
            // LEFT JOIN: A user may have multiple account records (different providerIds)
            const rows = db
                .prepare(
                    `
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.emailVerified, 
                    u.createdAt,
                    u.twoFactorEnabled,
                    a.providerId,
                    CASE WHEN a.password IS NOT NULL AND a.password != '' THEN 1 ELSE 0 END as hasPassword
                FROM user u
                LEFT JOIN account a ON u.id = a.userId
                ORDER BY u.createdAt DESC
            `
                )
                .all();

            // Aggregate data by user ID
            // Example: User A has both credential and github login methods
            // The query result will have 2 rows, which need to be merged into 1 user object, with the providers array containing 2 elements
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
                        twoFactorEnabled: !!row.twoFactorEnabled,
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
     * Get a single user by ID
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
                    u.twoFactorEnabled,
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
                twoFactorEnabled: !!firstRow.twoFactorEnabled,
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
     * Get all users with a Credential account
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
     * Create a new Credential user
     * 
     * @param data User data (name, email, password)
     * @returns Returns user ID on success, throws exception on failure
     */
    static async createCredentialUser(
        data: CreateUserData
    ): Promise<{ userId: string }> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 1. Check if the email already exists
            const existingUser = db
                .prepare("SELECT id FROM user WHERE email = ?")
                .get(data.email);

            if (existingUser) {
                throw new Error("Email already exists");
            }

            // 2. Generate user ID
            const userId = crypto.randomUUID();
            const accountId = crypto.randomUUID();

            // 3. Hash password (using better-auth/crypto)
            const hashedPassword = await hashPassword(data.password);

            // 4. Insert user record
            const now = new Date().toISOString();
            db.prepare(
                `
                INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt)
                VALUES (?, ?, ?, 0, ?, ?)
            `
            ).run(userId, data.name, data.email, now, now);

            // 5. Insert account record (credential type)
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
     * Update user name
     */
    static async updateUserName(
        userId: string,
        name: string
    ): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // Check if the user exists
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
     * Update user password (Credential users only)
     * 
     * @param userId User ID
     * @param newPassword New password (plain text)
     */
    static async updateUserPassword(
        userId: string,
        newPassword: string
    ): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // 1. Check if the user has a credential account
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

            // 2. Hash new password
            const hashedPassword = await hashPassword(newPassword);

            // 3. Update password
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
     * Delete a user (cascading delete of all associated accounts)
     * 
     * @param userId User ID
     */
    static async deleteUser(userId: string): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // Check if the user exists
            const user = db.prepare("SELECT id FROM user WHERE id = ?").get(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // 1. Delete all associated accounts
            db.prepare("DELETE FROM account WHERE userId = ?").run(userId);

            // 2. Delete user
            db.prepare("DELETE FROM user WHERE id = ?").run(userId);

            console.log(`[UserManagementService] User deleted: ${userId}`);
        } catch (error) {
            console.error("[UserManagementService] Error deleting user:", error);
            throw error;
        }
    }

    /**
     * Verify if the password is correct
     * 
     * @param plainPassword Plain text password
     * @param hashedPassword Hashed password
     * @returns true if the password is correct
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
     * Check if the email already exists
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
     * Get the total number of users
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

    /**
     * Check if 2FA is enabled for the user
     */
    static async isTwoFactorEnabled(userId: string): Promise<boolean> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            const result = db
                .prepare("SELECT twoFactorEnabled FROM user WHERE id = ?")
                .get(userId);

            return !!result?.twoFactorEnabled;
        } catch (error) {
            console.error("[UserManagementService] Error checking 2FA status:", error);
            return false;
        }
    }

    /**
     * Disable 2FA for the user
     */
    static async disableTwoFactor(userId: string): Promise<void> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // Delete 2FA record
            db.prepare("DELETE FROM twoFactor WHERE userId = ?").run(userId);

            // Update the twoFactorEnabled field in the user table
            db.prepare("UPDATE user SET twoFactorEnabled = 0 WHERE id = ?").run(userId);

            console.log(`[UserManagementService] 2FA disabled for user: ${userId}`);
        } catch (error) {
            console.error("[UserManagementService] Error disabling 2FA:", error);
            throw error;
        }
    }

    private static generateBackupCodesFn(options?: BackupCodeOptions | undefined) {
        return Array.from({ length: options?.amount ?? 10 })
            .fill(null)
            .map(() => generateRandomString(options?.length ?? 10, "a-z", "0-9", "A-Z"))
            .map((code) => `${code.slice(0, 5)}-${code.slice(5)}`);
    }

    /**
     * From: better-auth/plugins/two-factor/backup-codes/index.ts
     * Generate backup codes
     */
    static async generateBackupCodes(
        secret: string,
        options?: BackupCodeOptions | undefined,
    ) {
        const backupCodes = options?.customBackupCodesGenerate
            ? options.customBackupCodesGenerate()
            : UserManagementService.generateBackupCodesFn(options);
        if (options?.storeBackupCodes === "encrypted") {
            const encCodes = await symmetricEncrypt({
                data: JSON.stringify(backupCodes),
                key: secret,
            });
            return {
                backupCodes,
                encryptedBackupCodes: encCodes,
            };
        }
        if (
            typeof options?.storeBackupCodes === "object" &&
            "encrypt" in options?.storeBackupCodes
        ) {
            return {
                backupCodes,
                encryptedBackupCodes: await options?.storeBackupCodes.encrypt(
                    JSON.stringify(backupCodes),
                ),
            };
        }
        return {
            backupCodes,
            encryptedBackupCodes: JSON.stringify(backupCodes),
        };
    }

    /**
     * Generate 2FA Secret for a user (admin operation)
     * Returns secret, otpauth URL, and backup codes
     */
    static async generateTwoFactorSecret(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
        backupCodes: string[];
    }> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // Get user information
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Generate a 32-character random secret using the better-auth standard method
            const secret = generateRandomString(32);

            // Get the better-auth secret for encryption (from settings.json)
            const authSecret = systemConfigService.getAuthSecret();

            // Store the secret using better-auth's symmetric encryption (AES-256-GCM)
            const encryptedSecret = await symmetricEncrypt({
                key: authSecret,
                data: secret,
            });

            // Generate backup codes (using internal method, referencing better-auth implementation)
            const twoFactorPlugin = auth.options.plugins?.find((p: any) => p.id === 'two-factor') as TwoFactorPluginWithOptions | undefined;
            const storeBackupCodes = twoFactorPlugin?.options?.backupCodeOptions?.storeBackupCodes || "plain";
            console.log('[UserManagementService] storeBackupCodes option:', storeBackupCodes);
            const backupCodes = await UserManagementService.generateBackupCodes(authSecret, { storeBackupCodes });

            // Delete old 2FA record (if it exists)
            db.prepare("DELETE FROM twoFactor WHERE userId = ?").run(userId);

            // Insert new 2FA record, storing the encrypted secret and backup codes
            db.prepare(
                `INSERT INTO twoFactor (id, userId, secret, backupCodes)
                 VALUES (?, ?, ?, ?)`
            ).run(crypto.randomUUID(), userId, encryptedSecret, backupCodes.encryptedBackupCodes);

            // Generate otpauthUrl using better-auth's createOTP
            const appName = "Block Style CMS";
            const otpauthUrl = createOTP(secret, {
                digits: 6,
                period: 30,
            }).url(appName, user.email);

            console.log(`[UserManagementService] 2FA secret generated for user: ${userId}`);

            return {
                secret,  // Return original secret (user can enter manually)
                otpauthUrl,
                backupCodes: backupCodes.backupCodes,
            };
        } catch (error) {
            console.error("[UserManagementService] Error generating 2FA secret:", error);
            throw error;
        }
    }

    /**
     * Verify TOTP code and enable 2FA (using better-auth's createOTP)
     */
    static async verifyAndEnableTwoFactor(userId: string, code: string): Promise<boolean> {
        try {
            const auth = await getAuth();
            const db = auth.options.database as any;

            // Get the user's 2FA record
            const twoFactor = db
                .prepare("SELECT * FROM twoFactor WHERE userId = ?")
                .get(userId);

            if (!twoFactor) {
                throw new Error("No 2FA setup found for this user");
            }

            // Get the better-auth secret for decryption (from settings.json)
            const authSecret = systemConfigService.getAuthSecret();

            // Decrypt the encrypted secret stored in the database
            const decryptedSecret = await symmetricDecrypt({
                key: authSecret,
                data: twoFactor.secret,  // Decrypt the stored ciphertext
            });

            console.log('[2FA Debug] User Code:', code);
            console.log('[2FA Debug] Decrypted secret length:', decryptedSecret.length);

            // Perform TOTP verification using better-auth's createOTP
            const otpVerifier = createOTP(decryptedSecret, {
                period: 30,  // 30-second time window
                digits: 6,   // 6-digit verification code
            });

            // The verify method automatically handles ±1 time window (total 90 seconds tolerance)
            const isValid = await otpVerifier.verify(code, {
                window: 1,  // Allow 1 window before and after
            });

            console.log('[2FA Debug] Verification result:', isValid ? '✅ Valid' : '❌ Invalid');

            if (!isValid) {
                return false;
            }

            // Verification successful, update the twoFactorEnabled field in the user table
            db.prepare("UPDATE user SET twoFactorEnabled = 1 WHERE id = ?").run(userId);

            console.log(`[UserManagementService] 2FA enabled for user: ${userId}`);

            return true;
        } catch (error) {
            console.error("[UserManagementService] Error verifying 2FA code:", error);
            throw error;
        }
    }
}
