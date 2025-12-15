# 快速驗證指令

## 一鍵檢查列表

### Console 快速驗證
在瀏覽器 Console 執行以下指令快速檢查狀態：

```javascript
// 1. 檢查 WordService 資料
console.log('Words loaded:', WordService?.wordsData?.length);
console.log('First word:', WordService?.wordsData?.[0]);

// 2. 檢查 AppState
console.log('Active words:', AppState?.activeWordList?.length);
console.log('Current word:', AppState?.currentWord);

// 3. 檢查 Services
console.log('Services:', {
  wordService: typeof WordService,
  audioService: typeof AudioService,
  storageService: typeof StorageService
});

// 4. 檢查 Tooltip
const tooltip = document.getElementById('translation-tooltip');
console.log('Tooltip exists:', !!tooltip);
console.log('Tooltip visible:', tooltip?.classList.contains('visible'));

// 5. 檢查 Token
const tokens = document.querySelectorAll('.interactive-word');
console.log('Interactive tokens:', tokens.length);
```

---

## 快速測試流程（5 分鐘）

### 最小驗證集
只測試最關鍵的功能：

1. **資料載入** (30 秒)
   - 開啟頁面
   - Console 看到 "Loaded 8656 words" ✅

2. **進入練習** (1 分鐘)
   - 點擊「單字練習」
   - 選 J2
   - 看到卡片 ✅

3. **Token 點擊** (2 分鐘)
   - 翻到背面
   - 點擊例句單字
   - Tooltip 出現 ✅
   - 卡片未翻轉 ✅

4. **發音** (30 秒)
   - 點擊發音按鈕
   - 聽到聲音 ✅

5. **導航** (1 分鐘)
   - 上一個/下一個
   - 題數更新 ✅

**如果這 5 項全過 → 應用基本正常 ✅**

---

## 問題回報格式

### 範本
```markdown
## 問題報告

**功能**: Token 點擊
**步驟**:
1. 進入單字練習
2. 翻到背面
3. 點擊例句中的 "need"

**預期**: Tooltip 出現
**實際**: Tooltip 未出現

**Console 錯誤**:
\```
[貼上錯誤訊息]
\```

**截圖**: [如有]
```
