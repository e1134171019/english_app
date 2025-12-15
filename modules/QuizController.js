import { AppState } from '../core/state.js';
import { AudioService } from '../services/audio.js';

export const QuizController = {
    name: 'quiz-screen',

    init() {
        console.log('QuizModule Init');
        // Input Enter Key Listener
        const input = document.getElementById('quiz-input');
        if (input) {
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
        }
    },

    onEnter(params) {
        console.log('QuizModule Enter', params);

        // Reset Quiz State
        AppState.quizCorrectCount = 0;
        AppState.currentIndex = 0;

        // Ensure words are loaded (if not already by Level Select)
        if (!AppState.activeWordList || AppState.activeWordList.length === 0) {
            // Handle empty list
        }

        this.loadQuestion();
    },

    onExit() {
        AudioService.cancelSpeech();
    },

    // --- Logic ---

    loadQuestion() {
        const word = AppState.activeWordList[AppState.currentIndex];
        if (!word) return;

        this.resetUI();

        // Auto speak
        setTimeout(() => this.speakWord(), 500);
    },

    resetUI() {
        const input = document.getElementById('quiz-input');
        const feedback = document.getElementById('quiz-feedback');
        const submitBtn = document.getElementById('quiz-submit-btn');
        const skipBtn = document.getElementById('quiz-skip-btn');

        if (input) { input.value = ''; input.disabled = false; input.focus(); }
        if (feedback) { feedback.textContent = ''; feedback.className = 'hidden'; }
        if (submitBtn) submitBtn.classList.remove('hidden');
        if (skipBtn) skipBtn.classList.remove('hidden');

        this.updateCounter();
    },

    speakWord() {
        const word = AppState.activeWordList[AppState.currentIndex];
        if (word) AudioService.speak(word.english);
    },

    checkAnswer(isSkip = false) {
        const word = AppState.activeWordList[AppState.currentIndex];
        const input = document.getElementById('quiz-input');
        const feedback = document.getElementById('quiz-feedback');
        const submitBtn = document.getElementById('quiz-submit-btn');
        const skipBtn = document.getElementById('quiz-skip-btn');
        const nextBtn = document.getElementById('quiz-next-btn');
        const infoCard = document.getElementById('quiz-full-info');

        const userVal = input ? input.value.trim().toLowerCase() : '';
        const correctVal = word.english.toLowerCase();

        // UI Updates
        if (submitBtn) submitBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (input) input.disabled = true;

        if (isSkip) {
            this.showFeedback(false, `跳過。答案是: ${word.english}`);
            this.speakFeedback(false, word.english);
        } else if (userVal === correctVal) {
            AppState.quizCorrectCount++;
            this.showFeedback(true, '正確！ Correct!');
            this.speakFeedback(true);
        } else {
            this.showFeedback(false, `錯誤。答案是: ${word.english}`);
            this.speakFeedback(false, word.english);
        }
    },

    showFeedback(isCorrect, msg) {
        const el = document.getElementById('quiz-feedback');
        if (el) {
            el.textContent = msg;
            el.className = isCorrect ? 'success' : 'error'; // css classes
            el.classList.remove('hidden');
        }
    },

    speakFeedback(isCorrect, text = '') {
        if (isCorrect) {
            AudioService.speak('Correct!');
        } else {
            AudioService.speak(text);
        }
    },

    nextQuestion() {
        if (AppState.currentIndex < AppState.activeWordList.length - 1) {
            AppState.currentIndex++;
            this.loadQuestion();
        } else {
            // Maybe loop or just stop
        }
    },

    prevQuestion() {
        if (AppState.currentIndex > 0) {
            AppState.currentIndex--;
            this.loadQuestion();
        }
    },

    updateCounter() {
        const counter = document.getElementById('quiz-counter');
        if (counter) {
            counter.textContent = `${AppState.currentIndex + 1} / ${AppState.activeWordList.length}`;
        }
    }
};
