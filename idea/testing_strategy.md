# 分層測試策略

## 測試分層原則

根據 Vitest 最佳實踐，我們採用以下分層策略：

### Layer 1: 單元測試（jsdom）
**環境**: `environment: 'jsdom'`  
**速度**: 快速（< 10 秒）

**測試範圍**:
- ✅ DOM 生成邏輯（tokenizeSentence 產生 HTML）
- ✅ 資料處理（WordService normalize）
- ✅ Class state 管理（Tooltip visible/hidden）
- ✅ 簡單互動（show/hide API 呼叫）

**不適合測試**:
- ❌ CSS Layout / `getBoundingClientRect()`
- ❌ 真實點擊事件冒泡
- ❌ 音訊播放
- ❌ 複雜 DOM 定位

---

### Layer 2: 瀏覽器測試（Browser Mode）
**環境**: `--browser` (Playwright)  
**速度**: 較慢（~30 秒）

**測試範圍**:
- ✅ 使用者點擊流程（Token → Tooltip → 發音）
- ✅ 事件委派（確認不誤觸發）
- ✅ Tooltip 定位與可見性
- ✅ 卡片翻轉邏輯
- ✅ 發音 API 呼叫（mock speechSynthesis）

**何時使用**: 
整合測試、端到端用戶流程驗證

---

## 測試案例分配

### jsdom 測試（快速冒煙）

#### TC-001: WordService 資料載入 ✅
```javascript
// tests/unit/wordService.test.js
- ✓ should load data successfully
- ✓ should normalize schema correctly
- ✓ should handle schema variations
```

#### TC-002: tokenizeSentence Token 生成
```javascript
// tests/unit/wordService.token.test.js
- [ ] should create interactive tokens
- [ ] should preserve word text
- [ ] should handle empty sentence
```

#### TC-003: TooltipManager State
```javascript
// tests/unit/tooltipManager.test.js
- [ ] show() adds visible class
- [ ] show() sets correct text content
- [ ] hide() removes visible class
- [ ] hide timer clears correctly
```

#### TC-004: Tooltip 自動隱藏（Fake Timers）
```javascript
// tests/unit/tooltipManager.timeout.test.js
- [ ] auto-hides after 3 seconds
- [ ] clearTimeout on manual hide
```

---

### Browser 測試（真實互動）

#### TC-005: Token 點擊 → Tooltip 顯示
```javascript
// tests/browser/tokenClick.test.js
- [ ] clicking token shows tooltip
- [ ] tooltip contains word + translation
- [ ] tooltip positioned near click
```

#### TC-006: Token 點擊 → 發音觸發
```javascript
// tests/browser/audio.test.js
- [ ] speechSynthesis.speak() called
- [ ] with correct word text
- [ ] language set to 'en-US'
```

#### TC-007: 事件不誤觸發
```javascript
// tests/browser/eventDelegation.test.js
- [ ] clicking token does NOT flip card
- [ ] clicking button does NOT flip card
- [ ] clicking card DOES flip card
```

---

## Mock 策略

### Global Mocks (setupFetch.js)
```javascript
// 所有測試共用
- fetch() → wordsData.json fixture
```

### Test-Specific Mocks
```javascript
// TooltipManager 測試
const mockServices = {
  wordService: { searchWords: vi.fn() },
  audioService: { speakText: vi.fn() }
};

// Browser 測試
await page.evaluate(() => {
  window.speechSynthesis.speak = vi.fn();
});
```

---

## 執行策略

### 開發時（快速反饋）
```bash
# 只跑 jsdom 測試
npm test

# Watch mode
npm test -- --watch
```

### 提交前（完整驗證）
```bash
# jsdom + browser 全跑
npm test && npm run test:browser
```

### CI/CD
```bash
# 單次執行 + 覆蓋率
npm test -- --run --coverage
npm run test:browser -- --run
```

---

## 測試優先級

### 🔴 Critical（必做 - jsdom）
1. TC-001: WordService 載入 ✅
2. TC-002: tokenizeSentence
3. TC-003: TooltipManager state
4. TC-004: Tooltip timeout

### 🟡 Important（建議 - Browser）
5. TC-005: Token 點擊整合
6. TC-006: 發音觸發
7. TC-007: 事件委派

### 🟢 Optional
8. TC-008: FlashcardController render
9. TC-009: Verb3 三態
10. TC-010: Custom import

---

## 成功標準

### Phase C-1（當前）
- ✅ TC-001 通過（3/3 tests）
- ⏳ TC-002~TC-004 實作中

### Phase C-2（目標）
- ✅ TC-001~TC-004 全過（jsdom）
- ✅ 執行時間 < 10 秒
- ✅ 無 flaky tests

### Phase C-3（完整）
- ✅ TC-001~TC-007 全過
- ✅ 覆蓋率 > 60%
- ✅ Browser 測試穩定

---

**遵循此策略可確保測試效率與可靠性的平衡**
