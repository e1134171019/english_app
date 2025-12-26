/**
 * 音訊服務
 * 封裝 Web Speech API (TTS) 功能
 */

import { AppState } from '../core/state.js';
import { AppConfig } from '../core/config.js';

export const AudioService = {
    /**
     * 朗讀文字
     * @param {string} text - 要朗讀的文字
     * @param {number} rateMultiplier - 語速倍率
     */
    speakText(text, rateMultiplier = 1.0) {
        if (!window.speechSynthesis || !text) return;
        this.cancelSpeech();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = AppState.getCurrentSpeed() * rateMultiplier;

        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.lang === 'en-US');
        if (bestVoice) utterance.voice = bestVoice;

        window.speechSynthesis.speak(utterance);
    },

    // Alias for backward compatibility
    speak(text, rate) {
        this.speakText(text, rate);
    },

    /**
     * 取消當前朗讀
     */
    cancelSpeech() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    },

    /**
     * 設定語速
     * @param {number} speed - 語速值
     */
    setSpeed(speed) {
        const speedValue = parseFloat(speed) || AppConfig.DEFAULT_SPEED;
        AppState.setCurrentSpeed(speedValue);
    },

    /**
     * 自動播放卡片內容
     * @param {Object} card - 單字卡片物件
     */
    async autoPlayCard(card) {
        const cardEl = document.getElementById('flashcard');
        if (!cardEl.classList.contains('is-flipped')) {
            cardEl.classList.add('is-flipped');
            await this.wait(600);
        }

        this.speakText(card.english, 1.0);
        await this.wait(1500);

        if (card.example_en) {
            this.speakText(card.example_en, 0.9);
        }
    },

    /**
     * 等待指定時間
     * @param {number} ms - 毫秒數
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // --- Compatibility / Helpers ---
    speak(text) {
        this.speakText(text);
    },

    playCorrectSound() {
        // Simple fallback using TTS or an Audio object if available
        this.speakText("Correct!");
    },

    playErrorSound() {
        this.speakText("Wrong.");
    }
};
