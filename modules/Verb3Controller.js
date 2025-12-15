import { AppState } from '../core/state.js';
// WordService and AudioService imports removed for DI

// Module-scope services variable to avoid 'this' context issues
let services = null;

export const Verb3Controller = {
    name: 'verb3-screen',

    init(injectedServices) {
        console.log('Verb3Module Init');
        services = injectedServices;
        // Ensure stats exist
        AppState.verb3Stats = { correct: 0, wrong: 0 };
    },

    onEnter(params) {
        console.log('Verb3Module Enter', params);

        // Safety Fix: Ensure other screens are hidden
        const conflictScreens = ['quiz-screen', 'practice-screen', 'level-select-screen'];
        conflictScreens.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.classList.remove('active'); }
        });

        // Ensure SELF is shown
        const self = document.getElementById('verb3-screen');
        if (self) { self.style.display = 'block'; self.classList.add('active'); }

        // TS-13 Integration
        if (AppState.activeWordList && AppState.activeWordList.length > 0) {
            const verbs = AppState.activeWordList.filter(w => w.verb);
            if (verbs.length > 0) {
                console.log(`Verb3: Loaded ${verbs.length} verbs from Level Select`);
                AppState.verb3List = verbs;
            }
        } else {
            AppState.verb3List = [];
        }

        AppState.verb3Stats = { correct: 0, wrong: 0 };
        this.updateStatsUI();

        if (!AppState.verb3Level) AppState.verb3Level = 'JH';
        this.refreshUI();
        this.loadQuestion();
    },

    // ... (rest of the methods remain mostly the same, updated to use 'services' instead of 'this.services') ...

    onExit() {
        // Cleanup
    },

    switchLevel(level) {
        AppState.verb3Level = level;
        AppState.verb3List = [];
        AppState.verb3Stats = { correct: 0, wrong: 0 };
        this.updateStatsUI();
        this.refreshUI();
        this.loadQuestion();
    },

    refreshUI() {
        document.querySelectorAll('#verb3-screen .chip-group .chip').forEach(c => c.classList.remove('active'));
        if (AppState.verb3Level === 'JH') document.getElementById('v3-tab-jh')?.classList.add('active');
        if (AppState.verb3Level === 'SH') document.getElementById('v3-tab-sh')?.classList.add('active');
    },

    loadQuestion() {
        let list = AppState.verb3List;

        if (!list || list.length === 0) {
            const targetLevel = AppState.verb3Level;
            let sourceList = [];

            if (targetLevel === 'CUSTOM') {
                alert('此功能已移除');
                return;
            } else {
                // DEPENDENCY: WordService (accessed via module scope)
                sourceList = services.wordService.getAllWords();
            }

            list = sourceList.filter(w => {
                if (!w.verb) return false;
                if (targetLevel === 'JH') {
                    const sl = (w.schoolLevel || w.level || '').toUpperCase();
                    return sl.startsWith('J') || sl === 'JH';
                }
                if (targetLevel === 'SH') {
                    const sl = (w.schoolLevel || w.level || '').toUpperCase();
                    return sl.startsWith('H') || sl === 'SH' || sl === 'ADV' || sl === 'S';
                }
                return false;
            });

            if (list.length === 0) {
                alert(`在 ${targetLevel} 中找不到動詞資料！`);
                return;
            }

            list.sort(() => Math.random() - 0.5);
            AppState.verb3List = list;
            AppState.verb3Index = 0;
        }

        if (AppState.verb3Index >= list.length) AppState.verb3Index = 0;

        const word = list[AppState.verb3Index];
        this.renderWord(word, list.length);
    },

    renderWord(word, total) {
        if (!word) return;
        AppState.verb3CurrentVerb = word;

        document.getElementById('v3-counter').textContent = `${AppState.verb3Index + 1} / ${total}`;
        document.getElementById('v3-base').textContent = word.verb.base || word.english;

        const zhEl = document.getElementById('v3-zh');
        if (zhEl) zhEl.textContent = word.chinese || word.translation || '';

        const lvlEl = document.getElementById('v3-level-badge');
        if (lvlEl) lvlEl.textContent = word.schoolLevel || word.level || '';

        this.resetInput('v3-past');
        this.resetInput('v3-pp');

        const checkBtn = document.getElementById('v3-check-btn');
        this.isAnswerChecked = false;
        if (checkBtn) {
            checkBtn.disabled = false;
            checkBtn.classList.remove('hidden');
            checkBtn.textContent = '檢查答案';
        }

        const msg = document.getElementById('v3-msg');
        if (msg) { msg.textContent = ''; msg.className = 'hidden'; }
    },

    resetInput(id) {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.disabled = false;
            el.classList.remove('error', 'success');
        }
    },

    updateStatsUI() {
        const statsEl = document.getElementById('v3-stats');
        const correctEl = document.getElementById('v3-stat-correct');
        const wrongEl = document.getElementById('v3-stat-wrong');

        if (statsEl) statsEl.classList.remove('hidden');
        if (correctEl) correctEl.textContent = AppState.verb3Stats.correct;
        if (wrongEl) wrongEl.textContent = AppState.verb3Stats.wrong;
    },

    checkAnswer() {
        const checkBtn = document.getElementById('v3-check-btn');

        if (this.isAnswerChecked) {
            this.nextQuestion();
            return;
        }

        const word = AppState.verb3CurrentVerb;
        if (!word || !word.verb) return;

        const pInput = document.getElementById('v3-past');
        const ppInput = document.getElementById('v3-pp');
        const msg = document.getElementById('v3-msg');

        let pVal = pInput.value.trim().toLowerCase();
        let ppVal = ppInput.value.trim().toLowerCase();

        const pCorrect = (word.verb.past || '').toLowerCase();
        const ppCorrect = (word.verb.pp || '').toLowerCase();

        let isAllCorrect = true;
        let showAnswer = false;

        if (pVal === pCorrect) {
            pInput.classList.add('success');
            pInput.classList.remove('error');
        } else {
            pInput.classList.add('error');
            isAllCorrect = false;
            showAnswer = true;
        }

        if (ppVal === ppCorrect) {
            ppInput.classList.add('success');
            ppInput.classList.remove('error');
        } else {
            ppInput.classList.add('error');
            isAllCorrect = false;
            showAnswer = true;
        }

        if (isAllCorrect) {
            AppState.verb3Stats.correct++;
            msg.textContent = `✅ 完全正確！`;
            msg.className = 'success';
            // DEPENDENCY: AudioService (accessed via module scope)
            // services.audioService.playCorrectSound();
        } else {
            AppState.verb3Stats.wrong++;
            msg.textContent = `❌ 過去式: ${word.verb.past}, 過去分詞: ${word.verb.pp}`;
            msg.className = 'error';
            // DEPENDENCY: AudioService (accessed via module scope)
            // services.audioService.playErrorSound();
        }

        this.updateStatsUI();
        msg.classList.remove('hidden');

        this.isAnswerChecked = true;
        if (checkBtn) checkBtn.textContent = '下一題';
    },

    nextQuestion() {
        if (AppState.verb3List && AppState.verb3Index < AppState.verb3List.length - 1) {
            AppState.verb3Index++;
            this.loadQuestion();
        } else {
            alert('本輪練習結束！');
        }
    },

    prevQuestion() {
        if (AppState.verb3Index > 0) {
            AppState.verb3Index--;
            this.loadQuestion();
        }
    }
};
