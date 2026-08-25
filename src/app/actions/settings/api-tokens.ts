"use server";

import { headers } from "next/headers";
import { getAuth } from "@/lib/auth/auth";
import { getCurrentSession, withAuth } from "@/lib/auth/permissions";
import { HttpStatus, type Result } from "@/lib/response";

export type ApiTokenSummary = {
    id: string;
    name: string | null;
    start: string | null;
    prefix: string | null;
    enabled: boolean;
    expiresAt: Date | string | null;
    lastRequest: Date | string | null;
    createdAt: Date | string;
    referenceId: string;
};

export const listApiTokens = withAuth(
    async (): Promise<Result<ApiTokenSummary[]>> => {
        try {
            const auth = await getAuth();
            const result = await auth.api.listApiKeys({
                headers: await headers(),
            });
            const keys = Array.isArray(result)
                ? result
                : (result?.apiKeys ?? []);
            return {
                code: HttpStatus.OK,
                message: "API tokens retrieved",
                payload: keys as ApiTokenSummary[],
            };
        } catch (error) {
            console.error("[ApiTokens] list failed:", error);
            return {
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to list API tokens",
                payload: [],
            };
        }
    }
);

export const createApiToken = withAuth(
    async (input: {
        name: string;
        expiresInSeconds?: number | null;
    }): Promise<Result<{ key: string; token: ApiTokenSummary }>> => {
        try {
            const name = input.name?.trim();
            if (!name) {
                return {
                    code: HttpStatus.BAD_REQUEST,
                    message: "Name is required",
                    payload: { key: "", token: {} as ApiTokenSummary },
                };
            }
            const session = await getCurrentSession();
            if (!session) {
                return {
                    code: HttpStatus.UNAUTHORIZED,
                    message: "Authentication required",
                    payload: { key: "", token: {} as ApiTokenSummary },
                };
            }
            const auth = await getAuth();
            const created = await auth.api.createApiKey({
                body: {
                    name,
                    userId: session.user.id,
                    expiresIn: input.expiresInSeconds ?? null,
                },
            });
            const { key, ...token } = created;
            return {
                code: HttpStatus.OK,
                message: "API token created",
                payload: { key, token: token as ApiTokenSummary },
            };
        } catch (error) {
            console.error("[ApiTokens] create failed:", error);
            return {
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create API token",
                payload: { key: "", token: {} as ApiTokenSummary },
            };
        }
    }
);

export const getApiToken = withAuth(
    async (id: string): Promise<Result<ApiTokenSummary | null>> => {
        try {
            const auth = await getAuth();
            const token = await auth.api.getApiKey({
                query: { id },
                headers: await headers(),
            });
            return {
                code: HttpStatus.OK,
                message: "API token retrieved",
                payload: token as ApiTokenSummary,
            };
        } catch (error) {
            console.error("[ApiTokens] get failed:", error);
            return {
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to get API token",
                payload: null,
            };
        }
    }
);

export const revokeApiToken = withAuth(
    async (keyId: string): Promise<Result<{ success: boolean }>> => {
        try {
            const auth = await getAuth();
            const result = await auth.api.deleteApiKey({
                body: { keyId },
                headers: await headers(),
            });
            return {
                code: HttpStatus.OK,
                message: "API token revoked",
                payload: { success: result.success },
            };
        } catch (error) {
            console.error("[ApiTokens] revoke failed:", error);
            return {
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to revoke API token",
                payload: { success: false },
            };
        }
    }
);
