/**
 * startMode - 統一啟動路由
 * 無論封面或自訂題庫，都走這個統一入口
 */

import { AppState } from '../core/state.js';

export function startMode({ mode, deckId, container }) {
    console.log(`[startMode] Mode: ${mode}, DeckId: ${deckId}`);

    // 1. 獲取 DeckService
    const deckService = container.get('deckService');

    // 2. 獲取題庫單字
    const words = deckService.getWords(deckId);

    if (!words || words.length === 0) {
        alert('題庫無資料或單字數為 0');
        return false;
    }

    console.log(`[startMode] Loaded ${words.length} words from deck: ${deckId}`);

    // 3. 更新 AppState（統一來源）
    AppState.currentDeckId = deckId;
    AppState.currentWords = words;
    AppState.activeWordList = words; // 向後兼容

    // 4. 路由到對應 Controller
    const controllerMap = {
        'practice': 'flashcardController',
        'quiz': 'quizController',
        'verb3': 'verb3Controller'
    };

    const controllerName = controllerMap[mode];
    if (!controllerName) {
        console.error(`[startMode] Unknown mode: ${mode}`);
        return false;
    }

    try {
        const controller = container.get(controllerName);

        // 5. 啟動 Controller（傳入 words 和 deckId）
        controller.start({ words, deckId });

        // 6. 設置為當前模塊（讓 main.js 的按鈕可以委託）
        if (window.app) {
            window.app.currentModule = controller;
            console.log(`[startMode] Set currentModule to ${controllerName}`);
        }

        console.log(`[startMode] ✓ Started ${controllerName}`);
        return true;

    } catch (error) {
        console.error(`[startMode] Error starting controller:`, error);
        alert(`啟動失敗: ${error.message}`);
        return false;
    }
}

/**
 * startMainMode - 啟動封面三大模式
 * @param {string} mode - practice / quiz / verb3
 * @param {Object} levelSelection - { tier1, tier2 }
 * @param {Object} container - ServiceContainer
 */
export function startMainMode(mode, levelSelection, container) {
    const { tier1, tier2 } = levelSelection;

    // 更新 main 狀態
    AppState.main.selectedMode = mode;
    AppState.main.selectedLevel = { tier1, tier2 };

    // 建立 System Deck ID
    const deckId = `system:${tier1.toLowerCase()}_${tier2.toLowerCase()}`;

    return startMode({ mode, deckId, container });
}

/**
 * startCustomMode - 啟動自訂題庫模式
 * @param {string} mode - practice / quiz / verb3
 * @param {string} deckId - custom:xxxxx
 * @param {Object} container - ServiceContainer
 */
export function startCustomMode(mode, deckId, container) {
    console.log('[startCustomMode] Called with:', { mode, deckId });

    // 更新 custom 狀態
    AppState.custom.selectedMode = mode;

    const result = startMode({ mode, deckId, container });

    // ✅ 強制設置 currentModule（確保導航按鈕能委託到正確的 controller）
    if (result && window.app && container) {
        const controllerMap = {
            'practice': 'flashcardController',
            'quiz': 'quizController',
            'verb3': 'verb3Controller'
        };
        const controllerName = controllerMap[mode];
        if (controllerName) {
            try {
                const controller = container.get(controllerName);
                window.app.currentModule = controller;
                console.log(`[startCustomMode] ✓ Force set currentModule to ${controllerName}`);
            } catch (e) {
                console.error('[startCustomMode] Error setting currentModule:', e);
            }
        }
    }

    console.log('[startCustomMode] Result:', result);

    return result;
}
