/**
 * LocalStorage 服務
 * 封裝所有資料持久化操作
 */

import { AppConfig } from '../core/config.js';
import { AppState } from '../core/state.js';
import { wordsData } from '../data/wordsData.js';

export const StorageService = {
    /**
     * 初始化資料
     * 從 LocalStorage 載入使用者單字和封鎖單字
     */
    init() {
        console.log('StorageService initializing...');

        // 檢查 wordsData.js 是否已載入
        if (typeof wordsData === 'undefined' || !Array.isArray(wordsData) || wordsData.length === 0) {
            console.error('ERROR: wordsData.js (wordsData) not loaded! wordsData is undefined or empty.');
            alert('資料載入失敗！請確認 wordsData.js 檔案存在且正確載入。');
            return false;
        }

        console.log(`✓ Loaded ${wordsData.length} words from wordsData.js`);

        // 載入使用者單字
        const userWords = this.loadUserWords();
        AppState.setUserWords(userWords);
        console.log(`Loaded ${userWords.length} user words`);

        // 載入封鎖單字
        const blockedWords = this.loadBlockedWords();
        AppState.setBlockedWords(blockedWords);
        console.log(`Loaded ${blockedWords.length} blocked words`);

        return true;
    },

    /**
     * 載入使用者自訂單字
     */
    loadUserWords() {
        const saved = localStorage.getItem(AppConfig.STORAGE_KEYS.USER_WORDS);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse user words:', e);
                return [];
            }
        }
        return [];
    },

    /**
     * 儲存使用者自訂單字
     */
    saveUserWords(words) {
        localStorage.setItem(AppConfig.STORAGE_KEYS.USER_WORDS, JSON.stringify(words));
        AppState.setUserWords(words);
    },

    /**
     * 載入封鎖單字列表
     */
    loadBlockedWords() {
        const saved = localStorage.getItem(AppConfig.STORAGE_KEYS.BLOCKED_WORDS);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse blocked words:', e);
                return [];
            }
        }
        return [];
    },

    /**
     * 儲存封鎖單字列表
     */
    /**
     * 儲存封鎖單字列表
     */
    saveBlockedWords(words) {
        localStorage.setItem(AppConfig.STORAGE_KEYS.BLOCKED_WORDS, JSON.stringify(words));
        AppState.setBlockedWords(words);
    },

    /**
     * 載入自訂練習組 (Custom Sets)
     * Structure: [{ id: timestamp, name: string, words: [] }]
     */
    loadCustomSets() {
        const saved = localStorage.getItem('custom_sets'); // Consider adding to AppConfig
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse custom sets:', e);
                return [];
            }
        }
        return [];
    },

    saveCustomSets(sets) {
        localStorage.setItem('custom_sets', JSON.stringify(sets));
        // Update AppState if needed, or caller handles it
    },

    addCustomSet(name, words) {
        const sets = this.loadCustomSets();
        if (sets.length >= 5) {
            return null; // TS-19 Limit
        }
        const newSet = {
            id: Date.now(),
            name: name || `自訂練習 ${new Date().toLocaleDateString()}`,
            words: words
        };
        sets.unshift(newSet); // Newest first
        this.saveCustomSets(sets);
        return newSet;
    },

    updateCustomSet(id, newName) {
        const sets = this.loadCustomSets();
        const set = sets.find(s => s.id === id);
        if (set) {
            set.name = newName;
            this.saveCustomSets(sets);
            return true;
        }
        return false;
    },

    deleteCustomSet(id) {
        let sets = this.loadCustomSets();
        sets = sets.filter(s => s.id !== id);
        this.saveCustomSets(sets);
    },

    // ==================== Deck Management ====================

    /**
     * 儲存題庫
     * @param {Object} deck - Deck 物件
     */
    saveDeck(deck) {
        const decks = this.getAllDecks();

        // 檢查是否已存在（更新）
        const existingIndex = decks.findIndex(d => d.id === deck.id);
        if (existingIndex >= 0) {
            decks[existingIndex] = deck;
        } else {
            decks.push(deck);
        }

        localStorage.setItem('custom_decks', JSON.stringify(decks));
        console.log(`[Storage] Deck saved: ${deck.id}`);
    },

    /**
     * 取得單一題庫
     * @param {string} deckId
     * @returns {Object|null}
     */
    getDeck(deckId) {
        const decks = this.getAllDecks();
        return decks.find(d => d.id === deckId) || null;
    },

    /**
     * 取得所有自訂題庫
     * @returns {Array}
     */
    getAllDecks() {
        const saved = localStorage.getItem('custom_decks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse decks:', e);
                return [];
            }
        }
        return [];
    },

    /**
     * 刪除題庫
     * @param {string} deckId
     */
    deleteDeck(deckId) {
        let decks = this.getAllDecks();
        decks = decks.filter(d => d.id !== deckId);
        localStorage.setItem('custom_decks', JSON.stringify(decks));
        console.log(`[Storage] Deck deleted: ${deckId}`);
    }
};
