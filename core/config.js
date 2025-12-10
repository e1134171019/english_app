/**
 * 應用程式設定常數
 */

const AppConfig = {
    // 等級定義
    LEVELS: {
        J1: 'J1',
        J2: 'J2',
        J3: 'J3',
        H1: 'H1',
        H2: 'H2',
        H3: 'H3',
        ADV: 'ADV'
    },

    // 等級群組
    LEVEL_GROUPS: {
        JH_ALL: ['J1', 'J2', 'J3'],
        SH_ALL: ['H1', 'H2', 'H3'],
        ALL: ['J1', 'J2', 'J3', 'H1', 'H2', 'H3', 'ADV']
    },

    // 預設設定
    DEFAULT_SPEED: 1.0,
    DEFAULT_QUIZ_COUNT: 20,
    MAX_CUSTOM_WORDS: 100,

    // LocalStorage 鍵值
    STORAGE_KEYS: {
        USER_WORDS: 'userWords',
        BLOCKED_WORDS: 'blockedWords'
    }
};
