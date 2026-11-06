import { getDocument } from "@blocknote/server-util/dom";

let document: Document | undefined;

/** One JSDOM document. 0.57 throws if two editors bind different documents. */
export function serverBlockNoteDocument(): Document {
    document ??= getDocument();
    return document;
}
