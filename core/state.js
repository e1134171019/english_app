/**
 * 全域狀態管理
 * 集中管理所有應用程式狀態
 */

export const AppState = {
    // ==================== 狀態分離 ====================
    // 封面三大模式狀態（不受自訂模式影響）
    main: {
        selectedMode: 'practice',  // practice / quiz / verb3
        selectedLevel: {
            tier1: '',  // JH / SH / Advanced
            tier2: ''   // J1, J2, J3, S1, S2, S3
        }
    },

    // 我的專屬模式狀態（不受封面影響）
    custom: {
        selectedMode: 'practice'  // practice / quiz / verb3
    },

    // Deck 上下文
    currentDeckId: null,      // 當前使用的題庫 ID
    currentWords: [],         // 當前題庫的單字（統一來源）

    // ==================== 原有狀態（向後兼容）====================
    // 單字資料
    userWords: [],
    blockedWords: [],
    activeWordList: [],  // 保留以兼容現有代碼

    // 當前狀態
    currentMode: 'home',
    selectedLevels: [],
    currentIndex: 0,
    currentCard: {},
    currentSpeed: 1.0,
    pendingMode: '',
    currentTier: '',

    // 測驗相關
    quizList: [],
    quizIndex: 0,
    quizCurrentWord: null,

    // 動詞三態相關
    verb3CurrentLevel: 'JH',
    verb3List: [],
    verb3Index: 0,
    verb3CurrentVerb: null,

    // 自訂義訓練
    customWordList: [],

    // Getter 方法
    getUserWords() {
        return this.userWords;
    },

    getBlockedWords() {
        return this.blockedWords;
    },

    getActiveWordList() {
        return this.activeWordList;
    },

    getCurrentCard() {
        return this.currentCard;
    },

    getCurrentSpeed() {
        return this.currentSpeed;
    },

    // Setter 方法
    setUserWords(words) {
        this.userWords = words;
    },

    setBlockedWords(words) {
        this.blockedWords = words;
    },

    setActiveWordList(words) {
        this.activeWordList = words;
    },

    setCurrentCard(card) {
        this.currentCard = card;
    },

    setCurrentSpeed(speed) {
        this.currentSpeed = speed;
    },

    setCurrentIndex(index) {
        this.currentIndex = index;
    },

    setPendingMode(mode) {
        this.pendingMode = mode;
    },

    setCurrentTier(tier) {
        this.currentTier = tier;
    },

    // 重置狀態
    reset() {
        this.currentIndex = 0;
        this.currentCard = {};
    }
};
