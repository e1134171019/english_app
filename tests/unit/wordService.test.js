/**
 * TC-001: WordService 資料載入與正規化
 * 驗證 WordService 能正確載入 JSON 並提供標準化資料
 */

import { describe, test, expect, beforeAll, vi } from 'vitest';
import { WordService } from '../../services/wordService.js';
import testWords from '../fixtures/testWords.json';

describe('WordService - Data Loading (TC-001)', () => {
    beforeAll(async () => {
        // Mock fetch for jsdom environment
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => testWords
        });

        // 初始化 WordService（載入 JSON）
        await WordService.init();
    });

    test('should load data successfully', () => {
        expect(WordService.wordsData).toBeDefined();
        expect(WordService.wordsData.length).toBeGreaterThan(0);
        console.log(`✓ Loaded ${WordService.wordsData.length} words`);
    });

    test('should normalize schema correctly', () => {
        const firstWord = WordService.wordsData[0];

        // 驗收條件：必須包含這些欄位
        expect(firstWord).toHaveProperty('english');
        expect(firstWord).toHaveProperty('translation');
        expect(firstWord).toHaveProperty('pos');
        expect(firstWord).toHaveProperty('exampleEn');
        expect(firstWord).toHaveProperty('level');

        // 確保非空
        expect(firstWord.english).toBeTruthy();
        expect(firstWord.translation).toBeTruthy();

        console.log('✓ First word schema:', {
            english: firstWord.english,
            translation: firstWord.translation,
            pos: firstWord.pos
        });
    });

    test('should handle schema variations (backward compatibility)', () => {
        // 測試正規化是否能處理多種欄位名稱
        const allWords = WordService.wordsData;

        allWords.forEach(word => {
            expect(word.english).toBeDefined();
            expect(word.translation).toBeDefined();
            // pos 允許空字串（某些單字可能沒詞性）
            expect(word).toHaveProperty('pos');
        });
    });
});
