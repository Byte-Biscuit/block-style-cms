import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/response';

// 成功响应
export function success<T = Record<string, unknown>>(message = 'success', payload: T = {} as T) {
    const res: ApiResponse<T> = { code: 200, message, payload };
    return NextResponse.json(res);
}

// 服务器内部错误
export function failure<T = Record<string, unknown>>(message = 'failure', payload: T = {} as T) {
    const res: ApiResponse<T> = { code: 500, message, payload };
    return NextResponse.json(res);
}

// 未授权
export function unauthorized<T = Record<string, unknown>>(message = '未授权', payload: T = {} as T) {
    const res: ApiResponse<T> = { code: 401, message, payload };
    return NextResponse.json(res);
}

// 禁止访问
export function forbidden<T = Record<string, unknown>>(message = '禁止访问', payload: T = {} as T) {
    const res: ApiResponse<T> = { code: 403, message, payload };
    return NextResponse.json(res);
}

// 参数错误
export function badRequest<T = Record<string, unknown>>(message = '参数错误', payload: T = {} as T) {
    const res: ApiResponse<T> = { code: 400, message, payload };
    return NextResponse.json(res);
}

// 资源未找到
export function notFound<T = Record<string, unknown>>(message = '资源未找到', payload: T = {} as T) {
    const res: ApiResponse<T> = { code: 404, message, payload };
    return NextResponse.json(res);
}