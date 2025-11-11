import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from "@/i18n/routing";
import { getSessionCookie } from "better-auth/cookies";
import { X_PATH_HEADER_KEY, BETTER_AUTH_SIGN_IN } from '@/constants';

const nextIntlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    if (pathname.match(/^\/(images|videos|files|audios)\//)) {
        const response = NextResponse.next();
        response.headers.set(X_PATH_HEADER_KEY, pathname);
        return response;
    }
    if (pathname.match(/\/m(\/|$)/)) {

        /**
         * Security Warning: The getSessionCookie function only checks for the existence of a session cookie; it does not validate it. 
         * Relying solely on this check for security is dangerous, as anyone can manually create a cookie to bypass it. 
         * You must always validate the session on your server for any protected actions or pages.
         */
        const cookies = getSessionCookie(request);
        if (!cookies) {
            return NextResponse.redirect(new URL(BETTER_AUTH_SIGN_IN, request.url));
        }
    }
    if (!pathname.startsWith('/api/')) {
        const response = nextIntlMiddleware(request);
        response.headers.set(X_PATH_HEADER_KEY, pathname);
        return response;
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|html|txt|json|yml|yaml|xml)).*)',
    ],
}
