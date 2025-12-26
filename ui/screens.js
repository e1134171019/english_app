/**
 * 畫面管理器
 * 處理畫面切換和各模式的進入邏輯
 */

import { AppState } from '../core/state.js';
import { WordService } from '../services/wordService.js';
import { AudioService } from '../services/audioService.js';
import { DOMManager } from './dom.js';

export const ScreenManager = {
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

        // Ensure Tier 1 is visible
        const tier1Chips = document.getElementById('tier1-chips');
        if (tier1Chips) tier1Chips.classList.remove('hidden');

        this.backToTier1();
    },

    /**
     * 顯示第二層選單
     */
    showTier2(tier) {
        console.log(`showTier2 called with tier: ${tier}`);
        AppState.setCurrentTier(tier);

        // 隱藏第一層
        // 隱藏第一層 (Selector: #tier1-chips)
        // 隱藏第一層 (Selector: #tier1-chips)
        // const tier1Chips = document.getElementById('tier1-chips');
        // if (tier1Chips) tier1Chips.classList.add('hidden'); 

        // Update: User wants to see Step 1? Or navigation flow issues?
        // If we hide it, we must show it back. 
        // Let's NOT hide it for now, consistent with "Bento" style where you might change selection.
        // OR if design requires hiding, we must ensure it's shown in backToTier1 (which we did inside showLevelSelection, but backToTier1 also needs it).

        const tier2Container = document.getElementById('tier2-chips');
        if (!tier2Container) return;
        tier2Container.innerHTML = ''; // Clear previous

        let options = [];
        if (tier === 'JH') options = ['國一', '國二', '國三', '全部'];
        else if (tier === 'SH') options = ['高一', '高二', '高三', '全部'];
        else if (tier === 'ADV') options = ['Level 4', 'Level 5', 'Level 6'];

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chip';
            btn.textContent = opt;
            btn.onclick = () => {
                document.querySelectorAll('#tier2-chips .chip').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                // Map visual text to code
                const levelMap = {
                    '國一': 'J1', '國二': 'J2', '國三': 'J3',
                    '高一': 'H1', '高二': 'H2', '高三': 'H3',
                    'Level 4': '4', 'Level 5': '5', 'Level 6': '6' // Adjust if needed
                };
                let code = levelMap[opt] || opt;

                if (opt === '全部') code = (tier === 'JH' ? 'JH_ALL' : 'SH_ALL');

                // Call selectLevel with correct code
                this.selectLevel([code]);
            };
            tier2Container.appendChild(btn);
        });

        const tier2JhEl = document.getElementById('tier2-jh');
        const tier2ShEl = document.getElementById('tier2-sh');

        if (!tier2JhEl || !tier2ShEl) {
            console.warn('Tier 2 elements not found');
            return;
        }

        // Legacy logic removal: No tier2-jh/sh static elements. Dynamic rendering.
        this.updateLevelSelectTitle(`請選擇${tier === 'JH' ? '國中' : (tier === 'SH' ? '高中' : '進階')}等級`);

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

        // Ensure Tier 1 is visible
        const tier1Chips = document.getElementById('tier1-chips');
        if (tier1Chips) tier1Chips.classList.remove('hidden');

        // Reset Tier 2 container
        const tier2Container = document.getElementById('tier2-chips');
        if (tier2Container) tier2Container.innerHTML = '<div style="padding: 20px; color: var(--text-hint); text-align: center; width: 100%;">請先選擇學制</div>';

        // Reset Tier 1 active state
        document.querySelectorAll('#tier1-chips .chip').forEach(c => c.classList.remove('active'));

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

        // Update Counter
        const counter = document.getElementById('quiz-counter');
        if (counter) counter.textContent = `${AppState.quizIndex + 1} / ${AppState.quizList.length}`;

        // Update Prev Button
        const prevBtn = document.getElementById('quiz-prev-btn');
        if (prevBtn) prevBtn.disabled = (AppState.quizIndex === 0);

        // Reset Next button state
        const nextBtn = document.getElementById('quiz-next-btn');
        if (nextBtn) nextBtn.disabled = (AppState.quizIndex >= AppState.quizList.length - 1);

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
    },

    /**
     * 分層返回邏輯
     */
    goBackHierarchy() {
        const current = AppState.currentMode;
        console.log(`goBackHierarchy logic for: ${current}`);

        // 1. Practice/Quiz Screen -> Level Select (Tier 2/1)
        if (current === 'practice-screen' || current === 'quiz-screen') {
            // Return to Level Select
            // Check if we came from Tier 2 selection
            this.showScreen('level-select-screen');
            // Assuming Level Select state (Tier 1/2) is preserved in DOM
            // If Tier 2 was selected, we should probably stay there or let user decide?
            // "Return to previous layer" -> Level Select Screen is the previous layer.
            return;
        }

        // 2. Level Select Screen
        if (current === 'level-select-screen') {
            // Check active tier
            const tier2Container = document.getElementById('tier2-chips');
            const hasTier2Content = tier2Container && tier2Container.children.length > 0 && tier2Container.textContent !== '請先選擇學制';
            const tier1Active = document.querySelector('#tier1-chips .chip.active');

            if (tier1Active || hasTier2Content) {
                // In Tier 2 -> Go back to Tier 1
                this.backToTier1();
                return;
            } else {
                // In Tier 1 (No selection) -> Go Home
                this.showScreen('home-screen');
                return;
            }
        }

        // 3. Other Screens -> Home
        // verb3, library, add, etc. -> Home
        this.showScreen('home-screen');
    },
};
