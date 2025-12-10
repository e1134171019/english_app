/**
 * DOM 管理器
 * 集中管理 DOM 元素的更新和顯示
 */

const DOMManager = {
    // DOM 元素快取
    elements: {},

    /**
     * 初始化 - 快取常用的 DOM 元素
     */
    init() {
        this.elements = {
            // 卡片相關
            flashcard: document.getElementById('flashcard'),
            cardChinese: document.getElementById('card-chinese'),
            cardEnglish: document.getElementById('card-english'),
            cardPos: document.getElementById('card-pos'),
            cardPhonetic: document.getElementById('card-phonetic'),
            cardMeaning: document.getElementById('card-meaning'),
            backCollocations: document.getElementById('back-collocations'),
            cardSentenceBox: document.getElementById('card-sentence-box'),
            cardExampleEn: document.getElementById('card-example-en'),
            cardExampleZh: document.getElementById('card-example-zh'),
            pageIndicator: document.getElementById('page-indicator'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),

            // Toast
            toast: document.getElementById('toast')
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
        const { flashcard, cardChinese, cardEnglish, cardPos, cardPhonetic,
            cardMeaning, cardSentenceBox, cardExampleEn, cardExampleZh } = this.elements;

        // 移除翻面狀態
        flashcard.classList.remove('is-flipped');

        setTimeout(() => {
            // 更新卡片內容
            cardChinese.textContent = card.translation || '(未命名)';
            cardEnglish.textContent = card.english;
            cardPos.textContent = card.pos || '';
            cardPhonetic.textContent = '';

            // 解釋
            cardMeaning.textContent = card.translation || '';

            // 搭配詞（暫時清空）
            this.elements.backCollocations.innerHTML = '';

            // 例句
            if (card.example_en) {
                cardExampleEn.innerHTML = this.createInteractiveSentence(card.example_en);
                cardExampleZh.textContent = card.example_zh || '';
                cardSentenceBox.style.display = 'block';
            } else {
                cardSentenceBox.style.display = 'none';
            }

            // 更新頁碼和按鈕
            this.updatePageIndicator(currentIndex, totalCount);
        }, 150);
    },

    /**
     * 更新頁碼指示器
     */
    updatePageIndicator(current, total) {
        this.elements.pageIndicator.textContent = `${current + 1} / ${total}`;
        this.elements.prevBtn.disabled = current === 0;
        this.elements.nextBtn.disabled = current === total - 1;
    },

    /**
     * 建立互動式例句（單字可點擊）
     */
    createInteractiveSentence(sentence) {
        if (!sentence) return '';

        const words = sentence.split(/(\s+|[.,!?;:])/);

        return words.map(word => {
            if (/^[a-zA-Z]+$/.test(word)) {
                return `<span class="word-token" onmouseenter="showWordTooltip(event, '${word}')" onmouseleave="scheduleHideTooltip()">${word}</span>`;
            }
            return word;
        }).join('');
    },

    /**
     * 更新單字數量顯示
     */
    updateWordCounts(counts) {
        if (!counts) return;

        const updateCount = (id, count) => {
            const el = document.getElementById(id);
            if (el) el.textContent = `共 ${count} 字`;
        };

        updateCount('j1-count', counts.J1);
        updateCount('j2-count', counts.J2);
        updateCount('j3-count', counts.J3);
        updateCount('h1-count', counts.H1);
        updateCount('h2-count', counts.H2);
        updateCount('h3-count', counts.H3);
        updateCount('adv-count', counts.ADV);
        updateCount('jh-count', counts.JH_TOTAL);
        updateCount('sh-count', counts.SH_TOTAL);
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

// 全域函式（用於 HTML onclick）
function showWordTooltip(event, word) {
    TooltipManager.show(event, word);
}

function scheduleHideTooltip() {
    TooltipManager.scheduleHide();
}

/**
 * Tooltip 管理器
 */
const TooltipManager = {
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
