import { describe, it, } from 'vitest';
import { formatDateI18n } from '../util';

describe('formatDateI18n', () => {
    const fixedDate = new Date('2025-09-05T04:17:28.644Z');

    describe('I18n Date format', () => {
        it('should return relative time in Chinese (zh-CN)', () => {
            const result = formatDateI18n(fixedDate, 'zh-CN');
            console.log('Result:', result);
        });

        it('should return relative time in English (en-US)', () => {
            const result = formatDateI18n(fixedDate, 'en-US');
            console.log('Result:', result);
        });

        it('should return relative time in Traditional Chinese (zh-TW)', () => {
            const result = formatDateI18n(fixedDate, 'zh-TW');
            console.log('Result:', result);
        });

        it('should use relative format as default', () => {
            const result = formatDateI18n(fixedDate, "error");
            console.log('Result:', result);
        });
    });
});