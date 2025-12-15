/**
 * TC-002: tokenizeSentence 產生可點擊 Token
 * 驗證例句能正確轉換為互動式 HTML
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { WordService } from '../../services/wordService.js';

describe('WordService - Token Generation (TC-002)', () => {
    beforeAll(async () => {
        await WordService.init();
    });

    test('should create interactive spans from sentence', () => {
        const sentence = "I need a pen";
        const html = WordService.tokenizeSentence(sentence);

        expect(html).toContain('class="interactive-word"');
        expect(html).toContain('<span');
        expect(html).toContain('need'); // 確保單字保留
    });

    test('should preserve all words in sentence', () => {
        const sentence = "This is a test";
        const html = WordService.tokenizeSentence(sentence);

        ['This', 'is', 'a', 'test'].forEach(word => {
            expect(html).toContain(word);
        });
    });

    test('should handle empty input gracefully', () => {
        expect(WordService.tokenizeSentence('')).toBe('');
        expect(WordService.tokenizeSentence(null)).toBe('');
        expect(WordService.tokenizeSentence(undefined)).toBe('');
    });

    test('should handle single word', () => {
        const html = WordService.tokenizeSentence('hello');

        expect(html).toContain('interactive-word');
        expect(html).toContain('hello');
    });
});
