import { NextResponse } from "next/server";

/**
 * Own the `/.well-known/*` namespace outside `[locale]` so probes (Chrome
 * DevTools, ACME, security.txt, …) never become a fake locale.
 * Unknown paths 404; add a more specific route/file when you actually need one.
 */
export function GET() {
    return new NextResponse(null, { status: 404 });
}
