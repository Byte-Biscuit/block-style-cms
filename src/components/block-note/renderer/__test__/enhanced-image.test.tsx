import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EnhancedImage from "../enhanced-image";

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}));

vi.mock("next/image", () => ({
    default: ({ src, alt }: { src: string; alt: string }) => {
        // Minimal Next.js Image mock for JSDOM assertions.
        // (Use a div to avoid biome's "no <img>" rule in tests.)
        return (
            <div
                data-testid="next-image"
                data-src={src}
                role="img"
                aria-label={alt}
            />
        );
    },
}));

describe("EnhancedImage", () => {
    beforeEach(() => {
        vi.mocked(useTranslations).mockImplementation(() => {
            return ((key: string) => {
                return (
                    {
                        zoom: "Zoom",
                        closePreview: "Close preview",
                    }[key] ?? key
                );
            }) as unknown as ReturnType<typeof useTranslations>;
        });
    });

    it("renders a width-and-height-capped preview and opens zoom dialog on click", async () => {
        const alt = "Article image";

        render(
            <EnhancedImage
                data={{
                    id: "1",
                    type: "enhancedImage",
                    props: {
                        src: "https://example.com/a.jpg",
                        alt,
                        caption: "caption",
                        alignment: "center",
                        objectFit: "contain",
                        width: "568",
                        height: "320",
                        maxWidth: "100%",
                        source: "upload",
                    },
                }}
            />
        );

        const previewButton = screen.getByRole("button", { name: /zoom/i });
        expect(previewButton.parentElement?.className).toContain(
            "aspect-video"
        );

        fireEvent.click(previewButton);

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /close preview/i })
            ).toBeTruthy();
        });
    });
});
