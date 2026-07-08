(() => {
  'use strict';

  if (window.__toeicPart5QualityV5Loaded) return;
  window.__toeicPart5QualityV5Loaded = true;

  const meta = new Map();
  let loadToken = 0;
  const baseApplyUnits = applyUnits;
  const baseMakeQuestion = makeQuestion;

  const low = value => String(value || '').trim().toLowerCase();
  const unique = values => {
    const seen = new Set();
    return (values || []).filter(value => {
      const key = low(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  function broadPos(pos) {
    const value = low(pos);
    if (/adv/.test(value)) return 'adv';
    if (/adj|a\./.test(value)) return 'adj';
    if (/v\.|vt|vi|verb/.test(value)) return 'verb';
    if (/n\.|noun/.test(value)) return 'noun';
    return 'other';
  }

  function unitNo(item) {
    if (Number.isInteger(Number(item?.unitNo))) return Number(item.unitNo);
    const match = String(item?.u || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function itemKey(no, word) {
    return `${no}|${low(word)}`;
  }

  function familyStem(word) {
    const value = low(word);
    const stripped = value.replace(/(?:atively|ationally|fulness|ousness|iveness|ability|ibility|ation|ition|ment|ness|ity|ive|able|ible|al|ic|ous|ful|less|er|or|ist|ance|ence|ly|ed|ing|s)$/,'');
    return stripped.length >= 4 ? stripped : value.slice(0, Math.min(4, value.length));
  }

  function wordTokens(value) {
    return (String(value || '').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).map(low);
  }

  function strictFamily(item) {
    const base = low(item?.w || item?.word);
    const stem = familyStem(base);
    const family = item?.family || item?.f || [];
    return unique([base, ...family.flatMap(wordTokens)]).filter(value => {
      if (!/^[a-z-]+$/.test(value)) return false;
      if (value === base) return true;
      return value.startsWith(stem) || familyStem(value) === stem;
    });
  }

  function inferSlotPos(sentence, answer, fallbackPos) {
    const source = String(sentence || '');
    const match = source.match(new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'));
    if (!match) return broadPos(fallbackPos);

    const index = match.index || 0;
    const before = source.slice(0, index).toLowerCase().trim();
    const after = source.slice(index + match[0].length).toLowerCase().trim();

    if (/\b(to|will|would|can|could|may|might|must|should|do|does|did)\s*$/.test(before)) return 'verb';
    if (/\b(has|have|had)\s*$/.test(before)) return 'verb';
    if (/\b(is|are|was|were|be|been|being)\s*$/.test(before)) {
      return /ing$|ed$|en$/.test(low(answer)) ? 'verb' : 'adj';
    }
    if (/\b(a|an|the|this|that|these|those|my|your|his|her|its|our|their|each|every|another|such)\s*$/.test(before)) {
      return /^[a-z][a-z'-]*\b/.test(after) ? 'adj' : 'noun';
    }
    if (/\b(very|too|so|quite|rather|extremely|highly)\s*$/.test(before)) return 'adj';
    if (/ly$/.test(low(answer))) return 'adv';
    return broadPos(fallbackPos);
  }

  function inflectLike(base, target) {
    const source = low(base);
    const form = low(target);
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

  function samePosOptions(question, position) {
    const answer = String(question.ans || '').trim();
    const item = question.item || {};
    const candidates = [];

    for (const entry of meta.values()) {
      if (low(entry.word) === low(item.w)) continue;
      if (broadPos(entry.pos) !== position) continue;
      candidates.push(position === 'verb' ? inflectLike(entry.word, answer) : low(entry.word));
    }

    const distractors = shuffle(unique(candidates).filter(value => low(value) !== low(answer))).slice(0, 3);
    return distractors.length === 3 ? shuffle([answer, ...distractors]) : null;
  }

  function repairQuestion(question) {
    if (!question?.toeic) return question;

    question.label = `${question.item?.u || 'Unit'}｜多益 Part 5`;
    if (question.kind === 'preposition') return question;

    if (question.kind === 'family') {
      const forms = strictFamily(question.item);
      if (forms.length >= 4 && forms.some(value => low(value) === low(question.ans))) {
        const distractors = shuffle(forms.filter(value => low(value) !== low(question.ans))).slice(0, 3);
        if (distractors.length === 3) {
          question.opts = shuffle([question.ans, ...distractors]);
          return question;
        }
      }
    }

    const position = inferSlotPos(question.completed || question.q, question.ans, question.item?.pos || '');
    const options = samePosOptions(question, position);
    if (options) question.opts = options;
    return question;
  }

  async function loadMeta(units) {
    const token = ++loadToken;
    const loaded = await Promise.all((units || []).map(async no => {
      const id = String(no).padStart(2, '0');
      const response = await fetch(`../unit${id}-vocab-lab/index.html?v=20260708-toeic-quality-v5`, { cache: 'no-store' });
      if (!response.ok) return [];
      const source = await response.text();
      return extractWordsArray(source).map(raw => ({
        unitNo: no,
        word: String(raw.word || raw.w || '').trim(),
        pos: String(raw.pos || raw.p || '').trim(),
        family: [...(raw.related || []), ...(raw.forms || []), ...(raw.family || raw.f || [])]
      }));
    }));

    if (token !== loadToken) return;
    meta.clear();
    loaded.flat().forEach(item => meta.set(itemKey(item.unitNo, item.word), item));
  }

  applyUnits = async function qualityApplyUnits(units) {
    await baseApplyUnits(units);
    await loadMeta(units);
  };

  makeQuestion = function qualityMakeQuestion() {
    return repairQuestion(baseMakeQuestion());
  };

  const prepareInitial = () => {
    if (typeof loading !== 'undefined' && loading) {
      setTimeout(prepareInitial, 120);
      return;
    }
    if (Array.isArray(selectedUnits) && selectedUnits.length) {
      loadMeta(selectedUnits).catch(error => console.warn('Unable to load TOEIC option metadata', error));
    }
  };
  prepareInitial();
})();