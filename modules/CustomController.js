import { AppState } from '../core/state.js';
// Service Imports removed for DI

// Module-scope services
let services = null;

export const CustomController = {
    name: 'custom-training-screen',

    init(injectedServices) {
        console.log('CustomModule Init');
        services = injectedServices;
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
        // Logic from main.js Step 2235:

        // Lookup words
        // DEPENDENCY: WordService
        const allWords = services.wordService.getAllWords();
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

        // DEPENDENCY: StorageService
        const result = services.storageService.addCustomSet(setObj);
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

        // DEPENDENCY: StorageService
        const sets = services.storageService.loadCustomSets();
        listEl.innerHTML = '';

        sets.forEach(set => {
            const card = document.createElement('div');
            card.className = 'custom-set-card card'; // TS-20 Classes
            // Use data attributes instead of onclick
            card.innerHTML = `
            <div class="custom-set-header">
                <div class="custom-set-title">${set.name}</div>
                <div class="custom-set-info">${new Date(set.date).toLocaleDateString()} • ${set.words.length} words</div>
            </div>
            <div class="custom-set-actions" style="margin-top:12px; display:flex; gap:8px;">
                <button class="btn btn-primary btn-sm custom-play-btn" data-set-id="${set.id}">播放</button>
                <button class="btn btn-outline btn-sm custom-delete-btn" data-set-id="${set.id}">刪除</button>
            </div>
          `;
            listEl.appendChild(card);
        });
    },

    playSet(setId) {
        // DEPENDENCY: StorageService
        const sets = services.storageService.loadCustomSets();
        const set = sets.find(s => s.id === setId);
        if (!set) return;

        // Hydrate
        // DEPENDENCY: WordService
        const allWords = services.wordService.getAllWords();
        const list = [];
        set.words.forEach(wKey => {
            const w = allWords.find(x => x.english === wKey);
            if (w) list.push(w);
        });

        if (list.length === 0) { alert('清單為空！'); return; }

        AppState.activeWordList = list;
        AppState.customWordList = list; // Persist for other modes (e.g. Verb3)
        AppState.currentIndex = 0;

        window.app.navigate('practice-screen');
    },

    deleteSet(setId) {
        if (confirm('確定刪除?')) {
            // DEPENDENCY: StorageService
            services.storageService.deleteCustomSet(setId);
            this.renderSets();
        }
    }
};
