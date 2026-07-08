(() => {
  const path = location.pathname;

  function replaceText(selector, from, to) {
    const node = document.querySelector(selector);
    if (node) node.textContent = node.textContent.replace(from, to);
  }

  function normalizeCompact(item) {
    if (!item || item.word) return item;
    return {
      word: item.w || '',
      zh: item.z || '',
      pos: item.p || '',
      ipa: item.i || '',
      bookNo: item.b || '',
      family: item.f || [],
      syn: item.s || [],
      ant: item.a || [],
      ex: item.x || []
    };
  }

  function upgradeComprehensive() {
    replaceText('.brand p', 'Unit 01～Unit 10', 'Unit 01～Unit 16');
    replaceText('.brand p', 'Unit 01～Unit 11', 'Unit 01～Unit 16');
    replaceText('.brand p', 'Unit 01～Unit 12', 'Unit 01～Unit 16');
    replaceText('.brand p', 'Unit 01～Unit 13', 'Unit 01～Unit 16');
    replaceText('.brand p', 'Unit 01～Unit 14', 'Unit 01～Unit 16');
    replaceText('.brand p', 'Unit 01～Unit 15', 'Unit 01～Unit 16');

    if (typeof normalizeWord === 'function' && !normalizeWord.__unit16Patched) {
      const originalNormalizeWord = normalizeWord;
      normalizeWord = function(item, unitNo) {
        return originalNormalizeWord(normalizeCompact(item), unitNo);
      };
      normalizeWord.__unit16Patched = true;
    }

    const choices = document.querySelector('#unitChoices');
    if (!choices) return;

    for (const no of [11, 12, 13, 14, 15, 16]) {
      if (choices.querySelector(`input[value="${no}"]`)) continue;
      const label = document.createElement('label');
      label.className = 'unitToggle';
      label.innerHTML = `<input type="checkbox" value="${no}"> Unit ${String(no).padStart(2, '0')}`;
      choices.appendChild(label);
    }

    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('vocab_selected_units_v1') || '[]'); } catch (_) {}
    saved = [...new Set((Array.isArray(saved) ? saved : []).map(Number))]
      .filter(no => Number.isInteger(no) && no >= 1 && no <= 16)
      .sort((a, b) => a - b);

    if (!saved.length) return;
    document.querySelectorAll('#unitChoices input').forEach(input => {
      const checked = saved.includes(Number(input.value));
      input.checked = checked;
      input.closest('.unitToggle')?.classList.toggle('selected', checked);
    });

    const applySaved = () => {
      try {
        if (typeof loading !== 'undefined' && loading) {
          setTimeout(applySaved, 180);
          return;
        }
        if (typeof applyUnits === 'function') {
          selectedUnits = saved;
          applyUnits(saved);
        }
      } catch (error) {
        console.warn('Unit 16 comprehensive upgrade:', error);
      }
    };
    applySaved();
  }

  function upgradeGrammar() {
    try {
      if (typeof extractWords === 'function' && !extractWords.__unit16Patched) {
        const originalExtractWords = extractWords;
        extractWords = function(html) {
          return originalExtractWords(html).map(normalizeCompact);
        };
        extractWords.__unit16Patched = true;
      }

      if (typeof unitSources === 'undefined') return;
      for (let no = 8; no <= 16; no++) {
        const unitName = `Unit ${String(no).padStart(2, '0')}`;
        if (!unitSources.some(([name]) => name === unitName)) {
          unitSources.push([unitName, `../unit${String(no).padStart(2, '0')}-vocab-lab/`]);
        }
      }

      document.title = 'Unit 01-16 Exam Vocabulary Cloze';
      const h1 = document.querySelector('.brand h1');
      if (h1) h1.textContent = '1-16 課例句單字選擇題';
      const p = document.querySelector('.brand p');
      if (p) p.textContent = '整合 Unit 01 到 Unit 16。重新整理頁面時會先把題目洗牌；按「下一題」會依照本次洗牌後的順序出題。中文與解析作答後才顯示。';
      const loadingNode = document.querySelector('.loading');
      if (loadingNode) loadingNode.textContent = '正在載入 Unit 01-16 題庫...';

      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if ((typeof questions !== 'undefined' && questions.length > 0) || attempts >= 40) {
          clearInterval(timer);
          if (typeof loadQuestions === 'function') loadQuestions();
        }
      }, 250);
    } catch (error) {
      console.warn('Unit 16 grammar upgrade:', error);
    }
  }

  if (path.endsWith('/vocab-lab/comprehensive.html')) upgradeComprehensive();
  if (path.endsWith('/vocab-lab/grammar.html')) upgradeGrammar();
})();