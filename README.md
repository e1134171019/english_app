# 個人英文練習網站

一個專為台灣國高中生設計的離線英文單字學習工具，提供互動式單字卡、聽力測驗、動詞三態練習等多種學習模式。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特色

### 📖 單字練習模式
- **分級學習**：國中 2000 字、高中 6000 字、進階 7000 字
- **細分年級**：國一/國二/國三、高一/高二/高三
- **翻卡設計**：正面顯示中文，背面顯示英文、詞性、音標、解釋、例句
- **互動例句**：點擊例句中的任何單字即時顯示中文翻譯
- **語音朗讀**：使用 Web Speech API 朗讀單字和例句
- **進度追蹤**：顯示當前學習進度（如 3/50）

### 🎧 聽力測驗模式
- **聽音拼字**：點擊喇叭按鈕聽發音，輸入正確拼寫
- **即時反饋**：立即顯示答案正確與否
- **分級測驗**：可選擇不同年級的單字進行測驗

### 🎓 高中進階訓練
- **格林法則**：學習印歐語系輔音演變規律
- **動詞三態**：練習國中/高中常用動詞的過去式和過去分詞

### ✨ 自訂義訓練
- **批次查詢**：一次貼上多個單字，系統自動查詢並分類
- **找到的單字**：顯示完整資訊（詞性、中文、級別）
- **未找到的單字**：列出無法匹配的單字
- **快速啟動**：直接用查詢結果開始單字練習或聽力測驗

### ➕ 新增單字
- **手動新增**：輸入英文、詞性、中文、級別
- **AI 生成**：使用 AI 自動生成完整單字卡（需啟動 API 伺服器）
  - 自動生成音標
  - 自動生成英文解釋
  - 自動生成搭配詞和詞根家族
  - 自動生成例句
- **資料持久化**：自動儲存到 localStorage

### 🗑️ 刪除單字
- **搜尋功能**：快速搜尋要刪除的單字
- **完整資訊**：顯示單字的詳細資訊
- **安全刪除**：確認後刪除用戶新增的單字

## 🚀 快速開始

### 方法一：直接開啟（簡單但有限制）

1. 下載專案檔案
2. 用瀏覽器直接開啟 `new_index.html`
3. 開始使用

⚠️ **注意**：使用 `file://` 協議會有 CORS 限制，部分功能（如 PWA）無法使用。

### 方法二：使用 HTTP 伺服器（推薦）

#### 使用 Python 內建伺服器

```bash
# 進入專案目錄
cd d:\English_app\web

# 啟動 HTTP 伺服器
python -m http.server 8000

# 在瀏覽器開啟
# http://localhost:8000/new_index.html
```

#### 使用 Node.js http-server

```bash
# 安裝 http-server（只需一次）
npm install -g http-server

# 啟動伺服器
http-server -p 8000

# 在瀏覽器開啟
# http://localhost:8000/new_index.html
```

### 方法三：使用 AI 生成功能（完整體驗）

如果要使用 AI 自動生成單字卡功能，需要啟動 API 伺服器：

```bash
# 1. 確保已安裝 Python 依賴
pip install flask flask-cors openai

# 2. 設定環境變數（編輯 .env 檔案）
GITHUB_MODELS_TOKEN=your_token_here
GITHUB_MODELS_ENDPOINT=https://models.inference.ai.azure.com

# 3. 啟動 API 伺服器
python api_server.py

# 4. 在另一個終端啟動 HTTP 伺服器
python -m http.server 8000

# 5. 在瀏覽器開啟
# http://localhost:8000/new_index.html
```

## 📁 專案結構

```
d:\English_app\web\
├── new_index.html          # 主 HTML 檔案
├── style.css               # 主樣式表
├── tooltip_dark.css        # 工具提示樣式
├── main.js                 # 主要 JavaScript 邏輯
├── wordsData.js            # 單字資料庫
├── verb3Data.js            # 動詞三態資料
├── migrate_levels.js       # 資料遷移腳本
├── api_server.py           # Flask API 伺服器（AI 生成）
├── .env                    # 環境變數配置
├── English7000.xlsx        # Excel 單字資料
└── README.md               # 本文件
```

## 🎯 使用指南

### 單字練習

1. 點擊首頁的「📖 單字練習」
2. 選擇學制（國中/高中/進階）
3. 選擇年級（J1/J2/J3 或 H1/H2/H3）
4. 卡片正面顯示中文，點擊「查看英文」翻卡
5. 背面顯示完整資訊，點擊例句中的單字查看翻譯
6. 使用「上一個」/「下一個」按鈕切換單字

### 聽力測驗

1. 點擊首頁的「🎧 聽力測驗」
2. 選擇要測驗的級別
3. 點擊喇叭按鈕聽發音
4. 在輸入框輸入聽到的單字
5. 點擊「送出」查看答案
6. 點擊「下一題」繼續

### 自訂義訓練

1. 點擊首頁的「✨ 自訂義訓練」
2. 在文字框貼上想練習的單字（可用空格、逗號或換行分隔）
3. 點擊「查詢單字」
4. 查看找到的單字和未找到的單字
5. 選擇「用這一批開始單字練習」或「用這一批開始發音測驗」

### 新增單字

#### 手動新增
1. 點擊首頁的「➕ 新增單字」
2. 填寫表單（英文、詞性、中文、級別、例句）
3. 點擊「💾 儲存單字」

#### AI 生成（需啟動 API 伺服器）
1. 確保 API 伺服器正在運行
2. 在新增單字頁面輸入英文單字
3. 系統自動生成完整資訊
4. 確認後儲存

## 🛠️ 技術規格

### 前端技術
- **HTML5**：語義化標籤
- **CSS3**：
  - CSS Variables（主題色彩）
  - Flexbox & Grid 佈局
  - 3D Transform（翻卡效果）
  - 響應式設計（Mobile-first）
- **Vanilla JavaScript**：
  - ES6+ 語法
  - Web Speech API（語音合成）
  - localStorage（資料持久化）
  - 事件委派（Event Delegation）

### 後端技術（可選）
- **Flask**：輕量級 Web 框架
- **OpenAI API**：AI 生成單字卡內容
- **CORS**：跨域資源共享

### 瀏覽器支援
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

⚠️ **注意**：需要支援 Web Speech API 的瀏覽器才能使用語音功能。

## 📊 資料格式

### 單字資料結構

```javascript
{
  word: "example",              // 英文單字
  pos: "n.",                    // 詞性
  chineseFront: "例子",         // 中文翻譯
  level: "J1",                  // 級別
  phonetic: "/ɪɡˈzæm.pəl/",    // 音標
  meaning: "Something that...", // 英文解釋
  collocations: [               // 搭配詞/詞根家族
    "for example (例如)",
    "set an example (樹立榜樣)"
  ],
  sentence1: {                  // 例句
    en: "This is an example.",
    cn: "這是一個例子。"
  }
}
```

### localStorage 資料

- `userWords`：用戶新增的單字
- `blockedWords`：用戶刪除的單字列表

## 🎨 設計特色

### 色彩系統
```css
--primary-color: #6366F1;      /* 主色調 - 靛藍色 */
--primary-dark: #4338CA;       /* 深色主調 */
--bg-color: #F3F4F6;          /* 背景色 - 淺灰 */
--card-bg: #FFFFFF;           /* 卡片背景 - 白色 */
--text-main: #1F2937;         /* 主要文字色 */
--text-secondary: #6B7280;    /* 次要文字色 */
```

### UI/UX 特點
- 🎴 **3D 翻卡動畫**：流暢的卡片翻轉效果
- 💬 **即時工具提示**：點擊單字即時顯示翻譯
- 🔊 **語音朗讀**：可調整語速的 TTS 功能
- 📱 **響應式設計**：完美適配手機、平板、桌面
- 🎯 **直覺操作**：簡潔明瞭的使用者介面

## 🔧 開發指南

### 新增單字資料

編輯 `wordsData.js`：

```javascript
const fullWordList = [
  {
    word: "新單字",
    pos: "n.",
    chineseFront: "中文翻譯",
    level: "J1",
    phonetic: "/音標/",
    meaning: "英文解釋",
    collocations: ["搭配詞1", "搭配詞2"],
    sentence1: {
      en: "英文例句",
      cn: "中文例句"
    }
  },
  // ... 更多單字
];
```

### 修改主題色彩

編輯 `style.css` 的 `:root` 區塊：

```css
:root {
  --primary-color: #your-color;
  --primary-dark: #your-dark-color;
  /* ... 其他顏色 */
}
```

### 新增功能模組

1. 在 `new_index.html` 新增畫面區塊
2. 在 `style.css` 新增樣式
3. 在 `main.js` 新增功能函式
4. 在首頁新增導航按鈕

## 📝 已知限制

1. **Word Family 功能未實作**：原始需求中的單字家族練習和測驗功能尚未開發
2. **隱藏單字功能未實作**：目前只能刪除用戶新增的單字，無法隱藏系統單字
3. **離線 AI 生成**：AI 生成功能需要網路連線和 API 金鑰
4. **瀏覽器限制**：使用 `file://` 協議會有 CORS 限制

## 🚧 未來改進計劃

### 高優先級
- [ ] 實作 Word Family Practice 功能
- [ ] 實作 Word Family Quiz 功能
- [ ] 新增隱藏單字功能（區分刪除和隱藏）
- [ ] 新增 familyId 資料欄位

### 中優先級
- [ ] 新增學習統計功能
- [ ] 新增複習提醒功能
- [ ] 支援匯出/匯入單字列表
- [ ] 新增深色模式

### 低優先級
- [ ] PWA 支援（離線使用）
- [ ] 多語言介面
- [ ] 雲端同步功能

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📄 授權

MIT License

## 👨‍💻 作者

開發於 2025 年

## 🙏 致謝

- 單字資料來源：台灣教育部常用英文單字
- Web Speech API：瀏覽器原生語音合成
- OpenAI API：AI 生成功能

---

**享受學習英文的樂趣！** 🎉
