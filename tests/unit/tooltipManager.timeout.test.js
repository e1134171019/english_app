/**
 * TC-004: Tooltip 自動隱藏（使用 Fake Timers）
 * 驗證 Tooltip 在 3 秒後自動隱藏
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TooltipManager } from '../../web/ui/TooltipManager.js';

describe('TooltipManager - Auto Hide (TC-004)', () => {
    let manager;
    let mockServices;
    let tooltipElement;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div id="translation-tooltip"></div>';
        tooltipElement = document.getElementById('translation-tooltip');

        // Mock services
        mockServices = {
            wordService: {
                searchWords: vi.fn(() => ({
                    validWords: [{ english: 'word', translation: '單字' }]
                }))
            },
            audioService: {
                speakText: vi.fn()
            }
        };

        manager = new TooltipManager(mockServices);
        manager.init();
    });

    test('auto-hides after 3 seconds', async () => {
        vi.useFakeTimers();

        await manager.show('word', { x: 100, y: 100 });
        expect(tooltipElement.classList.contains('visible')).toBe(true);

        // 快進 3 秒
        vi.advanceTimersByTime(3000);
        expect(tooltipElement.classList.contains('visible')).toBe(false);

        vi.useRealTimers();
    });

    test('manual hide clears timer', async () => {
        vi.useFakeTimers();

        await manager.show('word', { x: 100, y: 100 });
        manager.hide();

        // 快進時間不應有副作用
        vi.advanceTimersByTime(5000);
        expect(tooltipElement.classList.contains('visible')).toBe(false);

        vi.useRealTimers();
    });

    test('subsequent show resets timer', async () => {
        vi.useFakeTimers();

        // 第一次顯示
        await manager.show('word1', { x: 100, y: 100 });
        vi.advanceTimersByTime(2000); // 過 2 秒

        // 第二次顯示（重置計時器）
        await manager.show('word2', { x: 200, y: 200 });
        vi.advanceTimersByTime(2000); // 再過 2 秒（總共 4 秒，但計時器已重置）

        // 應該還在顯示
        expect(tooltipElement.classList.contains('visible')).toBe(true);

        // 再過 1 秒（從第二次 show 算起剛好 3 秒）
        vi.advanceTimersByTime(1000);
        expect(tooltipElement.classList.contains('visible')).toBe(false);

        vi.useRealTimers();
    });
});
