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

  function parseWordsArray(source) {
    const patterns = [/const\s+words\s*=\s*/, /\bwords\s*:\s*/];
    let start = -1;
    for (const pattern of patterns) {
      const match = pattern.exec(source);
      if (!match) continue;
      start = source.indexOf('[', match.index + match[0].length);
      if (start >= 0) break;
    }
    if (start < 0) throw new Error('找不到 words 題庫');

    let depth = 0;
    let quote = '';
    let escaped = false;
    for (let index = start; index < source.length; index++) {
      const char = source[index];
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (char === '\\') { escaped = true; continue; }
        if (char === quote) quote = '';
        continue;
      }
      if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
      if (char === '[') depth++;
      if (char === ']') {
        depth--;
        if (depth === 0) {
          const literal = source.slice(start, index + 1);
          return Function(`"use strict";return (${literal});`)();
        }
      }
    }
    throw new Error('words 題庫陣列不完整');
  }

  function readSavedUnits() {
    for (const key of ['vocab_selected_units_v4', 'vocab_selected_units_v3', 'vocab_selected_units_v2', 'vocab_selected_units_v1']) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        const valid = [...new Set((Array.isArray(saved) ? saved : []).map(Number))]
          .filter(no => Number.isInteger(no) && no >= 1 && no <= 20)
          .sort((a, b) => a - b);
        if (valid.length) return valid;
      } catch (_) {}
    }
    return [];
  }

  function upgradeComprehensive() {
    for (let old = 10; old <= 19; old++) {
      replaceText('.brand p', `Unit 01～Unit ${String(old).padStart(2, '0')}`, 'Unit 01～Unit 20');
    }

    if (typeof extractWordsArray === 'function' && !extractWordsArray.__unit20Patched) {
      extractWordsArray = function(source) {
        return parseWordsArray(source);
      };
      extractWordsArray.__unit20Patched = true;
    }

    if (typeof normalizeWord === 'function' && !normalizeWord.__unit20Patched) {
      const originalNormalizeWord = normalizeWord;
      normalizeWord = function(item, unitNo) {
        return originalNormalizeWord(normalizeCompact(item), unitNo);
      };
      normalizeWord.__unit20Patched = true;
    }

    const choices = document.querySelector('#unitChoices');
    if (!choices) return;

    for (let no = 11; no <= 20; no++) {
      if (choices.querySelector(`input[value="${no}"]`)) continue;
      const label = document.createElement('label');
      label.className = 'unitToggle';
      label.innerHTML = `<input type="checkbox" value="${no}"> Unit ${String(no).padStart(2, '0')}`;
      choices.appendChild(label);
    }

    const saved = readSavedUnits();
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
        console.warn('Unit 20 comprehensive upgrade:', error);
      }
    };
    applySaved();
  }

  function upgradeGrammar() {
    try {
      if (typeof extractWords === 'function' && !extractWords.__unit20Patched) {
        extractWords = function(html) {
          return parseWordsArray(html).map(normalizeCompact);
        };
        extractWords.__unit20Patched = true;
      }

      if (typeof unitSources === 'undefined') return;
      for (let no = 8; no <= 20; no++) {
        const unitName = `Unit ${String(no).padStart(2, '0')}`;
        if (!unitSources.some(([name]) => name === unitName)) {
          unitSources.push([unitName, `../unit${String(no).padStart(2, '0')}-vocab-lab/`]);
        }
      }

      document.title = 'Unit 01-20 Exam Vocabulary Cloze';
      const h1 = document.querySelector('.brand h1');
      if (h1) h1.textContent = '1-20 課例句單字選擇題';
      const p = document.querySelector('.brand p');
      if (p) p.textContent = '整合 Unit 01 到 Unit 20。重新整理頁面時會先把題目洗牌；按「下一題」會依照本次洗牌後的順序出題。中文與解析作答後才顯示。';
      const loadingNode = document.querySelector('.loading');
      if (loadingNode) loadingNode.textContent = '正在載入 Unit 01-20 題庫...';

      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if ((typeof questions !== 'undefined' && questions.length > 0) || attempts >= 40) {
          clearInterval(timer);
          if (typeof loadQuestions === 'function') loadQuestions();
        }
      }, 250);
    } catch (error) {
      console.warn('Unit 20 grammar upgrade:', error);
    }
  }

  if (path.endsWith('/vocab-lab/comprehensive.html')) upgradeComprehensive();
  if (path.endsWith('/vocab-lab/grammar.html')) upgradeGrammar();
})();