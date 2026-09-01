import { describe, expect, it } from "vitest";
import { mergeWithDefaults } from "../defaults";

describe("mergeWithDefaults", () => {
    it("fills missing other.exportMark from defaults", () => {
        const merged = mergeWithDefaults({
            comment: {
                enabled: true,
                maxTotalComments: 100,
                limits: {
                    contentMinLength: 10,
                    contentMaxLength: 1000,
                    maxLinksAllowed: 2,
                },
                moderation: { requireApproval: false },
            },
            suggestion: {
                enabled: true,
                maxTotalSuggestions: 500,
                limits: {
                    contentMinLength: 10,
                    contentMaxLength: 2000,
                    maxLinksAllowed: 3,
                },
            },
        } as Parameters<typeof mergeWithDefaults>[0]);

        expect(merged.other.exportMark).toEqual({
            text: "bsc",
            uppercase: false,
        });
    });
});
