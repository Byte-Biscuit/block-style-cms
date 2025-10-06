import { useState, useEffect } from "react";

/**
 * Generic debounce hook
 * @param value The value to debounce
 * @param delay Debounce delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debounced;
}
