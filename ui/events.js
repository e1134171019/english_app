/**
 * 事件管理器
 * 集中管理所有事件監聽器
 */

const EventManager = {
    /**
     * 初始化所有事件監聽器
     */
    init() {
        this.initNavigation();
        this.initTwoTierMenu();
        this.initCardEvents();
        this.initQuizEvents();
        this.initVerb3Events();
        this.initCustomTrainingEvents();
        this.initAddDeleteEvents();

        console.log('✓ EventManager initialized');
    },

    /**
     * 初始化首頁導航事件
     */
    initNavigation() {
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            const target = btn.dataset.target;
            const mode = btn.dataset.mode;

            btn.addEventListener('click', () => {
                if (target === 'level-select-screen') {
                    AppState.setPendingMode(mode || 'practice');
                    ScreenManager.showScreen('level-select-screen');
                    ScreenManager.backToTier1();
                } else {
                    ScreenManager.showScreen(target);

                    // 特殊畫面的初始化
                    if (target === 'delete-screen') {
                        this.renderDeleteList();
                    }
                }
            });
        });

        console.log('✓ Navigation initialized');
    },

    /**
     * 初始化兩層選單事件
     */
    initTwoTierMenu() {
        // 第一層：學制選擇
        const tier1Buttons = document.querySelectorAll('#tier1-selection .level-btn');
        tier1Buttons.forEach(btn => {
            const tier1 = btn.dataset.tier1;
            btn.addEventListener('click', () => {
                if (tier1 === 'JH') {
                    ScreenManager.showTier2('JH');
                } else if (tier1 === 'SH') {
                    ScreenManager.showTier2('SH');
                } else if (tier1 === 'ADV') {
                    ScreenManager.selectLevel(['ADV']);
                }
            });
        });

        // 第二層：國中年級選擇
        const tier2JhButtons = document.querySelectorAll('#tier2-jh .level-btn');
        tier2JhButtons.forEach(btn => {
            const level = btn.dataset.level;
            btn.addEventListener('click', () => {
                if (level === 'JH_ALL') {
                    ScreenManager.selectLevel(['J1', 'J2', 'J3']);
                } else {
                    ScreenManager.selectLevel([level]);
                }
            });
        });

        // 第二層：高中年級選擇
        const tier2ShButtons = document.querySelectorAll('#tier2-sh .level-btn');
        tier2ShButtons.forEach(btn => {
            const level = btn.dataset.level;
            btn.addEventListener('click', () => {
                if (level === 'SH_ALL') {
                    ScreenManager.selectLevel(['H1', 'H2', 'H3']);
                } else {
                    ScreenManager.selectLevel([level]);
                }
            });
        });

        console.log('✓ Two-tier menu initialized');
    },

    /**
     * 初始化卡片相關事件
     */
    initCardEvents() {
        // 語速調整
        const speedRange = document.getElementById('speed-range');
        if (speedRange) {
            speedRange.addEventListener('input', (e) => {
                AudioService.setSpeed(e.target.value);
            });
        }
    },

    /**
     * 初始化測驗事件
     */
    initQuizEvents() {
        // 這裡可以加入測驗相關的事件監聽器
    },

    /**
     * 初始化動詞三態事件
     */
    initVerb3Events() {
        // 動詞三態相關事件
    },

    /**
     * 初始化自訂訓練事件
     */
    initCustomTrainingEvents() {
        // 自訂訓練相關事件
    },

    /**
     * 初始化新增/刪除單字事件
     */
    initAddDeleteEvents() {
        // 搜尋過濾
        const deleteSearch = document.getElementById('delete-search');
        if (deleteSearch) {
            deleteSearch.addEventListener('input', () => {
                this.filterDeleteList();
            });
        }
    },

    /**
     * 過濾刪除列表
     */
    filterDeleteList() {
        const searchTerm = document.getElementById('delete-search').value.toLowerCase();
        this.renderDeleteList(searchTerm);
    },

    /**
     * 渲染刪除列表
     */
    renderDeleteList(searchTerm = '') {
        const listEl = document.getElementById('delete-list');
        let wordsToShow = AppState.getUserWords();

        if (searchTerm) {
            wordsToShow = wordsToShow.filter(w =>
                w.english.toLowerCase().includes(searchTerm) ||
                w.translation.includes(searchTerm)
            );
        }

        if (wordsToShow.length === 0) {
            listEl.innerHTML = '<li style="text-align: center; color: #9CA3AF; padding: 20px;">沒有找到單字</li>';
            return;
        }

        listEl.innerHTML = wordsToShow.map(word => `
      <li class="word-list-item">
        <div class="word-info">
          <strong>${word.english}</strong> (${word.pos || 'n/a'})
          <br>
          <span style="color: #6B7280;">${word.translation}</span>
        </div>
        <button class="delete-btn" onclick="deleteUserWord('${word.english}')">刪除</button>
      </li>
    `).join('');
    }
};
