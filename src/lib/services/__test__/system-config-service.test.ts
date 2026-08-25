import fsSync from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { systemConfigService } from "../system-config-service";

describe("SystemConfigService", () => {
    const mockConfig = {
        authentication: {
            accessControl: {
                allowedEmails: ["test@example.com"],
            },
        },
        initializedAt: "2026-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    describe("readConfigSync", () => {
        it("should return config if file exists", () => {
            vi.stubEnv("CMS_DATA_PATH", "/tmp/cms-data");
            vi.spyOn(fsSync, "existsSync").mockReturnValue(true);
            vi.spyOn(fsSync, "readFileSync").mockReturnValue(
                JSON.stringify(mockConfig)
            );

            const config = systemConfigService.readConfigSync();
            expect(config).not.toBeNull();
            expect(config?.initializedAt).toBe(mockConfig.initializedAt);
        });
    });

    describe("getAllowedEmails", () => {
        it("should return an empty array if config is null", () => {
            const emails = systemConfigService.getAllowedEmails();
            expect(emails).toEqual([]);
        });
    });
});
