(() => {
  const styleId = 'vocab-speech-upgrade-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .speak-sentence-btn,.speak-all-btn{border:0;border-radius:12px;padding:7px 10px;font-weight:900;cursor:pointer;background:#111827;color:#fff;margin:0 8px 8px 0;display:inline-flex;align-items:center;gap:4px;font-size:14px;line-height:1.2}
      .speak-all-btn{width:100%;justify-content:center;margin-top:10px;background:#2563eb;padding:12px 14px;border-radius:16px}
      .ex .speak-sentence-btn{float:right;margin-left:10px}
    `;
    document.head.appendChild(style);
  }

  function loadScriptOnce(src) {
    const pathname = new URL(src, location.href).pathname;
    const existing = [...document.scripts].find(script => {
      try { return new URL(script.src, location.href).pathname === pathname; }
      catch (_) { return false; }
    });
    if (existing) {
      if (existing.dataset.loaded === '1' || existing.readyState === 'complete') return Promise.resolve();
      return new Promise(resolve => {
        existing.addEventListener('load', resolve, {once:true});
        existing.addEventListener('error', resolve, {once:true});
        setTimeout(resolve, 1200);
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => { script.dataset.loaded = '1'; resolve(); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function installVocabularyPageUpgrades() {
    const path = location.pathname;
    const version = '20260708-unit22-v1';
    if (path.endsWith('/vocab-lab/comprehensive.html')) {
      await loadScriptOnce(`/english_app/vocab-lab/toeic-part5-upgrade.js?v=${version}`);
      await loadScriptOnce(`/english_app/vocab-lab/toeic-part5-quality-v5.js?v=${version}`);
      await loadScriptOnce(`/english_app/vocab-lab/unit11-upgrade.js?v=${version}`);
      await loadScriptOnce(`/english_app/vocab-lab/comprehensive-unit22-upgrade.js?v=${version}`);
    } else if (path.endsWith('/vocab-lab/grammar.html')) {
      await loadScriptOnce(`/english_app/vocab-lab/unit11-upgrade.js?v=${version}`);
    }
  }

  installVocabularyPageUpgrades().catch(error => console.warn('Vocabulary page bootstrap failed:', error));

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('這個瀏覽器不支援語音朗讀。');
      return;
    }
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  }

  function speakQueue(sentences, index = 0) {
    if (!('speechSynthesis' in window) || index >= sentences.length) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.lang = 'en-US';
    utterance.rate = 0.78;
    utterance.onend = () => setTimeout(() => speakQueue(sentences, index + 1), 450);
    window.speechSynthesis.speak(utterance);
  }

  function getCurrentSentences() {
    return [...document.querySelectorAll('.ex strong')]
      .map(el => el.textContent.trim())
      .filter(Boolean);
  }

  function enhanceExamples() {
    document.querySelectorAll('.ex').forEach(ex => {
      if (ex.dataset.speechEnhanced === '1') return;
      const strong = ex.querySelector('strong');
      if (!strong) return;
      const text = strong.textContent.trim();
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'speak-sentence-btn';
      btn.textContent = '🔊 例句';
      btn.addEventListener('click', event => {
        event.stopPropagation();
        speak(text);
      });
      ex.insertBefore(btn, strong);
      ex.dataset.speechEnhanced = '1';
    });

    const side = document.querySelector('.side');
    if (side && !side.querySelector('.speak-all-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'speak-all-btn';
      btn.textContent = '🔊 朗讀全部例句';
      btn.addEventListener('click', () => {
        const sentences = getCurrentSentences();
        if (sentences.length) speakQueue(sentences);
      });
      const btns = side.querySelector('.btns');
      if (btns) btns.insertAdjacentElement('afterend', btn);
      else side.appendChild(btn);
    }
  }

  function getAnswerSentence(fb) {
    const lines = fb.textContent.split('\n').map(x => x.trim()).filter(Boolean);
    return lines.find(x => /^[A-Za-z0-9'"].*[.!?]$/.test(x));
  }

  function feedbackHasBeenAnswered(fb) {
    const text = fb.textContent || '';
    return /正確|錯誤|答案|Correct|Wrong|answer/i.test(text) && getAnswerSentence(fb);
  }

  function enhanceFeedback() {
    const fb = document.querySelector('#fb.feedback, .feedback#fb');
    if (!fb) return;

    const oldBtn = fb.querySelector('.speak-answer-btn');

    if (!feedbackHasBeenAnswered(fb)) {
      if (oldBtn) oldBtn.remove();
      fb.dataset.speechEnhanced = '0';
      return;
    }

    if (oldBtn) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'speak-sentence-btn speak-answer-btn';
    btn.textContent = '🔊 朗讀答案例句';
    btn.style.float = 'none';
    btn.addEventListener('click', () => speak(getAnswerSentence(fb)));
    fb.prepend(btn);
    fb.dataset.speechEnhanced = '1';
  }

  function hidePracticeAnswerInTitle() {
    document.querySelectorAll('.panel h2').forEach(h2 => {
      const text = h2.textContent.trim();
      if (/^分層測[驗量]\s*[:：]/.test(text) || /^分层测[验量]\s*[:：]/.test(text)) {
        h2.textContent = text.includes('分层') ? '分层测验' : '分層測驗';
      }
    });
  }

  function installRenderPracticePatch() {
    if (window.__vocabRenderPracticePatched) return;
    if (typeof renderPractice !== 'function') return;

    const originalRenderPractice = renderPractice;
    window.__vocabRenderPracticePatched = true;
    window.renderPractice = function (...args) {
      const result = originalRenderPractice.apply(this, args);
      hidePracticeAnswerInTitle();
      enhanceFeedback();
      requestAnimationFrame(() => {
        hidePracticeAnswerInTitle();
        enhanceFeedback();
      });
      return result;
    };
  }

  function installRandomNextPatch() {
    if (window.__vocabRandomNextPatched) return;
    if (typeof nextWord !== 'function' || typeof renderPractice !== 'function') return;

    window.__vocabRandomNextPatched = true;
    window.nextWord = function () {
      try {
        const arr = typeof filtered === 'function' ? filtered() : (typeof words !== 'undefined' ? words : []);
        if (!arr || arr.length === 0) return;

        if (arr.length === 1) {
          state.selected = arr[0].word;
        } else {
          let candidate = arr[Math.floor(Math.random() * arr.length)];
          let guard = 0;
          while (candidate.word === state.selected && guard < 20) {
            candidate = arr[Math.floor(Math.random() * arr.length)];
            guard++;
          }
          state.selected = candidate.word;
        }

        if (typeof save === 'function') save();
        window.renderPractice();
      } catch (error) {
        console.warn('Random next patch failed:', error);
      }
    };
  }

  function installGrammarSequentialShufflePatch() {
    if (window.__grammarSequentialShufflePatched) return;
    if (!location.pathname.includes('/vocab-lab/grammar.html')) return;
    if (typeof pool !== 'function' || typeof render !== 'function') return;

    window.__grammarSequentialShufflePatched = true;

    const originalPool = window.pool;
    const sessionPools = new Map();
    const shuffleOnce = arr => [...arr].sort(() => Math.random() - 0.5);
    const keyOf = arr => {
      if (!arr || !arr.length) return 'empty';
      const first = arr[0] || {};
      const last = arr[arr.length - 1] || {};
      return `${arr.length}|${first.unit || ''}|${last.unit || ''}|${first.q || ''}|${last.q || ''}`;
    };

    window.pool = function () {
      const arr = originalPool();
      const key = keyOf(arr);
      if (!sessionPools.has(key)) sessionPools.set(key, shuffleOnce(arr));
      return sessionPools.get(key);
    };

    const title = document.querySelector('.brand p');
    if (title) {
      title.textContent = '考試實戰版：每次重新整理會先把題目洗牌；接著按「下一題」會照本次洗牌後的順序依序出題。';
    }

    if (typeof render === 'function') render();
  }

  function enhance() {
    installRenderPracticePatch();
    installRandomNextPatch();
    installGrammarSequentialShufflePatch();
    enhanceExamples();
    enhanceFeedback();
    hidePracticeAnswerInTitle();
  }

  const observer = new MutationObserver(() => enhance());
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', enhance);
  window.addEventListener('load', enhance);
  setInterval(enhance, 800);
  enhance();
})();