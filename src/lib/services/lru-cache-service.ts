import { LRUCache } from 'lru-cache'

/**
 * LRU Cache 服务类
 * 
 * 关于 {} 约束的说明：
 * - {} 在 TypeScript 中表示"任何非 null/undefined 的值"
 * - 包括：string, number, boolean, object, array, function, symbol 等
 * - 排除：null, undefined
 * 
 * 虽然 lru-cache 库要求 {} 约束，但在实际使用中：
 * - 99% 的情况下键类型是 string 或 number
 * - 值类型通常是 object 或基本类型
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type  
class LRUCacheService<K extends {} = string, V extends {} = string | number | boolean | Record<PropertyKey, unknown> | Array<unknown>> {
    private cache: LRUCache<K, V, unknown>;

    constructor(options?: Partial<LRUCache.Options<K, V, unknown>>) {
        const defaultOptions: LRUCache.Options<K, V, unknown> = {
            max: 100,
            ttl: 1000 * 60 * 5,
            ttlAutopurge: true
        };
        this.cache = new LRUCache<K, V, unknown>({ ...defaultOptions, ...options });
    }

    get(key: K): V | undefined {
        return this.cache.get(key);
    }

    set(key: K, value: V, ttl?: number): void {
        if (ttl !== undefined) {
            this.cache.set(key, value, { ttl });
        } else {
            this.cache.set(key, value);
        }
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    delete(key: K): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    keys(): K[] {
        return Array.from(this.cache.keys());
    }

    size(): number {
        return this.cache.size;
    }
}
// Unified cache instance and management
export const lruCacheService = new LRUCacheService();
