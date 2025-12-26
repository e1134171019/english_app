/**
 * 美化的提示系統 - 替代 alert()
 */

export const Toast = {
    /**
     * 顯示成功訊息
     */
    success(message, duration = 2500) {
        this._show(message, 'success', duration);
    },

    /**
     * 顯示錯誤訊息
     */
    error(message, duration = 3000) {
        this._show(message, 'error', duration);
    },

    /**
     * 顯示資訊訊息
     */
    info(message, duration = 2500) {
        this._show(message, 'info', duration);
    },

    /**
     * 顯示確認對話框
     */
    confirm(message, onConfirm, onCancel) {
        this._showConfirm(message, onConfirm, onCancel);
    },

    /**
     * 內部方法：顯示提示
     */
    _show(message, type, duration) {
        // 移除舊的 toast
        const existing = document.querySelector('.custom-toast');
        if (existing) existing.remove();

        // 創建新的 toast
        const toast = document.createElement('div');
        toast.className = `custom-toast custom-toast-${type}`;
        toast.innerHTML = `
            <div class="custom-toast-icon">${this._getIcon(type)}</div>
            <div class="custom-toast-message">${message}</div>
        `;

        document.body.appendChild(toast);

        // 動畫顯示
        setTimeout(() => toast.classList.add('show'), 10);

        // 自動隱藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * 內部方法：顯示確認對話框
     */
    _showConfirm(message, onConfirm, onCancel) {
        // 移除舊的 modal
        const existing = document.querySelector('.custom-modal-overlay');
        if (existing) existing.remove();

        // 創建 modal
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        overlay.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-icon">⚠️</div>
                <div class="custom-modal-message">${message}</div>
                <div class="custom-modal-actions">
                    <button class="custom-modal-btn custom-modal-btn-cancel">取消</button>
                    <button class="custom-modal-btn custom-modal-btn-confirm">確定</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // 綁定事件
        const confirmBtn = overlay.querySelector('.custom-modal-btn-confirm');
        const cancelBtn = overlay.querySelector('.custom-modal-btn-cancel');

        const close = () => {
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 300);
        };

        confirmBtn.addEventListener('click', () => {
            close();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            close();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close();
                if (onCancel) onCancel();
            }
        });

        // 動畫顯示
        setTimeout(() => overlay.classList.add('show'), 10);
    },

    /**
     * 獲取圖標
     */
    _getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
};

// 全域暴露
window.Toast = Toast;
