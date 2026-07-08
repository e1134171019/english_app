(() => {
  'use strict';

  if (window.__mixedToeicEngineV4Loaded) return;
  window.__mixedToeicEngineV4Loaded = true;

  const LETTERS = ['A', 'B', 'C', 'D'];
  const PREPOSITIONS = ['of', 'to', 'for', 'with', 'from', 'in', 'on', 'at', 'by', 'into', 'about', 'against', 'over', 'under'];
  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'be', 'been', 'being', 'is', 'are', 'was', 'were',
    'do', 'does', 'did', 'to', 'of', 'for', 'with', 'from', 'in', 'on',
    'at', 'by', 'and', 'or', 'somebody', 'someone', 'something', 'one',
    'ones', 'your', 'his', 'her', 'their', 'our', 'my', 'n', 'v', 'ving'
  ]);
  const IRREGULAR = {
    spit: ['spit', 'spits', 'spat', 'spitting'],
    freeze: ['freeze', 'freezes', 'froze', 'frozen', 'freezing'],
    weave: ['weave', 'weaves', 'wove', 'woven', 'weaving'],
    rob: ['rob', 'robs', 'robbed', 'robbing'],
    tie: ['tie', 'ties', 'tied', 'tying'],
    dim: ['dim', 'dims', 'dimmed', 'dimming'],
    quit: ['quit', 'quits', 'quitting'],
    cast: ['cast', 'casts', 'casting']
  };

  const toeic = {
    rich: new Map(),
    questions: [],
    index: 0,
    loadToken: 0,
    ready: false,
    selectedUnitsKey: ''
  };

  const baseApplyUnits = applyUnits;
  const baseSetTop = setTop;
  const baseMakeQuestion = makeQuestion;
  const baseRender = render;
  const baseCheckChoice = checkChoice;
  const baseNextQuestion = nextQuestion;

  function low(value) {
    return String(value || '').trim().toLowerCase();
  }

  function unique(values) {
    const seen = new Set();
    return (values || []).filter(value => {
      const key = low(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function wordTokens(value) {
    return (String(value || '').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [])
      .map(value => value.toLowerCase());
  }

  function contentTokens(value) {
    return wordTokens(value).filter(value => value.length > 1 && !STOP_WORDS.has(value));
  }

  function broadPos(pos) {
    const value = low(pos);
    if (/adv/.test(value)) return 'adv';
    if (/adj|a\./.test(value)) return 'adj';
    if (/v\.|vt|vi|verb/.test(value)) return 'verb';
    if (/n\.|noun/.test(value)) return 'noun';
    return 'other';
  }

  function guessedPos(word, fallbackPos) {
    const value = low(word);
    if (/ly$/.test(value)) return 'adv';
    if (/(tion|sion|ment|ness|ity|ship|ance|ence|hood|dom|ism|ist|er|or|age|ure)$/.test(value)) return 'noun';
    if (/(ous|ful|less|ive|able|ible|ic|ary|ory|ent|ant)$/.test(value)) return 'adj';
    return broadPos(fallbackPos);
  }

  function inferSlotPos(sentence, answer, fallbackPos) {
    const source = String(sentence || '');
    const match = source.match(new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'));
    if (!match) return guessedPos(answer, fallbackPos);

    const index = match.index || 0;
    const before = source.slice(0, index).toLowerCase().trim();
    const after = source.slice(index + match[0].length).toLowerCase().trim();

    if (/\b(to|will|would|can|could|may|might|must|should|do|does|did)\s*$/.test(before)) return 'verb';
    if (/\b(has|have|had)\s*$/.test(before)) return /ed$|en$/.test(low(answer)) ? 'verb' : guessedPos(answer, fallbackPos);
    if (/\b(is|are|was|were|be|been|being)\s*$/.test(before)) {
      if (/ing$|ed$|en$/.test(low(answer))) return 'verb';
      return 'adj';
    }
    if (/\b(a|an|the|this|that|these|those|my|your|his|her|its|our|their|each|every|another|such)\s*$/.test(before)) {
      return /^[a-z][a-z'-]*\b/.test(after) ? 'adj' : 'noun';
    }
    if (/^[a-z][a-z'-]*\b/.test(after) && broadPos(fallbackPos) === 'adj') return 'adj';
    if (/\b(very|too|so|quite|rather|extremely|highly)\s*$/.test(before)) return 'adj';
    return guessedPos(answer, fallbackPos);
  }

  function unitNumber(item) {
    if (Number.isInteger(Number(item.unitNo))) return Number(item.unitNo);
    const match = String(item.u || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function itemKey(unitNo, word) {
    return `${unitNo}|${low(word)}`;
  }

  function variants(word, family) {
    const base = low(word);
    const values = new Set(IRREGULAR[base] || []);
    if (base) {
      [base, `${base}s`, `${base}es`, `${base}ed`, `${base}d`, `${base}ing`, `${base}ly`]
        .forEach(value => values.add(value));
    }
    (family || []).flatMap(wordTokens).forEach(value => {
      if (base && value.startsWith(base.slice(0, Math.min(4, base.length)))) values.add(value);
    });
    return [...values].sort((a, b) => b.length - a.length);
  }

  function findTarget(sentence, item) {
    for (const value of item.variants || []) {
      const match = String(sentence || '').match(new RegExp(`\\b${escapeRegExp(value)}\\b`, 'i'));
      if (match) return match[0];
    }
    return '';
  }

  function inflectLike(base, target) {
    const source = low(base);
    const form = low(target);
    if (!source) return source;

    if (/ing$/.test(form)) {
      if (/ie$/.test(source)) return `${source.slice(0, -2)}ying`;
      if (/e$/.test(source) && !/ee$/.test(source)) return `${source.slice(0, -1)}ing`;
      return `${source}ing`;
    }
    if (/ied$/.test(form) && /y$/.test(source)) return `${source.slice(0, -1)}ied`;
    if (/ed$/.test(form)) return /e$/.test(source) ? `${source}d` : `${source}ed`;
    if (/ies$/.test(form) && /y$/.test(source)) return `${source.slice(0, -1)}ies`;
    if (/es$/.test(form)) return `${source}es`;
    if (/s$/.test(form) && !/ss$/.test(form)) return `${source}s`;
    if (/ly$/.test(form)) return /y$/.test(source) ? `${source.slice(0, -1)}ily` : `${source}ly`;
    return source;
  }

  function normalizeRaw(raw, unitNo) {
    const word = String(raw.word || raw.w || '').trim();
    const family = unique([
      ...(raw.related || []),
      ...(raw.forms || []),
      ...(raw.family || raw.f || [])
    ]);
    const examples = (raw.ex || raw.x || [])
      .map(pair => [String(pair?.[0] || '').trim(), String(pair?.[1] || '').trim()])
      .filter(pair => pair[0]);

    return {
      unitNo,
      u: `Unit ${String(unitNo).padStart(2, '0')}`,
      w: word,
      z: String(raw.zh || raw.z || '').trim(),
      pos: String(raw.pos || raw.p || '').trim(),
      family,
      syn: unique(raw.syn || raw.s || []),
      ant: unique(raw.ant || raw.a || []),
      examples,
      variants: variants(word, family)
    };
  }

  async function loadRichUnits(units) {
    const token = ++toeic.loadToken;
    const loaded = await Promise.all((units || []).map(async unitNo => {
      const id = String(unitNo).padStart(2, '0');
      const response = await fetch(`../unit${id}-vocab-lab/index.html?v=20260708-mixed-toeic-v4`, { cache: 'no-store' });
      if (!response.ok) return [];
      const source = await response.text();
      return extractWordsArray(source).map(raw => normalizeRaw(raw, unitNo));
    }));

    if (token !== toeic.loadToken) return;
    toeic.rich.clear();
    loaded.flat().forEach(item => toeic.rich.set(itemKey(item.unitNo, item.w), item));
  }

  function richItems() {
    return [...toeic.rich.values()];
  }

  function familyWords(item) {
    return unique((item.family || []).flatMap(contentTokens)).filter(value => value !== low(item.w));
  }

  function samePosDistractors(item, answer, slotPos) {
    const values = [];
    for (const other of richItems()) {
      if (low(other.w) === low(item.w)) continue;
      if (broadPos(other.pos) !== slotPos) continue;
      values.push(slotPos === 'verb' ? inflectLike(other.w, answer) : low(other.w));
    }
    return unique(values);
  }

  function sameFamilyDistractors(item, answer) {
    return unique(familyWords(item)).filter(value => low(value) !== low(answer));
  }

  function fourOptions(answer, candidates) {
    const distractors = shuffle(unique(candidates).filter(value => low(value) !== low(answer))).slice(0, 3);
    if (distractors.length !== 3) return null;
    return shuffle([answer, ...distractors]);
  }

  function validQuestion(question) {
    if (!question || !question.prompt || !question.answer || !question.completed) return false;
    if ((question.prompt.match(/_____/g) || []).length !== 1) return false;
    if (!Array.isArray(question.options) || question.options.length !== 4) return false;
    if (unique(question.options).length !== 4) return false;
    if (question.options.filter(value => low(value) === low(question.answer)).length !== 1) return false;

    if (['lexical', 'collocation'].includes(question.kind)) {
      const expected = question.slotPos;
      const mismatched = question.options.some(option => guessedPos(option, expected) !== expected);
      if (mismatched) return false;
    }
    return true;
  }

  function coreCandidate(item, sentence, translation) {
    const answer = findTarget(sentence, item);
    if (!answer) return null;

    const slotPos = inferSlotPos(sentence, answer, item.pos);
    if (!['noun', 'verb', 'adj', 'adv'].includes(slotPos)) return null;

    const family = sameFamilyDistractors(item, answer)
      .filter(value => guessedPos(value, item.pos) === slotPos)
      .map(value => slotPos === 'verb' ? inflectLike(value, answer) : value);
    const options = fourOptions(answer, [
      ...family,
      ...samePosDistractors(item, answer, slotPos)
    ]);
    if (!options) return null;

    const question = {
      kind: low(answer) === low(item.w) ? 'lexical' : 'form',
      slotPos,
      prompt: sentence.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'), '_____'),
      answer,
      options,
      completed: sentence,
      translation,
      item
    };
    return validQuestion(question) ? question : null;
  }

  function familyCandidate(item, sentence, translation) {
    const family = familyWords(item);
    if (family.length < 4) return null;

    const matches = family
      .map(word => ({ word, match: sentence.match(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i'))?.[0] }))
      .filter(entry => entry.match);
    if (!matches.length) return null;

    const selected = shuffle(matches)[0];
    const options = fourOptions(selected.match, family.filter(value => value !== selected.word));
    if (!options) return null;

    const question = {
      kind: 'family',
      prompt: sentence.replace(new RegExp(`\\b${escapeRegExp(selected.match)}\\b`, 'i'), '_____'),
      answer: selected.match,
      options,
      completed: sentence,
      translation,
      item
    };
    return validQuestion(question) ? question : null;
  }

  function phraseCandidates(item, sentence, translation) {
    const output = [];

    for (const phrase of item.family || []) {
      const raw = String(phrase).match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
      const lower = raw.map(value => value.toLowerCase());
      if (lower.length < 2) continue;

      const presentCount = lower.filter(value => new RegExp(`\\b${escapeRegExp(value)}\\b`, 'i').test(sentence)).length;
      if (presentCount < 2) continue;

      for (const prep of PREPOSITIONS) {
        if (!lower.includes(prep)) continue;
        const match = sentence.match(new RegExp(`\\b${escapeRegExp(prep)}\\b`, 'i'))?.[0];
        if (!match) continue;

        const options = fourOptions(match, PREPOSITIONS.filter(value => value !== prep));
        const question = {
          kind: 'preposition',
          prompt: sentence.replace(new RegExp(`\\b${escapeRegExp(match)}\\b`, 'i'), '_____'),
          answer: match,
          options,
          completed: sentence,
          translation,
          item
        };
        if (validQuestion(question)) output.push(question);
      }

      for (const token of raw.filter(value => !STOP_WORDS.has(low(value)) && low(value) !== low(item.w))) {
        const match = sentence.match(new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i'))?.[0];
        if (!match) continue;

        const slotPos = inferSlotPos(sentence, match, 'noun');
        if (!['noun', 'verb', 'adj', 'adv'].includes(slotPos)) continue;
        const options = fourOptions(match, samePosDistractors(item, match, slotPos));
        const question = {
          kind: 'collocation',
          slotPos,
          prompt: sentence.replace(new RegExp(`\\b${escapeRegExp(match)}\\b`, 'i'), '_____'),
          answer: match,
          options,
          completed: sentence,
          translation,
          item
        };
        if (validQuestion(question)) output.push(question);
      }
    }

    return output;
  }

  function candidatesFor(item) {
    const output = [];
    for (const [sentence, translation] of item.examples || []) {
      const core = coreCandidate(item, sentence, translation);
      const family = familyCandidate(item, sentence, translation);
      if (core) output.push(core);
      if (family) output.push(family);
      output.push(...phraseCandidates(item, sentence, translation));
    }

    const seen = new Set();
    return output.filter(question => {
      const key = `${question.prompt}|${question.answer}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return validQuestion(question);
    });
  }

  function mixQuestions(items) {
    const buckets = new Map();
    for (const item of items) {
      for (const question of candidatesFor(item)) {
        if (!buckets.has(question.kind)) buckets.set(question.kind, []);
        buckets.get(question.kind).push(question);
      }
    }

    for (const [kind, questions] of buckets) buckets.set(kind, shuffle(questions));

    const result = [];
    let previousKinds = [];
    while ([...buckets.values()].some(list => list.length)) {
      const availableKinds = [...buckets.entries()]
        .filter(([, list]) => list.length)
        .map(([kind]) => kind);
      const preferred = availableKinds.filter(kind => !previousKinds.includes(kind));
      const kind = shuffle(preferred.length ? preferred : availableKinds)[0];
      const question = buckets.get(kind).pop();
      result.push(question);
      previousKinds = [...previousKinds, kind].slice(-2);
    }
    return result;
  }

  async function prepareToeic(units) {
    const key = (units || []).slice().sort((a, b) => a - b).join(',');
    toeic.ready = false;
    toeic.selectedUnitsKey = key;
    await loadRichUnits(units);
    if (toeic.selectedUnitsKey !== key) return;
    toeic.questions = mixQuestions(richItems());
    toeic.index = 0;
    toeic.ready = true;
  }

  applyUnits = async function mixedToeicApplyUnits(units) {
    await baseApplyUnits(units);
    await prepareToeic(units);
  };

  function toQuestion(candidate) {
    return {
      type: 'choice',
      toeic: true,
      kind: candidate.kind,
      label: `${candidate.item.u}｜多益 Part 5`,
      q: candidate.prompt,
      ans: candidate.answer,
      opts: candidate.options,
      completed: candidate.completed,
      translation: candidate.translation,
      item: candidate.item
    };
  }

  setTop = function mixedToeicSetTop() {
    baseSetTop();
    if (mode !== 'toeic') return;
    $('#modeName').textContent = '多益 Part 5';
    $('#count').textContent = toeic.questions.length ? `${toeic.index + 1} / ${toeic.questions.length}` : '0 / 0';
  };

  makeQuestion = function mixedToeicMakeQuestion() {
    if (mode !== 'toeic') return baseMakeQuestion();
    const candidate = toeic.questions[toeic.index];
    return candidate ? toQuestion(candidate) : null;
  };

  render = function mixedToeicRender() {
    if (mode === 'toeic' && !toeic.ready) {
      setTop();
      $('#app').innerHTML = '<div class="loading">正在分析所選 Unit 的教材並建立混合題庫……</div>';
      return;
    }
    if (mode === 'toeic' && !toeic.questions.length) {
      setTop();
      $('#app').innerHTML = '<div class="feedback">所選教材目前不足以產生符合品質條件的四選一題目。請增加選取的 Unit。</div>';
      return;
    }

    baseRender();
    if (mode !== 'toeic' || !currentQuestion?.toeic) return;

    document.querySelectorAll('.opt').forEach((button, index) => {
      button.innerHTML = `<span class="toeicLetter">(${LETTERS[index]})</span><span>${escapeHtml(button.dataset.value)}</span>`;
    });
    if ($('#fb')) $('#fb').textContent = '請選出最適合填入空格的答案。';
  };

  checkChoice = function mixedToeicCheckChoice(button, value) {
    if (mode !== 'toeic' || !currentQuestion?.toeic) return baseCheckChoice(button, value);

    const question = currentQuestion;
    document.querySelectorAll('.opt').forEach(option => {
      option.disabled = true;
      if (low(option.dataset.value) === low(question.ans)) option.classList.add('correct');
    });

    const correct = low(value) === low(question.ans);
    if (correct) {
      button.classList.add('correct');
      score++;
    } else {
      button.classList.add('wrong');
      markWrong(
        { ...question.item, e: question.q, t: `答案：${question.ans}｜${question.completed}｜${question.translation}` },
        question.label
      );
    }

    const answerIndex = question.opts.findIndex(option => low(option) === low(question.ans));
    $('#fb').textContent = `${correct ? '正確' : '錯誤'}\n正確答案：(${LETTERS[answerIndex] || '?'}) ${question.ans}\n\n完整句子：\n${question.completed}\n\n中文：\n${question.translation || question.item.t || question.item.z}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn primary toeicNext';
    next.textContent = '下一題';
    next.onclick = nextQuestion;
    $('#fb').appendChild(document.createElement('br'));
    $('#fb').appendChild(next);
    setTop();
  };

  nextQuestion = function mixedToeicNextQuestion() {
    if (mode !== 'toeic') return baseNextQuestion();
    if (!toeic.questions.length) return;
    toeic.index = (toeic.index + 1) % toeic.questions.length;
    currentQuestion = null;
    render();
  };

  async function activateToeic() {
    if (loading) return;
    mode = 'toeic';
    currentQuestion = null;
    score = 0;
    if (!toeic.ready) {
      render();
      await prepareToeic(selectedUnits);
    }
    render();
  }

  function install() {
    const modes = document.querySelector('.modes');
    if (modes && !modes.querySelector('[data-mode="toeic"]')) {
      const button = document.createElement('button');
      button.className = 'mode';
      button.dataset.mode = 'toeic';
      button.textContent = '多益 Part 5';
      button.onclick = activateToeic;
      modes.insertBefore(button, modes.querySelector('[data-mode="wrong"]') || null);
    }

    const style = document.createElement('style');
    style.textContent = `
      .modes{grid-template-columns:repeat(7,1fr)}
      .toeicLetter{display:inline-block;min-width:42px;color:#1d4ed8;font-weight:950}
      .opt.correct .toeicLetter{color:#166534}
      .opt.wrong .toeicLetter{color:#be123c}
      .toeicNext{display:block;width:100%;margin-top:14px}
      @media(max-width:860px){.modes{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  install();

  const prepareInitial = () => {
    if (typeof loading !== 'undefined' && loading) {
      setTimeout(prepareInitial, 120);
      return;
    }
    if (Array.isArray(selectedUnits) && selectedUnits.length) {
      prepareToeic(selectedUnits).catch(error => console.warn('Unable to prepare mixed TOEIC questions', error));
    }
  };
  prepareInitial();
})();