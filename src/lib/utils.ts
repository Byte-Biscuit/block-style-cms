/**
 * Deep merge two objects
 * @param target - Base object
 * @param source - Override object (takes precedence)
 * @returns Merged object with source values overriding target values
 * 
 * @example
 * const base = { a: 1, b: { c: 2, d: 3 } };
 * const override = { b: { c: 5 }, e: 6 };
 * const result = mergeDeep(base, override);
 * // result: { a: 1, b: { c: 5, d: 3 }, e: 6 }
 */
export function mergeDeep<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
): T {
    const result = { ...target };

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];

            if (
                sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)
            ) {
                result[key] = mergeDeep(targetValue, sourceValue);
            } else {
                result[key] = sourceValue as any;
            }
        }
    }

    return result;
}
