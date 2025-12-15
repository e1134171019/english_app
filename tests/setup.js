/**
 * Vitest 測試環境初始化
 */

// 模擬瀏覽器全域物件（如需要）
global.window = global.window || {};

// 設定測試用的環境變數
process.env.NODE_ENV = 'test';

console.log('[Test Setup] Vitest environment initialized');
