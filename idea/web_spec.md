# 前端規格書 (Frontend Specification)

## 1. 專案簡介
本專案為一個專為台灣國高中生設計的「英文練習」網頁應用程式 (SPA)。目標是提供一個輕量、離線可用、且具備現代化互動體驗的單字學習工具。

### 1.1 目標使用者
- **國中學生**：針對會考範圍（2000 單字），重點在基礎拼寫與聽力。
- **高中學生**：針對學測指考範圍（7000 單字），重點在單字家族變化、同義詞、搭配詞。
- **自學者**：需要一個乾淨、無廣告、可自訂進度的學習工具。

### 1.2 學習目標
- **單字記憶**：透過翻卡模式（Flashcards）強化「英中對照」記憶。
- **聽力訓練**：透過 Web Speech API 進行純聽力測驗。
- **文法/型態**：透過「動詞三態」與「家族字」練習，掌握單字變化規則。
- **客製化**：使用者可匯入學校考試範圍的單字進行集中特訓。

---

## 2. 資料來源與欄位說明
主要資料來源為 `ENGLISH_10000_LEVELED.xlsx`，經由轉換工具轉為 `wordsData.js`。

| 欄位名稱 | 類型 | 說明 | 備註 |
|:--- |:--- |:--- |:--- |
| `word` | String | 英文單字 | 唯一 Key |
| `pos` | String | 詞性 (n., v., adj.) | |
| `translation` | String | 中文翻譯 | |
| `level` | String | 等級標籤 | J1~J3, H1~H3, ADV |
| `school_level` | String | 學制 | JH (國中), SH (高中), ADV (進階) |
| `verb_base` | String | 動詞原形 | 用於三態練習 |
| `verb_past` | String | 動詞過去式 | |
| `verb_pp` | String | 動詞過去分詞 | |
| `family_id` | String | 單字家族 ID | 相同 ID 者為同一家族 |
| `example_en` | String | 英文例句 | 支援點擊單字查翻譯 |
| `example_zh` | String | 例句中文翻譯 | |
| `synonyms` | Array | 同義詞/相似詞 | 未來擴充用 |

---

## 3. 頁面與流程設計

### 3.1 Home / 模式選擇畫面 (`home-screen`)
- **佈局**：
  - 頂部：App 標題 (`<h1>英文練習</h1>`)。
  - 中央：Grid 佈局的選單按鈕。
- **按鈕功能**：
  - `📖 單字練習` → 進入 `level-select-screen` (Mode: `practice`)
  - `🎧 發音測驗` → 進入 `level-select-screen` (Mode: `quiz`)
  - `🔄 動詞三態 / 格林法則` → 進入 `verb3-screen`
  - `⚙️ 自訂 / 進階訓練` → 進入 `custom-training-screen`
  - `➕ 新增單字` → 進入 `add-screen`
  - `🗑️ 刪除 / 隱藏單字` → 進入 `delete-screen`

### 3.2 等級選擇畫面 (`level-select-screen`)
- **第一層 (Tier 1)**：
  - 按鈕：「國中 (Junior High)」、「高中 (Senior High)」、「進階 (Advanced)」
- **第二層 (Tier 2)**：
  - 若選國中 → 顯示：J1, J2, J3, 國中全部
  - 若選高中 → 顯示：H1, H2, H3, 高中全部
- **邏輯**：選擇後，根據當前 Mode (`practice` 或 `quiz`) 導向對應畫面，並設定 `AppState.activeWordList`。

### 3.3 單字卡練習模式 (`practice-screen`)
- **介面**：
  - **頂部**：進度條 / 頁碼 (e.g., "5 / 100")。
  - **中間 (卡片)**：
    - 正面：大字體中文。
    - 點擊「查看英文」或卡片本體 → 翻轉 (CSS 3D Transform)。
    - 背面：英文單字、音標、詞性、例句區塊。
  - **底部**：控制列 (上一個、播放發音、自動播放開關、下一個)。
- **互動**：
  - **翻卡**：點擊卡片翻面。
  - **例句點擊**：點擊例句中的單字 (`.word-token`)，顯示懸浮翻譯 (`Tooltip`)。
  - **鍵盤快捷鍵**：左右鍵切換，空白鍵翻面/發音。

### 3.4 聽力測驗模式 (`quiz-screen`)
- **介面**：
  - 中央顯示大喇叭圖示。
  - 下方輸入框 (`input`)。
  - 「送出」與「跳過」按鈕。
- **流程**：
  1. 自動播放單字讀音。
  2. 使用者輸入拼寫。
  3. Enter 或點擊送出。
  4. 判定：
     - 正確：顯示綠色勾勾，播放「叮」效效 (可選)，顯示完整單字資訊。
     - 錯誤：顯示紅色叉叉，並顯示正確拼寫與 Diff。
  5. 點擊「下一題」。

### 3.5 動詞三態訓練模式 (`verb3-screen`)
- **Tab 切換**：動詞三態 / 格林法則 (暫保留)。
- **三態練習**：
  - 顯示：動詞原形 (Base)。
  - 輸入：過去式 (Past) & 過去分詞 (PP)。
  - 檢查：需兩者皆對才算通過。
  - 支援不規則變化 (如 `go -> went -> gone`) 與 A-A-A, A-B-B 等規則提示 (未來擴充)。

### 3.6 自訂單字 / 匯入清單 (`custom-training-screen`)
- **功能**：
  - 文字區域 (`textarea`) 供使用者貼上單字列表 (支援逗號、換行分隔)。
  - 按鈕「查詢並建立練習」。
- **邏輯**：
  - 解析輸入字串 -> 查詢 `wordsData`。
  - 分類為「有效單字」與「無效單字」。
  - 將有效單字設為 `activeWordList`，進入練習或測驗模式。

---

## 4. UI / 設計風格規格

### 4.1 整體風格
- **設計語言**：Material Design 簡約風格。
- **配色**：
  - 主色 (Primary): Indigo-500 (`#6366F1`) - 用於主要按鈕、標題。
  - 背景 (Background): Gray-100 (`#F3F4F6`)。
  - 卡片 (Surface): White (`#FFFFFF`)。
  - 成功 (Success): Emerald-500 (`#10B981`)。
  - 錯誤 (Error): Red-500 (`#EF4444`)。
- **字體**：
  - 英文：Inter, Roboto, Segoe UI。
  - 中文：微軟正黑體 (Microsoft JhengHei), Noto Sans TC。

### 4.2 卡片排版
- **陰影**：`box-shadow: 0 10px 30px rgba(0,0,0,0.1)` 營造浮動感。
- **圓角**：`border-radius: 20px`。
- **標籤**：Level 標籤使用 Pill Shape (圓角矩形)，背景色為淺灰，文字深灰。

### 4.3 RWD 響應式策略
- **Mobile (< 640px)**:
  - 選單：`grid-template-columns: 1fr` (單欄)。
  - 卡片高度：`520px` (配合手機視窗)。
  - 字體：標題縮小至 `2.2rem`。
  - 操作：按鈕增大，方便手指點擊。
- **Tablet (640px - 1024px)**:
  - 選單：`grid-template-columns: repeat(2, 1fr)`。
  - 卡片：置中，寬度 `80%`。
- **Desktop (> 1024px)**:
  - 佈局：最大寬度限制在 `480px` (彷彿 App 介面) 或是並排顯示統計資訊 (側邊欄)。
  - 目前設計採「中央 App 視窗化」，背景可留白或顯示裝飾。

---

## 5. 功能規格與互動細節

### 5.1 導航與狀態
- **`ScreenManager`**：負責切換 `.screen` 的 `hidden`/`active` class。
- **History API**：目前為純 SPA，未實作前端路由 (Hash Router)，重新整理會回到首頁 (未來可優化)。

### 5.2 錯誤處理
- **API 失敗**：若 AI 生成服務 (`api_server.py`) 未啟動，前端 fetch 失敗應 catch error 並 `alert('無法連接 AI 服務')`，不應卡死介面。
- **Excel 讀取失敗**：`exportWordsFromExcel.js` 為 Build time 工具，若失敗則無法產出 `wordsData.js`，前端會顯示空白或舊資料。

---

## 6. 技術棧與架構

### 6.1 前端架構 (Vanilla JS Modules)
採用 ES Modules 標準，無 bundle (開發階段)，直接由瀏覽器載入。

- `core/`
  - `state.js`: 透過 Proxy 或 Singleton 管理全域狀態 (`AppState`)。
  - `config.js`: 全域常數 (`MAX_WORDS`, `API_URL`)。
- `services/`
  - `wordService.js`: 單字搜尋、過濾、CRUD 邏輯。
  - `audio.js`: `window.speechSynthesis` 封裝。
  - `storage.js`: `localStorage` 存取封裝。
  - `aiService.js`: `fetch` 呼叫後端 API。
- `ui/`
  - `dom.js`: 封裝 `document.getElementById` 與常用的 DOM 更新函式。
  - `events.js`: 集中管理 `addEventListener`，使用 Event Delegation。
  - `screens.js`: 控制畫面顯示/隱藏與特定畫面的初始化邏輯。

### 6.2 後端 (Optional)
- **Python Flask (`api_server.py`)**：
  - 提供 `/api/generate-card` 接口。
  - 串接 OpenAI / Azure Models 來生成單字詳情。

---

## 7. 設定與環境變數

前端設定位於 `core/config.js`，敏感設定位於 `.env` (後端用)。

### 7.1 前端 Config
- `TTS_RATE`: 語音速度預設 `0.8`。
- `PASSING_SCORE`: 測驗通過分數 `60`。

### 7.2 後端 Env
檔案：`.env`
- `GITHUB_MODELS_TOKEN`: AI 服務 Token。
- `GITHUB_MODELS_ENDPOINT`: AI 服務端點。

---

## 8. 部署與 GitHub Actions

### 8.1 部署策略
- **Target**: GitHub Pages。
- **Source**: `web/` 目錄。
- **Build**: 由於是原生 JS，無需 Webpack/Vite Build，直接部署原始檔即可 (或透過 Action 執行 Excel 轉 JSON 的腳本)。

### 8.2 GitHub Actions Workflow (概念)
1. **Trigger**: Push to `main` branch.
2. **Step 1**: Checkout code.
3. **Step 2**: Setup Node.js.
4. **Step 3**: Run `node tools/exportWordsFromExcel.js` (若 Excel 有更新，重新產出 JSON)。
5. **Step 4**: Deploy `web/` folder to `gh-pages` branch.

---
*這份文件定義了「英文練習」App 的開發規範與未來藍圖。*
