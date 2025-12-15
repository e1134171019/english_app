# 測試實作檢查清單

## Phase C-1: 框架安裝

- [ ] 檢查是否已有 package.json
- [ ] 安裝 Vitest (`npm install -D vitest`)
- [ ] 安裝 Playwright (`npm install -D @vitest/browser playwright`)
- [ ] 建立 `vitest.config.js`
- [ ] 更新 `package.json` scripts

---

## Phase C-2: 測試骨架建立

### 目錄結構
- [ ] 建立 `tests/` 目錄
- [ ] 建立 `tests/unit/` 子目錄
- [ ] 建立 `tests/browser/` 子目錄
- [ ] 建立 `tests/fixtures/` 子目錄
- [ ] 建立 `tests/setup.js`

### 測試檔案
- [ ] `tests/unit/wordService.test.js`
- [ ] `tests/unit/tooltipManager.test.js`
- [ ] `tests/unit/flashcardController.test.js`
- [ ] `tests/browser/tokenClick.test.js`
- [ ] `tests/browser/flashcard.test.js`
- [ ] `tests/fixtures/testWords.json`

---

## Phase C-3: 撰寫測試（依優先級）

### Critical (必做)
- [ ] TC-001: WordService 資料載入
- [ ] TC-002: tokenizeSentence 產生 Token
- [ ] TC-003: TooltipManager.show()
- [ ] TC-004: Tooltip 自動隱藏
- [ ] TC-005: Token 點擊觸發 Tooltip（整合）
- [ ] TC-006: Token 點擊不翻卡片

### Important (建議)
- [ ] TC-007: Token 點擊觸發發音
- [ ] TC-008: FlashcardController 渲染
- [ ] TC-009: 按鈕點擊不翻卡片

### Optional
- [ ] TC-010: Verb3 三態
- [ ] TC-011: Custom 匯入
- [ ] TC-012: 防抖測試

---

## Phase C-4: 執行與修正

- [ ] 本地執行所有測試
- [ ] 修正失敗的測試
- [ ] 確認無 flaky tests
- [ ] 檢視覆蓋率報告

---

## Phase C-5: CI/CD 整合（如需要）

- [ ] 建立 `.github/workflows/test.yml`
- [ ] 設定自動測試觸發
- [ ] 確認 CI 環境測試通過

---

## 當前狀態

✅ **已完成**: 
- 測試規格書撰寫 (`test_specification.md`)
- 測試計畫 (`phase_c_testing_plan.md`)

⏳ **待執行**:
- 框架安裝
- 測試實作

---

## 預估時間

- **框架安裝**: 15 分鐘
- **骨架建立**: 30 分鐘
- **Critical 測試撰寫**: 2-3 小時
- **除錯與修正**: 1-2 小時
- **總計**: 約 4-6 小時

---

## 注意事項

⚠️ **先確保功能正常**：在撰寫測試前，先手動驗證所有功能無誤  
⚠️ **逐步實作**：不要一次寫完所有測試，先寫 TC-001~TC-003  
⚠️ **Mock 策略**：優先使用真實資料，只在必要時 mock
