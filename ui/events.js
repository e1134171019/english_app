
/**
 * 事件管理器
 * 集中管理所有事件監聽器
 */

import { AppState } from '../core/state.js';
import { AppConfig } from '../core/config.js';
import { ScreenManager } from './screens.js';
import { AudioService } from '../services/audioService.js';
import { WordService } from '../services/wordService.js';
import { DOMManager, TooltipManager } from './dom.js';
import { AIService } from '../services/aiService.js';
import { StorageService } from '../services/storageService.js';

export const EventManager = {
    /**
     * 初始化所有事件監聽器
     * Note: Token clicks, Tier 1/2 chips, and flashcard flip are now handled by EventCoordinator in main.js
     */
    init() {
        this.initNavigation();
        // this.initTwoTierMenu(); // REMOVED - handled by EventCoordinator
        this.initCardEvents(); // Simplified - flashcard flip removed
        // this.initPracticeEvents(); // REMOVED - handled by EventCoordinator
        this.initQuizEvents();
        this.initVerb3Events();
        this.initCustomTrainingEvents();
        this.initAddDeleteEvents();
        this.initModals();
        // this.initGlobalDelegation(); // REMOVED - Tooltip handled by EventCoordinator

        console.log('✓ EventManager initialized (refactored)');
    },

    // REMOVED: initPracticeEvents()
    // Token clicks and interactive sentences are now handled by EventCoordinator in main.js
    // Speed slider moved to initCardEvents()

    /* DELETED CODE (formerly Line 38-87):
     * - Token click handler (replaced by EventCoordinator)
     * - Sentence box click (replaced by EventCoordinator)
     * - Tooltip display (now uses TooltipManager via EventCoordinator)
     * All functionality moved to EventCoordinator in main.js Line 85-90
     */


    initModals() {
        // Legacy AI Modal logic removed. The app uses direct generation in future tasks.
        const generateBtn = document.getElementById('ai-generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => alert('AI 功能開發中'));
        }

        // Import Modal
        const importModal = document.getElementById('import-modal');
        if (importModal) {
            const confirmBtn = importModal.querySelector('.success');
            if (confirmBtn) confirmBtn.addEventListener('click', () => alert('匯入功能開發中！'));
        }

        // Generic Close & Cancel
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                if (modal) modal.classList.add('hidden');
            });
        });
    },

    // REMOVED: initGlobalDelegation()
    // Tooltip hover and most global delegation now handled by EventCoordinator

    /* DELETED CODE (formerly Line 115-156):
     * - Tooltip mouseover/mouseout (conflicted with click-based Tooltip)
     * - Delete button handler (can be moved if needed)
     * - Flip hint buttons (obsolete)
     */


    /**
     * 初始化首頁導航事件
     */
    initNavigation() {
        // 設定通用返回按鈕 (Screen 內的 back-btn, if any left)
        document.querySelectorAll('.back-btn').forEach(btn => {
            if (!btn.dataset.target && !btn.id) {
                btn.addEventListener('click', () => ScreenManager.showScreen('home-screen'));
            }
        });

        // Navigation is mainly handled by HTML onclick calling Window App. 
        // We only add listeners for elements NOT having onclick, like global-back-btn if it exists.
        const globalBackBtn = document.getElementById('global-back-btn'); // ID corrected to global-back-btn
        if (globalBackBtn) {
            globalBackBtn.addEventListener('click', () => {
                // Check if in Tier 2
                const tier2Content = document.getElementById('tier2-chips');
                if (document.getElementById('level-select-screen').classList.contains('active') &&
                    tier2Content && tier2Content.children.length > 0 && AppState.selectedTier1) {
                    ScreenManager.backToTier1();
                } else {
                    ScreenManager.showScreen('home-screen');
                }
            });
        }

        // Observer for Global Back Button Visibility & Title
        const observer = new MutationObserver((mutations) => {
            document.querySelectorAll('.screen').forEach(screen => {
                if (screen.classList.contains('active')) {
                    const title = document.getElementById('screen-title');
                    if (screen.id === 'home-screen') {
                        if (title) title.textContent = '英文練習';
                        if (globalBackBtn) globalBackBtn.classList.add('hidden');
                    } else {
                        if (globalBackBtn) globalBackBtn.classList.remove('hidden');
                        // Update Title based on screen
                        if (title) {
                            if (screen.id === 'practice-screen') title.textContent = '單字練習';
                            else if (screen.id === 'quiz-screen') title.textContent = '發音測驗';
                            else if (screen.id === 'level-select-screen') title.textContent = '選擇等級';
                            else if (screen.id === 'verb3-screen') title.textContent = '進階訓練';
                            else if (screen.id === 'add-screen') title.textContent = '新增單字';
                            else if (screen.id === 'custom-training-screen') title.textContent = '自訂練習';
                            else if (screen.id === 'my-custom-screen') {
                                title.textContent = '我的自訂';
                                DOMManager.renderCustomSets(StorageService.loadCustomSets());
                            }
                            else if (screen.id === 'delete-screen') title.textContent = '管理單字';
                        }
                    }
                }
            });
        });

        const content = document.getElementById('content');
        if (content) {
            observer.observe(content, { attributes: true, subtree: true, attributeFilter: ['class'] });
        }


        // Bento Grid and Bottom Nav have onclick="..." in HTML.
        // We do NOT attach listeners here to avoid duplicate triggers.
        console.log('✓ Navigation initialized');
    },

    // REMOVED: initTwoTierMenu()
    // Tier 1 and Tier 2 chip clicks are now handled by EventCoordinator in main.js

    /* DELETED CODE (formerly Line 228-247):
     * - Tier 1 chip click handlers (replaced by EventCoordinator)
     * - ScreenManager.showTier2() calls (now in main.js _registerEvents)
     * All functionality moved to EventCoordinator in main.js Line 103-137
     */


    /**
     * 初始化卡片相關事件
     */
    initCardEvents() {
        // 語速調整 (Fixed ID: rate-slider)
        const speedRange = document.getElementById('rate-slider');
        if (speedRange) {
            speedRange.addEventListener('input', (e) => {
                AudioService.setSpeed(parseFloat(e.target.value));
            });
        }

        // 自動朗讀
        const autoPlayBtn = document.getElementById('auto-play-btn');
        if (autoPlayBtn) {
            autoPlayBtn.addEventListener('click', () => {
                const currentCard = AppState.getCurrentCard();
                // Toggle Logic handled in AudioService or ScreenManager?
                // For now, simple toggle or trigger
                const isAuto = autoPlayBtn.classList.toggle('active'); // active state style
                autoPlayBtn.textContent = isAuto ? 'Auto: ON' : 'Auto: OFF';
                if (isAuto) AudioService.autoPlayCard(currentCard);
                else AudioService.cancelSpeech();
            });
        }

        // 上一張 / 下一張 (Fixed IDs: prev-btn, next-btn)
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (AppState.currentIndex > 0) {
                    AudioService.cancelSpeech();
                    AppState.setCurrentIndex(AppState.currentIndex - 1);
                    ScreenManager.renderCard();
                }
            });
        }

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const activeWordList = AppState.getActiveWordList();
                if (AppState.currentIndex < activeWordList.length - 1) {
                    AudioService.cancelSpeech();
                    AppState.setCurrentIndex(AppState.currentIndex + 1);
                    ScreenManager.renderCard();
                }
            });
        }

        // Replay Button
        const replayBtn = document.getElementById('replay-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                const card = AppState.getCurrentCard();
                if (card && card.english) AudioService.speakText(card.english);
            });
        }

        // 卡片上的發音按鈕 (Fixed ID: speak-btn-back)
        const speakBtnBack = document.getElementById('speak-btn-back');
        if (speakBtnBack) {
            speakBtnBack.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = AppState.getCurrentCard();
                if (card && card.english) AudioService.speakText(card.english, 1.0);
            });
        }

        // Flip Button (Front)
        const flipBtnFront = document.getElementById('flip-btn-front');
        if (flipBtnFront) {
            flipBtnFront.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('flashcard').classList.add('flipped');
            });
        }

        // Card Click - REMOVED (now handled by EventCoordinator)
        // Flashcard flip is handled by EventCoordinator in main.js Line 92-102

        /* DELETED CODE:
         * - flashcard.addEventListener('click', ...) 
         * - This prevented duplicate event listeners
         */
    },

    /**
     * 初始化測驗事件
     */
    initQuizEvents() {
        const playBtn = document.getElementById('quiz-play-btn');
        if (playBtn) playBtn.addEventListener('click', () => ScreenManager.playQuizAudio());

        const submitBtn = document.getElementById('quiz-submit-btn');
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitQuizAnswer());

        // Input Enter Key (Single declaration)
        const quizInput = document.getElementById('quiz-input');
        if (quizInput) {
            quizInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.submitQuizAnswer();
            });
        }

        const nextBtn = document.getElementById('quiz-next-btn');
        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (AppState.quizIndex < AppState.quizList.length - 1) {
                AppState.quizIndex++;
                ScreenManager.loadQuizQuestion();
            }
        });

        const prevBtn = document.getElementById('quiz-prev-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (AppState.quizIndex > 0) {
                AppState.quizIndex--;
                ScreenManager.loadQuizQuestion();
            }
        });
    },

    submitQuizAnswer() {
        const input = document.getElementById('quiz-input');
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = AppState.quizCurrentWord.english.toLowerCase();

        const resultEl = document.getElementById('quiz-result');
        const statusEl = document.getElementById('quiz-result-status');
        const answerEl = document.getElementById('quiz-correct-answer');

        if (userAnswer === correctAnswer) {
            statusEl.textContent = '✅ 正確！';
            statusEl.style.color = '#10B981';
        } else {
            statusEl.textContent = '❌ 錯誤';
            statusEl.style.color = '#EF4444';
        }

        answerEl.textContent = `${AppState.quizCurrentWord.english} (${AppState.quizCurrentWord.translation})`;
        resultEl.classList.remove('hidden');

        document.getElementById('quiz-next-btn').disabled = false;
    },

    /**
     * 初始化動詞三態事件
     */
    initVerb3Events() {
        // Tab 切換
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active
                tabs.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Switch pane
                const target = e.target.textContent.includes('格林') ? 'tab-grimm' : 'tab-verb3'; // 簡單判斷或用 id
                // HTML: onclick="switchTab('grimm')"
                // We should check exact logic.
                // Better: add data-tab attribute if possible OR rely on text or index.
                // Assuming currently 2 tabs.

                // Let's implement switchTab logic here
                const tabName = target === 'tab-verb3' ? 'verb3' : 'grimm';
                this.switchTab(tabName);
            });
        });

        // Level selection
        const levelBtns = document.querySelectorAll('.verb-level-btn');
        levelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.target.textContent.includes('國中') ? 'JH' : 'SH';
                this.selectVerbLevel(level);
            });
        });

        // Submit / Next
        document.getElementById('verb3-submit')?.addEventListener('click', () => this.submitVerb3Answer());
        document.getElementById('verb3-next')?.addEventListener('click', () => {
            AppState.verb3Index++;
            this.loadVerb3Question();
        });
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(tabName)) btn.classList.add('active'); // hacky?
            // Better: Manual mapping.
            // HTML: onclick="switchTab('grimm')" content: 格林法則
            // HTML: onclick="switchTab('verb3')" content: 動詞三態
            if (tabName === 'grimm' && btn.textContent.includes('格林')) btn.classList.add('active');
            else if (tabName === 'verb3' && btn.textContent.includes('三態')) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.add('hidden');
            pane.classList.remove('active');
        });

        const targetPane = document.getElementById(`tab - ${tabName} `);
        if (targetPane) {
            targetPane.classList.remove('hidden');
            targetPane.classList.add('active');
        }

        if (tabName === 'verb3') {
            this.loadVerb3Data();
        }
    },

    selectVerbLevel(level) {
        if (AppState.verb3CurrentLevel === level && AppState.verb3List.length > 0) return; // Prevent reload if same level
        AppState.verb3CurrentLevel = level;
        document.querySelectorAll('.verb-level-btn').forEach(btn => {
            if (level === 'JH' && btn.textContent.includes('國中')) btn.classList.add('active');
            else if (level === 'SH' && btn.textContent.includes('高中')) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.loadVerb3Data();
    },

    loadVerb3Data() {
        // Need to import verb3List? Or existing logic put it in AppState.
        // We need to import it.
        // Wait, AppState has verb3List. Ideally load it.
        import('../data/verb3Data.js').then(module => {
            const allVerbs = module.verb3List;
            if (AppState.verb3CurrentLevel === 'JH') {
                AppState.verb3List = allVerbs.filter(v => ['J1', 'J2', 'J3'].includes(v.level));
            } else {
                AppState.verb3List = allVerbs.filter(v => ['H1', 'H2', 'H3'].includes(v.level));
            }
            // AppState.verb3List = AppState.verb3List.sort(() => Math.random() - 0.5); // Remove auto-shuffle to prevent confusion
            AppState.verb3Index = 0;
            this.loadVerb3Question();
        });
    },

    loadVerb3Question() {
        if (AppState.verb3Index >= AppState.verb3List.length) {
            AppState.verb3Index = 0;
        }
        AppState.verb3CurrentVerb = AppState.verb3List[AppState.verb3Index];

        document.getElementById('verb3-base').textContent = AppState.verb3CurrentVerb.base;
        document.getElementById('verb3-translation').textContent = `(${AppState.verb3CurrentVerb.translation})`;
        document.getElementById('verb3-past-input').value = '';
        document.getElementById('verb3-pp-input').value = '';
        document.getElementById('verb3-result').classList.add('hidden');
        document.getElementById('verb3-next').disabled = true;
    },

    submitVerb3Answer() {
        const userPast = document.getElementById('verb3-past-input').value.trim().toLowerCase();
        const userPP = document.getElementById('verb3-pp-input').value.trim().toLowerCase();
        const correctPast = AppState.verb3CurrentVerb.past.toLowerCase();
        // handling slash in past? e.g. "was/were". Simple check: includes or exact.
        // verb3Data has "was/were". Logic in main.js: `userPast === correctPast`.
        // "was/were" != "was".
        // Let's keep main.js logic for now. main.js: `userPast === correctPast`.
        // So user must type "was/were"? Or maybe just exact match.

        const correctPP = AppState.verb3CurrentVerb.ppart.toLowerCase();
        const resultEl = document.getElementById('verb3-result');
        let message = '';
        if (userPast === correctPast && userPP === correctPP) {
            message = '✅ 完全正確！';
            resultEl.style.color = '#10B981';
        } else {
            message = `❌ 答案：<br>過去式：${AppState.verb3CurrentVerb.past}<br>過去分詞：${AppState.verb3CurrentVerb.ppart}`;
            resultEl.style.color = '#EF4444';
        }
        resultEl.innerHTML = message;
        resultEl.classList.remove('hidden');
        document.getElementById('verb3-next').disabled = false;
    },

    /**
     * 初始化自訂訓練事件
     */
    initCustomTrainingEvents() {
        const startPracticeBtn = document.getElementById('custom-start-practice');
        const startQuizBtn = document.getElementById('custom-start-quiz');
        const inputArea = document.getElementById('custom-words-input');

        const processAndStart = (mode) => {
            const text = inputArea.value.trim();
            if (!text) {
                alert('請輸入單字列表！');
                return;
            }

            const rawList = text.split(/[\n,]+/).map(w => w.trim()).filter(w => w);
            const { validWords, invalidWords } = WordService.searchWords(rawList);

            if (validWords.length === 0) {
                alert('找不到有效單字，請檢查拼字。');
                return;
            }

            // Save set
            const newSet = StorageService.addCustomSet(null, validWords.map(w => w.english));
            DOMManager.showToast(`已儲存自訂練習組: ${newSet.name}`);

            // Start Mode
            AppState.setActiveWordList(validWords);
            if (mode === 'practice') {
                ScreenManager.enterPracticeMode();
            } else {
                AppState.quizList = validWords.sort(() => Math.random() - 0.5);
                AppState.quizIndex = 0;
                ScreenManager.enterQuizMode();
            }
        };

        if (startPracticeBtn) {
            startPracticeBtn.addEventListener('click', () => processAndStart('practice'));
        }

        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => processAndStart('quiz'));
        }

        // My Custom Screen Delegation
        const customList = document.getElementById('my-custom-list');
        if (customList) {
            customList.addEventListener('click', (e) => {
                const target = e.target.closest('.icon-btn') || e.target.closest('.set-info');
                if (!target) return;

                const id = parseInt(target.dataset.id);
                if (!id) return;

                // Edit
                if (target.classList.contains('custom-edit-btn')) {
                    const newName = prompt('請輸入新名稱:');
                    if (newName) {
                        StorageService.updateCustomSet(id, newName);
                        DOMManager.renderCustomSets(StorageService.loadCustomSets());
                    }
                }
                // Delete
                else if (target.classList.contains('custom-delete-btn')) {
                    if (confirm('確定要刪除此練習組嗎？')) {
                        StorageService.deleteCustomSet(id);
                        DOMManager.renderCustomSets(StorageService.loadCustomSets());
                    }
                }
                // Play (Info click or Play button)
                else if (target.classList.contains('custom-play-btn') || target.classList.contains('set-info')) {
                    const sets = StorageService.loadCustomSets();
                    const set = sets.find(s => s.id === id);
                    if (set) {
                        const { validWords } = WordService.searchWords(set.words);
                        if (validWords.length === 0) { alert('此練習組沒有有效單字'); return; }
                        AppState.setActiveWordList(validWords);
                        ScreenManager.enterPracticeMode();
                    }
                }
            });
        }
    },


    /**
     * 初始化新增/刪除單字事件
     */
    initAddDeleteEvents() {
        // Search Filter
        const deleteSearch = document.getElementById('delete-search');
        if (deleteSearch) {
            deleteSearch.addEventListener('input', () => {
                this.filterDeleteList();
            });
        }

        // Open AI Modal - Removed

        // Save Manually
        const saveBtn = document.getElementById('save-word-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveNewWord();
            });
        }
    },

    saveNewWord() {
        const english = document.getElementById('add-english').value.trim();
        const pos = document.getElementById('add-pos').value.trim();
        const translation = document.getElementById('add-translation').value.trim();
        const level = document.getElementById('add-level').value;
        const exampleEn = document.getElementById('add-example-en').value.trim();
        const exampleZh = document.getElementById('add-example-zh').value.trim();

        try {
            WordService.addUserWord({ english, pos, translation, level, exampleEn, exampleZh });
            DOMManager.updateWordCounts(WordService.getWordCounts());

            // clear inputs
            ['add-english', 'add-pos', 'add-translation', 'add-example-en', 'add-example-zh'].forEach(id => document.getElementById(id).value = '');

            const messageEl = document.getElementById('add-message');
            messageEl.textContent = `✅ 成功新增單字「${english}」！`;
            messageEl.classList.remove('hidden');
            messageEl.style.color = '#10B981';
            setTimeout(() => messageEl.classList.add('hidden'), 3000);
        } catch (error) {
            alert(error.message);
        }
    },

    handleDeleteUserWord(english) {
        if (!confirm(`確定要刪除單字「${english}」嗎？`)) return;
        WordService.deleteUserWord(english);
        DOMManager.updateWordCounts(WordService.getWordCounts());
        this.renderDeleteList();
        DOMManager.showToast(`✅ 已刪除「${english}」`);
    },

    filterDeleteList() {
        const searchTerm = document.getElementById('delete-search').value.toLowerCase();
        this.renderDeleteList(searchTerm);
    },

    renderDeleteList(searchTerm = '') {
        const listEl = document.getElementById('delete-list');
        let wordsToShow = AppState.getUserWords();
        if (searchTerm) {
            wordsToShow = wordsToShow.filter(w =>
                w.english.toLowerCase().includes(searchTerm) ||
                w.translation.includes(searchTerm)
            );
        }

        if (wordsToShow.length === 0) {
            listEl.innerHTML = '<li style="text-align: center; color: #9CA3AF; padding: 20px;">沒有找到單字</li>';
            return;
        }

        listEl.innerHTML = wordsToShow.map(word => `
    <li class="word-list-item">
        <div class="word-info">
            <strong>${word.english}</strong> (${word.pos || 'n/a'})
            <br>
                <span style="color: #6B7280;">${word.translation}</span>
        </div>
        <button class="delete-btn" data-word="${word.english}">刪除</button>
    </li>
    `).join('');
    }
};
