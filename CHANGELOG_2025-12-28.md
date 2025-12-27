# 📝 最新更新 (2025-12-28)

## PWA 支持与移动端修复

### ✨ 新功能
- ✅ **PWA 支持**: 可添加到主屏幕，离线使用
- ✅ **Service Worker**: 自动缓存，提升加载速度

### 🐛 重大修复

**1. 翻卡布局问题** 
- 修复背面内容"挤在一起"
- 移除 inline style 冲突

**2. 移动端点击失效**
- ✅ 升级到 Pointer Events (pointerup)
- ✅ 添加 touch-action CSS
- ✅ 修复 backface-visibility 阻止点击
- ✅ **关键**: 禁用 inactive card face 的 pointer-events

**3. iOS 音频问题**
- ✅ 自动解锁音频上下文
- ✅ 支持移动端 TTS

### ✅ 测试验证
- 真实手机测试通过
- 例句单字点击正常发音
- 桌面版无影响

---

详见完整文档：
- [README.md](../README.md)
- [使用流程_v2.md](../使用流程_v2.md)
- [walkthrough.md](../../.gemini/antigravity/brain/636d0bbc-d667-4cd7-af6d-8b79d08adc88/walkthrough.md)
