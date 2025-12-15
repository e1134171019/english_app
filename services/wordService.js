/**
 * 單字服務
 * 處理單字資料的過濾、搜尋、統計等邏輯
 */

import { AppState } from '../core/state.js';
import { wordsData } from '../data/wordsData.js';
import { StorageService } from './storage.js';

export const WordService = {
    /**
     * Standardize word data structure
     * @param {Object} raw - Raw data from different sources
     */
    normalizeWord(raw) {
        return {
            english: raw.English || raw.english || raw.word || '（無英文）',
            translation: raw.Translation || raw.translation || raw.zh || raw.chineseFront || '（無中文翻譯）',
            level: raw.Level || raw.level || '',
            pos: raw.POS || raw.pos || '（無詞性）',
            phonetic: raw.Phonetic || raw.phonetic || '',
            exampleEn: raw.example_en || raw.exampleEn || '',
            exampleZh: raw.example_zh || raw.exampleZh || '',
            verb: raw.verb || null,
            synonyms: Array.isArray(raw.synonyms) ? raw.synonyms : [],
            family: raw.family_key || raw.family || '',
            schoolLevel: raw.schoolLevel || '',
            pattern: raw.pattern || '',
            patternZh: raw.patternZh || ''
        };
    },

    getAllWords() {
        return [...wordsData, ...AppState.getUserWords()].map(w => this.normalizeWord(w));
    },

    /**
     * 根據等級更新活動單字列表
     * @param {Array} levels - 等級陣列
     */
    updateActiveWordList(levels) {
        // 合併內建單字和使用者單字
        const allWords = [...wordsData, ...AppState.getUserWords()];

        // 過濾掉被封鎖的單字
        const blockedWords = AppState.getBlockedWords();
        const filteredWords = allWords.filter(word =>
            !blockedWords.includes(word.English || word.english) // Check both cases as strict validation happens later
        );

        // 根據等級篩選 & 正規化
        const activeWords = filteredWords
            .filter(word => levels.includes(word.level))
            .map(word => this.normalizeWord(word)); // Apply normalization here

        AppState.setActiveWordList(activeWords);
        console.log(`Filtered ${activeWords.length} words for levels: ${levels.join(', ')}`);

        return activeWords;
    },

    /**
     * 計算各等級的單字數量
     * @returns {Object} 各等級的單字數量
     */
    getWordCounts() {
        // 檢查 wordsData 是否存在
        if (typeof wordsData === 'undefined' || !Array.isArray(wordsData)) {
            console.warn('wordsData not available, skipping word count update');
            return null;
        }

        // 計算各等級的單字數量
        const allWords = [...wordsData, ...AppState.getUserWords()];
        const counts = {
            J1: 0, J2: 0, J3: 0,
            H1: 0, H2: 0, H3: 0,
            ADV: 0
        };

        allWords.forEach(word => {
            if (counts.hasOwnProperty(word.level)) {
                counts[word.level]++;
            }
        });

        // 計算總計
        const jhTotal = counts.J1 + counts.J2 + counts.J3;
        const shTotal = counts.H1 + counts.H2 + counts.H3;
        const allTotal = jhTotal + shTotal + counts.ADV;

        return {
            ...counts,
            JH_TOTAL: jhTotal,
            SH_TOTAL: shTotal,
            ALL_TOTAL: allTotal
        };
    },

    /**
     * 新增使用者單字
     * @param {Object} wordData - 單字資料
     */
    addUserWord(wordData) {
        const { english, pos, translation, level, exampleEn, exampleZh } = wordData;

        if (!english || !translation) {
            throw new Error('請至少填寫英文單字和中文翻譯！');
        }

        const newWord = {
            english,
            pos,
            translation,
            level,
            family_id: `USER_${Date.now()}`,
            example_en: exampleEn,
            example_zh: exampleZh
        };

        const userWords = AppState.getUserWords();
        userWords.push(newWord);
        StorageService.saveUserWords(userWords);

        return newWord;
    },

    /**
     * 刪除使用者單字
     * @param {string} english - 英文單字
     */
    deleteUserWord(english) {
        const userWords = AppState.getUserWords();
        const filtered = userWords.filter(w => w.english !== english);
        StorageService.saveUserWords(filtered);
        return true;
    },

    /**
     * 搜尋單字
     * @param {Array} wordList - 要搜尋的單字列表（字串陣列）
     * @returns {Object} { validWords, invalidWords }
     */
    searchWords(wordList) {
        const validWords = [];
        const invalidWords = [];

        // 建立快速查詢 Map (lowercase)
        // Ensure map creation handles inconsistent keys if needed, but assuming English is key
        const wordMap = new Map();
        [...wordsData, ...AppState.getUserWords()].forEach(w => {
            const key = (w.English || w.english || '').toLowerCase();
            if (key) wordMap.set(key, w);
        });

        wordList.forEach(inputWord => {
            const lowerInput = inputWord.toLowerCase();
            if (wordMap.has(lowerInput)) {
                // Found: Normalize it immediately
                validWords.push(this.normalizeWord(wordMap.get(lowerInput)));
            } else {
                invalidWords.push(inputWord);
            }
        });

        return { validWords, invalidWords };
    }
};
