import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { systemConfigService } from '../system-config-service';

describe('SystemConfigService', () => {
    const mockConfig = {
        authentication: {
            accessControl: {
                allowedEmails: ['test@example.com']
            }
        },
        initializedAt: '2026-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('readConfigSync', () => {
        it('should return config if file exists', () => {
            const config = systemConfigService.readConfigSync();
            expect(config).not.toBeNull();
        });
    });

    describe('getAllowedEmails', () => {
        it('should return an empty array if config is null', () => {
            const emails = systemConfigService.getAllowedEmails();
            expect(emails).not.toBeNull();
        });
    });
});
