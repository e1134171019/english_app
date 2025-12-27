/**
 * AddWordController - AI Generated Words Manager
 * Manages daily AI-generated word previews
 */

export class AddWordController {
    constructor(wordService) {
        this.wordService = wordService;
        this.todayWords = [];
        console.log('[AddWordController] Initialized');
    }

    /**
     * Initialize the controller
     */
    async init() {
        console.log('[AddWordController] Starting init...');
        this.todayWords = this.loadTodayWords();
        this.setupUI();
        this.renderWordList();
        console.log(`[AddWordController] Loaded ${this.todayWords.length} words for today`);
    }

    /**
     * Load today's AI generated words from localStorage
     */
    loadTodayWords() {
        const today = new Date().toISOString().split('T')[0];
        const key = `aiGeneratedWords_${today}`;

        // Clean old dates
        this.cleanOldDates(today);

        const words = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(`[AddWordController] Loaded ${words.length} words from ${key}`);
        return words;
    }

    /**
     * Clean old date entries (daily reset)
     */
    cleanOldDates(today) {
        const keysRemoved = [];
        Object.keys(localStorage)
            .filter(key => key.startsWith('aiGeneratedWords_') && !key.includes(today))
            .forEach(key => {
                localStorage.removeItem(key);
                keysRemoved.push(key);
            });

        if (keysRemoved.length > 0) {
            console.log(`[AddWordController] Removed old data:`, keysRemoved);
        }
    }

    /**
     * Save today's words to localStorage
     */
    saveTodayWords() {
        const today = new Date().toISOString().split('T')[0];
        const key = `aiGeneratedWords_${today}`;
        localStorage.setItem(key, JSON.stringify(this.todayWords));
        console.log(`[AddWordController] Saved ${this.todayWords.length} words to ${key}`);
    }

    /**
     * Setup UI event listeners
     */
    setupUI() {
        const generateBtn = document.getElementById('generate-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');
        const wordInput = document.getElementById('word-input');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleManualGenerate());
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.handleClearAll());
        }

        if (wordInput) {
            wordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleManualGenerate();
                }
            });
        }

        console.log('[AddWordController] UI event listeners setup complete');
    }

    /**
     * Handle manual word generation
     */
    async handleManualGenerate() {
        const input = document.getElementById('word-input');
        const word = input.value.trim();

        if (!word) {
            Toast.warning('請輸入單字');
            return;
        }

        console.log(`[AddWordController] Manual generation requested for: ${word}`);
        Toast.info(`正在生成「${word}」...`);

        try {
            const data = await this.wordService.generateWordWithAI(word);

            if (data) {
                this.addWord(data, 'manual');
                this.wordService.saveToUserWords(data);
                Toast.success(`✓ 已生成「${word}」`);
                input.value = '';
            } else {
                Toast.error('生成失敗');
            }
        } catch (error) {
            console.error('[AddWordController] Generation error:', error);
            Toast.error('生成失敗：' + error.message);
        }
    }

    /**
     * Add a word to today's preview list
     */
    addWord(wordData, source = 'tooltip') {
        // Check if already exists
        if (this.todayWords.some(w => w.english.toLowerCase() === wordData.english.toLowerCase())) {
            console.log(`[AddWordController] "${wordData.english}" already exists in preview`);
            return;
        }

        const word = {
            ...wordData,
            generatedAt: new Date().toISOString(),
            source
        };

        this.todayWords.push(word);
        this.saveTodayWords();
        this.renderWordList();

        console.log(`[AddWordController] Added "${wordData.english}" (source: ${source})`);
    }

    /**
     * Delete a word from preview
     */
    deleteWord(index) {
        const word = this.todayWords[index];
        if (confirm(`確定要刪除「${word.english}」嗎？`)) {
            console.log(`[AddWordController] Deleting "${word.english}"`);
            this.todayWords.splice(index, 1);
            this.saveTodayWords();
            this.renderWordList();
            Toast.success('已刪除');
        }
    }

    /**
     * Clear all words
     */
    handleClearAll() {
        if (this.todayWords.length === 0) {
            Toast.info('沒有單字可刪除');
            return;
        }

        if (confirm(`確定要刪除全部 ${this.todayWords.length} 個單字嗎？`)) {
            console.log(`[AddWordController] Clearing all ${this.todayWords.length} words`);
            this.todayWords = [];
            this.saveTodayWords();
            this.renderWordList();
            Toast.success('已全部刪除');
        }
    }

    /**
     * Render the word list
     */
    renderWordList() {
        const container = document.getElementById('ai-words-list');
        const countElement = document.getElementById('word-count');

        if (!container) return;

        // Update count
        if (countElement) {
            countElement.textContent = this.todayWords.length;
        }

        if (this.todayWords.length === 0) {
            container.innerHTML = '<p class="empty-state">今日尚無 AI 生成單字</p>';
            return;
        }

        container.innerHTML = this.todayWords.map((word, index) => `
            <div class="word-card">
                <div class="word-header">
                    <h3 class="word-title">${word.english} <span class="pos-tag">${word.pos}</span></h3>
                    <button class="delete-btn" onclick="window.addWordController.deleteWord(${index})" title="刪除">
                        ❌
                    </button>
                </div>
                <p class="word-translation">${word.translation}</p>
                <p class="word-phonetic">${word.phonetic}</p>
                <div class="word-example">
                    <p class="example-en">"${word.exampleEn}"</p>
                    <p class="example-zh">→ ${word.exampleZh}</p>
                </div>
                <div class="word-meta">
                    <span class="source-tag source-${word.source}">
                        ${word.source === 'manual' ? '📝 手動生成' : '💡 例句點擊'}
                    </span>
                    <span class="time-tag">${this.formatTime(word.generatedAt)}</span>
                </div>
            </div>
        `).join('');

        console.log(`[AddWordController] Rendered ${this.todayWords.length} words`);
    }

    /**
     * Format timestamp
     */
    formatTime(isoString) {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
