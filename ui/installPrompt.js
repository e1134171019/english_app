/**
 * PWA 安装提示
 * 引导用户将应用添加到主屏幕
 */

export const InstallPrompt = {
    deferredPrompt: null,
    isInstalled: false,

    init() {
        this.checkInstallStatus();
        this.setupInstallPrompt();
        this.createInstallBanner();
    },

    /**
     * 检查应用是否已安装
     */
    checkInstallStatus() {
        // 检查是否在独立模式运行（已安装）
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('✓ App is installed');
            return true;
        }

        // iOS Safari 检测
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✓ App is installed (iOS)');
            return true;
        }

        return false;
    },

    /**
     * 设置安装提示
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认的安装提示
            e.preventDefault();
            
            // 保存事件，稍后可以触发
            this.deferredPrompt = e;
            
            // 显示自定义安装按钮
            this.showInstallButton();
            
            console.log('✓ Install prompt ready');
        });

        // 监听安装成功
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.isInstalled = true;
            this.hideInstallBanner();
            this.deferredPrompt = null;
        });
    },

    /**
     * 创建安装横幅
     */
    createInstallBanner() {
        if (this.isInstalled) return;

        const banner = document.createElement('div');
        banner.id = 'install-banner';
        banner.className = 'install-banner hidden';
        banner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <div class="install-title">安装到主屏幕</div>
                    <div class="install-desc">快速访问，离线使用</div>
                </div>
                <button class="install-btn" id="install-btn">安装</button>
                <button class="install-close" id="install-close">×</button>
            </div>
        `;

        document.body.appendChild(banner);

        // 添加样式
        this.addStyles();

        // 绑定事件
        document.getElementById('install-btn')?.addEventListener('click', () => {
            this.install();
        });

        document.getElementById('install-close')?.addEventListener('click', () => {
            this.hideInstallBanner();
            localStorage.setItem('install-banner-dismissed', Date.now().toString());
        });
    },

    /**
     * 显示安装按钮
     */
    showInstallButton() {
        const banner = document.getElementById('install-banner');
        if (!banner) return;

        // 检查用户是否之前关闭过
        const dismissed = localStorage.getItem('install-banner-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            
            // 7天后再次显示
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // 延迟显示，避免打扰用户
        setTimeout(() => {
            banner.classList.remove('hidden');
            banner.classList.add('show');
        }, 3000);
    },

    /**
     * 隐藏安装横幅
     */
    hideInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('show');
            banner.classList.add('hidden');
        }
    },

    /**
     * 触发安装
     */
    async install() {
        if (!this.deferredPrompt) {
            this.showIOSInstructions();
            return;
        }

        // 显示安装提示
        this.deferredPrompt.prompt();

        // 等待用户选择
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User choice: ${outcome}`);

        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
        } else {
            console.log('❌ User dismissed the install prompt');
        }

        // 清除保存的事件
        this.deferredPrompt = null;
        this.hideInstallBanner();
    },

    /**
     * 显示 iOS 安装说明
     */
    showIOSInstructions() {
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
            const modal = document.createElement('div');
            modal.className = 'ios-install-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <h3>安装到主屏幕</h3>
                    <ol>
                        <li>点击底部的 <strong>分享</strong> 按钮 <span style="font-size: 20px;">⎋</span></li>
                        <li>向下滚动找到 <strong>"添加到主屏幕"</strong></li>
                        <li>点击 <strong>"添加"</strong></li>
                    </ol>
                    <button class="modal-close">知道了</button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.modal-close')?.addEventListener('click', () => {
                modal.remove();
            });

            modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
                modal.remove();
            });
        }
    },

    /**
     * 添加样式
     */
    addStyles() {
        if (document.getElementById('install-prompt-styles')) return;

        const style = document.createElement('style');
        style.id = 'install-prompt-styles';
        style.textContent = `
            .install-banner {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 16px;
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                max-width: calc(100% - 32px);
                transition: transform 0.3s ease;
            }

            .install-banner.hidden {
                display: none;
            }

            .install-banner.show {
                transform: translateX(-50%) translateY(0);
            }

            .install-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .install-icon {
                font-size: 32px;
            }

            .install-text {
                flex: 1;
            }

            .install-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 2px;
            }

            .install-desc {
                font-size: 12px;
                opacity: 0.9;
            }

            .install-btn {
                background: white;
                color: #667eea;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
            }

            .install-close {
                background: transparent;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0 4px;
                opacity: 0.8;
            }

            .ios-install-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }

            .modal-content {
                position: relative;
                background: white;
                padding: 24px;
                border-radius: 16px;
                max-width: 320px;
                margin: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .modal-content h3 {
                margin: 0 0 16px 0;
                color: #1f2937;
            }

            .modal-content ol {
                margin: 0 0 16px 0;
                padding-left: 20px;
                color: #4b5563;
            }

            .modal-content li {
                margin-bottom: 8px;
            }

            .modal-close {
                width: 100%;
                background: #6366f1;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }

            @media (min-width: 768px) {
                .install-banner {
                    bottom: 90px;
                }
            }
        `;
        document.head.appendChild(style);
    }
};
