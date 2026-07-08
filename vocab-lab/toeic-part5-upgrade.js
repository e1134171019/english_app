(() => {
  'use strict';

  if (window.__mixedToeicEngineV3Loaded) return;
  window.__mixedToeicEngineV3Loaded = true;

  const LETTERS = ['A','B','C','D'];
  const PREPOSITIONS = ['of','to','for','with','from','in','on','at','by','into','about','against','over','under'];
  const STOP = new Set(['a','an','the','be','been','being','is','are','was','were','do','does','did','to','of','for','with','from','in','on','at','by','and','or','somebody','someone','something','one','ones','your','his','her','their','our','my','n','v','ving']);
  const IRREGULAR = {
    spit:['spit','spits','spat','spitting'], freeze:['freeze','freezes','froze','frozen','freezing'],
    weave:['weave','weaves','wove','woven','weaving'], rob:['rob','robs','robbed','robbing'],
    tie:['tie','ties','tied','tying'], dim:['dim','dims','dimmed','dimming'],
    quit:['quit','quits','quitting'], cast:['cast','casts','casting']
  };

  const state = { rich:new Map(), lastKinds:[], loadToken:0 };
  const baseApplyUnits = applyUnits;
  const baseSetTop = setTop;
  const baseMakeQuestion = makeQuestion;
  const baseRender = render;
  const baseCheckChoice = checkChoice;

  function low(value){ return String(value || '').trim().toLowerCase(); }
  function unique(values){
    const seen = new Set();
    return (values || []).filter(value => {
      const key = low(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function tokens(value){
    return (String(value || '').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [])
      .map(value => value.toLowerCase());
  }
  function contentTokens(value){ return tokens(value).filter(value => value.length > 1 && !STOP.has(value)); }
  function unitNoOf(item){
    if (Number.isInteger(Number(item.unitNo))) return Number(item.unitNo);
    const match = String(item.u || item.unit || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
  function keyFor(unitNo, word){ return `${unitNo}|${low(word)}`; }
  function broadPos(pos){
    const value = low(pos);
    if (/adv/.test(value)) return 'adv';
    if (/adj|a\./.test(value)) return 'adj';
    if (/v\.|vt|vi|verb/.test(value)) return 'verb';
    if (/n\.|noun/.test(value)) return 'noun';
    return 'other';
  }
  function guessedPos(answer, fallback){
    const value = low(answer);
    if (/ly$/.test(value)) return 'adv';
    if (/(tion|sion|ment|ness|ity|ship|ance|ence|hood|dom|ism|ist|er|or|age|ure)$/.test(value)) return 'noun';
    if (/(ous|ful|less|ive|able|ible|ic|ary|ory|ent|ant)$/.test(value)) return 'adj';
    return broadPos(fallback);
  }
  function variants(word, related){
    const base = low(word);
    const output = new Set(IRREGULAR[base] || []);
    if (base) [base,`${base}s`,`${base}es`,`${base}ed`,`${base}d`,`${base}ing`,`${base}ly`].forEach(value => output.add(value));
    (related || []).flatMap(tokens).forEach(value => {
      if (base && value.startsWith(base.slice(0,Math.min(4,base.length)))) output.add(value);
    });
    return [...output].sort((a,b) => b.length - a.length);
  }
  function findTarget(sentence, item){
    for (const value of item.variants || []) {
      const match = String(sentence || '').match(new RegExp(`\\b${escapeRegExp(value)}\\b`,'i'));
      if (match) return match[0];
    }
    return '';
  }
  function inflectLike(base, target){
    const source = low(base), form = low(target);
    if (!source) return source;
    if (/ing$/.test(form)) {
      if (/ie$/.test(source)) return `${source.slice(0,-2)}ying`;
      if (/e$/.test(source) && !/ee$/.test(source)) return `${source.slice(0,-1)}ing`;
      return `${source}ing`;
    }
    if (/ied$/.test(form) && /y$/.test(source)) return `${source.slice(0,-1)}ied`;
    if (/ed$/.test(form)) return /e$/.test(source) ? `${source}d` : `${source}ed`;
    if (/ies$/.test(form) && /y$/.test(source)) return `${source.slice(0,-1)}ies`;
    if (/es$/.test(form)) return `${source}es`;
    if (/s$/.test(form) && !/ss$/.test(form)) return `${source}s`;
    if (/ly$/.test(form)) return /y$/.test(source) ? `${source.slice(0,-1)}ily` : `${source}ly`;
    return source;
  }
  function familyWords(item){
    return unique((item.family || []).flatMap(contentTokens)).filter(value => value !== low(item.w));
  }
  function samePosPool(item, answer){
    const targetPos = guessedPos(answer,item.pos);
    return unique([...state.rich.values()]
      .filter(other => low(other.w) !== low(item.w) && broadPos(other.pos) === targetPos)
      .map(other => inflectLike(other.w,answer)));
  }
  function allWordPool(item, answer){
    return unique([...state.rich.values()]
      .filter(other => low(other.w) !== low(item.w))
      .map(other => inflectLike(other.w,answer)));
  }
  function fourOptions(answer, candidates){
    const distractors = shuffle(unique(candidates).filter(value => low(value) !== low(answer))).slice(0,3);
    return distractors.length === 3 ? shuffle([answer,...distractors]) : null;
  }
  function normalizeRaw(raw, unitNo){
    const word = String(raw.word || raw.w || '').trim();
    const family = unique([...(raw.related || []),...(raw.forms || []),...(raw.family || raw.f || [])]);
    const examples = (raw.ex || raw.x || []).map(pair => [String(pair?.[0] || '').trim(),String(pair?.[1] || '').trim()]).filter(pair => pair[0]);
    return {
      unitNo, u:`Unit ${String(unitNo).padStart(2,'0')}`, w:word,
      z:String(raw.zh || raw.z || '').trim(), pos:String(raw.pos || raw.p || '').trim(),
      family, syn:unique(raw.syn || raw.s || []), ant:unique(raw.ant || raw.a || []),
      examples, variants:variants(word,family)
    };
  }
  async function loadRichUnits(units){
    const token = ++state.loadToken;
    const loaded = await Promise.all((units || []).map(async unitNo => {
      const id = String(unitNo).padStart(2,'0');
      const response = await fetch(`../unit${id}-vocab-lab/index.html?v=20260708-mixed-toeic-v3`,{cache:'no-store'});
      if (!response.ok) return [];
      const source = await response.text();
      return extractWordsArray(source).map(raw => normalizeRaw(raw,unitNo));
    }));
    if (token !== state.loadToken) return;
    state.rich.clear();
    loaded.flat().forEach(item => state.rich.set(keyFor(item.unitNo,item.w),item));
  }
  function enrich(item){
    const unitNo = unitNoOf(item);
    return state.rich.get(keyFor(unitNo,item.w)) || {
      unitNo, u:item.u || `Unit ${String(unitNo).padStart(2,'0')}`, w:item.w, z:item.z,
      pos:item.pos || '', family:item.family || [], syn:item.syn || [], ant:item.ant || [],
      examples:item.e ? [[item.e,item.t || '']] : [], variants:variants(item.w,item.family || [])
    };
  }

  applyUnits = async function mixedToeicApplyUnits(units){
    await baseApplyUnits(units);
    await loadRichUnits(units);
    state.lastKinds = [];
  };

  function coreCandidate(item, sentence, translation){
    const answer = findTarget(sentence,item);
    if (!answer) return null;
    const options = fourOptions(answer,[...familyWords(item).map(value => inflectLike(value,answer)),...samePosPool(item,answer),...allWordPool(item,answer)]);
    if (!options) return null;
    return {kind:low(answer) === low(item.w) ? 'lexical' : 'form',prompt:sentence.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`,'i'),'_____'),answer,options,completed:sentence,translation,item};
  }
  function familyCandidate(item, sentence, translation){
    const matches = familyWords(item).map(word => ({word,match:sentence.match(new RegExp(`\\b${escapeRegExp(word)}\\b`,'i'))?.[0]})).filter(entry => entry.match);
    if (!matches.length) return null;
    const selected = shuffle(matches)[0], answer = selected.match;
    const options = fourOptions(answer,[...familyWords(item).filter(value => value !== selected.word),...samePosPool(item,answer),...allWordPool(item,answer)]);
    if (!options) return null;
    return {kind:'family',prompt:sentence.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`,'i'),'_____'),answer,options,completed:sentence,translation,item};
  }
  function phraseCandidates(item, sentence, translation){
    const output = [];
    for (const phrase of item.family || []) {
      const raw = String(phrase).match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
      const lower = raw.map(value => value.toLowerCase());
      if (lower.length < 2 || lower.filter(value => new RegExp(`\\b${escapeRegExp(value)}\\b`,'i').test(sentence)).length < 2) continue;

      for (const prep of PREPOSITIONS) {
        if (!lower.includes(prep)) continue;
        const direct = new RegExp(`\\b${escapeRegExp(prep)}\\b`,'i');
        const base = (item.variants || []).map(escapeRegExp).join('|');
        const near = new RegExp(`\\b(?:${base})\\b(?:\\s+[A-Za-z']+){0,5}\\s+${prep}\\b`,'i');
        if (direct.test(sentence) && (near.test(sentence) || lower.some(value => value !== prep && new RegExp(`\\b${escapeRegExp(value)}\\b`,'i').test(sentence)))) {
          const options = fourOptions(prep,PREPOSITIONS.filter(value => value !== prep));
          if (options) output.push({kind:'preposition',prompt:sentence.replace(direct,'_____'),answer:prep,options,completed:sentence,translation,item});
        }
      }

      const content = raw.filter(value => !STOP.has(low(value)) && low(value) !== low(item.w));
      for (const token of content) {
        const match = sentence.match(new RegExp(`\\b${escapeRegExp(token)}\\b`,'i'))?.[0];
        if (!match) continue;
        const pool = [...samePosPool(item,match),...content.filter(value => low(value) !== low(token)),...allWordPool(item,match)];
        const options = fourOptions(match,pool);
        if (options) output.push({kind:'collocation',prompt:sentence.replace(new RegExp(`\\b${escapeRegExp(match)}\\b`,'i'),'_____'),answer:match,options,completed:sentence,translation,item});
      }
    }
    return output;
  }
  function candidatesFor(item){
    const output = [];
    for (const [sentence,translation] of item.examples || []) {
      const core = coreCandidate(item,sentence,translation);
      const family = familyCandidate(item,sentence,translation);
      if (core) output.push(core);
      if (family) output.push(family);
      output.push(...phraseCandidates(item,sentence,translation));
    }
    const seen = new Set();
    return output.filter(question => {
      const key = `${question.prompt}|${question.answer}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return question.options?.length === 4 && question.options.filter(value => low(value) === low(question.answer)).length === 1;
    });
  }
  function selectCandidate(item){
    const candidates = candidatesFor(item);
    if (!candidates.length) return null;
    const recent = new Set(state.lastKinds.slice(-2));
    const preferred = candidates.filter(candidate => !recent.has(candidate.kind));
    const selected = shuffle(preferred.length ? preferred : candidates)[0];
    state.lastKinds.push(selected.kind);
    state.lastKinds = state.lastKinds.slice(-3);
    return selected;
  }
  function buildQuestion(item){
    const rich = enrich(item);
    const selected = selectCandidate(rich);
    if (!selected) return null;
    return {
      type:'choice',toeic:true,kind:selected.kind,
      label:`${rich.u}｜多益 Part 5`,q:selected.prompt,ans:selected.answer,opts:selected.options,
      completed:selected.completed,translation:selected.translation,item
    };
  }

  setTop = function mixedToeicSetTop(){
    baseSetTop();
    if (mode === 'toeic') $('#modeName').textContent = '多益 Part 5';
  };
  makeQuestion = function mixedToeicMakeQuestion(){
    if (mode !== 'toeic') return baseMakeQuestion();
    const item = currentWord();
    return item ? buildQuestion(item) || baseMakeQuestion() : null;
  };
  render = function mixedToeicRender(){
    baseRender();
    if (mode !== 'toeic' || !currentQuestion?.toeic) return;
    document.querySelectorAll('.opt').forEach((button,index) => {
      button.innerHTML = `<span class="toeicLetter">(${LETTERS[index]})</span><span>${escapeHtml(button.dataset.value)}</span>`;
    });
    if ($('#fb')) $('#fb').textContent = '請選出最適合填入空格的答案。';
  };
  checkChoice = function mixedToeicCheckChoice(button,value){
    if (mode !== 'toeic' || !currentQuestion?.toeic) return baseCheckChoice(button,value);
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
      markWrong({...question.item,e:question.q,t:`答案：${question.ans}｜${question.completed}｜${question.translation}`},question.label);
    }
    const answerIndex = question.opts.findIndex(option => low(option) === low(question.ans));
    $('#fb').textContent = `${correct?'正確':'錯誤'}\n正確答案：(${LETTERS[answerIndex] || '?'}) ${question.ans}\n\n完整句子：\n${question.completed}\n\n中文：\n${question.translation || question.item.t || question.item.z}`;
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn primary toeicNext';
    next.textContent = '下一題';
    next.onclick = nextQuestion;
    $('#fb').appendChild(document.createElement('br'));
    $('#fb').appendChild(next);
    setTop();
  };

  function install(){
    const modes = document.querySelector('.modes');
    if (modes && !modes.querySelector('[data-mode="toeic"]')) {
      const button = document.createElement('button');
      button.className = 'mode';
      button.dataset.mode = 'toeic';
      button.textContent = '多益 Part 5';
      button.onclick = () => {
        if (loading) return;
        mode = 'toeic';
        currentQuestion = null;
        resetDeck();
        state.lastKinds = [];
        render();
      };
      modes.insertBefore(button,modes.querySelector('[data-mode="wrong"]') || null);
    }
    const style = document.createElement('style');
    style.textContent = '.modes{grid-template-columns:repeat(7,1fr)}.toeicLetter{display:inline-block;min-width:42px;color:#1d4ed8;font-weight:950}.opt.correct .toeicLetter{color:#166534}.opt.wrong .toeicLetter{color:#be123c}.toeicNext{display:block;width:100%;margin-top:14px}@media(max-width:860px){.modes{grid-template-columns:1fr 1fr}}';
    document.head.appendChild(style);
  }

  install();
  const waitForInitial = () => {
    if (typeof loading !== 'undefined' && loading) return setTimeout(waitForInitial,120);
    if (Array.isArray(selectedUnits) && selectedUnits.length) loadRichUnits(selectedUnits).catch(console.warn);
  };
  waitForInitial();
})();