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
     * Handle manual word generation (supports batch input)
     */
    async handleManualGenerate() {
        const input = document.getElementById('word-input');
        const inputText = input.value.trim();

        if (!inputText) {
            Toast.warning('請輸入單字');
            return;
        }

        // Parse multiple words (comma or space separated)
        const words = inputText
            .split(/[,，\s]+/)
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length > 0);

        if (words.length === 0) {
            Toast.warning('請輸入有效單字');
            return;
        }

        // Remove duplicates from input
        const uniqueWords = [...new Set(words)];

        if (uniqueWords.length < words.length) {
            const duplicateCount = words.length - uniqueWords.length;
            Toast.info(`已移除 ${duplicateCount} 個重複單字`);
        }

        // Filter out words that already exist in preview
        const newWords = uniqueWords.filter(word =>
            !this.todayWords.some(w => w.english.toLowerCase() === word)
        );

        const existingCount = uniqueWords.length - newWords.length;
        if (existingCount > 0) {
            const existingWords = uniqueWords.filter(word =>
                this.todayWords.some(w => w.english.toLowerCase() === word)
            );
            Toast.warning(`已跳過 ${existingCount} 個已存在單字：${existingWords.join(', ')}`);
        }

        if (newWords.length === 0) {
            Toast.info('所有單字都已存在');
            return;
        }

        console.log(`[AddWordController] Batch generation: ${newWords.length} words`);
        Toast.info(`正在生成 ${newWords.length} 個單字...`);

        let successCount = 0;
        let failCount = 0;

        for (const word of newWords) {
            try {
                console.log(`[AddWordController] Generating: ${word}`);
                const data = await this.wordService.generateWordWithAI(word);

                if (data) {
                    this.addWord(data, 'manual');
                    this.wordService.saveToUserWords(data);
                    successCount++;
                } else {
                    failCount++;
                    console.warn(`[AddWordController] Failed to generate: ${word}`);
                }
            } catch (error) {
                failCount++;
                console.error(`[AddWordController] Error generating "${word}":`, error);
            }
        }

        // Clear input
        input.value = '';

        // Show result
        if (successCount > 0 && failCount === 0) {
            Toast.success(`✓ 已生成 ${successCount} 個單字`);
        } else if (successCount > 0 && failCount > 0) {
            Toast.warning(`生成完成：成功 ${successCount} 個，失敗 ${failCount} 個`);
        } else {
            Toast.error(`生成失敗 (${failCount} 個)`);
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
            <div class="word-item" onclick="window.addWordController.viewWord('${word.english}')" title="點擊查看完整內容">
                <span class="word-name">${word.english}</span>
                <button class="delete-btn" onclick="event.stopPropagation(); window.addWordController.deleteWord(${index})" title="刪除">
                    刪除
                </button>
            </div>
        `).join('');

        console.log(`[AddWordController] Rendered ${this.todayWords.length} words`);
    }

    /**
     * Navigate to flashcard practice to view full word details
     */
    viewWord(english) {
        console.log(`[AddWordController] Viewing word: ${english}`);

        // Find the word data
        const wordData = this.todayWords.find(w => w.english === english);
        if (!wordData) {
            console.error(`[AddWordController] Word not found: ${english}`);
            return;
        }

        // Navigate to practice screen
        const router = window.Router;
        if (router && router.navigate) {
            router.navigate('practice-screen');

            // Wait for screen to load, then show this specific word
            setTimeout(() => {
                const flashcardController = window.container?.get('flashcardController');
                if (flashcardController) {
                    // Find word in active deck or create temporary deck
                    flashcardController.showSpecificWord(wordData);
                } else {
                    console.warn('[AddWordController] FlashcardController not available');
                }
            }, 100);
        } else {
            console.warn('[AddWordController] Router not available, trying alternative navigation');

            // Alternative: directly manipulate screens
            const screens = document.querySelectorAll('.screen');
            screens.forEach(s => s.classList.remove('active'));

            const practiceScreen = document.getElementById('practice-screen');
            if (practiceScreen) {
                practiceScreen.classList.add('active');
            }
        }
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
