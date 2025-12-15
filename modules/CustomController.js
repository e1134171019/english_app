import { AppState } from '../core/state.js';
import { WordService } from '../services/wordService.js';
import { StorageService } from '../services/storage.js';

export const CustomController = {
    name: 'custom-training-screen',

    init() {
        console.log('CustomModule Init');
    },

    onEnter(params) {
        this.renderSets();
    },

    onExit() { },

    async processInput() {
        const inputEl = document.getElementById('custom-input');
        const text = inputEl.value;

        // Parse
        // Split by comma, newline, space
        const rawTokens = text.split(/[\n, ]+/).map(t => t.trim().toLowerCase()).filter(t => t);
        const uniqueTokens = [...new Set(rawTokens)];

        if (uniqueTokens.length === 0) {
            alert('請輸入單字！');
            return;
        }

        // Limits (TS-22, TS-19)
        if (uniqueTokens.length > 300) {
            alert('單字數量超過 300 個限制！');
            return;
        }

        // Create Set
        const setName = `Custom Set ${new Date().toLocaleTimeString()}`; // Simple name
        // Or ask user? For now auto-name or generic.
        // Logic from main.js Step 2235:

        // Lookup words
        const allWords = WordService.getAllWords();
        const foundWords = [];
        const missing = [];

        uniqueTokens.forEach(token => {
            const w = allWords.find(x => x.english.toLowerCase() === token);
            if (w) foundWords.push(w);
            else missing.push(token);
        });

        const setObj = {
            id: Date.now().toString(),
            name: `匯入 (${foundWords.length}字)`,
            date: new Date().toISOString(),
            words: foundWords.map(w => w.english) // persist IDs or English keys
        };

        const result = StorageService.addCustomSet(setObj);
        if (!result) {
            alert('自訂清單已達上限 (5組)！請先刪除舊的。');
            return;
        }

        alert(`成功匯入 ${foundWords.length} 個單字。\n未知: ${missing.length} 個 (${missing.slice(0, 3).join(', ')}...)`);
        inputEl.value = '';
        this.renderSets();
    },

    renderSets() {
        const listEl = document.getElementById('custom-sets-list');
        if (!listEl) return;

        const sets = StorageService.loadCustomSets();
        listEl.innerHTML = '';

        sets.forEach(set => {
            const card = document.createElement('div');
            card.className = 'custom-set-card card'; // TS-20 Classes
            // Simple innerHTML based on structure
            card.innerHTML = `
            <div class="custom-set-header">
                <div class="custom-set-title">${set.name}</div>
                <div class="custom-set-info">${new Date(set.date).toLocaleDateString()} • ${set.words.length} words</div>
            </div>
            <div class="custom-set-actions" style="margin-top:12px; display:flex; gap:8px;">
                <button class="btn btn-primary btn-sm" onclick="app.playCustomSet('${set.id}')">播放</button>
                <button class="btn btn-outline btn-sm" onclick="app.deleteCustomSet('${set.id}')">刪除</button>
            </div>
          `;
            listEl.appendChild(card);
        });
    },

    playSet(setId) {
        const sets = StorageService.loadCustomSets();
        const set = sets.find(s => s.id === setId);
        if (!set) return;

        // Hydrate
        const allWords = WordService.getAllWords();
        const list = [];
        set.words.forEach(wKey => {
            const w = allWords.find(x => x.english === wKey);
            if (w) list.push(w);
        });

        // Set Logic - Reuse Flashcard Pipeline?
        // Yes, sets activeWordList and navigates to Practice.
        // But wait, user said "Two Pipeline". 
        // If we navigate to 'practice-screen', FlashcardController takes over.

        if (list.length === 0) { alert('清單為空！'); return; }

        AppState.activeWordList = list;
        AppState.customWordList = list; // Persist for other modes (e.g. Verb3)
        AppState.currentIndex = 0;

        // Main Router should handle this.
        // Returning specific signal?
        // Or calling app.navigate?
        // Since this is a module, we can access global app if exposed, or return action.
        // We will rely on `window.app.navigate` for now as it's the pattern.
        window.app.navigate('practice-screen');
    },

    deleteSet(setId) {
        if (confirm('確定刪除?')) {
            StorageService.deleteCustomSet(setId);
            this.renderSets();
        }
    }
};
