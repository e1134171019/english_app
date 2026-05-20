(() => {
  const unitNo = String(window.VOCAB_UNIT?.no || location.pathname.match(/unit(\d+)/i)?.[1] || '').padStart(2, '0');
  const unitLabel = `Unit ${unitNo}`;
  const unitIndex = Number(unitNo || 0);
  const unitNameZh = window.VOCAB_UNIT?.zh || `第 ${unitIndex} 課`;
  const data = Array.isArray(words) ? words.map(normalizeWord) : [];
  const storageKey = `reading_vocab_mastered_${unitNo}`;
  const wrongKey = `reading_vocab_wrong_${unitNo}`;
  const state = {
    view: 'read',
    selected: data[0]?.word || '',
    query: '',
    level: 1,
    questionOrder: [],
    questionIndex: 0,
    answered: false,
    currentQuestion: null,
    wrong: readJSON(wrongKey, []),
    mastered: new Set(readJSON(storageKey, [])),
  };

  function normalizeWord(w) {
    const related = arr(w.related || w.forms);
    const syn = arr(w.syn);
    const ant = arr(w.ant);
    return {
      word: String(w.word || '').trim(),
      pos: String(w.pos || '').trim(),
      pron: String(w.pron || '').trim(),
      zh: String(w.zh || '').trim(),
      concept: String(w.concept || `核心詞義：${w.zh || ''}`).trim(),
      related,
      syn,
      ant,
      forms: arr(w.forms),
      ex: Array.isArray(w.ex) ? w.ex.map(pair => [String(pair?.[0] || ''), String(pair?.[1] || '')]) : [],
    };
  }
  function arr(v) { return Array.isArray(v) ? v.filter(Boolean).map(String) : []; }
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function attr(s) { return esc(s).replace(/`/g, '&#96;'); }
  function reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function shuffle(list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function activeWord() { return data.find(w => w.word === state.selected) || data[0]; }
  function wordByName(name) { return data.find(w => w.word === name); }
  function inflectedMatch(sentence, word) {
    const raw = String(word || '').trim();
    const bases = [raw, raw.replace(/y$/i, 'i'), raw.replace(/e$/i, '')].filter(Boolean);
    for (const base of bases) {
      const re = new RegExp(`\\b${reEsc(base)}(?:s|es|ed|d|ing)?\\b`, 'i');
      const m = String(sentence).match(re);
      if (m) return m[0];
    }
    return raw;
  }
  function highlight(sentence, word, makeButton = false) {
    const match = inflectedMatch(sentence, word);
    if (!match) return esc(sentence);
    const re = new RegExp(`\\b${reEsc(match)}\\b`, 'i');
    const html = esc(sentence);
    const safeMatch = esc(match);
    return html.replace(new RegExp(reEsc(safeMatch), 'i'), makeButton ? `<button class="hot${state.selected===word?' active':''}" data-word="${attr(word)}">${safeMatch}</button>` : `<strong>${safeMatch}</strong>`);
  }
  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.78;
    speechSynthesis.speak(u);
  }
  function speakExamples(word) {
    const w = wordByName(word);
    if (!w || !w.ex.length || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    let i = 0;
    const go = () => {
      if (i >= w.ex.length) return;
      const u = new SpeechSynthesisUtterance(w.ex[i][0]);
      u.lang = 'en-US';
      u.rate = 0.78;
      u.onend = () => { i += 1; setTimeout(go, 420); };
      speechSynthesis.speak(u);
    };
    go();
  }
  function allExamples() {
    return data.flatMap(w => w.ex.map(ex => ({ word: w.word, en: ex[0], zh: ex[1] })));
  }
  function filteredExamples() {
    const q = state.query.trim().toLowerCase();
    const examples = allExamples();
    if (!q) return examples;
    return examples.filter(item => {
      const w = wordByName(item.word);
      return [item.word, item.en, item.zh, w?.zh, ...(w?.related || []), ...(w?.syn || []), ...(w?.ant || [])].join(' ').toLowerCase().includes(q);
    });
  }
  function updateProgress() {
    const stat = document.querySelector('#stat');
    const bar = document.querySelector('#bar');
    if (!stat || !bar) return;
    stat.textContent = `${state.mastered.size} / ${data.length} mastered`;
    bar.style.width = `${data.length ? (state.mastered.size / data.length) * 100 : 0}%`;
  }
  function markMastered(word) {
    if (!word) return;
    state.mastered.add(word);
    saveJSON(storageKey, [...state.mastered]);
    updateProgress();
  }
  function saveWrong(q) {
    if (!q) return;
    const key = `${q.level}|${q.word}|${q.prompt}`;
    if (!state.wrong.some(item => item.key === key)) {
      state.wrong.unshift({ ...q, key, at: Date.now() });
      saveJSON(wrongKey, state.wrong);
    }
  }
  function clearWrong() {
    state.wrong = [];
    localStorage.removeItem(wrongKey);
    render();
  }
  function removeWrong(key) {
    state.wrong = state.wrong.filter(item => item.key !== key);
    saveJSON(wrongKey, state.wrong);
    render();
  }
  function mountShell() {
    document.title = `${unitLabel} Reading Vocabulary Lab`;
    document.body.innerHTML = `
      <div class="app">
        <header class="top">
          <div class="brand"><h1>${unitLabel} Reading Vocabulary Lab</h1><p>${unitNameZh}：閱讀例句 → 點擊單字 → 字族理解 → 分層測驗 → 錯題複習</p></div>
          <div class="stat"><span id="stat">0 / 0 mastered</span><div class="barBox"><div class="bar" id="bar"></div></div></div>
        </header>
        <nav class="tabs">
          <button class="tab active" data-view="read">文章閱讀</button>
          <button class="tab" data-view="practice">分層測驗</button>
          <button class="tab" data-view="review">錯題複習</button>
          <button class="tab" data-view="map">字族總覽</button>
        </nav>
        <main id="main"></main>
      </div>`;
    injectStyle();
    bindShell();
    updateProgress();
    render();
  }
  function injectStyle() {
    if (document.getElementById('reading-vocab-shared-style')) return;
    const style = document.createElement('style');
    style.id = 'reading-vocab-shared-style';
    style.textContent = `
      :root{--bg:#f5f7fb;--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--blue:#2563eb;--shadow:0 18px 55px rgba(15,23,42,.1)}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif}button,input{font:inherit}button{border:0;cursor:pointer}.app{max-width:1180px;margin:0 auto;padding:18px}.top{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:14px}.brand h1{font-size:28px;margin:0;letter-spacing:-.04em}.brand p{margin:4px 0 0;color:var(--muted)}.stat{background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px 16px;font-weight:900;box-shadow:var(--shadow);min-width:170px}.barBox{height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:10px}.bar{height:100%;width:0;background:linear-gradient(90deg,#2563eb,#60a5fa)}.tabs{display:flex;gap:8px;overflow:auto;margin:12px 0 18px}.tab{white-space:nowrap;border-radius:999px;padding:12px 16px;background:#fff;border:1px solid var(--line);color:var(--muted);font-weight:900}.tab.active{background:#111827;color:#fff}.layout{display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:18px;align-items:start}.reader,.side,.panel{background:#fff;border:1px solid var(--line);border-radius:28px;box-shadow:var(--shadow)}.reader{padding:24px}.reader h2{margin:0 0 14px;font-size:22px}.search{width:100%;padding:14px 16px;border:1px solid var(--line);border-radius:16px;margin-bottom:14px;font-weight:800}.article{display:grid;gap:10px}.vline{border:1px solid var(--line);border-radius:18px;padding:14px;background:#fff}.vline b{display:inline-grid;place-items:center;background:#dbeafe;color:#1d4ed8;border-radius:10px;min-width:34px;height:30px;margin-right:8px}.sent{font-size:18px;line-height:1.65}.tr{color:var(--muted);margin:5px 0 0 46px;line-height:1.55}.hot{display:inline;border:0;border-radius:10px;padding:2px 6px;background:#eef2ff;color:#1d4ed8;font-weight:900}.hot.active{background:#1d4ed8;color:#fff}.hint{font-size:14px;color:var(--muted);margin-top:16px}.side{position:sticky;top:18px;padding:22px}.wordTop{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.word{font-size:46px;line-height:.95;font-weight:950;letter-spacing:-.07em;margin:0;color:#111827}.pos{background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:7px 10px;font-weight:900}.pron{color:var(--muted);margin:8px 0 0}.zh{font-size:23px;font-weight:950;margin:20px 0 8px}.concept{color:var(--muted);line-height:1.7}.block{margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}.block h3{font-size:13px;color:var(--muted);margin:0 0 10px;text-transform:uppercase;letter-spacing:.08em}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border-radius:999px;padding:7px 10px;background:#eef2ff;color:#3730a3;font-weight:800}.syn{background:#ecfdf5;color:#047857}.ant{background:#fff1f2;color:#be123c}.ex{border-left:4px solid #93c5fd;padding-left:12px;margin:10px 0}.ex strong{display:block;line-height:1.55}.ex span{display:block;color:var(--muted);margin-top:4px;line-height:1.55}.exHead{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.btn{border-radius:16px;padding:13px 14px;font-weight:900;background:#e5e7eb;color:#111827}.primary{background:var(--blue);color:#fff}.dark{background:#111827;color:#fff}.panel{padding:22px}.panel h2{margin:0 0 14px}.levels{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.level{border-radius:16px;padding:12px 8px;background:#fff;border:1px solid var(--line);font-weight:900;color:var(--muted)}.level.active{background:#2563eb;color:white}.qcard{border-radius:22px;background:#111827;color:#fff;padding:22px;margin-bottom:14px}.qcard small{color:#cbd5e1;font-weight:900;text-transform:uppercase}.q{font-size:28px;font-weight:950;line-height:1.35;margin:10px 0 0}.options{display:grid;grid-template-columns:1fr 1fr;gap:10px}.opt{border-radius:16px;padding:14px;background:#fff;border:1px solid var(--line);font-weight:900;text-align:left}.opt.correct{background:#dcfce7;color:#166534;border-color:#86efac}.opt.wrong{background:#ffe4e6;color:#be123c;border-color:#fda4af}.input{width:100%;border:1px solid var(--line);border-radius:16px;padding:14px;font-size:20px;font-weight:900}.feedback{margin-top:12px;border-radius:18px;padding:14px;background:#f9fafb;border:1px solid var(--line);white-space:pre-wrap;line-height:1.7}.list{display:grid;gap:10px}.row{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid var(--line);border-radius:18px;padding:14px}.row strong{font-size:20px}.row span{color:var(--muted);font-size:14px}.small{font-size:13px;color:var(--muted)}.ghost{background:#fff;border:1px solid var(--line)}.empty{color:var(--muted);padding:18px;border:1px dashed var(--line);border-radius:18px}.kbd{display:inline-block;padding:2px 8px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:900}@media(max-width:900px){.layout{grid-template-columns:1fr}.side{position:static}.levels,.options{grid-template-columns:1fr 1fr}}@media(max-width:560px){.app{padding:12px}.top{align-items:flex-start;flex-direction:column}.reader,.side,.panel{border-radius:22px;padding:18px}.word{font-size:40px}.levels,.options,.btns{grid-template-columns:1fr}.stat{width:100%}.tr{margin-left:0}.sent{font-size:17px}}
    `;
    document.head.appendChild(style);
  }
  function bindShell() {
    document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === btn));
      render();
    }));
  }
  function render() {
    if (state.view === 'read') renderRead();
    if (state.view === 'practice') renderPractice();
    if (state.view === 'review') renderReview();
    if (state.view === 'map') renderMap();
  }
  function renderRead() {
    const main = document.querySelector('#main');
    const examples = filteredExamples();
    const w = activeWord();
    main.innerHTML = `<section class="layout"><article class="reader"><h2>${unitLabel} Example Context</h2><input class="search" id="search" placeholder="搜尋${unitNameZh}單字、中文、相關詞，例如 ${esc(data[0]?.word || '')} / 反義詞"><div class="article">${examples.map((item, idx) => `<div class="vline"><div class="sent"><b>${idx + 1}</b>${highlight(item.en, item.word, true)}</div><p class="tr">${esc(item.zh)}</p></div>`).join('') || '<div class="empty">沒有符合的例句。</div>'}</div><p class="hint">點擊藍色單字即可切換右側資訊卡。</p></article>${renderSide(w)}</section>`;
    const search = document.querySelector('#search');
    search.value = state.query;
    search.addEventListener('input', e => { state.query = e.target.value; renderRead(); });
    document.querySelectorAll('.hot').forEach(btn => btn.addEventListener('click', () => { state.selected = btn.dataset.word; renderRead(); }));
    bindSideButtons();
  }
  function renderSide(w) {
    if (!w) return '<aside class="side empty">尚無單字資料。</aside>';
    const related = [...new Set([...(w.related || []), ...(w.forms || [])])];
    return `<aside class="side"><div class="wordTop"><div><h2 class="word">${esc(w.word)}</h2><p class="pron">${esc(w.pron || '')}</p></div><span class="pos">${esc(w.pos || '—')}</span></div><div class="zh">${esc(w.zh)}</div><p class="concept">${esc(w.concept || '')}</p><div class="block"><h3>Related Words</h3><div class="chips">${related.map(x => `<span class="chip">${esc(x)}</span>`).join('') || '<span class="small">No data</span>'}</div></div><div class="block"><h3>Synonyms</h3><div class="chips">${w.syn.map(x => `<span class="chip syn">${esc(x)}</span>`).join('') || '<span class="small">No data</span>'}</div></div><div class="block"><h3>Antonyms</h3><div class="chips">${w.ant.map(x => `<span class="chip ant">${esc(x)}</span>`).join('') || '<span class="small">No data</span>'}</div></div><div class="block"><h3>Examples</h3>${w.ex.map((e, i) => `<div class="ex"><div class="exHead"><strong>${esc(e[0])}</strong><button class="btn dark speak-one" data-text="${attr(e[0])}">🔊 例句</button></div><span>${esc(e[1])}</span></div>`).join('') || '<div class="small">No data</div>'}</div><div class="btns"><button class="btn primary speak-word" data-text="${attr(w.word)}">🔊 朗讀單字</button><button class="btn speak-all" data-word="${attr(w.word)}">🔊 全部例句</button></div></aside>`;
  }
  function bindSideButtons() {
    document.querySelectorAll('.speak-one,.speak-word').forEach(btn => btn.addEventListener('click', () => speak(btn.dataset.text)));
    document.querySelectorAll('.speak-all').forEach(btn => btn.addEventListener('click', () => speakExamples(btn.dataset.word)));
  }
  function poolForQuestions() { return data.filter(w => w.ex.length); }
  function questionFor(word, level) {
    const wordsPool = poolForQuestions();
    const distractors = shuffle(wordsPool.filter(w => w.word !== word.word)).slice(0, 3);
    if (level === 1) {
      return { level, word: word.word, prompt: word.word, label: 'LEVEL 1 英文選中文', answer: word.zh, choices: shuffle([word.zh, ...distractors.map(w => w.zh)]), explanation: `${word.word}：${word.zh}` };
    }
    if (level === 2) {
      return { level, word: word.word, prompt: word.zh, label: 'LEVEL 2 中文選英文', answer: word.word, choices: shuffle([word.word, ...distractors.map(w => w.word)]), explanation: `${word.word}：${word.zh}` };
    }
    if (level === 3) {
      const ex = word.ex[0]; const target = inflectedMatch(ex[0], word.word); const blank = ex[0].replace(new RegExp(`\\b${reEsc(target)}\\b`, 'i'), '______');
      return { level, word: word.word, prompt: blank, label: 'LEVEL 3 例句選單字', answer: target, choices: shuffle([target, ...distractors.map(w => inflectedMatch(w.ex[0]?.[0] || w.word, w.word))]), zh: ex[1], explanation: `${word.word}：${word.zh}` };
    }
    return { level, word: word.word, prompt: word.zh, label: 'LEVEL 4 主動輸出', answer: word.word, input: true, explanation: `${word.word}：${word.zh}` };
  }
  function resetQuestions() {
    state.questionOrder = shuffle(poolForQuestions());
    state.questionIndex = 0;
    state.answered = false;
    state.currentQuestion = state.questionOrder.length ? questionFor(state.questionOrder[0], state.level) : null;
  }
  function ensureQuestion() {
    if (!state.currentQuestion) resetQuestions();
  }
  function nextQuestion() {
    if (!state.questionOrder.length) resetQuestions();
    else {
      state.questionIndex = (state.questionIndex + 1) % state.questionOrder.length;
      state.answered = false;
      state.currentQuestion = questionFor(state.questionOrder[state.questionIndex], state.level);
    }
    renderPractice();
  }
  function renderPractice() {
    ensureQuestion();
    const q = state.currentQuestion;
    const main = document.querySelector('#main');
    main.innerHTML = `<section class="panel"><h2>分層測驗</h2><div class="levels">${[1,2,3,4].map(n => `<button class="level ${state.level===n?'active':''}" data-level="${n}">${n}級</button>`).join('')}</div>${q ? `<div class="qcard"><small>${esc(q.label)}</small><p class="q">${esc(q.prompt)}</p></div>${q.input ? `<input class="input" id="answerInput" placeholder="輸入英文單字">` : `<div class="options">${q.choices.map(c => `<button class="opt" data-choice="${attr(c)}">${esc(c)}</button>`).join('')}</div>`}<div class="btns"><button class="btn primary" id="checkBtn">檢查</button><button class="btn" id="nextBtn">下一個字</button></div><div class="feedback" id="feedback">作答後才會顯示答案、中文與解析。</div>` : '<div class="empty">目前沒有可測驗的題目。</div>'}</section>`;
    document.querySelectorAll('.level').forEach(btn => btn.addEventListener('click', () => { state.level = Number(btn.dataset.level); resetQuestions(); renderPractice(); }));
    if (!q) return;
    document.querySelector('#checkBtn').addEventListener('click', () => checkPractice());
    document.querySelector('#nextBtn').addEventListener('click', () => nextQuestion());
    if (!q.input) document.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => { if (!state.answered) { document.querySelectorAll('.opt').forEach(x => x.classList.remove('selected')); btn.classList.add('selected'); btn.dataset.selected = '1'; } }));
    if (q.input) document.querySelector('#answerInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkPractice(); });
  }
  function chosenOption() { return document.querySelector('.opt[data-selected="1"]')?.dataset.choice || ''; }
  function checkPractice() {
    if (state.answered || !state.currentQuestion) return;
    const q = state.currentQuestion;
    const user = q.input ? document.querySelector('#answerInput')?.value.trim() : chosenOption();
    const correct = String(user).toLowerCase() === String(q.answer).toLowerCase();
    const fb = document.querySelector('#feedback');
    if (!user) { fb.textContent = '請先作答。'; return; }
    state.answered = true;
    if (!q.input) {
      document.querySelectorAll('.opt').forEach(btn => {
        btn.disabled = true;
        if (String(btn.dataset.choice).toLowerCase() === String(q.answer).toLowerCase()) btn.classList.add('correct');
        if (btn.dataset.selected === '1' && !correct) btn.classList.add('wrong');
      });
    }
    if (correct) {
      markMastered(q.word);
      fb.textContent = `正確。\n答案：${q.answer}\n${q.zh ? `中文：${q.zh}\n` : ''}解析：${q.explanation}`;
    } else {
      saveWrong(q);
      fb.textContent = `錯誤。\n正確答案：${q.answer}\n${q.zh ? `中文：${q.zh}\n` : ''}解析：${q.explanation}`;
    }
  }
  function renderReview() {
    const main = document.querySelector('#main');
    main.innerHTML = `<section class="panel"><div class="wordTop"><h2>錯題複習</h2><button class="btn ghost" id="clearWrong">清除錯題</button></div><div class="list">${state.wrong.map(item => `<div class="row"><div><strong>${esc(item.word)}</strong><br><span>${esc(item.label || '')}｜${esc(item.prompt || '')}</span></div><button class="btn" data-remove="${attr(item.key)}">移除</button></div>`).join('') || '<div class="empty">目前沒有錯題。</div>'}</div></section>`;
    document.querySelector('#clearWrong')?.addEventListener('click', clearWrong);
    document.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => removeWrong(btn.dataset.remove)));
  }
  function renderMap() {
    const main = document.querySelector('#main');
    main.innerHTML = `<section class="panel"><h2>字族總覽</h2><div class="list">${data.map(w => `<div class="row"><div><strong>${esc(w.word)}</strong><br><span>${esc(w.zh)} ｜ ${esc([...(w.related || []), ...(w.forms || [])].join(' / ') || 'No related data')}</span></div><button class="btn" data-open="${attr(w.word)}">查看</button></div>`).join('')}</div></section>`;
    document.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => { state.selected = btn.dataset.open; state.view = 'read'; document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === 'read')); renderRead(); }));
  }

  mountShell();
})();