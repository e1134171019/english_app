# UI 介面設計規範 (Central App Window)

本文件描述「英文練習 English Practice App」的 UI/UX 重構規範。
目標是建立一個「中央視窗化」的介面，在 Desktop 呈現如手機 App 般置中顯示，Mobile 則全螢幕滿版。

## 🎨 設計語言與系統

採用 Material Design 風格，強調卡片式設計、柔和陰影與圓角。

### C. CSS Tokens (:root)

```css
:root {
  /* 色彩系統 */
  --primary: #6366F1;             /* 主色：靛藍 */
  --primary-light: #818CF8;       /* 淺主色 */
  --primary-dark: #4F46E5;        /* 深主色 */
  --on-primary: #FFFFFF;          /* 主色上的文字 */
  
  --bg-app: #FFFFFF;              /* App 本體背景 */
  --bg-shell: #F3F4F6;            /* Shell 外部背景 (Desktop 留白處) */
  --bg-card: #FFFFFF;             /* 卡片背景 */
  
  --text-main: #1F2937;           /* 主要文字 (Gray 800) */
  --text-secondary: #6B7280;      /* 次要文字 (Gray 500) */
  --text-hint: #9CA3AF;           /* 提示文字 (Gray 400) */
  
  --status-success: #10B981;
  --status-error: #EF4444;
  --status-warning: #F59E0B;

  /* 尺寸與間距 */
  --header-height: 60px;
  --bottom-nav-height: 64px;      /* 如有使用 */
  --radius-xl: 20px;              /* 大圓角 (App 容器/主要卡片) */
  --radius-lg: 12px;              /* 一般元件圓角 */
  --radius-md: 8px;               /* 小元件圓角 */
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 陰影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-floating: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* 動畫 */
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## A. 版面結構草圖 (Layout Structure)

應用程式將包覆在一個 `#app-shell` 容器中，實現視窗化效果。

```html
<body>
  <!-- 外部背景層 (在 Desktop 顯示背景色) -->
  <div id="app-shell" class="app-shell">
    
    <!-- 1. 頂部導航列 (Sticky Top) -->
    <header id="topbar" class="app-header">
      <div class="header-left">
        <!-- 返回按鈕 (動態顯示/隱藏) -->
        <button id="global-back-btn" class="icon-btn hidden">
          <span class="material-icons">arrow_back</span>
        </button>
      </div>
      <h1 id="screen-title" class="header-title">英文練習</h1>
      <div class="header-right">
        <!-- 功能選單/設定按鈕 -->
        <button id="menu-btn" class="icon-btn">
          <span class="material-icons">menu</span>
        </button>
      </div>
    </header>

    <!-- 2. 主要內容區 (Scrollable) -->
    <main id="content" class="app-content">
      <!-- 各個 Screen 區塊放置於此 -->
      <section id="home-screen" class="screen active">...</section>
      <section id="practice-screen" class="screen hidden">...</section>
      <!-- ... 其他 screen ... -->
    </main>

    <!-- 3. 底部導航列 (Optional / Sticky Bottom) -->
    <!-- 建議保留，未來可做快速切換，目前可先隱藏或作版權列 -->
    <!-- <nav id="bottom-nav" class="app-bottom-nav">...</nav> -->

  </div>

  <!-- 4. 覆蓋層 (Tooltips, Modals, Toasts) -->
  <div id="overlay-layer">
    <div id="tooltip-container" class="tooltip hidden"></div>
    <div id="toast-container" class="toast-container"></div>
    <div id="ai-modal" class="modal hidden">...</div>
  </div>
</body>
```

**Layout CSS 關鍵:**
- `#app-shell`:
  - `max-width: 480px;`
  - `margin: 0 auto;` (Desktop 置中)
  - `height: 100vh;` (或 `100dvh` for mobile)
  - `display: flex; flex-direction: column;`
  - `background: var(--bg-app);`
  - Desktop 模式下可加 `box-shadow: var(--shadow-floating);` 和 `border-radius: var(--radius-xl);` (需 parent padding)
- `#content`:
  - `flex: 1;`
  - `overflow-y: auto;` (內容捲動)
  - `padding: var(--spacing-md);`

---

## B. 畫面元件清單 (Screen Components)

所有既有 ID 必須保留，結構需優化以符合 CSS Flex/Grid 佈局。

### 1. #home-screen
*   **Layout**: Simple Grid (2 columns on mobile, or 1 column stacked cards)
*   **Elements**:
    *   `.hero-section`: 歡迎標語、今日進度摘要 (Optional)
    *   `.menu-grid`:
        *   `button.menu-card[data-target="level-select-screen"][data-mode="practice"]` (單字練習)
        *   `button.menu-card[data-target="level-select-screen"][data-mode="quiz"]` (發音測驗)
        *   `button.menu-card[data-target="advanced-screen"]` (進階訓練)
        *   `button.menu-card[data-target="add-screen"]` (新增/批次)
        *   `button.menu-card[data-target="delete-screen"]` (刪除)

### 2. #level-select-screen
*   **Elements**:
    *   `h2#level-select-title` (由 header 取代，此元素可隱藏或作為副標題)
    *   `#tier1-selection.tier-container`:
        *   Buttons: `JH` (國中), `SH` (高中), `ADV` (進階) - Style as large selectable cards.
    *   `#tier2-jh.tier-container.hidden`:
        *   Grid Buttons: `J1`, `J2`, `J3`, `JH_ALL`
    *   `#tier2-sh.tier-container.hidden`:
        *   Grid Buttons: `H1`, `H2`, `H3`, `SH_ALL`
    *   `button#tier-back-btn` (Secondary style, "回上一層")

### 3. #practice-screen
*   **Elements**:
    *   `.progress-bar-container`:
        *   `#progress-text` (e.g. "3 / 50")
        *   `.progress-track > .progress-fill`
    *   `.card-container`: (置中、最大高度)
        *   `#flashcard.flashcard`: 
            *   `.card-face.front`: `h2#card-front`, `button.flip-hint-btn`
            *   `.card-face.back`: 
                *   `.card-header`: `#card-english`, `button.icon-btn.speak-btn`
                *   `.card-tags`: `#card-pos`, `#card-level`
                *   `.card-body`: `#card-phonetic`, `#card-translation`
                *   `.card-sentence-box`: `p#card-sentence-en` (with spans), `p#card-sentence-cn`
    *   `.control-bar`:
        *   `button#prevBtn`, `button#auto-play-btn`, `button#nextBtn` (Floating Action Button style for Next?)

### 4. #quiz-screen
*   **Elements**:
    *   `.quiz-header`: `#quiz-current` / `#quiz-total`
    *   `.quiz-main`:
        *   `button#quiz-play-btn` (Large circular button with ripple effect)
    *   `.quiz-input-area`:
        *   `input#quiz-input` (Underline or soft box style)
        *   `button#quiz-submit-btn` (Primary block button)
    *   `#quiz-result`: `.result-icon`, `.result-text`, `#quiz-correct-answer`
    *   `button#quiz-next-btn`

### 5. #advanced-screen
*   **Elements**:
    *   `.tabs-nav`: overflow-x scrollable if needed.
        *   `button.tab-btn` (家族練習 / 家族測驗 / 動詞三態)
    *   `#tab-grimm`: (Content)
    *   `#tab-verb3`: 
        *   `.level-toggles`: 國中 / 高中
        *   `.verb-card`:
            *   `#verb3-base` (Large Display)
            *   Inputs: `#verb3-past-input`, `#verb3-pp-input`
            *   `#verb3-result`
            *   Actions: Submit, Next

### 6. #add-screen
*   **Elements**:
    *   `.section-title`: "✨ 批次查詢 / 帶入"
    *   `.batch-area`:
        *   `textarea#custom-words-input`
        *   `button.action-btn` (查詢)
        *   `#custom-results`: Valid/Invalid counts, and "Start Buttons" group.
    *   `.divider`: "或 手動新增"
    *   `.form-area`:
        *   Inputs: English, POS, Translation, Level (Select), FamilyId
        *   `button#ai-generate-btn` (Feature button)
        *   `button#save-word-btn` (Primary action)

### 7. #delete-screen
*   **Elements**:
    *   `.search-bar`: Sticky top inside screen?
        *   `input#delete-search` (Search icon prefix)
    *   `ul#delete-list.word-list`:
        *   `li.word-list-item`: 
            *   Left: Word info
            *   Right: `button.delete-btn` (Red outline)

---

## D. 互動與狀態

1.  **Screen Transition**:
    *   利用 `.screen.active` 與 `.screen.hidden`。
    *   CSS: 
        ```css
        .screen { opacity: 0; transform: translateY(10px); transition: opacity 0.3s, transform 0.3s; display: none; }
        .screen.active { opacity: 1; transform: translateY(0); display: block; }
        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) { .screen { transition: none; } }
        ```

2.  **Tooltips (#overlay-layer)**:
    *   Absolute positioning based on click coordinates (calculated in JS).
    *   Animation: Pop-in scale.

3.  **Feedback**:
    *   Quiz Correct: Border becomes Green (`var(--status-success)`).
    *   Quiz Wrong: Shake animation + Red border.

這個規範將作為工程實作的基礎藍圖。
