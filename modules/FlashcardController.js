import { AppState } from '../core/state.js';
// Service imports removed for DI

// Module-scope services pattern
let services = null;

export const FlashcardController = {
    name: 'practice-screen',

    init(injectedServices) {
        console.log('FlashcardModule Init');
        services = injectedServices;
    },

    /**
     * 啟動單字練習（Deck 模式）
     * @param {Object} config - { words, deckId }
     */
    start({ words, deckId }) {
        console.log(`[Flashcard] Starting with deck: ${deckId}, ${words.length} words`);

        if (!words || words.length === 0) {
            alert('題庫無單字可供練習');
            return;
        }

        // 設定當前單字列表（不依賴全域 activeWords）
        this.words = words;
        this.deckId = deckId;
        this.currentIndex = 0;

        // 更新 AppState（向後兼容）
        AppState.practiceList = words;
        AppState.currentIndex = 0;

        // 顯示畫面
        this.showScreen();

        // 初始渲染
        this.renderCard();
    },

    onEnter(params) {
        console.log('FlashcardModule Enter', params);

        // Mode Handling
        if (params && params.mode === 'quiz') {
            AppState.currentMode = 'practice';
        }

        // Show Screen
        this.showScreen();

        // Load Words
        // DEPENDENCY: WordService
        const words = services.wordService.getActiveProcessingWords();
        if (words.length === 0) {
            alert('沒有單字可供練習！請先在等級選擇中選取。');
            window.app.navigate('level-select-screen');
            return;
        }

        AppState.practiceList = words;
        AppState.currentIndex = 0;

        // Initial Render
        this.renderCard();
    },

    onExit() {
        // Stop any audio when leaving
        // DEPENDENCY: AudioService
        if (services && services.audioService) {
            services.audioService.cancelSpeech();
        }
    },

    showScreen() {
        // Hide others (Safety)
        document.querySelectorAll('.screen').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('active');
        });

        const el = document.getElementById('practice-screen');
        if (el) {
            // Remove inline display style to let CSS flex layout work
            el.style.display = '';  // Clear inline style
            el.classList.add('active');  // CSS handles display via .active class
        }
    },

    renderCard() {
        const list = AppState.practiceList;
        if (!list || list.length === 0) return;

        // Loop check
        if (AppState.currentIndex >= list.length) AppState.currentIndex = 0;
        if (AppState.currentIndex < 0) AppState.currentIndex = list.length - 1;

        const word = list[AppState.currentIndex];
        AppState.currentWord = word;

        // DOM Update
        const backTextEl = document.getElementById('card-back-text'); // Back: English
        const phoneticEl = document.getElementById('card-phonetic');
        const posEl = document.getElementById('card-pos');
        const frontTextEl = document.getElementById('card-front-text'); // Front: Chinese
        const sentenceEnEl = document.getElementById('card-sentence-en');
        const sentenceZhEl = document.getElementById('card-sentence-zh');
        const counterEl = document.getElementById('practice-counter'); // Header counter element
        const levelBadgeEl = document.getElementById('card-level-badge');
        const schoolLabelEl = document.getElementById('card-school-label');

        if (backTextEl) backTextEl.textContent = word.english;
        if (phoneticEl) phoneticEl.textContent = word.phonetic || '';
        if (posEl) posEl.textContent = word.pos || '';
        if (levelBadgeEl) levelBadgeEl.textContent = word.level || '';
        if (schoolLabelEl) schoolLabelEl.textContent = word.schoolLevel || '';
        if (frontTextEl) frontTextEl.textContent = word.translation || '';

        // Example Sentence
        if (sentenceEnEl) {
            // Tokenize for interactive click
            if (word.exampleEn) {
                // DEPENDENCY: WordService
                sentenceEnEl.innerHTML = services.wordService.tokenizeSentence(word.exampleEn);
            } else {
                sentenceEnEl.textContent = '暫無例句。';
            }
        }

        if (sentenceZhEl) sentenceZhEl.textContent = word.exampleZh || '';

        // Update practice counter at top
        if (counterEl) {
            counterEl.textContent = `${AppState.currentIndex + 1} / ${list.length}`;
        }

        // Reset Card Flip State
        const card = document.getElementById('flashcard');
        if (card) card.classList.remove('flipped', 'is-flipped');

        // Render Related Info (Fixing the missing part from previous bad edit)
        this.renderRelatedInfo(word);

        // Auto Play check
        if (AppState.isAutoPlay) {
            // DEPENDENCY: AudioService
            services.audioService.autoPlayCard(word);
        }
    },

    renderRelatedInfo(word) {
        const infoEl = document.getElementById('card-related-info');
        if (!infoEl) return;

        let html = '';

        // 1. Verb Forms (可點擊)
        if (word.verb && (word.verb.past || word.verb.pp)) {
            const base = word.verb.base || word.english;
            const past = word.verb.past;
            const pp = word.verb.pp;

            html += `<div style="margin-bottom:4px;"><b>三態:</b> `;
            html += `<span class="interactive-word" data-word="${base}">${base}</span> > `;
            html += `<span class="interactive-word" data-word="${past}">${past}</span> > `;
            html += `<span class="interactive-word" data-word="${pp}">${pp}</span>`;
            html += `</div>`;
        }

        // 2. Synonyms / Collocations (可點擊)
        if (word.synonyms && word.synonyms.length > 0) {
            const badgeStyle = `display:inline-block; background:var(--bg-subtle); padding:2px 6px; border-radius:4px; margin-right:4px; font-size:0.85rem; cursor:pointer;`;
            const synTags = word.synonyms.map(s =>
                `<span class="interactive-word" data-word="${s}" style="${badgeStyle}">${s}</span>`
            ).join('');
            html += `<div style="margin-top:6px; margin-bottom:4px;"><b>相關:</b> ${synTags}</div>`;
        }

        // 3. Family or Pattern
        if (word.family) {
            html += `<div style="color:var(--text-hint); font-size:0.8rem;">家族: ${word.family}</div>`;
        }
        if (word.patternZh) {
            html += `<div style="color:var(--text-hint); font-size:0.8rem;">類型: ${word.patternZh}</div>`;
        }

        infoEl.innerHTML = html;
    },

    nextCard() {
        console.log('[Flashcard] nextCard called');
        AppState.currentIndex++;
        if (AppState.currentIndex >= AppState.practiceList.length) {
            AppState.currentIndex = 0;
        }
        this.renderCard();
    },

    prevCard() {
        console.log('[Flashcard] prevCard called');
        AppState.currentIndex--;
        if (AppState.currentIndex < 0) {
            AppState.currentIndex = AppState.practiceList.length - 1;
        }
        this.renderCard();
    },

    flipCard() {
        const card = document.getElementById('flashcard');
        if (card) card.classList.toggle('flipped');
    },

    toggleAutoPlay() {
        AppState.isAutoPlay = !AppState.isAutoPlay;
        const btn = document.getElementById('autoplay-btn');
        if (btn) {
            btn.classList.toggle('active', AppState.isAutoPlay);
            if (AppState.isAutoPlay) {
                // Trigger play immediately if turning on
                this.renderCard(); // Rerender to trigger autoplay logic
            } else {
                // DEPENDENCY: AudioService
                services.audioService.cancelSpeech();
            }
        }
    },

    speakCurrentWord() {
        // DEPENDENCY: AudioService
        if (AppState.currentWord && services.audioService) {
            services.audioService.speakText(AppState.currentWord.english);
        }
    },

    speakExample() {
        // DEPENDENCY: AudioService
        if (AppState.currentWord && AppState.currentWord.exampleEn && services.audioService) {
            services.audioService.speakText(AppState.currentWord.exampleEn, 0.9);
        }
    }
};
