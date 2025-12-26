# English Practice App - Developer Documentation

這份文件詳細說明了系統的技術架構、資料流向 (Pipeline)、模組化設計以及樣式系統。

## 1. 系統架構 (System Architecture)

本專案採用 **模組化 (Modular)** 與 **單頁應用 (SPA)** 架構。

### 核心結構
*   **Core (核心層)**: 管理全域狀態 (`state.js`)、設定 (`config.js`) 與依賴注入容器 (`ServiceContainer.js`)。
*   **Services (服務層)**: 提供共用功能，如資料處理 (`wordService.js`)、音訊 (`audioService.js`)、儲存 (`storageService.js`)、題庫管理 (`DeckService.js`)、AI 翻譯 (`aiService.js`)。
*   **Modules (模組層)**: 每個功能畫面獨立為一個 Controller：
    *   `FlashcardController.js` - 單字練習
    *   `QuizController.js` - 聽力測驗
    *   `Verb3Controller.js` - 動詞三態
    *   `CustomController.js` - 自訂題庫管理
*   **Main (入口)**: `main.js` 作為中央路由器 (Router) 與事件分發器 (Event Delegation)。

---

## 2. 資料管線 (Data Pipeline)

資料從原始檔案流向 UI 的過程如下：

### A. 資料來源 (Source)
*   **檔案**: `data/wordsData.js`
*   **格式**: JSON 陣列，由 Excel 轉換而來。
*   **問題**: 原始資料欄位名稱可能不統一 (例如 `English` vs `english`, `Translation` vs `chineseFront`)。

### B. 資料正規化 (Normalization) - `WordService.js`
為了確保後端資料與前端 UI 對齊，所有資料在進入 App 運算前，都會經過 **正規化** 處理。

```javascript
// WordService.normalizeWord(raw)
{
    english: raw.English || raw.english,      // 統一轉為 english
    translation: raw.Translation || raw.translation,
    exampleEn: raw.example_en || raw.sentence, // 對齊例句欄位
    verb: raw.verb || null,                    // 確保動詞物件存在
    synonyms: raw.synonyms || []               // 確保陣列存在
}
```

### C. 狀態管理 (State) - `AppState`
*   **`activeWordList`**: 經過篩選 (Level/Block) 與正規化後的「當前學習列表」。
*   **`currentIndex`**: 目前學習到第幾個字 (全域指標)。
*   **重要規則**: 模組切換時，必須重置 `currentIndex = 0`，避免索引越界 (Index Out of Bounds) 導致無聲或錯誤。

---

## 3. 模組化與委派設計 (Delegate Pattern)

為了讓 HTML 保持乾淨且不依賴特定模組，我們使用 `main.js` 作為 **委派中心**。

### 運作流程
1.  **HTML**: 使用統一的 `app` 介面。
    ```html
    <button onclick="app.checkQuiz()">送出</button>
    ```
2.  **Main.js (Delegate)**: 轉發給當前活躍的模組。
    ```javascript
    checkQuiz() { 
        this.currentModule?.checkAnswer?.(); 
    }
    ```
3.  **Controller (Implementation)**: 實作具體邏輯。
    ```javascript
    // QuizController.js
    checkAnswer() { ... }
    ```

**優點**: HTML 不需要知道現在是誰在負責 (解耦)，切換模組只需更換 `this.currentModule`。

---

## 4. CSS 設計系統 (Design System)

樣式表 (`styles/app.css`) 採用 CSS Variables (變數) 進行統一管理，確保視覺一致性。

### 核心變數
```css
:root {
  --primary: #6366F1;       /* 主色調 (Indigo) */
  --success: #10B981;       /* 成功色 (Green) */
  --error: #EF4444;         /* 錯誤色 (Red) */
  --bg-surface: #FFFFFF;    /* 卡片背景 */
  --text-main: #1F2937;     /* 主要文字 */
}
```
## UI 系統

### UI 組件
- **screens.js**: 畫面管理器，負責畫面切換
- **dom.js**: DOM 元素管理
- **events.js**: 全域事件處理（已整合到 main.js）
- **toast.js**: 美化的通知系統（替代 alert/confirm）⭐ 新增
- **simpleTooltip.js**: 單字翻譯浮窗（黑底白字）⭐ 新增
### 佈局策略
*   **`.screen`**: 所有功能畫面預設 `display: none`。
*   **`.screen.active`**: 透過 JS 添加 `active` 類別來顯示特定畫面 (`display: block/flex`)。
*   **`.card`**: 統一的卡片陰影與圓角風格。

---

## 5. 功能實作詳解 (Feature Deep Dives)

### 單字練習 (Flashcard Mode)
*   **管線**: Data -> `renderCurrentCard()` -> DOM
*   **資料對齊**:
    *   讀取 `word.exampleEn` 填入 `#card-sentence-en`。
    *   讀取 `word.verb` (Base/Past/PP) 組合 HTML 填入 `#card-related-info`。
*   **音訊**: 透過 `AudioService.speak(text)` 朗讀，解決了舊版API名稱不一致的問題。

### 聽力練習 (Listening Mode)
*   **狀態衝突解決**:
    *   問題：與 Flashcard 共用 `currentIndex`，切換時若未歸零會導致讀取空資料 (無聲)。
    *   解法：在 `onEnter()` 強制執行 `AppState.currentIndex = 0`。
*   **UI 佈局**:
    *   使用 `max-width: 350px` 與 `white-space: nowrap` 確保導覽列水平排列不換行。

### 動詞三態 (Verb3 Mode)
*   **特殊邏輯**:
    *   透過 `WordService` 篩選出 `word.pos` 包含 `v.` 的字。
    *   檢查機制：輸入框 (Input) 與資料庫 `word.verb.past` 比對。
    *   **視覺回饋**: 動態添加 `.success` (綠) 或 `.error` (紅) CSS class 至輸入框。

### 自訂題庫 (Custom Deck Mode)
*   **功能**：
    *   允許使用者輸入自訂單字列表
    *   選擇練習模式（單字練習 / 聽力 / 動詞三態）
    *   題庫 CRUD 管理（建立、讀取、刪除）
*   **資料儲存**：使用 LocalStorage 持久化
*   **驗證機制**：透過 `WordService` 驗證單字是否存在於資料庫

---

## 6. 依賴注入 (ServiceContainer)

採用 Singleton 模式管理所有服務，確保：

```javascript
// ServiceContainer.js
class ServiceContainer {
    constructor() {
        this.services = new Map();
    }
    
    register(name, serviceClass, options) {
        // 註冊服務
    }
    
    get(name) {
        // 取得服務單例
    }
}
```

**優點**：
*   服務只初始化一次（Singleton）
*   Controller 透過容器取得服務（Dependency Injection）
*   易於測試與替換實作
*   避免循環依賴

---

## 7. 事件處理機制

採用**事件委派 (Event Delegation)** 模式：

### 全局事件處理
*   `main.js` 註冊全局點擊監聽器
*   根據 `data-action` 屬性分發事件
*   各 Controller 透過 `window.app.currentModule` 接收委派

### Controller 事件委派
*   各 Controller 在自己的畫面內使用事件委派
*   使用 `addEventListener` 在父元素上監聽
*   透過 `event.target.closest()` 識別目標元素

**範例**：
```javascript
// CustomController.js
registerEventHandlers() {
    this.container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        if (action === 'delete-deck') {
            this.handleDeleteDeck(target);
        }
    }, true);
}
```

---

這份文件旨在協助開發者快速理解系統脈絡，進行維護或擴充功能。

**最後更新**：2025-12-26
