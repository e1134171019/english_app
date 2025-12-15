export const AIService = {
    API_ENDPOINT: 'http://127.0.0.1:5000/api/generate-card',

    /**
     * 呼叫 AI 生成單字卡
     * @param {string} word - 要生成的英文單字
     * @returns {Promise<Object>} 生成的卡片資料
     */
    async generateCard(word) {
        if (!word) throw new Error('請輸入單字');

        try {
            console.log(`Calling AI service for word: ${word}`);
            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: word })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'AI 生成失敗');
            }

            const data = await response.json();
            return data.card;

        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }
};
