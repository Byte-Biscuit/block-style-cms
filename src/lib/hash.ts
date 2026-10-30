import { createHash } from "node:crypto";

/** SHA-256 fingerprint as lowercase hex (content-address / dedupe). */
export function sha256Hex(data: Buffer | Uint8Array | string): string {
    return createHash("sha256").update(data).digest("hex");
}
