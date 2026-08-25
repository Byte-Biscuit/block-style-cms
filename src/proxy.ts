import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { BETTER_AUTH_SIGN_IN, X_PATH_HEADER_KEY } from "@/constants";
import { routing } from "@/i18n/routing";
import { extractApiKey, requireApiToken } from "@/lib/auth/permissions";
import { HttpStatus } from "@/lib/response";

const nextIntlMiddleware = createMiddleware(routing);

/**
 * `request.url` is a string (standard Web API).
 * `request.nextUrl` is an object (Next.js extended URL object).
 */

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    let response: NextResponse;

    // /api/m: session cookie OR API token (Route Handlers only)
    if (pathname.startsWith("/api/m")) {
        const apiAuth = await authorizeApiM(request);
        if (!apiAuth.ok) {
            return apiAuth.response;
        }
        response = NextResponse.next();
        return injectHeader(response, { pathname });
    }

    // Other API routes pass through
    if (pathname.startsWith("/api/")) {
        response = NextResponse.next();
        return injectHeader(response, { pathname });
    }

    // Protect admin pages: session cookie only (not API token)
    if (pathname.match(/\/m(\/|$)/)) {
        /**
         * Security Warning: The getSessionCookie function only checks for the existence of a session cookie; it does not validate it.
         * Relying solely on this check for security is dangerous, as anyone can manually create a cookie to bypass it.
         * You must always validate the session on your server for any protected actions or pages.
         */
        const cookies = getSessionCookie(request);
        if (!cookies) {
            return NextResponse.redirect(
                new URL(BETTER_AUTH_SIGN_IN, request.url)
            );
        }
    }

    // Default handling by next-intl middleware
    response = nextIntlMiddleware(request);
    return injectHeader(response, { pathname });
}

async function authorizeApiM(
    request: NextRequest
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
    // Prefer token when present; otherwise require session cookie
    if (extractApiKey(request)) {
        const tokenAuth = await requireApiToken(request);
        if (!tokenAuth.allowed) {
            return {
                ok: false,
                response: unauthorizedJson(
                    tokenAuth.message || "Invalid API token",
                    tokenAuth.code || HttpStatus.UNAUTHORIZED
                ),
            };
        }
        return { ok: true };
    }

    if (getSessionCookie(request)) {
        return { ok: true };
    }

    return {
        ok: false,
        response: unauthorizedJson("Authentication required"),
    };
}

function unauthorizedJson(
    message: string,
    code: number = HttpStatus.UNAUTHORIZED
) {
    return NextResponse.json({ code, message, payload: {} }, { status: code });
}

function injectHeader(response: NextResponse, params: { pathname: string }) {
    // Set a custom header for the Layout to read
    const { pathname } = params;
    response.headers.set(X_PATH_HEADER_KEY, pathname);
    return response;
}

/*
 * Match all paths, but exclude the following:
 * 1. _next/ (Next.js system files)
 * 2. favicon.ico
 * 3. Common static asset file extensions (these should not trigger the middleware even if in public)
 */
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|bmp|tiff|mp4|webm|ogg|mp3|wav|flac|aac|pdf|doc|docx|xls|xlsx|ppt|pptx|csv|rtf|txt|css|js|map|woff|woff2|ttf|eot|otf|json|xml|yml|yaml|toml)).*)",
    ],
};
