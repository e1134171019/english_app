/**
 * DeckService - 題庫管理服務
 * 統一管理 System Deck（內建）和 Custom Deck（自訂）
 */

export class DeckService {
    constructor(storage, wordService) {
        this.storage = storage;
        this.wordService = wordService;
    }

    /**
     * 建立自訂題庫
     * @param {string} name - 題庫名稱
     * @param {string} inputText - 輸入的單字文本
     * @returns {Object} { deck, invalidWords }
     */
    createDeck(name, inputText) {
        // 1. 解析輸入
        const rawWords = this._parseInput(inputText);

        if (rawWords.length === 0) {
            throw new Error('請輸入至少一個單字');
        }

        if (rawWords.length > 100) {
            throw new Error(`最多 100 個單字（目前：${rawWords.length} 個）`);
        }

        // 2. 驗證與查詢完整資料
        const result = this.wordService.searchWords(rawWords);
        const validWords = result.validWords || [];
        const invalidWords = result.invalidWords || [];

        if (validWords.length === 0) {
            throw new Error('無有效單字，請檢查輸入');
        }

        // 3. 建立 Deck 物件
        const deck = {
            id: `custom:${Date.now()}`,
            name: name || `題庫 ${new Date().toLocaleDateString()}`,
            type: 'custom',
            wordList: validWords.map(w => w.english), // 只存單字本身
            createdAt: Date.now(),
            meta: {
                validCount: validWords.length,
                invalidCount: invalidWords.length,
                source: 'user_input'
            }
        };

        // 4. 儲存到 LocalStorage
        this.storage.saveDeck(deck);

        console.log(`[DeckService] Deck created: ${deck.id}, ${deck.meta.validCount} words`);

        return { deck, invalidWords };
    }

    /**
     * 獲取題庫單字（支援 System 和 Custom）
     * @param {string} deckId - 題庫 ID
     * @returns {Array} 完整的單字物件陣列
     */
    getWords(deckId) {
        if (!deckId) {
            console.warn('[DeckService] No deckId provided');
            return [];
        }

        if (deckId.startsWith('system:')) {
            return this._getSystemWords(deckId);
        } else if (deckId.startsWith('custom:')) {
            return this._getCustomWords(deckId);
        }

        console.warn(`[DeckService] Unknown deck type: ${deckId}`);
        return [];
    }

    /**
     * 取得單一題庫資訊（不含完整單字）
     * @param {string} deckId
     * @returns {Object|null}
     */
    getDeck(deckId) {
        return this.storage.getDeck(deckId);
    }

    /**
     * 取得所有自訂題庫
     * @returns {Array}
     */
    getAllDecks() {
        return this.storage.getAllDecks();
    }

    /**
     * 刪除題庫
     * @param {string} deckId
     */
    deleteDeck(deckId) {
        if (!deckId.startsWith('custom:')) {
            throw new Error('只能刪除自訂題庫');
        }

        this.storage.deleteDeck(deckId);
        console.log(`[DeckService] Deck deleted: ${deckId}`);
    }

    /**
     * 更新題庫
     * @param {Object} deck - 更新後的 deck 物件
     */
    updateDeck(deck) {
        this.storage.saveDeck(deck);
        console.log(`[DeckService] Deck updated: ${deck.id}`);
    }

    // ==================== 私有方法 ====================

    /**
     * 解析輸入文字
     * @private
     */
    _parseInput(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        return text
            .split(/[\n\s,]+/)           // 換行、空格、逗號分隔
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length > 0)   // 移除空白
            .filter((w, i, arr) => arr.indexOf(w) === i); // 去重
    }

    /**
     * 獲取系統題庫單字（內建分級）
     * @private
     */
    /**
     * 獲取系統題庫單字（內建分級）
     * @private
     */
    _getSystemWords(deckId) {
        // 解析 deck ID: "system:jh_j1" → tier1="JH", tier2="J1"
        // Convert to uppercase for consistent comparison
        const parts = deckId.replace('system:', '').toUpperCase().split('_');
        if (parts.length !== 2) {
            console.error(`[DeckService] Invalid system deckId: ${deckId}`);
            return [];
        }

        let [tier1, tier2] = parts;

        // Fix potential naming mismatch if any
        if (tier1 === 'ADVANCED') tier1 = 'Advanced';

        // 使用 WordService 過濾
        const allWords = this.wordService.getAllWords();
        return allWords.filter(word => {
            // 匹配學制與等級 (Case-insensitive check or normalized)
            const wLevel = (word.level || '').toUpperCase();
            const wSchool = (word.schoolLevel || '').toUpperCase();

            // 匹配學制
            if (tier1 === 'JH' && wSchool !== 'JH') return false;
            if (tier1 === 'SH' && wSchool !== 'SH') return false;
            if (tier1 === 'Advanced' && wLevel !== 'ADVANCED') return false;

            // 匹配等級 (Skip tier check for Advanced as it's a single tier)
            if (tier1 !== 'Advanced' && wLevel !== tier2) return false;

            return true;
        });
    }

    /**
     * 獲取自訂題庫單字
     * @private
     */
    _getCustomWords(deckId) {
        const deck = this.storage.getDeck(deckId);

        if (!deck || !deck.wordList) {
            console.warn(`[DeckService] Deck not found or empty: ${deckId}`);
            return [];
        }

        console.log(`[DeckService] Retrieving words for deck: ${deck.name}`, deck.wordList);

        // 從 wordService 取得完整單字資料
        const result = this.wordService.searchWords(deck.wordList);

        console.log(`[DeckService] Search result:`, {
            valid: result.validWords.length,
            invalid: result.invalidWords.length
        });

        return result.validWords || [];
    }
}
