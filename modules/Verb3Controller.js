import { AppState } from '../core/state.js';
import { WordService } from '../services/wordService.js';
import { AudioService } from '../services/audio.js';

export const Verb3Controller = {
    name: 'verb3-screen',

    init() {
        console.log('Verb3Module Init');
        // Ensure stats exist
        AppState.verb3Stats = { correct: 0, wrong: 0 };
    },

    onEnter(params) {
        console.log('Verb3Module Enter', params);

        // Safety Fix: Ensure other screens are hidden (Dual-Layer Protection)
        // Sometimes main.js nuclear option might miss if DOM is updating slowly.
        const conflictScreens = ['quiz-screen', 'practice-screen', 'level-select-screen'];
        conflictScreens.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.classList.remove('active'); }
        });

        // Ensure SELF is shown
        const self = document.getElementById('verb3-screen');
        if (self) { self.style.display = 'block'; self.classList.add('active'); }

        // TS-13 Integration: Use Active List from Level Select if available
        if (AppState.activeWordList && AppState.activeWordList.length > 0) {
            const verbs = AppState.activeWordList.filter(w => w.verb);
            if (verbs.length > 0) {
                console.log(`Verb3: Loaded ${verbs.length} verbs from Level Select`);
                AppState.verb3List = verbs;
            } else {
                // Active list has no verbs? Fallback or Alert?
                // Alert maybe intrusive if switching modes. Just fallback to default level.
            }
        } else {
            // Not from Level Select? Ensure we clear list to trigger auto-load
            AppState.verb3List = [];
        }

        // Reset Stats on Entry? Or keep session? Reset usually.
        AppState.verb3Stats = { correct: 0, wrong: 0 };
        this.updateStatsUI();

        // Use default level if not set
        if (!AppState.verb3Level) AppState.verb3Level = 'JH';
        this.refreshUI();
        this.loadQuestion();
    },

    onExit() {
        // Cleanup
    },

    switchLevel(level) {
        AppState.verb3Level = level;
        AppState.verb3List = []; // Clear to force reload

        // Reset Stats when switching level? Yes.
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

        // Load Data if empty
        if (!list || list.length === 0) {
            const targetLevel = AppState.verb3Level;
            let sourceList = [];

            if (targetLevel === 'CUSTOM') {
                // Removed per user request
                alert('此功能已移除');
                return;
            } else {
                sourceList = WordService.getAllWords();
            }

            list = sourceList.filter(w => {
                if (!w.verb) return false;
                // Level Filter for STANDARD levels
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

            // Randomize
            list.sort(() => Math.random() - 0.5);
            AppState.verb3List = list;
            AppState.verb3Index = 0;
        }

        // Reset Index check
        if (AppState.verb3Index >= list.length) AppState.verb3Index = 0;

        const word = list[AppState.verb3Index];
        this.renderWord(word, list.length);
    },

    renderWord(word, total) {
        if (!word) return;
        AppState.verb3CurrentVerb = word;

        document.getElementById('v3-counter').textContent = `${AppState.verb3Index + 1} / ${total}`;
        document.getElementById('v3-base').textContent = word.verb.base || word.english;

        // TS-14 New Fields
        const zhEl = document.getElementById('v3-zh');
        if (zhEl) zhEl.textContent = word.chinese || word.translation || '';

        const lvlEl = document.getElementById('v3-level-badge');
        if (lvlEl) lvlEl.textContent = word.schoolLevel || word.level || '';

        // Inputs
        this.resetInput('v3-past');
        this.resetInput('v3-pp');

        // Buttons
        const checkBtn = document.getElementById('v3-check-btn');

        this.isAnswerChecked = false; // Reset State
        if (checkBtn) {
            checkBtn.disabled = false;
            checkBtn.classList.remove('hidden');
            checkBtn.textContent = '檢查答案'; // Reset Text
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

        // State Check: If already checked, go to Next
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
        let showAnswer = false; // Always show answer on error for this requirement

        // Validate Past
        if (pVal === pCorrect) {
            pInput.classList.add('success');
            pInput.classList.remove('error');
        } else {
            pInput.classList.add('error');
            isAllCorrect = false;
            showAnswer = true;
        }

        // Validate PP
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
            AudioService.playCorrectSound();
        } else {
            AppState.verb3Stats.wrong++;

            // Format: 過去式 :accounted, 過去分詞: accounted
            msg.textContent = `❌ 過去式: ${word.verb.past}, 過去分詞: ${word.verb.pp}`;
            msg.className = 'error';
            AudioService.playErrorSound();
        }

        this.updateStatsUI();
        msg.classList.remove('hidden');

        // Change Button to Next
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
