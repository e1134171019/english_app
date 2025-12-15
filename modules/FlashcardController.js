import { AppState } from '../core/state.js';
import { AudioService } from '../services/audio.js';
import { WordService } from '../services/wordService.js';
import { DOMManager } from '../ui/dom.js';

export const FlashcardController = {
    name: 'practice-screen',

    init() {
        console.log('FlashcardModule Init');
        // Bind UI Events if necessary, or rely on global onclick delegation via App
    },

    onEnter(params) {
        console.log('FlashcardModule Enter', params);
        // If we have words, render current. If not, maybe redirect or zero state?
        // Usually params would carry filter info? Or AppState has list?
        // In current main.js: AppState.activeWordList is populated by Level Select.

        if (!AppState.activeWordList || AppState.activeWordList.length === 0) {
            console.warn('No words loaded for practice.');
            // Optionally fallback or alert
        }

        this.renderCurrentCard();
    },

    onExit() {
        console.log('FlashcardModule Exit');
        AudioService.cancelSpeech();
        this.stopAutoPlay();
    },

    // --- Actions ---

    renderCurrentCard() {
        const word = AppState.activeWordList[AppState.currentIndex];
        if (!word) return;

        // Update Counter
        const counterEl = document.getElementById('practice-counter');
        if (counterEl) counterEl.textContent = `${AppState.currentIndex + 1} / ${AppState.activeWordList.length}`;

        // Progress Bar
        const progressFill = document.getElementById('practice-progress');
        if (progressFill) {
            const pct = ((AppState.currentIndex + 1) / AppState.activeWordList.length) * 100;
            progressFill.style.width = `${pct}%`;
        }

        // Reset Card Flip
        const card = document.getElementById('flashcard');
        if (card) {
            card.classList.remove('flipped');
            // Remove any transient classes
            card.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
        }

        // Populate Data
        // Front
        this.setText('card-front-text', word.english); // Strategy: Front English
        // Badges
        this.setText('card-level-badge', word.level || 'Mix');
        this.setText('card-school-label', word.schoolLevel || '');

        // Back
        this.setText('card-back-text', word.english);
        this.setText('card-pos', word.pos || ''); // Fix POS mapping
        this.setText('card-phonetic', word.phonetic || '/.../');

        // Sentences
        const enEx = word.exampleEn || word.example_en || '';
        const zhEx = word.exampleZh || word.example_zh || '';

        const enEl = document.getElementById('card-sentence-en');
        if (enEl) {
            enEl.innerHTML = enEx
                ? DOMManager.createInteractiveSentence(enEx, word.english)
                : 'No example.';
        }

        this.setText('card-sentence-zh', zhEx || '無例句。');

        // Related Info
        const infoEl = document.getElementById('card-related-info');
        if (infoEl) {
            let html = '';

            // 1. Verb Forms
            if (word.verb && (word.verb.past || word.verb.pp)) {
                html += `<div style="margin-bottom:4px;"><b>三態:</b> ${word.verb.base || word.english} > ${word.verb.past} > ${word.verb.pp}</div>`;
            }

            // 2. Synonyms / Collocations
            if (word.synonyms && word.synonyms.length > 0) {
                // If it's a string (legacy), split it? WordService ensures it is array.
                const badgeStyle = `display:inline-block; background:var(--bg-subtle); padding:2px 6px; border-radius:4px; margin-right:4px; font-size:0.85rem;`;
                const synTags = word.synonyms.map(s => `<span style="${badgeStyle}">${s}</span>`).join('');
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
        }

        // Auto Play Logic
        if (AppState.settings.autoPlay) {
            this.playSequence(word);
        }
    },

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    flipCard() {
        const card = document.getElementById('flashcard');
        if (card) card.classList.toggle('flipped');
    },

    nextCard() {
        if (!AppState.activeWordList.length) return;

        if (AppState.currentIndex < AppState.activeWordList.length - 1) {
            AppState.currentIndex++;
            this.animateTransition('next');
        } else {
            // End of list
            alert('已完成本組練習！');
            // Loop or Stay? Stay.
        }
    },

    prevCard() {
        if (AppState.currentIndex > 0) {
            AppState.currentIndex--;
            this.animateTransition('prev');
        }
    },

    animateTransition(dir) {
        // Simplified animation logic: Just render for now to be safe
        // Ideally add css classes, wait 300ms, then render.
        this.renderCurrentCard();
    },

    speakCurrentWord() {
        const word = AppState.activeWordList[AppState.currentIndex];
        if (word) AudioService.speak(word.english);
    },

    speakExample() {
        const word = AppState.activeWordList[AppState.currentIndex];
        const sentence = word.exampleEn || word.example_en;
        if (word && sentence) AudioService.speak(sentence);
    },

    toggleAutoPlay() {
        AppState.settings.autoPlay = !AppState.settings.autoPlay;
        const btn = document.getElementById('autoplay-btn');
        if (btn) btn.classList.toggle('active', AppState.settings.autoPlay);

        if (AppState.settings.autoPlay) {
            this.playSequence(AppState.activeWordList[AppState.currentIndex]);
        } else {
            AudioService.cancelSpeech();
            clearTimeout(this.autoPlayTimer);
        }
    },

    playSequence(word) {
        if (!word) return;
        // Simple sequence: Word -> Wait -> Sentence
        AudioService.speak(word.english, () => {
            this.autoPlayTimer = setTimeout(() => {
                // Maybe flip?
                const card = document.getElementById('flashcard');
                if (card && !card.classList.contains('flipped')) card.classList.add('flipped');

                const sentence = word.exampleEn || word.example_en || '';
                AudioService.speak(sentence, () => {
                    this.autoPlayTimer = setTimeout(() => {
                        this.nextCard();
                    }, 2000);
                });
            }, 1000);
        });
    },

    stopAutoPlay() {
        if (this.autoPlayTimer) clearTimeout(this.autoPlayTimer);
    }
};
