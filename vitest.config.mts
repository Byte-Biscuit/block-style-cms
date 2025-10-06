import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        include: [
            'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
        ],
        exclude: [
            'node_modules',
            'dist',
            '.next',
            'docs',
            'data',
            '.vscode',
            'public',
        ],
        globals: true,
        testTimeout: 10000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{js,ts,jsx,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.{js,ts,jsx,tsx}',
                'src/**/__tests__/**'
            ]
        },
    },
});
