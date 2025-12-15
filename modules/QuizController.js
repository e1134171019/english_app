import { AppState } from '../core/state.js';
// AudioService import removed for DI

// Module-scope services
let services = null;

export const QuizController = {
    name: 'quiz-screen',

    init(injectedServices) {
        console.log('QuizModule Init');
        services = injectedServices;
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
        if (services && services.audioService) {
            services.audioService.cancelSpeech();
        }
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
        const nextBtn = document.getElementById('quiz-next-btn');

        if (input) { input.value = ''; input.disabled = false; input.focus(); }
        if (feedback) { feedback.textContent = ''; feedback.className = 'hidden'; }
        if (submitBtn) submitBtn.classList.remove('hidden');
        if (skipBtn) skipBtn.classList.remove('hidden');
        // Hide next button initially? Original code didn't explicit hide next button here but logic implies it.
        // Let's stick to original behavior for UI reset.
        if (nextBtn) nextBtn.classList.add('hidden'); // Logic inferred from checkAnswer which shows it.

        this.updateCounter();
    },

    speakWord() {
        const word = AppState.activeWordList[AppState.currentIndex];
        // DEPENDENCY: AudioService
        if (word && services.audioService) services.audioService.speak(word.english);
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
        if (nextBtn) nextBtn.classList.remove('hidden'); // Show next button

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
        if (!services || !services.audioService) return;

        if (isCorrect) {
            services.audioService.speak('Correct!');
        } else {
            services.audioService.speak(text);
        }
    },

    nextQuestion() {
        if (AppState.currentIndex < AppState.activeWordList.length - 1) {
            AppState.currentIndex++;
            this.loadQuestion();
        } else {
            // End of quiz
            alert(`測驗結束！分數: ${AppState.quizCorrectCount} / ${AppState.activeWordList.length}`);
            window.app.navigate('level-select-screen');
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
