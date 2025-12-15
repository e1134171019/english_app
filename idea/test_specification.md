# 測試規格書 (Test Specification)

## 版本資訊
- **文件版本**: 1.0
- **建立日期**: 2025-12-16
- **測試框架**: Vitest + Playwright
- **測試範圍**: 8-12 個冒煙測試（Smoke Tests）

---

## 測試目標

### 核心目的
在 DI/IoC 重構完成後，鎖住關鍵使用者流程，防止改一處壞一片的回歸問題。

### 重點測試區域
1. **資料管線**: WordService 載入 + Schema 正規化
2. **互動流程**: Token 點擊 → Tooltip + 發音
3. **事件委派**: 避免誤觸發（不翻卡片）

---

## 測試環境

### 單元測試 (Unit Tests)
- **運行環境**: jsdom
- **目的**: 測試資料邏輯、DOM 生成
- **執行速度**: < 5 秒

### 瀏覽器測試 (Browser Tests)
- **運行環境**: Chromium (via Playwright)
- **目的**: 測試真實互動、可見性、定位
- **執行速度**: < 30 秒

---

## 測試案例清單

### 🔴 Critical - 必須通過才能部署

#### TC-001: WordService 資料載入與正規化
**測試檔案**: `tests/unit/wordService.test.js`

**前置條件**:
- wordsData.json 存在且有效

**測試步驟**:
```javascript
1. 呼叫 WordService.init()
2. 等待 Promise resolve
3. 檢查 WordService.wordsData
```

**驗收條件**:
- [ ] `wordsData.length > 0`
- [ ] 第一筆資料包含 `english` 屬性
- [ ] 第一筆資料包含 `translation` 屬性（非空）
- [ ] 第一筆資料包含 `pos` 屬性
- [ ] 第一筆資料包含 `exampleEn` 屬性
- [ ] Console 無錯誤

**Mock 需求**: 無（使用真實 JSON）

---

#### TC-002: tokenizeSentence 產生可點擊 Token
**測試檔案**: `tests/unit/wordService.test.js`

**前置條件**: 
- WordService 已載入

**測試步驟**:
```javascript
1. 準備測試句子："I need a pen"
2. 呼叫 WordService.tokenizeSentence(sentence)
3. 檢查回傳的 HTML 字串
```

**驗收條件**:
- [ ] 回傳值包含 `class="interactive-word"`
- [ ] 每個單字被 `<span>` 包裝
- [ ] 包含 `onclick` 或 `data-word` 屬性
- [ ] 單字文本保持完整（"need" 存在）

**Mock 需求**: 無

---

#### TC-003: TooltipManager.show() 顯示邏輯
**測試檔案**: `tests/unit/tooltipManager.test.js`

**前置條件**:
- TooltipManager 已初始化
- DOM 中存在 `#translation-tooltip` 元素

**測試步驟**:
```javascript
1. Mock wordService.searchWords() 回傳固定翻譯
2. Mock audioService.speakText()
3. 呼叫 manager.show('test', { x: 100, y: 100 })
4. 檢查 tooltip 元素
```

**驗收條件**:
- [ ] Tooltip 元素加上 `visible` class
- [ ] Tooltip 文本包含 "test"（英文）
- [ ] Tooltip 文本包含翻譯（中文）
- [ ] `audioService.speakText()` 被呼叫 1 次
- [ ] `audioService.speakText()` 參數為 "test"

**Mock 策略**:
```javascript
const mockServices = {
  wordService: {
    searchWords: vi.fn().mockReturnValue({
      validWords: [{ english: 'test', translation: '測試' }]
    })
  },
  audioService: {
    speakText: vi.fn()
  }
};
```

---

#### TC-004: Tooltip 自動隱藏（3 秒）
**測試檔案**: `tests/unit/tooltipManager.test.js`

**前置條件**:
- TooltipManager 已顯示 tooltip

**測試步驟**:
```javascript
1. 啟用 Fake Timers (vi.useFakeTimers())
2. 呼叫 manager.show('word', position)
3. 確認 tooltip 可見
4. 快進時間 3000ms
5. 檢查 tooltip 狀態
6. 恢復真實時間
```

**驗收條件**:
- [ ] T=0: tooltip 有 `visible` class
- [ ] T=3000ms: tooltip 無 `visible` class
- [ ] hideTimer 已清除

**Mock 需求**: Fake Timers

---

#### TC-005: 點擊 Token 觸發 Tooltip（整合測試）
**測試檔案**: `tests/browser/tokenClick.test.js`

**前置條件**:
- 應用程式已啟動
- 已進入單字練習模式

**測試步驟**:
```javascript
1. 導航到首頁 (localhost:8085)
2. 點擊「單字練習」
3. 選擇等級 J2
4. 點擊「開始練習」
5. 等待卡片渲染
6. 點擊例句中第一個 .interactive-word
7. 檢查 tooltip 顯示
```

**驗收條件**:
- [ ] Tooltip 在 500ms 內可見
- [ ] Tooltip 包含被點擊的英文單字
- [ ] Tooltip 包含中文翻譯（Unicode 範圍 \\u4e00-\\u9fa5）
- [ ] Tooltip 位置接近點擊位置

**環境**: 真實瀏覽器（Playwright）

---

#### TC-006: 點擊 Token 不觸發卡片翻轉
**測試檔案**: `tests/browser/flashcard.test.js`

**前置條件**:
- 已進入單字練習模式
- 卡片未翻轉（無 `flipped` class）

**測試步驟**:
```javascript
1. 定位 #flashcard 元素
2. 記錄初始 class 列表
3. 點擊 .interactive-word
4. 等待 500ms
5. 檢查卡片 class
```

**驗收條件**:
- [ ] 點擊前：卡片無 `flipped` class
- [ ] 點擊後：卡片仍無 `flipped` class
- [ ] Tooltip 正常顯示（不影響卡片）

**失敗情境**: 事件冒泡未正確阻止

---

### 🟡 Important - 強烈建議通過

#### TC-007: 點擊 Token 觸發發音
**測試檔案**: `tests/browser/audio.test.js`

**前置條件**:
- 瀏覽器允許音訊播放

**測試步驟**:
```javascript
1. Inject spy 到 window.speechSynthesis.speak
2. 點擊 token "example"
3. 檢查 spy 呼叫記錄
```

**驗收條件**:
- [ ] `speechSynthesis.speak()` 被呼叫
- [ ] 傳入的 SpeechSynthesisUtterance.text = "example"
- [ ] 語言設為 'en-US'

**Mock 策略**:
```javascript
await page.evaluate(() => {
  window._speechCalls = [];
  const original = window.speechSynthesis.speak;
  window.speechSynthesis.speak = function(utterance) {
    window._speechCalls.push({
      text: utterance.text,
      lang: utterance.lang
    });
    original.call(this, utterance);
  };
});
```

---

#### TC-008: FlashcardController 渲染正確欄位
**測試檔案**: `tests/unit/flashcardController.test.js`

**前置條件**:
- FlashcardController 已初始化
- DOM 包含卡片元素

**測試步驟**:
```javascript
1. 準備 mock word 資料
2. Mock services (wordService, audioService)
3. 呼叫 FlashcardController.renderCard()
4. 檢查 DOM 元素
```

**Mock 資料**:
```javascript
const mockWord = {
  english: 'abandon',
  translation: '放棄',
  pos: 'v.',
  phonetic: '/əˈbændən/',
  exampleEn: 'They had to abandon their car.',
  exampleZh: '他們不得不放棄他們的車。',
  level: 'H2'
};
```

**驗收條件**:
- [ ] `#card-front-text` 顯示 "放棄"（中文）
- [ ] `#card-back-text` 顯示 "abandon"（英文）
- [ ] `#card-pos` 顯示 "v."
- [ ] `#card-phonetic` 顯示 "/əˈbændən/"
- [ ] `#card-sentence-en` 包含例句
- [ ] `#card-level-badge` 顯示 "H2"

---

#### TC-009: 點擊按鈕不觸發卡片翻轉
**測試檔案**: `tests/browser/eventDelegation.test.js`

**前置條件**:
- 卡片已渲染，處於正面

**測試步驟**:
```javascript
1. 定位發音按鈕 [data-action="speak-word"]
2. 點擊按鈕
3. 檢查卡片狀態
```

**驗收條件**:
- [ ] 卡片保持正面（無 `flipped`）
- [ ] 發音功能正常觸發
- [ ] 其他按鈕（上一個/下一個）點擊也不翻轉

---

### 🟢 Nice to Have - 可選

#### TC-010: Verb3 三態顯示
**測試檔案**: `tests/unit/verb3Controller.test.js`

**Mock 資料**:
```javascript
const verbWord = {
  english: 'go',
  verb: { base: 'go', past: 'went', pp: 'gone' }
};
```

**驗收條件**:
- [ ] 三態資訊正確渲染
- [ ] 格式為 "go > went > gone"

---

#### TC-011: CustomController 匯入單字
**測試檔案**: `tests/unit/customController.test.js`

**測試步驟**:
```javascript
1. 模擬用戶輸入單字清單
2. 呼叫 importWords()
3. 檢查清單建立
```

**驗收條件**:
- [ ] 清單儲存到 localStorage
- [ ] UI 更新顯示新清單

---

#### TC-012: 多次點擊 Token 不重複觸發
**測試檔案**: `tests/browser/debounce.test.js`

**測試步驟**:
```javascript
1. 快速點擊同一 token 3 次
2. 檢查發音呼叫次數
```

**驗收條件**:
- [ ] `speakText()` 只被呼叫 1 次（防抖）

---

## Mock 策略總覽

### WordService Mock
```javascript
const mockWordService = {
  wordsData: [/* test data */],
  searchWords: vi.fn(),
  tokenizeSentence: vi.fn(),
  getActiveProcessingWords: vi.fn()
};
```

### AudioService Mock
```javascript
const mockAudioService = {
  speakText: vi.fn(),
  speak: vi.fn(),
  cancelSpeech: vi.fn()
};
```

### AIService Mock
```javascript
const mockAIService = {
  generateCard: vi.fn().mockResolvedValue({
    english: 'test',
    translation: '測試'
  })
};
```

---

## 測試執行策略

### 本地開發
```bash
# 持續監聽模式
npm test -- --watch

# 單一文件
npm test -- tests/unit/wordService.test.js

# 瀏覽器測試（互動式）
npm run test:browser -- --ui
```

### CI/CD
```bash
# 所有測試（無 UI）
npm test -- --run

# 產生覆蓋率報告
npm test -- --coverage
```

---

## 成功標準

### 最低通過標準（部署前）
- ✅ TC-001 ~ TC-006 全過（Critical）
- ✅ 測試執行時間 < 30 秒
- ✅ 無 flaky tests（3 次執行結果一致）

### 理想標準
- ✅ TC-001 ~ TC-009 全過
- ✅ 程式碼覆蓋率 > 60%（核心邏輯）
- ✅ 瀏覽器測試穩定執行

---

## 測試資料準備

### 測試用 JSON（精簡版）
`tests/fixtures/testWords.json`:
```json
[
  {
    "english": "test",
    "translation": "測試",
    "pos": "n.",
    "exampleEn": "This is a test.",
    "exampleZh": "這是一個測試。",
    "level": "J1"
  },
  {
    "english": "example",
    "translation": "範例",
    "pos": "n.",
    "exampleEn": "Can you give me an example?",
    "exampleZh": "你能給我一個範例嗎？",
    "level": "J2"
  }
]
```

---

## 已知限制

### 無法測試的項目
1. **真實音訊播放**: CI 環境無音效卡，只測呼叫
2. **AI API 回應**: 需 mock，不測真實 API
3. **Service Worker 快取**: 需專門測試套件

### 測試環境差異
- **jsdom**: 無法測 CSS layout、`getBoundingClientRect()`
- **Playwright**: 啟動慢（~2 秒），適合整合測試

---

## 下一步

✅ **規格已完成**，等待確認後：
1. 建立 `package.json`（如不存在）
2. 安裝 Vitest + Playwright
3. 建立測試骨架檔案
4. 執行第一個測試（TC-001）
