/**
 * 畫面管理器
 * 處理畫面切換和各模式的進入邏輯
 */

const ScreenManager = {
    /**
     * 顯示指定畫面
     */
    showScreen(screenId) {
        console.log(`Navigating to screen: ${screenId}`);

        // 隱藏所有畫面
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });

        // 顯示指定畫面
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('active');
            AppState.currentMode = screenId;
            console.log(`✓ Screen ${screenId} is now active`);
        } else {
            console.error(`Screen ${screenId} not found!`);
        }
    },

    /**
     * 顯示等級選擇畫面
     */
    showLevelSelection(mode) {
        console.log(`showLevelSelection called with mode: ${mode}`);
        AppState.setPendingMode(mode);
        this.showScreen('level-select-screen');
        this.backToTier1();
    },

    /**
     * 顯示第二層選單
     */
    showTier2(tier) {
        console.log(`showTier2 called with tier: ${tier}`);
        AppState.setCurrentTier(tier);

        // 隱藏第一層
        document.getElementById('tier1-selection').classList.add('hidden');

        const tier2JhEl = document.getElementById('tier2-jh');
        const tier2ShEl = document.getElementById('tier2-sh');

        if (!tier2JhEl || !tier2ShEl) {
            console.warn('Tier 2 elements not found');
            return;
        }

        if (tier === 'JH') {
            tier2JhEl.classList.remove('hidden');
            tier2ShEl.classList.add('hidden');
            this.updateLevelSelectTitle('請選擇國中年級');
        } else if (tier === 'SH') {
            tier2ShEl.classList.remove('hidden');
            tier2JhEl.classList.add('hidden');
            this.updateLevelSelectTitle('請選擇高中年級');
        }

        const tierBackBtn = document.getElementById('tier-back-btn');
        if (tierBackBtn) {
            tierBackBtn.classList.remove('hidden');
        }
    },

    /**
     * 返回第一層選單
     */
    backToTier1() {
        AppState.setCurrentTier('');

        const tier1El = document.getElementById('tier1-selection');
        const tier2JhEl = document.getElementById('tier2-jh');
        const tier2ShEl = document.getElementById('tier2-sh');

        if (tier1El) tier1El.classList.remove('hidden');
        if (tier2JhEl) tier2JhEl.classList.add('hidden');
        if (tier2ShEl) tier2ShEl.classList.add('hidden');

        const tierBackBtn = document.getElementById('tier-back-btn');
        if (tierBackBtn) {
            tierBackBtn.classList.add('hidden');
        }

        this.updateLevelSelectTitle();
    },

    /**
     * 更新等級選擇標題
     */
    updateLevelSelectTitle(subTitle = '') {
        const baseLabel = AppState.pendingMode === 'quiz' ? '發音測驗' : '單字練習';
        const suffix = subTitle || '請選擇學制';
        const titleEl = document.getElementById('level-select-title');
        if (titleEl) {
            titleEl.textContent = `${baseLabel} - ${suffix}`;
        }
    },

    /**
     * 選擇等級並進入對應模式
     */
    selectLevel(levels) {
        console.log(`selectLevel called with levels: ${levels}`);
        AppState.selectedLevels = levels;
        WordService.updateActiveWordList(levels);

        // 根據 pendingMode 進入對應模式
        if (AppState.pendingMode === 'practice') {
            this.enterPracticeMode();
        } else if (AppState.pendingMode === 'quiz') {
            this.enterQuizMode();
        }
    },

    /**
     * 進入單字練習模式
     */
    enterPracticeMode() {
        const activeWordList = AppState.getActiveWordList();

        if (activeWordList.length === 0) {
            alert('此等級沒有單字！');
            this.showScreen('home-screen');
            return;
        }

        AppState.setCurrentIndex(0);
        this.showScreen('practice-screen');
        this.renderCard();
    },

    /**
     * 渲染卡片
     */
    renderCard() {
        const activeWordList = AppState.getActiveWordList();
        if (activeWordList.length === 0) return;

        const currentCard = activeWordList[AppState.currentIndex];
        AppState.setCurrentCard(currentCard);

        DOMManager.updateCard(
            currentCard,
            AppState.currentIndex,
            activeWordList.length
        );
    },

    /**
     * 進入測驗模式
     */
    enterQuizMode() {
        const activeWordList = AppState.getActiveWordList();

        if (activeWordList.length === 0) {
            alert('此等級沒有單字！');
            this.showScreen('home-screen');
            return;
        }

        AppState.quizList = [...activeWordList].sort(() => Math.random() - 0.5);
        AppState.quizIndex = 0;

        this.showScreen('quiz-screen');
        this.loadQuizQuestion();
    },

    /**
     * 載入測驗題目
     */
    loadQuizQuestion() {
        if (AppState.quizIndex >= AppState.quizList.length) {
            alert('測驗完成！');
            this.showScreen('home-screen');
            return;
        }

        AppState.quizCurrentWord = AppState.quizList[AppState.quizIndex];

        document.getElementById('quiz-current').textContent = AppState.quizIndex + 1;
        document.getElementById('quiz-total').textContent = AppState.quizList.length;

        document.getElementById('quiz-input').value = '';
        document.getElementById('quiz-result').classList.add('hidden');
        document.getElementById('quiz-next-btn').disabled = true;

        setTimeout(() => {
            this.playQuizAudio();
        }, 500);
    },

    /**
     * 播放測驗音訊
     */
    playQuizAudio() {
        if (AppState.quizCurrentWord) {
            AudioService.speakText(AppState.quizCurrentWord.english, 1.0);
        }
    }
};
