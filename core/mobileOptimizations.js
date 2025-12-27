/**
 * 移动端优化模块
 * 处理手势、触控反馈和移动端特定功能
 */

export const MobileOptimizations = {
    /**
     * 初始化移动端优化
     */
    init() {
        this.preventZoom();
        this.setupGestures();
        this.optimizeScrolling();
        this.setupPullToRefresh();
        this.setupSafeArea();
        
        console.log('✓ Mobile Optimizations initialized');
    },

    /**
     * 防止双击缩放和捏合缩放
     */
    preventZoom() {
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // 防止捏合缩放
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
        }, { passive: false });
    },

    /**
     * 设置手势支持（左右滑动切换卡片）
     */
    setupGestures() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        flashcard.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        flashcard.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    },

    /**
     * 处理手势
     */
    handleGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // 只在水平滑动距离大于垂直滑动时触发
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // 向右滑动 - 上一张卡片
                window.app?.prevCard?.();
            } else {
                // 向左滑动 - 下一张卡片
                window.app?.nextCard?.();
            }
        }
    },

    /**
     * 优化滚动性能
     */
    optimizeScrolling() {
        // 使用 passive listeners 优化滚动性能
        const scrollContainers = document.querySelectorAll('#main-content, .screen, .card-list');
        
        scrollContainers.forEach(container => {
            container.addEventListener('touchstart', () => {}, { passive: true });
            container.addEventListener('touchmove', () => {}, { passive: true });
        });
    },

    /**
     * 设置下拉刷新（可选功能）
     */
    setupPullToRefresh() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        let startY = 0;
        let isPulling = false;

        mainContent.addEventListener('touchstart', (e) => {
            if (mainContent.scrollTop === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        }, { passive: true });

        mainContent.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            const currentY = e.touches[0].pageY;
            const pullDistance = currentY - startY;

            if (pullDistance > 80) {
                // 可以在这里添加刷新逻辑
                // console.log('Pull to refresh triggered');
            }
        }, { passive: true });

        mainContent.addEventListener('touchend', () => {
            isPulling = false;
        }, { passive: true });
    },

    /**
     * 设置安全区域（适配刘海屏等）
     */
    setupSafeArea() {
        // 检测是否支持安全区域
        if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
            document.documentElement.classList.add('has-safe-area');
        }

        // 检测是否是独立应用模式（PWA）
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.documentElement.classList.add('standalone-mode');
        }
    },

    /**
     * 检测设备类型
     */
    getDeviceType() {
        const ua = navigator.userAgent;
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    },

    /**
     * 优化输入框聚焦（防止页面跳动）
     */
    optimizeInputFocus() {
        const inputs = document.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // 短暂延迟后滚动到输入框
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    },

    /**
     * 添加触觉反馈（支持的设备）
     */
    vibrate(pattern = [10]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * 检测网络状态
     */
    setupNetworkDetection() {
        window.addEventListener('online', () => {
            console.log('✅ Network: Online');
            // 可以在这里显示提示
        });

        window.addEventListener('offline', () => {
            console.warn('⚠️ Network: Offline');
            // 可以在这里显示离线提示
        });

        // 初始状态
        if (!navigator.onLine) {
            console.warn('⚠️ Currently offline');
        }
    }
};

// 自动初始化（如果是移动设备）
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.addEventListener('DOMContentLoaded', () => {
        MobileOptimizations.init();
    });
}
