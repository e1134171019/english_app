(() => {
  const path = location.pathname;
  const MAX_UNIT = 24;

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

  function extractBalancedLiteral(source, start, openChar, closeChar) {
    let depth = 0;
    let quote = '';
    let escaped = false;

    for (let index = start; index < source.length; index++) {
      const char = source[index];

      if (quote) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === quote) quote = '';
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char;
        continue;
      }

      if (char === openChar) depth++;
      if (char === closeChar) {
        depth--;
        if (depth === 0) return source.slice(start, index + 1);
      }
    }

    throw new Error('題庫資料結構不完整');
  }

  function parseWordsArray(source) {
    const vocabUnitToken = /window\.VOCAB_UNIT\s*=\s*/.exec(source);
    if (vocabUnitToken) {
      const objectStart = source.indexOf('{', vocabUnitToken.index + vocabUnitToken[0].length);
      if (objectStart >= 0) {
        const objectLiteral = extractBalancedLiteral(source, objectStart, '{', '}');
        const dataset = Function(`"use strict";return (${objectLiteral});`)();
        if (dataset && Array.isArray(dataset.words)) return dataset.words;
      }
    }

    const patterns = [
      /const\s+words\s*=\s*/,
      /(?:["']words["']|\bwords)\s*:\s*/
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(source);
      if (!match) continue;
      const start = source.indexOf('[', match.index + match[0].length);
      if (start < 0) continue;
      const literal = extractBalancedLiteral(source, start, '[', ']');
      const words = Function(`"use strict";return (${literal});`)();
      if (Array.isArray(words)) return words;
    }

    throw new Error('找不到 words 題庫');
  }

  function readSavedUnits() {
    const keys = [
      'vocab_selected_units_v8',
      'vocab_selected_units_v7',
      'vocab_selected_units_v6',
      'vocab_selected_units_v5',
      'vocab_selected_units_v4',
      'vocab_selected_units_v3',
      'vocab_selected_units_v2',
      'vocab_selected_units_v1'
    ];

    for (const key of keys) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        const valid = [...new Set((Array.isArray(saved) ? saved : []).map(Number))]
          .filter(no => Number.isInteger(no) && no >= 1 && no <= MAX_UNIT)
          .sort((a, b) => a - b);
        if (valid.length) return valid;
      } catch (_) {}
    }
    return [];
  }

  function upgradeComprehensive() {
    for (let old = 10; old < MAX_UNIT; old++) {
      replaceText('.brand p', `Unit 01～Unit ${String(old).padStart(2, '0')}`, `Unit 01～Unit ${MAX_UNIT}`);
    }

    if (typeof extractWordsArray === 'function' && !extractWordsArray.__quotedWordsPatched) {
      extractWordsArray = function(source) {
        return parseWordsArray(source);
      };
      extractWordsArray.__quotedWordsPatched = true;
    }

    if (typeof normalizeWord === 'function' && !normalizeWord.__compactWordsPatched) {
      const originalNormalizeWord = normalizeWord;
      normalizeWord = function(item, unitNo) {
        return originalNormalizeWord(normalizeCompact(item), unitNo);
      };
      normalizeWord.__compactWordsPatched = true;
    }

    const choices = document.querySelector('#unitChoices');
    if (!choices) return;

    for (let no = 11; no <= MAX_UNIT; no++) {
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
        console.warn('Comprehensive unit upgrade:', error);
      }
    };
    applySaved();
  }

  function upgradeGrammar() {
    try {
      if (typeof extractWords === 'function' && !extractWords.__quotedWordsPatched) {
        extractWords = function(html) {
          return parseWordsArray(html).map(normalizeCompact);
        };
        extractWords.__quotedWordsPatched = true;
      }

      if (typeof unitSources === 'undefined') return;
      for (let no = 8; no <= MAX_UNIT; no++) {
        const unitName = `Unit ${String(no).padStart(2, '0')}`;
        if (!unitSources.some(([name]) => name === unitName)) {
          unitSources.push([unitName, `../unit${String(no).padStart(2, '0')}-vocab-lab/`]);
        }
      }

      document.title = `Unit 01-${MAX_UNIT} Exam Vocabulary Cloze`;
      const h1 = document.querySelector('.brand h1');
      if (h1) h1.textContent = `1-${MAX_UNIT} 課例句單字選擇題`;
      const p = document.querySelector('.brand p');
      if (p) p.textContent = `整合 Unit 01 到 Unit ${MAX_UNIT}。重新整理頁面時會先把題目洗牌；按「下一題」會依照本次洗牌後的順序出題。中文與解析作答後才顯示。`;
      const loadingNode = document.querySelector('.loading');
      if (loadingNode) loadingNode.textContent = `正在載入 Unit 01-${MAX_UNIT} 題庫...`;

      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if ((typeof questions !== 'undefined' && questions.length > 0) || attempts >= 40) {
          clearInterval(timer);
          if (typeof loadQuestions === 'function') loadQuestions();
        }
      }, 250);
    } catch (error) {
      console.warn('Grammar unit upgrade:', error);
    }
  }

  if (path.endsWith('/vocab-lab/comprehensive.html')) upgradeComprehensive();
  if (path.endsWith('/vocab-lab/grammar.html')) upgradeGrammar();
})();