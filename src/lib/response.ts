import { NextResponse } from 'next/server';

export interface Result<T = unknown> {
    code: number;
    message: string;
    payload: T;
    tt?: number;
}

/**
 * HTTP status code constants
 * Follows the RFC 7231 standard
 */
export const HttpStatus = {
    // 2xx Success
    OK: 200,                    // Request succeeded
    CREATED: 201,               // Resource created successfully
    ACCEPTED: 202,              // Request accepted, processing
    NO_CONTENT: 204,            // Success, no content

    // 4xx Client errors
    BAD_REQUEST: 400,           // Bad request parameters
    UNAUTHORIZED: 401,          // Unauthorized
    FORBIDDEN: 403,             // Forbidden
    NOT_FOUND: 404,             // Resource not found
    CONFLICT: 409,              // Resource conflict (e.g., duplicate)
    UNPROCESSABLE_ENTITY: 422,  // Unprocessable entity (e.g., validation failed)

    // 5xx Server errors
    INTERNAL_SERVER_ERROR: 500, // Internal server error
    NOT_IMPLEMENTED: 501,       // Not implemented
    SERVICE_UNAVAILABLE: 503,   // Service unavailable
} as const;

// Success response
export function success<T = Record<string, unknown>>(message = 'success', payload: T = {} as T) {
    const res: Result<T> = { code: HttpStatus.OK, message, payload };
    return NextResponse.json(res);
}

// Internal server error
export function failure<T = Record<string, unknown>>(message = 'failure', payload: T = {} as T) {
    const res: Result<T> = { code: HttpStatus.INTERNAL_SERVER_ERROR, message, payload };
    return NextResponse.json(res);
}

// Unauthorized
export function unauthorized<T = Record<string, unknown>>(message = '未授权', payload: T = {} as T) {
    const res: Result<T> = { code: HttpStatus.UNAUTHORIZED, message, payload };
    return NextResponse.json(res);
}

// Forbidden
export function forbidden<T = Record<string, unknown>>(message = '禁止访问', payload: T = {} as T) {
    const res: Result<T> = { code: HttpStatus.FORBIDDEN, message, payload };
    return NextResponse.json(res);
}

// Bad request
export function badRequest<T = Record<string, unknown>>(message = '参数错误', payload: T = {} as T) {
    const res: Result<T> = { code: HttpStatus.BAD_REQUEST, message, payload };
    return NextResponse.json(res);
}

// Resource not found
export function notFound<T = Record<string, unknown>>(message = '资源未找到', payload: T = {} as T) {
    const res: Result<T> = { code: HttpStatus.NOT_FOUND, message, payload };
    return NextResponse.json(res);
}

// ==================== Utility Functions ====================

/**
 * Check if result is successful (2xx status code)
 * 判断响应是否成功
 */
export function isSuccess<T>(result: Result<T>): boolean {
    return result.code >= 200 && result.code < 300;
}

/**
 * Check if result is client error (4xx status code)
 * 判断是否为客户端错误
 */
export function isClientError<T>(result: Result<T>): boolean {
    return result.code >= 400 && result.code < 500;
}

/**
 * Check if result is server error (5xx status code)
 * 判断是否为服务器错误
 */
export function isServerError<T>(result: Result<T>): boolean {
    return result.code >= 500 && result.code < 600;
}