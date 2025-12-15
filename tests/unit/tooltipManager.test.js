/**
 * TC-003: TooltipManager 顯示與隱藏邏輯
 * 驗證 Tooltip 的基本 show/hide 功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TooltipManager } from '../../web/ui/TooltipManager.js';

describe('TooltipManager - Show/Hide (TC-003)', () => {
    let manager;
    let mockServices;
    let tooltipElement;

    beforeEach(() => {
        // 建立 tooltip DOM 元素
        document.body.innerHTML = '<div id="translation-tooltip"></div>';
        tooltipElement = document.getElementById('translation-tooltip');

        // Mock services（簡潔版）
        mockServices = {
            wordService: {
                searchWords: vi.fn(() => ({
                    validWords: [{
                        english: 'test',
                        translation: '測試'
                    }]
                }))
            },
            audioService: {
                speakText: vi.fn()
            }
        };

        // 初始化 TooltipManager
        manager = new TooltipManager(mockServices);
        manager.init();
    });

    test('show() adds visible class', async () => {
        await manager.show('test', { x: 100, y: 100 });

        expect(tooltipElement.classList.contains('visible')).toBe(true);
    });

    test('show() displays correct content', async () => {
        await manager.show('test', { x: 100, y: 100 });

        const text = tooltipElement.textContent;
        expect(text).toContain('test');
        expect(text).toContain('測試');
    });

    test('show() triggers audio', async () => {
        await manager.show('test', { x: 100, y: 100 });

        expect(mockServices.audioService.speakText).toHaveBeenCalledWith('test');
    });

    test('hide() removes visible class', () => {
        tooltipElement.classList.add('visible');
        manager.hide();

        expect(tooltipElement.classList.contains('visible')).toBe(false);
    });

    test('hide() clears current word', () => {
        manager.currentWord = 'test';
        manager.hide();

        expect(manager.currentWord).toBeNull();
    });
});
