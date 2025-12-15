/**
 * 全域狀態管理
 * 集中管理所有應用程式狀態
 */

export const AppState = {
    // 單字資料
    userWords: [],
    blockedWords: [],
    activeWordList: [],

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
