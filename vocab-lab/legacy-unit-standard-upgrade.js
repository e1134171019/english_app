(() => {
  'use strict';

  if (window.__legacyUnitStandardUpgradeLoaded) return;
  window.__legacyUnitStandardUpgradeLoaded = true;

  const match = location.pathname.match(/\/unit(0[1-7])-vocab-lab\/(?:index\.html)?$/);
  if (!match) return;

  const unitNo = match[1];
  const version = '20260709-legacy-standard-v1';

  function unique(values) {
    return [...new Set((values || []).filter(Boolean).map(value => String(value).trim()).filter(Boolean))];
  }

  function legacyWords() {
    try {
      if (typeof words !== 'undefined' && Array.isArray(words)) return words;
    } catch (_) {}
    return null;
  }

  function normalize(item, index) {
    const examples = Array.isArray(item.ex)
      ? item.ex.filter(pair => Array.isArray(pair) && pair.length).map(pair => [String(pair[0] || ''), String(pair[1] || '')])
      : [];

    const family = unique([
      ...(item.family || []),
      ...(item.forms || []),
      ...(item.related || [])
    ]);

    return {
      word: String(item.word || item.w || '').trim(),
      zh: String(item.zh || item.z || '').trim(),
      pos: String(item.pos || item.p || '').trim(),
      ipa: String(item.ipa || item.pron || item.i || '').trim(),
      bookNo: String(item.bookNo || item.b || index + 1),
      note: String(item.note || item.concept || '').trim(),
      family,
      syn: unique(item.syn || item.s || []),
      ant: unique(item.ant || item.a || []),
      ex: examples
    };
  }

  function loadStyle() {
    document.querySelectorAll('style').forEach(style => style.remove());
    const oldLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    oldLinks.forEach(link => link.remove());

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/english_app/vocab-lab/unit-standard.css?v=${version}`;
    document.head.appendChild(link);
  }

  function loadEngine() {
    const script = document.createElement('script');
    script.src = `/english_app/vocab-lab/unit-standard-engine.js?v=${version}`;
    script.async = false;
    script.onerror = () => {
      document.body.innerHTML = '<p style="padding:24px;font-family:system-ui">標準學習介面載入失敗，請重新整理。</p>';
    };
    document.body.appendChild(script);
  }

  function start(attempt = 0) {
    const source = legacyWords();
    if (!source) {
      if (attempt < 20) {
        setTimeout(() => start(attempt + 1), 50);
        return;
      }
      document.body.innerHTML = '<p style="padding:24px;font-family:system-ui">找不到原始單字題庫。</p>';
      return;
    }

    const normalized = source.map(normalize).filter(item => item.word && item.zh);
    if (!normalized.length) {
      document.body.innerHTML = '<p style="padding:24px;font-family:system-ui">這一課沒有可用的單字資料。</p>';
      return;
    }

    window.VOCAB_UNIT = {
      no: unitNo,
      storageKey: `unit${unitNo}_vocab_wrong_standard_v1`,
      words: normalized
    };

    loadStyle();
    document.body.innerHTML = '<main style="padding:32px;font-family:system-ui">正在載入 Unit ' + unitNo + ' 標準學習介面……</main>';
    loadEngine();
  }

  start();
})();