/**
 * Global Fetch Mock for Vitest
 * 統一處理所有測試的 fetch 請求
 */

import { vi } from 'vitest';

// 測試用 fixture 資料（精簡版，加速測試）
const FIXTURE_WORDS = [
    {
        english: 'need',
        translation: '需要',
        pos: 'v.',
        phonetic: '/niːd/',
        exampleEn: 'I need your help.',
        exampleZh: '我需要你的幫助。',
        level: 'J1',
        schoolLevel: 'JH',
        verb: { base: 'need', past: 'needed', pp: 'needed' },
        synonyms: ['require']
    },
    {
        english: 'test',
        translation: '測試',
        pos: 'n.',
        phonetic: '/test/',
        exampleEn: 'This is a test sentence.',
        exampleZh: '這是一個測試句子。',
        level: 'J2',
        schoolLevel: 'JH',
        verb: null,
        synonyms: []
    },
    {
        english: 'example',
        translation: '範例',
        pos: 'n.',
        phonetic: '/ɪɡˈzæmpl/',
        exampleEn: 'Can you give me an example?',
        exampleZh: '你能給我一個範例嗎？',
        level: 'J2',
        schoolLevel: 'JH',
        verb: null,
        synonyms: ['instance', 'sample']
    }
];

// Global fetch mock
vi.stubGlobal('fetch', vi.fn(async (input) => {
    const url = String(input);

    // Mock wordsData.json
    if (url.includes('wordsData.json')) {
        return {
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => FIXTURE_WORDS
        };
    }

    // 其他未處理的請求回傳 404
    return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' })
    };
}));

console.log('[Test Setup] Global fetch mock installed');
