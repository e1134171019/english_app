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
/web
├── new_index.html       # 應用程式主入口 (Single Page Application)
├── style.css            # 全域樣式與 RWD 設計
├── main.js              # 核心邏輯控制器 (Controller)
├── /data
│   ├── wordsData.js     # 核心單字庫
│   └── verb3Data.js     # 動詞三態資料庫
├── /services
│   ├── audio.js         # TTS語音服務
│   ├── storage.js       # 資料存取服務
│   └── wordService.js   # 單字處理邏輯
└── /core
    ├── config.js        # 全域設定
    └── state.js         # 狀態管理
```

---

*文件最後更新時間：2025-12-14*
