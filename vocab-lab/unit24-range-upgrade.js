(() => {
  'use strict';

  if (window.__unit24RangeUpgradeLoaded) return;
  window.__unit24RangeUpgradeLoaded = true;

  function upgradeGrammarRange() {
    if (!location.pathname.endsWith('/vocab-lab/grammar.html')) return;
    if (typeof unitSources === 'undefined') {
      setTimeout(upgradeGrammarRange, 120);
      return;
    }

    for (let no = 23; no <= 24; no++) {
      const unitName = `Unit ${String(no).padStart(2, '0')}`;
      if (!unitSources.some(([name]) => name === unitName)) {
        unitSources.push([unitName, `../unit${String(no).padStart(2, '0')}-vocab-lab/`]);
      }
    }

    document.title = 'Unit 01-24 Exam Vocabulary Cloze';
    const h1 = document.querySelector('.brand h1');
    if (h1) h1.textContent = '1-24 課例句單字選擇題';
    const p = document.querySelector('.brand p');
    if (p) p.textContent = '整合 Unit 01 到 Unit 24。重新整理頁面時會先把題目洗牌；按「下一題」會依照本次洗牌後的順序出題。中文與解析作答後才顯示。';
    const loadingNode = document.querySelector('.loading');
    if (loadingNode) loadingNode.textContent = '正在載入 Unit 01-24 題庫...';

    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (typeof loadQuestions === 'function') {
        clearInterval(timer);
        loadQuestions();
      } else if (attempts >= 40) {
        clearInterval(timer);
      }
    }, 250);
  }

  upgradeGrammarRange();
})();