/**
 * 簡化版 Tooltip - 只顯示中文翻譯（黑底）
 * Updated with AI word generation capability
 */

export const SimpleTooltip = {
    activeTooltip: null,
    wordService: null, // Will be injected by main.js

    /**
     * Initialize with WordService reference
     */
    init(wordService) {
        this.wordService = wordService;
        console.log('[SimpleTooltip] Initialized with AI support');
    },

    /**
     * Show word tooltip with AI fallback
     * @param {string} word - The word clicked
     * @param {Object} position - Click position {x, y}
     * @param {Object|null} wordData - Optional pre-fetched word data
     * @param {string|null} sentence - Optional sentence context
     */
    async show(word, position, wordData = null, sentence = null) {
        // Remove old tooltip
        this.hide();

        try {
            let data = wordData;

            // Step 1: Try exact match in database
            if (!data && this.wordService) {
                console.log(`[Tooltip] Looking up: ${word}`);
                data = await this.wordService.findWordWithLemma(word);
            }

            // Step 2: If not found, try AI identification with context
            if (!data && this.wordService) {
                console.log(`[Tooltip] Word not found, trying AI identification...`);

                const identification = await this.wordService.identifyWordWithAI(word, sentence);

                // If AI found a different base form, search for it
                if (identification && identification.baseForm && identification.baseForm !== word.toLowerCase()) {
                    console.log(`[Tooltip] AI identified base form: ${identification.baseForm}`);
                    console.log(`[Tooltip] Searching database for base form "${identification.baseForm}"...`);
                    data = await this.wordService.findWordWithLemma(identification.baseForm);
                    console.log(`[Tooltip] Base form "${identification.baseForm}" ${data ? 'FOUND ✓' : 'NOT FOUND ✗'} in database`);

                    if (data) {
                        // Found the base form! Show inflection info
                        const inflectionLabel = this.getInflectionLabel(identification.inflection);
                        const meaning = identification.contextualMeaning || data.translation;

                        this.showStatic(
                            word,
                            position,
                            `${word} (${identification.baseForm} 的${inflectionLabel})：${meaning}`
                        );
                        return;
                    } else {
                        // Base form also not found - auto-generate the base form (better UX)
                        console.log(`[Tooltip] Base form "${identification.baseForm}" also not found, auto-generating...`);
                        Toast.info(`正在生成「${identification.baseForm}」的完整資料...`);

                        const generatedData = await this.wordService.generateWordWithAI(identification.baseForm, sentence);

                        if (generatedData) {
                            // Removed: this.wordService.saveToUserWords(generatedData);
                            // Only save to today's preview list, not permanent database
                            console.log(`[Tooltip] ✅ AI Generated complete data for "${generatedData.english}":`, generatedData);

                            // Add to today's preview list
                            if (window.addWordController) {
                                window.addWordController.addWord(generatedData, 'tooltip');
                            }

                            console.log(`[Tooltip] ✅ Added to preview list`);
                            Toast.success(`✓ 已自動生成「${identification.baseForm}」`);

                            // Show with inflection info
                            const inflectionLabel = this.getInflectionLabel(identification.inflection);
                            const meaning = identification.contextualMeaning || generatedData.translation;

                            this.showStatic(
                                word,
                                position,
                                `${word} (${identification.baseForm} 的${inflectionLabel})：${meaning}`
                            );
                            return;
                        } else {
                            Toast.error('AI 生成失敗');
                            this.showStatic(word, position, '生成失敗');
                            return;
                        }
                    }
                }
            }

            // Step 3: If AI didn't identify a different base form, ask user to generate the original word
            if (!data && this.wordService) {
                console.log(`[Tooltip] No base form identified, prompting for generation of "${word}"`);
                const shouldGenerate = await this.promptAIGeneration(word);

                if (shouldGenerate) {
                    Toast.info(`正在生成「${word}」的完整資料...`);
                    data = await this.wordService.generateWordWithAI(word, sentence);

                    if (data) {
                        this.wordService.saveToUserWords(data);
                        Toast.success(`✓ 已生成「${word}」的完整資料`);
                    } else {
                        Toast.error('AI 生成失敗');
                        return;
                    }
                } else {
                    // User declined, show default message
                    this.showStatic(word, position, '查無中文');
                    return;
                }
            }

            // Display translation
            const chinese = data?.translation || data?.Translation || '查無中文';
            this.showStatic(word, position, chinese);

        } catch (error) {
            console.error('[Tooltip] Error:', error);
            this.showStatic(word, position, '查詢失敗');
        }
    },

    /**
     * Get Chinese label for inflection type
     */
    getInflectionLabel(inflection) {
        const labels = {
            'present-participle': '现在分词',
            'past-tense': '过去式',
            'past-participle': '过去分词',
            'third-person-singular': '第三人称单数',
            'plural': '复数',
            'comparative': '比较级',
            'superlative': '最高级',
            'gerund': '动名词'
        };
        return labels[inflection] || '变化形';
    },

    /**
     * Show static tooltip (no async logic)
     */
    showStatic(word, position, text) {
        // Remove old tooltip
        this.hide();

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'simple-tooltip';
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        // Calculate position (show above click position)
        const tooltipRect = tooltip.getBoundingClientRect();
        const x = Math.min(
            position.x - tooltipRect.width / 2,
            window.innerWidth - tooltipRect.width - 10
        );
        const y = position.y - tooltipRect.height - 10;

        tooltip.style.left = `${Math.max(10, x)}px`;
        tooltip.style.top = `${Math.max(10, y)}px`;

        this.activeTooltip = tooltip;

        // Animate in
        setTimeout(() => tooltip.classList.add('show'), 10);

        // Click anywhere to close
        setTimeout(() => {
            document.addEventListener('click', this._handleClickOutside, true);
        }, 100);
    },

    /**
     * Prompt user for AI generation
     */
    async promptAIGeneration(word) {
        return new Promise((resolve) => {
            if (window.Toast && window.Toast.confirm) {
                window.Toast.confirm(
                    `「${word}」不在資料庫中\n\n是否要使用 AI 自動生成完整資料？\n（包含釋義、例句、詞性等）`,
                    () => resolve(true),
                    () => resolve(false)
                );
            } else {
                // Fallback to native confirm
                resolve(confirm(`「${word}」不在資料庫中\n\n是否要使用 AI 自動生成完整資料？`));
            }
        });
    },

    /**
     * Hide tooltip
     */
    hide() {
        if (this.activeTooltip) {
            this.activeTooltip.classList.remove('show');
            setTimeout(() => {
                if (this.activeTooltip) {
                    this.activeTooltip.remove();
                    this.activeTooltip = null;
                }
            }, 200);
        }
        document.removeEventListener('click', this._handleClickOutside, true);
    },

    /**
     * Handle click outside
     */
    _handleClickOutside: (e) => {
        if (!e.target.closest('.simple-tooltip') && !e.target.closest('.interactive-word') && !e.target.closest('.custom-modal')) {
            SimpleTooltip.hide();
        }
    }
};

// Global export
window.SimpleTooltip = SimpleTooltip;
