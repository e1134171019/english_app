/**
 * 簡化版 Tooltip - 只顯示中文翻譯（黑底）
 */

export const SimpleTooltip = {
    activeTooltip: null,

    /**
     * 顯示單字提示（只顯示中文）
     */
    show(word, position, wordData) {
        // 移除舊的 tooltip
        this.hide();

        // 獲取中文翻譯（JSON 欄位為 translation）
        const chinese = wordData?.translation || wordData?.Translation || '查無中文';

        // 創建 tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'simple-tooltip';
        tooltip.textContent = chinese;

        document.body.appendChild(tooltip);

        // 計算位置（顯示在點擊位置上方）
        const tooltipRect = tooltip.getBoundingClientRect();
        const x = Math.min(
            position.x - tooltipRect.width / 2,
            window.innerWidth - tooltipRect.width - 10
        );
        const y = position.y - tooltipRect.height - 10;

        tooltip.style.left = `${Math.max(10, x)}px`;
        tooltip.style.top = `${Math.max(10, y)}px`;

        this.activeTooltip = tooltip;

        // 動畫顯示
        setTimeout(() => tooltip.classList.add('show'), 10);

        // 點擊任意地方關閉
        setTimeout(() => {
            document.addEventListener('click', this._handleClickOutside, true);
        }, 100);
    },

    /**
     * 隱藏 tooltip
     */
    hide() {
        if (this.activeTooltip) {
            this.activeTooltip.classList.remove('show');
            setTimeout(() => {
                if (this.activeTooltip) {
                    this.activeTooltip.remove();
                    this.activeTooltip = null;
                }
            }, 200);
        }
        document.removeEventListener('click', this._handleClickOutside, true);
    },

    /**
     * 處理外部點擊
     */
    _handleClickOutside: (e) => {
        if (!e.target.closest('.simple-tooltip') && !e.target.closest('.interactive-word')) {
            SimpleTooltip.hide();
        }
    }
};

// 全域暴露
window.SimpleTooltip = SimpleTooltip;
