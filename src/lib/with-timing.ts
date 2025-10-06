import { NextRequest } from 'next/server';

export function withTiming(handler: (req: NextRequest, ...args: unknown[]) => Promise<Response>) {
    return async (req: NextRequest, ...args: unknown[]) => {
        const start = Date.now();
        const res = await handler(req, ...args);
        const tt = Date.now() - start;
        if (res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            if (typeof data === 'object' && data && 'payload' in data) {
                data.tt = tt;
                data.ts = Date.now();
                return new Response(JSON.stringify(data), {
                    status: res.status,
                    headers: res.headers
                });
            }
        }
        return res;
    };
}
