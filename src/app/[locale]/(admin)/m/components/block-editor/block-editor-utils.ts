import type { Dictionary } from "@blocknote/core";
/**
 * 获取块编辑器容器元素
 * 用于修复 Dialog 在全屏元素下无法正确定位的问题
 * 
 */
export const getBlockEditorContainer = () => {
    return document.getElementById("id-block-note-editor");
};

export const getBlockNoteSelfDictionary = async (locale: string): Promise<Dictionary> => {
    const raw = (locale || "en-US").toLowerCase();

    // normalize some locale identifiers
    const key = raw === "zh-cn" ? "zh" : raw === "zh-tw" ? "zhTW" : raw;


    const loaders: Record<string, () => Promise<unknown>> = {
        enUS: () => import("@/blockn/locales/en"),
        zh: () => import("@/blockn/locales/zh"),
        zhTW: () => import("@/blockn/locales/zh-tw"),
    };
    const loader = loaders[key] ?? loaders.en;
    const promise = loader()
        .then((mod: unknown) => {
            // module may export default or named export (e.g. en, zh)
            const m = mod as Record<string, unknown>;
            const candidate = (m["default"] ?? m[key] ?? m["en"] ?? m) as unknown;
            return candidate as Dictionary;
        })
        .catch(async (err: unknown) => {
            // fallback to English on failure
            try {
                const fallback = await import("@/blockn/locales/en");
                const f = fallback as Record<string, unknown>;
                return f["enUS"] as Dictionary;
            } catch {
                // rethrow original error if fallback also fails
                throw err;
            }
        });
    return promise;
};