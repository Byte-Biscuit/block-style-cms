import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";

async function createAuth() {
    const db = new Database(":memory:");
    db.pragma("journal_mode = WAL");
    const auth = betterAuth({
        appName: "test",
        database: db,
        secret: "a".repeat(32),
        baseURL: "http://localhost:3000",
        emailAndPassword: { enabled: true },
        plugins: [
            apiKey({
                defaultPrefix: "bsc_",
                requireName: true,
                enableSessionForAPIKeys: false,
                keyExpiration: { defaultExpiresIn: null },
                rateLimit: { enabled: false },
            }),
        ],
    });
    const { getMigrations } = await import("better-auth/db/migration");
    const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(
        auth.options
    );
    if (toBeCreated.length || toBeAdded.length) {
        await runMigrations();
    }
    return { auth, db };
}

describe("apiKey plugin", () => {
    let auth: Awaited<ReturnType<typeof createAuth>>["auth"];
    let db: Database.Database;

    beforeEach(async () => {
        const created = await createAuth();
        auth = created.auth;
        db = created.db;
        const now = new Date().toISOString();
        db.prepare(
            `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt)
             VALUES (?, ?, ?, 1, ?, ?)`
        ).run("user-1", "Test", "test@example.com", now, now);
    });

    it("creates a key, verifies it, and rejects a wrong key", async () => {
        const created = await auth.api.createApiKey({
            body: { name: "ci", userId: "user-1" },
        });
        expect(created.key).toMatch(/^bsc_/);
        expect(created.key).not.toBe(created.start);

        const ok = await auth.api.verifyApiKey({
            body: { key: created.key },
        });
        expect(ok.valid).toBe(true);
        expect(ok.key?.referenceId).toBe("user-1");

        const bad = await auth.api.verifyApiKey({
            body: { key: "bsc_not-a-real-key" },
        });
        expect(bad.valid).toBe(false);
    });

    it("fails verify after the key row is deleted", async () => {
        const created = await auth.api.createApiKey({
            body: { name: "gone", userId: "user-1" },
        });
        db.prepare("DELETE FROM apikey WHERE id = ?").run(created.id);
        const result = await auth.api.verifyApiKey({
            body: { key: created.key },
        });
        expect(result.valid).toBe(false);
    });

    it("fails verify after expiresAt is in the past", async () => {
        const created = await auth.api.createApiKey({
            body: { name: "old", userId: "user-1" },
        });
        db.prepare("UPDATE apikey SET expiresAt = ? WHERE id = ?").run(
            "2000-01-01T00:00:00.000Z",
            created.id
        );
        const result = await auth.api.verifyApiKey({
            body: { key: created.key },
        });
        expect(result.valid).toBe(false);
    });
});
