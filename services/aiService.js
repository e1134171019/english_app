/**
 * AIService - Local Python API Backend
 * 連接本地 Flask 服務器（無 CORS 限制）
 */

export const AIService = {
    // 本地 API 端點
    API_ENDPOINT: 'http://127.0.0.1:5000/api/generate-card',

    /**
     * 生成英文單字卡片（透過本地 API）
     * @param {string} word - 要查詢的英文單字
     * @returns {Promise<Object>} 單字卡片資料
     */
    async generateCard(word) {
        if (!word) throw new Error('請輸入單字');

        try {
            console.log(`[AIService] Calling local API for: ${word}`);

            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: word })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[AIService] API error:', error);
                throw new Error(error.error || `API 錯誤: ${response.status}`);
            }

            const data = await response.json();
            console.log('[AIService] ✓ Card received:', data.card);

            return data.card;

        } catch (error) {
            console.error('[AIService] Error:', error);

            // 檢查是否是連線錯誤
            if (error.message.includes('Failed to fetch')) {
                throw new Error('無法連接到 API 服務器。請確認 api_server.py 已啟動。');
            }

            throw error;
        }
    },

    /**
     * 檢查 API 健康狀態
     */
    async checkHealth() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/health');
            const data = await response.json();
            console.log('[AIService] Health check:', data);
            return data;
        } catch (error) {
            console.error('[AIService] Health check failed:', error);
            return null;
        }
    }
};

/*
 * 使用說明
 * 
 * 1. 啟動 Python API 服務器:
 *    cd d:\English_app
 *    python api_server.py
 * 
 * 2. 確認服務器運行:
 *    打開瀏覽器訪問 http://127.0.0.1:5000/api/health
 * 
 * 3. 前端自動連接本地 API
 * 
 * 優點:
 * - 無 CORS 限制
 * - 使用 Gemini API
 * - 完整功能（翻譯、詞性、音標、例句）
 */
