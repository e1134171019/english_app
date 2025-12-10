/**
 * LocalStorage 服務
 * 封裝所有資料持久化操作
 */

const StorageService = {
    /**
     * 初始化資料
     * 從 LocalStorage 載入使用者單字和封鎖單字
     */
    init() {
        console.log('StorageService initializing...');

        // 檢查 wordsData.js 是否已載入
        if (typeof fullWordList === 'undefined' || !Array.isArray(fullWordList) || fullWordList.length === 0) {
            console.error('ERROR: wordsData.js not loaded! fullWordList is undefined or empty.');
            alert('資料載入失敗！請確認 wordsData.js 檔案存在且正確載入。');
            return false;
        }

        console.log(`✓ Loaded ${fullWordList.length} words from wordsData.js`);

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
    saveBlockedWords(words) {
        localStorage.setItem(AppConfig.STORAGE_KEYS.BLOCKED_WORDS, JSON.stringify(words));
        AppState.setBlockedWords(words);
    }
};
