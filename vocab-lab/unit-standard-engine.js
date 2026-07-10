(() => {
  'use strict';

  const config = window.VOCAB_UNIT;
  if (!config || !Array.isArray(config.words) || !config.words.length) {
    document.body.innerHTML = '<p style="padding:24px">找不到 Unit 題庫資料。</p>';
    return;
  }

  const words = config.words;
  const unitNo = String(config.no || '').padStart(2, '0');
  const storageKey = config.storageKey || `unit${unitNo}_vocab_wrong_v1`;
  const irregular = config.irregular || {};
  const state = { view: 'learn', word: words[0].word, query: '', question: null, answered: false, wrong: readWrong(), hideEnglish: false };

  const exampleCount = words.reduce((total, item) => total + (item.ex || []).length, 0);
  document.title = `Unit ${unitNo} Vocabulary Lab`;
  document.body.innerHTML = `
    <main class="app">
      <header class="hero">
        <div class="heroTop">
          <div>
            <div>Level 3 · Unit ${unitNo}</div>
            <h1>Unit ${unitNo} Vocabulary Lab</h1>
            <p>${words.length} 組核心單字與 ${exampleCount} 句教材例句：搜尋、發音、片語、例句閱讀、填空、中翻英與錯題複習。</p>
          </div>
          <a href="../vocab-lab/">返回總目錄</a>
        </div>
        <section class="stats">
          <div><b>${words.length}</b><span>核心單字</span></div>
          <div><b>${exampleCount}</b><span>完整例句</span></div>
          <div><b id="wrongCount">0</b><span>錯題</span></div>
        </section>
      </header>
      <section class="tools">
        <label class="search"><input id="search" placeholder="搜尋英文、中文、片語或例句"></label>
        <nav class="tabs">
          <button class="tab on" data-view="learn">單字學習</button>
          <button class="tab" data-view="read">例句閱讀</button>
          <button class="tab" data-view="quiz">例句填空</button>
          <button class="tab" data-view="type">中翻英</button>
          <button class="tab" data-view="wrong">錯題複習</button>
        </nav>
      </section>
      <section class="work"><aside class="list" id="list"></aside><article class="stage" id="stage"></article></section>
    </main>`;

  function readWrong() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveWrong() {
    localStorage.setItem(storageKey, JSON.stringify(state.wrong));
    const count = document.querySelector('#wrongCount');
    if (count) count.textContent = state.wrong.length;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function shuffle(items) {
    const output = [...items];
    for (let index = output.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [output[index], output[other]] = [output[other], output[index]];
    }
    return output;
  }

  function unique(items) {
    return [...new Set((items || []).filter(Boolean).map(String))];
  }

  function say(text) {
    if (!text || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 0.78;
    speechSynthesis.speak(speech);
  }

  function current() {
    return words.find(item => item.word === state.word) || words[0];
  }

  function filtered() {
    const query = state.query.trim().toLowerCase();
    if (!query) return words;
    return words.filter(item => [
      item.word, item.zh, item.pos, item.ipa,
      ...(item.family || []), ...(item.syn || []), ...(item.ant || []),
      ...(item.ex || []).flat()
    ].join(' ').toLowerCase().includes(query));
  }

  function variants(item) {
    const base = item.word.toLowerCase();
    const values = new Set(irregular[base] || []);
    [base, `${base}s`, `${base}es`, `${base}ed`, `${base}d`, `${base}ing`, `${base}ly`]
      .forEach(value => values.add(value));
    return [...values].sort((a, b) => b.length - a.length);
  }

  function target(sentence, item) {
    for (const form of variants(item)) {
      const match = String(sentence).match(new RegExp(`\b${escapeRegExp(form)}\b`, 'i'));
      if (match) return match[0];
    }
    return '';
  }

  function highlight(sentence, item) {
    const match = target(sentence, item);
    if (!match) return esc(sentence);
    const safe = esc(sentence);
    const needle = esc(match);
    return safe.replace(new RegExp(escapeRegExp(needle), 'i'), `<mark>${needle}</mark>`);
  }

  function coverPlain(value, className = '') {
    return `<span class="coveredText ${className}">${esc(value)}</span>`;
  }

  function coverHtml(html, className = '') {
    return `<span class="coveredText ${className}">${html}</span>`;
  }

  function coverEnglishText(value) {
    return esc(value).replace(/[A-Za-z][A-Za-z0-9'’.-]*(?:\s+[A-Za-z0-9'’.-]+)*/g, match => `<span class="coveredText">${match}</span>`);
  }

  function chips(items, kind = '') {
    return items?.length
      ? items.map(value => `<span class="chip ${kind}">${coverEnglishText(value)}</span>`).join('')
      : '<span class="muted">—</span>';
  }

  function broadPos(item) {
    const pos = String(item.pos || '').toLowerCase();
    if (pos.includes('adj')) return 'adj';
    if (pos.includes('adv')) return 'adv';
    if (pos.includes('v.')) return 'verb';
    if (pos.includes('n.')) return 'noun';
    return 'other';
  }

  function optionsFor(item, answer) {
    const parallel = words
      .filter(other => other.word !== item.word && broadPos(other) === broadPos(item))
      .map(other => other.word);
    const fallback = words.filter(other => other.word !== item.word).map(other => other.word);
    return shuffle([answer, ...shuffle(unique([...parallel, ...fallback])).slice(0, 3)]);
  }

  function addWrong(question, userAnswer) {
    const key = `${question.mode}|${question.item.word}|${question.prompt}`;
    const existing = state.wrong.find(entry => entry.key === key);
    if (existing) {
      existing.count++;
      existing.userAnswer = userAnswer;
    } else {
      state.wrong.unshift({
        key,
        word: question.item.word,
        zh: question.item.zh,
        mode: question.mode,
        prompt: question.prompt,
        answer: question.answer,
        userAnswer,
        count: 1,
        example: question.example
      });
    }
    saveWrong();
  }

  function moveWord(step) {
    const items = filtered();
    if (!items.length) return;
    const currentIndex = items.findIndex(item => item.word === state.word);
    const index = currentIndex >= 0 ? currentIndex : 0;
    const next = items[(index + step + items.length) % items.length];
    state.word = next.word;
    state.view = 'learn';
    state.question = null;
    render();
    requestAnimationFrame(() => document.querySelector('.wi.on')?.scrollIntoView({ block: 'nearest' }));
  }

  function renderList() {
    const items = filtered();
    const hidden = state.hideEnglish && state.view === 'learn';
    const list = document.querySelector('#list');
    list.classList.toggle('hideEnglish', hidden);
    list.innerHTML = items.length
      ? items.map(item => `
        <button class="wi ${item.word === state.word ? 'on' : ''}" data-word="${esc(item.word)}">
          <b>${coverPlain(item.word, 'listWord')}<span class="num">${esc(item.bookNo)}</span></b>
          <small>${coverPlain(item.pos, 'listPos')} · ${esc(item.zh)}</small>
        </button>`).join('')
      : '<div class="empty">找不到資料</div>';

    document.querySelectorAll('[data-word]').forEach(button => {
      button.onclick = () => {
        state.word = button.dataset.word;
        state.view = 'learn';
        state.question = null;
        render();
      };
    });
  }

  function renderLearn() {
    const item = current();
    const examples = item.ex || [];
    document.querySelector('#stage').classList.toggle('hideEnglish', state.hideEnglish);
    document.querySelector('#stage').innerHTML = `
      <div class="head">
        <div>
          <h2 class="word">${coverPlain(item.word, 'wordCover')}</h2>
          <div class="muted">課本 ${esc(item.bookNo)}　${coverPlain(item.pos, 'inlineCover')}　${coverPlain(item.ipa, 'inlineCover')}</div>
        </div>
        <div class="actions">
          <button class="btn ${state.hideEnglish ? 'active' : ''}" id="hideEnglish">🙈 全蓋住英文</button>
          <button class="btn ${!state.hideEnglish ? 'active' : ''}" id="showEnglish">👁 顯示全部</button>
          <button class="btn" id="prevWord">← 上一個</button>
          <button class="btn main" id="nextWord">下一個單字 →</button>
          <button class="btn main" id="sayWord">🔊 單字</button>
          <button class="btn" id="sayExamples">🔊 全部例句</button>
        </div>
      </div>
      <div class="meaning">${esc(item.zh)}</div>
      <section class="grid">
        <div class="box"><h3>常用片語／延伸字</h3><div class="chips">${chips(item.family)}</div></div>
        <div class="box"><h3>近義詞</h3><div class="chips">${chips(item.syn, 'syn')}</div></div>
        <div class="box"><h3>反義詞</h3><div class="chips">${chips(item.ant, 'ant')}</div></div>
      </section>
      <section class="examples">${examples.map((pair, index) => `
        <article class="ex">
          <div class="exTop"><p>${index + 1}. ${coverHtml(highlight(pair[0], item), 'sentenceCover')}</p><button data-say="${esc(pair[0])}">🔊</button></div>
          <small>${esc(pair[1])}</small>
        </article>`).join('')}</section>`;

    document.querySelector('#hideEnglish').onclick = () => {
      state.hideEnglish = true;
      render();
    };
    document.querySelector('#showEnglish').onclick = () => {
      state.hideEnglish = false;
      render();
    };
    document.querySelector('#prevWord').onclick = () => moveWord(-1);
    document.querySelector('#nextWord').onclick = () => moveWord(1);
    document.querySelector('#sayWord').onclick = () => say(item.word);
    document.querySelector('#sayExamples').onclick = () => {
      if (!examples.length || !('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      let index = 0;
      const next = () => {
        if (index >= examples.length) return;
        const speech = new SpeechSynthesisUtterance(examples[index++][0]);
        speech.lang = 'en-US';
        speech.rate = 0.78;
        speech.onend = () => setTimeout(next, 220);
        speechSynthesis.speak(speech);
      };
      next();
    };
    document.querySelectorAll('[data-say]').forEach(button => button.onclick = () => say(button.dataset.say));
  }

  function renderRead() {
    document.querySelector('#stage').classList.remove('hideEnglish');
    const query = state.query.trim().toLowerCase();
    const rows = words
      .flatMap(item => (item.ex || []).map(example => ({ item, example })))
      .filter(row => !query || [
        row.item.word, row.item.zh, ...(row.item.family || []), ...row.example
      ].join(' ').toLowerCase().includes(query));

    document.querySelector('#stage').innerHTML = `
      <h2>Unit ${unitNo} 完整例句</h2>
      <div class="muted">共 ${rows.length} 句；藍色標記為核心字或其變化。</div>
      <section class="reads">${rows.map(row => `
        <article class="read">
          <b>${esc(row.item.bookNo)} · ${esc(row.item.word)} · ${esc(row.item.pos)}</b>
          <p>${highlight(row.example[0], row.item)}</p>
          <small>${esc(row.example[1])}</small>
          <div class="foot">
            <button class="btn" data-open="${esc(row.item.word)}">查看單字</button>
            <button class="btn main" data-read="${esc(row.example[0])}">🔊</button>
          </div>
        </article>`).join('')}</section>`;

    document.querySelectorAll('[data-read]').forEach(button => button.onclick = () => say(button.dataset.read));
    document.querySelectorAll('[data-open]').forEach(button => {
      button.onclick = () => {
        state.word = button.dataset.open;
        state.view = 'learn';
        render();
      };
    });
  }

  function makeQuestion(mode) {
    const item = shuffle(words)[0];
    if (mode === 'type') {
      return { mode, item, prompt: `請輸入英文：${item.zh}`, answer: item.word, example: item.ex[0] || ['', ''] };
    }
    const example = item.ex.find(pair => target(pair[0], item)) || item.ex[0] || ['', ''];
    const answer = target(example[0], item) || item.word;
    const prompt = example[0]
      ? example[0].replace(new RegExp(`\b${escapeRegExp(answer)}\b`, 'i'), '_____')
      : `請選出：${item.zh}`;
    return {
      mode,
      item,
      prompt: `${prompt}\n${example[1]}`,
      answer,
      options: optionsFor(item, answer),
      example
    };
  }

  function ensureQuestion(mode) {
    if (!state.question || state.question.mode !== mode) {
      state.question = makeQuestion(mode);
      state.answered = false;
    }
    return state.question;
  }

  function renderQuiz(mode) {
    document.querySelector('#stage').classList.remove('hideEnglish');
    const question = ensureQuestion(mode);
    document.querySelector('#stage').innerHTML = `
      <div class="qcard"><small>${mode === 'type' ? '中翻英主動輸出' : '例句填空'}</small><p>${esc(question.prompt)}</p></div>
      ${mode === 'type'
        ? '<div class="input"><input id="answer" placeholder="輸入英文單字" autocomplete="off"><button class="btn main" id="check">檢查</button></div>'
        : `<div class="opts">${question.options.map(option => `<button class="opt" data-option="${esc(option)}">${esc(option)}</button>`).join('')}</div>`}
      <div class="fb" id="feedback">先作答，再查看正確答案與完整例句。</div>
      <div class="foot"><button class="btn" id="skip">跳過</button><button class="btn main" id="next" hidden>下一題</button></div>`;

    if (mode === 'type') {
      const input = document.querySelector('#answer');
      input.focus();
      document.querySelector('#check').onclick = () => checkAnswer(input.value, input);
      input.onkeydown = event => { if (event.key === 'Enter') checkAnswer(input.value, input); };
    } else {
      document.querySelectorAll('[data-option]').forEach(button => {
        button.onclick = () => checkAnswer(button.dataset.option, button);
      });
    }
    document.querySelector('#skip').onclick = nextQuestion;
    document.querySelector('#next').onclick = nextQuestion;
  }

  function checkAnswer(value, control) {
    if (state.answered) return;
    const question = state.question;
    const correct = String(value).trim().toLowerCase() === question.answer.toLowerCase();
    state.answered = true;

    if (question.mode === 'quiz') {
      document.querySelectorAll('.opt').forEach(button => {
        button.disabled = true;
        if (button.dataset.option.toLowerCase() === question.answer.toLowerCase()) button.classList.add('correct');
      });
      if (!correct) control.classList.add('bad');
    } else {
      control.disabled = true;
    }

    if (!correct) addWrong(question, value);
    document.querySelector('#feedback').textContent =
      `${correct ? '正確' : `錯誤。答案：${question.answer}`}\n` +
      `${question.item.word}：${question.item.zh}\n` +
      `${question.example[0] || ''}\n${question.example[1] || ''}`;
    document.querySelector('#next').hidden = false;
  }

  function nextQuestion() {
    state.question = null;
    state.answered = false;
    render();
  }

  function renderWrong() {
    document.querySelector('#stage').classList.remove('hideEnglish');
    document.querySelector('#stage').innerHTML = `
      <div class="head">
        <div><h2>錯題複習</h2><div class="muted">保存你的答案與答錯次數。</div></div>
        <button class="btn" id="clearWrong">清空錯題</button>
      </div>
      <section class="wrongs">${state.wrong.length ? state.wrong.map(entry => `
        <article class="wrong">
          <header><h3>${esc(entry.word)} × ${entry.count}</h3><button class="btn" data-remove="${esc(entry.key)}">移除</button></header>
          <p>${esc(entry.mode === 'type' ? '中翻英' : '例句填空')}
題目：${esc(entry.prompt)}
你的答案：${esc(entry.userAnswer || '未作答')}
正確答案：${esc(entry.answer)}
${esc(entry.example?.[0] || '')}
${esc(entry.example?.[1] || '')}</p>
          <button class="btn main" data-review="${esc(entry.word)}">重新學習</button>
        </article>`).join('') : '<div class="empty">目前沒有錯題。</div>'}</section>`;

    document.querySelector('#clearWrong').onclick = () => {
      state.wrong = [];
      saveWrong();
      renderWrong();
    };
    document.querySelectorAll('[data-remove]').forEach(button => {
      button.onclick = () => {
        state.wrong = state.wrong.filter(entry => entry.key !== button.dataset.remove);
        saveWrong();
        renderWrong();
      };
    });
    document.querySelectorAll('[data-review]').forEach(button => {
      button.onclick = () => {
        state.word = button.dataset.review;
        state.view = 'learn';
        render();
      };
    });
  }

  function render() {
    document.querySelectorAll('.tab').forEach(button => button.classList.toggle('on', button.dataset.view === state.view));
    renderList();
    ({
      learn: renderLearn,
      read: renderRead,
      quiz: () => renderQuiz('quiz'),
      type: () => renderQuiz('type'),
      wrong: renderWrong
    }[state.view])();
    saveWrong();
  }

  document.querySelector('#search').oninput = event => {
    state.query = event.target.value;
    const items = filtered();
    if (items.length && !items.some(item => item.word === state.word)) state.word = items[0].word;
    render();
  };

  document.querySelectorAll('.tab').forEach(button => {
    button.onclick = () => {
      state.view = button.dataset.view;
      state.question = null;
      render();
    };
  });

  document.addEventListener('keydown', event => {
    const active = document.activeElement;
    const typing = active && ['INPUT', 'TEXTAREA'].includes(active.tagName);
    if (typing || state.view !== 'learn') return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveWord(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveWord(-1);
    }
  });

  render();
})();