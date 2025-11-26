import { NextRequest } from "next/server";

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0] || real || 'unknown';
}

export function getRequestMetadata(request: NextRequest) {
    if (!request) {
        return { ip: 'unknown', userAgent: 'unknown' };
    }
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return { ip, userAgent };
}