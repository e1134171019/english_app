# 英文練習 Web App (English Practice App)

這是一個專為英語學習設計的 Web 應用程式，專注於單字記憶、聽力練習與動詞三態變化的訓練。
專案採用純前端技術 (HTML/CSS/JS) 構建，強調簡潔、高效與行動裝置友善 (Mobile-First) 的操作體驗。

## 📅 專案狀態 (Project Status)

| 功能模組 | 代號 | 狀態 | 說明 |
| :--- | :--- | :--- | :--- |
| **導航與架構** | TS-01 | ✅ 完成 | 層級選單 (學制 -> 等級) 導航邏輯驗證通過。 |
| **資料完整性** | TS-02 | ✅ 完成 | 透過 Python 轉換腳本自動生成 `wordsData.js`，包含三態與例句。 |
| **底部功能鍵** | TS-23 | ✅ 完成 | 實作全寬懸浮返回鍵 (Floating Back Btn)，解決與控制列重疊問題。 |
| **單字練習** | TS-03 | ✅ 完成 | **翻卡互動**：分區顯示例句 (英/中獨立)，點擊單字即時發音。**智慧查詢**：點擊單字顯示中文翻譯 (支援雲端補完)。**版面優化**：相關詞水平排列，按鈕置中。 |
| **聽力練習** | TS-04 | ⏳ 待測 | 聽音拼字測驗模式。 |
| **動詞三態** | TS-13 | ⏳ 待測 | 動詞變化的專項訓練。 |
| **客製化訓練** | TS-18 | ⏳ 待測 | 支援使用者匯入自定義單字列表。 |

---

## 🚀 核心功能 (Core Features)

### 1. 單字練習模式 (Vocabulary Practice)
- **多層級選單**：支援 國中 (JH)、高中 (SH)、進階 (ADV) 三大學制。
- **智慧翻卡介面**：
    - **正面**：簡潔顯示中文釋義。
    - **背面**：豐富資訊整合，包含詞性、音標、**分區例句** (英文/中文獨立顯示)。
- **互動式學習 (New!)**：
    - **點擊即讀**：點擊例句中的任何單字，立即朗讀該字發音。
    - **智慧翻譯**：點擊單字浮現中文釋義。若本地無資料，自動透過 **MyMemory API** 進行雲端查詢。
    - **三態/相關詞**：點擊 Verb 3 或 Synonyms 也具備同樣的發音與翻譯功能。
- **TTS 語音**：支援單字朗讀 (大喇叭) 與例句朗讀 (小喇叭)。

### 2. 資料處理 (Data Pipeline)
- **Python 自動化**：使用 `convert_excel_to_js.py` 將 Excel 為主的單字庫自動轉換為 Web 可用的 JSON 物件，確保資料結構統一。

### 2. 聽力測驗模式 (Listening Check)
- **聽音辨位**：隱藏單字文字，僅播放發音，測試拼寫能力。
- **即時回饋**：輸入後立即判定對錯，並提供正確答案對照。

### 3. 動詞三態訓練 (Verb Forms)
- **不規則動詞**：專注於 Past Tense (過去式) 與 Past Participle (過去分詞) 的變化記憶。
- **格林法則**：(規劃中) 引入語音變化的規則提示。

### 4. 我的專屬 (Custom Training)
- **自訂字庫**：允許貼上文章或單字清單，自動過濾並生成專屬練習組。
- **重點複習**：針對錯誤率高的單字進行加強。

---

## 🛠️ 技術架構 (Tech Stack)

- **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), Vanilla JavaScript (ES6+ Module)
- **Data**: JSON-like JS Objects (`wordsData.js`, `verb3Data.js`)
- **Storage**: LocalStorage (使用者設定與進度保存)
- **Audio**: Browser Web Speech API
- **Cache Control**: 透過 URL Versioning (`?v=timestamp`) 強制瀏覽器更新 CSS/JS，避免快取舊檔與測試干擾。

## 📂 檔案結構
```text
d:\English_app\
│
├── 📄 主要文件
│   ├── new_index.html       # 應用程式主入口 (Single Page Application)
│   ├── main.js              # 核心邏輯控制器與路由器
│   ├── package.json         # NPM 專案配置
│   ├── package-lock.json    # NPM 鎖定文件
│   ├── vitest.config.js     # 單元測試配置
│   └── web.code-workspace   # VS Code 工作區設定
│
├── 📚 文檔
│   ├── README.md            # 專案說明（本文件）
│   ├── README_DEV.md        # 開發者技術文檔
│   └── 使用流程_v2.md       # 使用者操作手冊
│
├── 🎨 樣式
│   └── styles/
│       └── app.css          # 主樣式表（CSS Variables + RWD）
│
├── 🎮 功能模組
│   └── modules/
│       ├── FlashcardController.js   # 單字練習控制器
│       ├── QuizController.js        # 聽力測驗控制器
│       ├── Verb3Controller.js       # 動詞三態控制器
│       └── CustomController.js      # 自訂題庫控制器
│
├── ⚙️ 服務層
│   └── services/
│       ├── audioService.js          # TTS 語音服務
│       ├── storageService.js        # LocalStorage 資料持久化
│       ├── wordService.js           # 單字處理與篩選
│       ├── DeckService.js           # 自訂題庫 CRUD
│       ├── aiService.js             # AI 翻譯服務
│       └── ServiceContainer.js      # 依賴注入容器
│
├── 🧭 路由
│   └── router/
│       └── startMode.js             # 模式啟動與導航邏輯
│
├── 🔧 核心
│   └── core/
│       ├── state.js                 # 全域狀態管理
│       ├── config.js                # 應用配置常量
│       └── ServiceContainer.js      # 服務容器實例
│
├── 🎨 UI 組件
│   └── ui/
│       ├── dom.js                   # DOM 操作工具
│       ├── TooltipManager.js        # 翻譯提示彈窗
│       └── screens.js               # 畫面管理器
│
├── 📊 資料
│   └── data/
│       ├── wordsData.js             # 核心單字庫（8,656 字）
│       ├── wordsData.json           # JSON 格式單字庫
│       └── verb3Data.js             # 動詞三態資料
│
├── 🧪 測試
│   └── tests/
│       ├── setup.js                 # Vitest 測試環境設定
│       ├── setupFetch.js            # Fetch API Mock
│       ├── unit/                    # 單元測試
│       │   ├── wordService.test.js
│       │   ├── wordService.token.test.js
│       │   ├── tooltipManager.test.js
│       │   └── tooltipManager.timeout.test.js
│       └── fixtures/                # 測試資料
│           └── testWords.json
│
├── 📋 規劃文檔
│   └── idea/
│       └── TESTING.md               # 測試完整指南
│
├── 🐍 Python 工具
│   ├── convert_excel_to_js.py       # Excel 轉 JSON 工具
│   ├── api_server.py                # AI API 服務器（可選）
│   ├── requirements.txt             # Python 依賴
│   └── ENGLISH_10000_LEVELED.xlsx   # 原始單字庫 Excel
│
├── 🔧 配置
│   ├── .gitignore                   # Git 忽略規則
│   └── .git/                        # Git 版本控制
│
└── 📦 依賴
    └── node_modules/                # NPM 套件（自動生成）
```

### 目錄說明

#### 核心目錄（必需）
- **modules/**：功能模組，每個 Controller 對應一個功能畫面
- **services/**：服務層，提供共用的業務邏輯
- **core/**：核心配置與狀態管理
- **data/**：單字資料庫

#### UI 與路由
- **ui/**：UI 工具與組件
- **router/**：路由與模式切換邏輯
- **styles/**：CSS 樣式表

#### 功能特色

- **多等級單字庫**：國中、高中、進階單字，共 8656 個單字
- **多種練習模式**：
  - 單字卡片（FlashCard）
  - 發音測驗（Quiz）
  - 動詞三態（Verb3）
  - 自訂題庫（Custom Deck）
- **智能互動**：
  - 點擊例句中的藍色單字顯示中文翻譯（黑底浮窗）
  - 單字發音（Text-to-Speech）
  - AI 生成例句（本地模型）
- **美化 UI**：
  - Toast 通知系統（漸層色彩、中央顯示）
  - 響應式設計（RWD）
  - Material Design 風格
- **自訂題庫**：輸入單字建立個人化題庫
- **總單字數**：8,656 個

---

#### 開發與測試
- **tests/**：單元測試（Vitest）
- **idea/**：規劃與測試文檔

#### 輔助工具
- **Python 工具**：資料轉換與 AI 服務
- **配置文件**：專案設定

### 檔案統計
- **JavaScript 文件**：~25 個
- **測試文件**：6 個
- **文檔文件**：4 個
- **總單字數**：8,656 個

---

## 📝 更新日誌 (Changelog)

### 2025-12-27 - UI 優化與布局改進
- **單字練習模式**：
  - ✅ 調整 Flashcard 高度為 45vh，解決卡片過小或溢出問題
  - ✅ 移除固定 aspect-ratio 限制，採用響應式高度設計
  - ✅ 優化垂直間距，實現上下邊界平衡置中
  - ✅ 字體放大至 4rem，提升可讀性
  
- **控制按鈕美化**：
  - ✅ 左右箭頭按鈕：漸層背景、立體陰影、hover 動畫效果
  - ✅ 自動播放按鈕：圓角邊框、柔和陰影、smooth transitions
  - ✅ 按鈕尺寸優化（52px）與間距調整（40px）
  
- **自訂題庫**：
  - ✅ 重構為水平單行佈局（題庫資訊 + 操作按鈕）
  - ✅ 修復 deckId 讀取邏輯錯誤
  - ✅ 動態渲染對應模式按鈕（單字練習/聽力練習/動詞三態）

### 2025-12-27 (晚) - 導航與 Quiz 修復
- **自訂題庫返回導航**：
  - ✅ 修復從「我的專屬」啟動練習後返回鍵跳轉錯誤
  - ✅ 新增 `AppState.currentSource` 追蹤來源（custom/system）
  - ✅ 修正 `startMode.js` 的 deckId 格式檢查（`custom:` 而非 `custom-`）
  - ✅ 實施完整的 ES Module 版本控制鏈（防止瀏覽器快取）

- **Quiz 聽力練習**：
  - ✅ 修復垂直居中失效（`display: block` 改為 `display: flex`）
  - ✅ Quiz 內容現在正確置中顯示
  - ✅ 修正 Quiz 結束導航邏輯（根據 `currentSource` 返回正確畫面）
  - ✅ 最後一題點擊「下一題」改為無動作（移除 alert 和跳轉）

### 2025-12-27 (深夜) - 動詞三態驗證
- **詞性過濾**：
  - ✅ 新增 `isVerb()` 和 `filterVerbs()` 詞性驗證函數
  - ✅ 動詞三態模式只接受動詞（vt., vi., v.）
  - ✅ 自動過濾名詞、形容詞、副詞等非動詞
  
- **錯誤訊息**：
  - ✅ 明確顯示被排除的單字類型（例如："apple 是名詞，不是動詞"）
  - ✅ 新增 `Toast.warning()` 警告提示（橙粉色漸層）
  - ✅ 若無動詞則顯示錯誤：「沒有找到任何動詞！動詞三態練習需要動詞。」

*文件最後更新時間：2025-12-27*
