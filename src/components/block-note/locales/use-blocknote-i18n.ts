import { useBlockNoteEditor } from "@blocknote/react";
import { useCallback } from "react";


const getNestedValue = (obj: unknown, path: string): unknown => {
    if (typeof obj !== "object" || obj === null) {
        return undefined;
    }
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
        if (typeof current !== "object" || current === null) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];

        if (current === undefined) {
            return undefined;
        }
    }
    return current;
};

export function useBlockNoteTranslation() {
    const editor = useBlockNoteEditor();
    const t = useCallback(
        (path: string, defaultValue: string = ""): string => {
            const value = getNestedValue(editor.dictionary, path);
            if (typeof value === "string") {
                return value;
            }
            return defaultValue;
        },
        [editor.dictionary]
    );
    return { t };
}