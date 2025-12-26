/**
 * CustomController (DeckManager)
 * 管理自訂題庫的建立、刪除和顯示
 */

import { AppState } from '../core/state.js';
import { startCustomMode } from '../router/startMode.js?v=20251227_nav_fix3';

let services = null;

export const CustomController = {
    name: 'custom-training-screen',

    init(injectedServices) {
        console.log('[CustomController] Init');
        services = injectedServices;
        this.registerEventHandlers();
    },

    onEnter(params) {
        console.log('[CustomController] Enter');
        this.showScreen();
        this.renderDeckList();
    },

    onExit() { },

    showScreen() {
        // Hide others
        document.querySelectorAll('.screen').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('active');
        });

        // Show self
        const el = document.getElementById('custom-training-screen');
        if (el) {
            el.style.display = 'block';
            el.classList.add('active');
        }
    },

    /**
 * 註冊事件處理器 - DISABLED to prevent duplicate handling
 * All events now handled by main.js global click handler
 */
    registerEventHandlers() {
        // TEMP DISABLED: 造成與 main.js 全域處理器衝突，導致無限事件循環
        // 所有 delete-deck, create-and-start, start-custom-* 事件
        // 統一由 main.js 的 _dispatchAction 處理

        console.log('[CustomController] ⚠️ Event delegation DISABLED (handled by main.js)');

        /* ORIGINAL CODE - COMMENTED OUT
        const screen = document.getElementById('custom-training-screen');
        if (!screen) {
            console.error('[CustomController] custom-training-screen not found!');
            return;
        }
    
        // ✅ 使用箭頭函數自動綁定 this
        screen.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
    
            const action = target.dataset.action;
            console.log('[CustomController] Event caught:', action);
    
            // 阻止默認行為和冒泡
            e.preventDefault();
            e.stopPropagation();
    
            // 處理各種 actions
            if (action === 'create-and-start') {
                const mode = target.dataset.mode;
                console.log('[CustomController] Create-and-start, mode:', mode);
                this.handleCreateAndStart(mode);
            }
            else if (action === 'delete-deck') {
                console.log('[CustomController] Delete deck, calling handleDeleteDeck...');
                this.handleDeleteDeck(target);
            }
            else if (action && action.startsWith('start-custom-')) {
                console.log('[CustomController] Start mode:', action);
                this.handleStartMode(target, action);
            }
    
            return false;
        }, true); // 捕獲階段
    
        console.log('[CustomController] ✓ Event delegation registered');
        */
    },

    /**
 * 建立題庫（只建立，不啟動）
 */
    handleCreateAndStart(mode) {
        const inputEl = document.getElementById('deck-input');
        const text = inputEl ? inputEl.value.trim() : '';

        if (!text) {
            Toast.error('請輸入單字');
            return;
        }

        try {
            const deckService = services.deckService;

            // 自動生成題庫名稱：我的題庫1, 我的題庫2...
            const existingDecks = deckService.getAllDecks();
            const deckNumber = existingDecks.length + 1;
            const autoName = `我的題庫${deckNumber}`;

            // 建立題庫
            const result = deckService.createDeck(autoName, text);
            const deck = result.deck || result;
            const invalidWords = result.invalidWords || [];

            // ✅ 儲存用戶選擇的模式（用於列表顯示）
            deck.selectedMode = mode;
            services.storageService.saveDeck(deck);

            // 使用正確的屬性名稱
            const wordCount = deck.wordList ? deck.wordList.length : (deck.meta?.validCount || 0);
            console.log(`[CustomController] Created deck: ${deck.id}, ${wordCount} words`);

            // 清空輸入
            if (inputEl) inputEl.value = '';

            // 顯示成功訊息
            const validCount = deck.meta?.validCount || wordCount;
            const invalidCount = invalidWords.length || deck.meta?.invalidCount || 0;
            let message = `✓ 題庫建立成功！\n「${autoName}」- ${validCount} 個單字`;
            if (invalidCount > 0) {
                message += `\n（${invalidCount} 個無效單字已略過）`;
            }
            Toast.success(message);

            // 重新渲染清單（讓用戶看到新題庫）
            this.renderDeckList();

            // ❌ 不再自動啟動模式
            // 用戶需要手動點擊題庫卡片上的「單字練習」等按鈕才會進入

        } catch (error) {
            console.error('[CustomController] Error:', error);
            Toast.error(`建立失敗: ${error.message}`);
        }
    },

    /**
     * 建立題庫
     */
    handleCreateDeck() {
        const inputEl = document.getElementById('deck-input');
        const nameEl = document.getElementById('deck-name');

        const text = inputEl ? inputEl.value.trim() : '';
        const name = nameEl ? nameEl.value.trim() : '';

        if (!text) {
            alert('請輸入單字');
            return;
        }

        try {
            const deckService = services.deckService;
            const { deck, invalidWords } = deckService.createDeck(name, text);

            // 提示結果
            let message = `題庫建立成功！\n\n`;
            message += `有效單字: ${deck.meta.validCount} 個\n`;
            if (deck.meta.invalidCount > 0) {
                message += `無效單字: ${deck.meta.invalidCount} 個\n`;
                message += `(${invalidWords.slice(0, 5).join(', ')}${invalidWords.length > 5 ? '...' : ''})`;
            }

            alert(message);

            // 清空輸入
            if (inputEl) inputEl.value = '';
            if (nameEl) nameEl.value = '';

            // 重新渲染清單
            this.renderDeckList();

        } catch (error) {
            alert(`建立失敗: ${error.message}`);
        }
    },

    /**
     * 刪除題庫
     */
    handleDeleteDeck(button) {
        // 直接從按鈕取得 deckId
        const deckId = button.dataset.deckId;

        if (!deckId) {
            console.error('[CustomController] No deckId found on delete button');
            return;
        }

        // 取得題庫名稱用於確認
        const deckCard = button.closest('.deck-card');
        const deckName = deckCard ? deckCard.querySelector('h4').textContent : '此題庫';

        // 使用 Toast.confirm 替代原生 confirm
        Toast.confirm(
            `確定要刪除「${deckName}」嗎？`,
            () => {
                // 確認刪除
                try {
                    const deckService = services.deckService;
                    deckService.deleteDeck(deckId);
                    console.log(`[CustomController] Deck deleted: ${deckId}`);
                    Toast.success('題庫已刪除');
                    this.renderDeckList();
                } catch (error) {
                    Toast.error(`刪除失敗: ${error.message}`);
                }
            },
            () => {
                // 取消刪除
                console.log('[CustomController] Delete cancelled');
            }
        );
    },

    /**
     * 啟動模式（使用自訂題庫）
     */
    handleStartMode(button, action) {
        // Fix: Read deckId directly from the button, fallback to card if needed
        const deckId = button.dataset.deckId || button.closest('.deck-card')?.dataset.deckId;

        if (!deckId) {
            console.error('[CustomController] No deckId found on button or card');
            return;
        }

        const mode = action.replace('start-custom-', ''); // practice / quiz / verb3

        console.log(`[CustomController] Starting ${mode} with deck: ${deckId}`);

        // 使用 startCustomMode 路由
        const container = services.container || window.serviceContainer;
        startCustomMode(mode, deckId, container);
    },

    /**
     * 渲染題庫清單
     */
    renderDeckList() {
        const container = document.getElementById('custom-deck-list');
        if (!container) {
            console.warn('[CustomController] custom-deck-list not found');
            return;
        }

        const deckService = services.deckService;
        const decks = deckService.getAllDecks();

        if (decks.length === 0) {
            container.innerHTML = '<p class="empty-state">尚無自訂題庫<br>請在上方輸入單字並建立</p>';
            return;
        }

        // 生成卡片 HTML
        const html = decks.map(deck => this.renderDeckCard(deck)).join('');
        container.innerHTML = html;
    },

    /**
     * 渲染單個題庫卡片（水平模式按鈕）
     */
    renderDeckCard(deck) {
        const createdDate = new Date(deck.createdAt).toLocaleDateString('zh-TW');
        const wordCount = deck.wordList ? deck.wordList.length : 0;

        return `
        <div class="deck-card" style="background: white; border-radius: 12px; padding: 12px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <!-- Left Info -->
            <div style="flex: 1; min-width: 0;">
                <h4 style="margin: 0 0 4px 0; font-size: 1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${deck.name}</h4>
                <div style="font-size: 0.8rem; color: var(--text-hint);">
                    ${wordCount} 個單字 • ${createdDate}
                </div>
            </div>

            <!-- Right Actions (Horizontal) -->
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                
                ${this.renderActionButtons(deck)}

                <button 
                    class="icon-btn" 
                    data-action="delete-deck" 
                    data-deck-id="${deck.id}"
                    style="width: 36px; height: 36px; padding: 8px; flex-shrink: 0; color: var(--text-secondary);"
                    title="刪除題庫">
                    🗑️
                </button>
            </div>
        </div>
        `;
    },

    renderActionButtons(deck) {
        const mode = deck.selectedMode || 'practice';
        const deckId = deck.id;

        let btnText = '單字練習';
        let action = 'start-custom-practice';

        if (mode === 'quiz') {
            btnText = '聽力練習';
            action = 'start-custom-quiz';
        } else if (mode === 'verb3') {
            btnText = '動詞三態';
            action = 'start-custom-verb3';
        }

        return `
            <button 
                class="btn btn-primary" 
                data-action="${action}" 
                data-deck-id="${deckId}"
                style="height: 36px; font-size: 0.875rem; padding: 0 16px; white-space: nowrap;">
                ${btnText}
            </button>`;
    }
};
