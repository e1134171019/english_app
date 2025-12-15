/**
 * DOM 管理器
 * 集中管理 DOM 元素的更新和顯示
 */

export const DOMManager = {
    // DOM 元素快取
    elements: {},

    /**
     * 初始化 - 快取常用的 DOM 元素
     */
    init() {
        this.elements = {
            // 卡片相關
            flashcard: document.getElementById('flashcard'),
            cardZh: document.getElementById('card-front-text'),       // Corrected ID
            cardEn: document.getElementById('card-back-text'),       // Corrected ID
            cardPos: document.getElementById('card-pos'),
            cardPhonetic: document.getElementById('card-phonetic'),

            // Sentence Section
            cardExampleEn: document.getElementById('card-sentence-en'), // Corrected ID
            cardExampleZh: document.getElementById('card-sentence-zh'), // Corrected ID

            // Navigation
            practiceCounter: document.getElementById('practice-counter'), // New
            practiceProgress: document.getElementById('practice-progress'), // New

            // Toast / Tooltip
            toast: document.getElementById('toast') // Note: toast ID not found in new_index.html, might need fallback or check
        };

        console.log('✓ DOMManager initialized');
    },

    /**
     * 更新卡片顯示
     * @param {Object} card - 單字卡片物件
     * @param {number} currentIndex - 當前索引
     * @param {number} totalCount - 總數量
     */
    updateCard(card, currentIndex, totalCount) {
        const { flashcard, cardZh, cardEn, cardPos, cardPhonetic,
            cardExampleEn, cardExampleZh, practiceCounter, practiceProgress } = this.elements;

        // 移除翻面狀態
        if (flashcard) {
            flashcard.classList.remove('flipped'); // Corrected class
            // Reset transition hack if needed, or rely on CSS
        }

        setTimeout(() => {
            // 更新卡片內容
            if (cardZh) cardZh.textContent = card.translation || '(未命名)';
            if (cardEn) cardEn.textContent = card.english;
            if (cardPos) cardPos.textContent = card.pos || '';
            if (cardPhonetic) cardPhonetic.textContent = card.phonetic || '/.../';

            // 例句
            if (card.exampleEn) { // Corrected prop name from wordService (exampleEn)
                // Use createInteractiveSentence to inject spans
                if (cardExampleEn) cardExampleEn.innerHTML = this.createInteractiveSentence(card.exampleEn, card.english);
                if (cardExampleZh) cardExampleZh.textContent = card.exampleZh || '';
            } else {
                if (cardExampleEn) cardExampleEn.innerHTML = '';
                if (cardExampleZh) cardExampleZh.textContent = '';
            }

            // 更新頁碼 (Progress Bar & Counter)
            if (practiceCounter) practiceCounter.textContent = `${currentIndex + 1} / ${totalCount}`;
            if (practiceProgress) {
                const pct = ((currentIndex + 1) / totalCount) * 100;
                practiceProgress.style.width = `${pct}%`;
            }

        }, 150);
    },

    updatePageIndicator(current, total) {
        // Deprecated in favor of direct update in updateCard
    },

    /**
     * 建立互動式例句（單字可點擊）
     */
    createInteractiveSentence(sentence, targetWord) {
        if (!sentence) return '';
        // Enhance: Highlight the target word strictly? Or just all words?
        // Current logic splits all. Let's keep it.
        const tokens = sentence.split(/(\s+|[.,!?;:“”"()])/);

        return tokens.map(token => {
            // If token is a word (alpha), wrap in span
            if (/^[a-zA-Z\u00C0-\u00FF]+['’]?[a-zA-Z\u00C0-\u00FF]*$/.test(token)) {
                const isTarget = targetWord && token.toLowerCase().includes(targetWord.toLowerCase());
                const className = isTarget ? 'token target-word' : 'token'; // 'token' class from CSS
                return `<span class="${className}" data-word="${token}">${token}</span>`;
            }
            return token;
        }).join('');
    },

    /**
     * 渲染自訂練習組列表
     */
    renderCustomSets(sets) {
        const container = document.getElementById('my-custom-list');
        if (!container) return;

        if (!sets || sets.length === 0) {
            container.innerHTML = '<div class="custom-set-item" style="padding:20px; text-align:center; color:var(--text-secondary);">暫無自訂練習組</div>';
            return;
        }

        container.innerHTML = sets.map(set => `
            <div class="custom-set-item" style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; margin-bottom:12px; border-radius:12px; box-shadow:var(--shadow-sm);">
                <div class="set-info" data-id="${set.id}" style="flex:1; cursor:pointer;">
                    <div style="font-weight:bold; color:var(--text-main); font-size:1.1rem;">${set.name}</div>
                    <div style="font-size:0.9rem; color:var(--text-secondary); margin-top:4px;">${set.words.length} 單字</div>
                </div>
                <div class="set-actions" style="display:flex; gap:8px;">
                    <button class="icon-btn small custom-edit-btn" data-id="${set.id}" title="編輯名稱"><span class="material-icons" style="font-size:1.2rem;">edit</span></button>
                    <button class="icon-btn small custom-delete-btn" data-id="${set.id}" title="刪除"><span class="material-icons" style="font-size:1.2rem;">delete</span></button>
                    <button class="icon-btn small custom-play-btn" data-id="${set.id}" title="開始練習" style="background:#EEF2FF; color:var(--primary);"><span class="material-icons">play_arrow</span></button>
                </div>
            </div>
        `).join('');
    },

    /**
     * 更新單字數量顯示
     */
    updateWordCounts(counts) {
        if (!counts) return;

        // In Master HTML, we only have #total-words-count in Home Stats for now
        // And maybe specific tier counts aren't visible in the new clean Level Select?
        // Let's just update Total if it exists
        const totalEl = document.getElementById('total-words-count');
        if (totalEl) totalEl.textContent = counts.TOTAL_WORDS || (counts.JH_TOTAL + counts.SH_TOTAL + counts.ADV);
    },

    /**
     * 顯示 Toast 提示訊息
     */
    showToast(message) {
        const toast = this.elements.toast;
        if (toast) {
            toast.textContent = message;
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.opacity = '0';
            }, 2000);
        }
    }
};

/**
 * Tooltip 管理器
 */
export const TooltipManager = {
    tooltipEl: null,
    hideTimer: null,

    init() {
        this.tooltipEl = document.getElementById('translation-tooltip');
    },

    show(event, word) {
        clearTimeout(this.hideTimer);

        if (!this.tooltipEl) {
            this.tooltipEl = document.getElementById('translation-tooltip');
        }

        const translation = `${word} (點擊查看翻譯)`;

        this.tooltipEl.innerHTML = `<strong>${word}</strong><br>${translation}`;
        this.tooltipEl.classList.remove('hidden');
        this.tooltipEl.classList.add('visible');

        const rect = event.target.getBoundingClientRect();
        this.tooltipEl.style.position = 'fixed';
        this.tooltipEl.style.top = `${rect.bottom + 5}px`;
        this.tooltipEl.style.left = `${rect.left}px`;
    },

    scheduleHide() {
        this.hideTimer = setTimeout(() => {
            this.hide();
        }, 300);
    },

    hide() {
        if (this.tooltipEl) {
            this.tooltipEl.classList.remove('visible');
            this.tooltipEl.classList.add('hidden');
        }
    }
};
