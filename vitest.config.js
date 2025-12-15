import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 全域啟用 describe, test, expect 等 API
    globals: true,

    // 單元測試環境：jsdom（模擬瀏覽器 DOM）
    environment: 'jsdom',

    // 全域 Setup 檔案（每個測試前執行）
    setupFiles: ['./tests/setup.js', './tests/setupFetch.js'],

    // 自動還原 stubbed globals（避免測試間污染）
    unstubGlobals: true,

    // 測試檔案匹配規則
    include: ['tests/**/*.test.js'],

    // 排除目錄
    exclude: ['node_modules', 'dist'],

    // 瀏覽器模式設定（用於整合測試）
    browser: {
      enabled: false, // 預設關閉，用 --browser 啟用
      name: 'chromium',
      provider: 'playwright',
      headless: true
    },

    // 覆蓋率設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['services/**/*.js', 'modules/**/*.js', 'web/ui/**/*.js'],
      exclude: ['tests', 'data', 'ui/events.js']
    },

    // 測試超時
    testTimeout: 10000
  }
});
