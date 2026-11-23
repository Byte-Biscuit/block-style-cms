declare module "jsdom" {
    export class JSDOM {
        constructor(
            html?: string,
            options?: {
                pretendToBeVisual?: boolean;
                resources?: string;
                url?: string;
            }
        );
        window: Window & typeof globalThis;
    }
}
