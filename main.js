/**
 * 個人英文練習網站 - 主程式
 * 重構版本 - Phase 1: 核心功能
 * 注意：fullWordList 由 wordsData.js 提供
 */

console.log('=== main.js is loading ===');

// ===== Section 1: Global State =====
// fullWordList 由 wordsData.js 定義，不在此處初始化
let userWords = [];
let blockedWords = [];
let activeWordList = [];
let currentMode = 'home';
let selectedLevels = [];
let currentIndex = 0;
let currentCard = {};
let currentSpeed = 1.0;
let pendingMode = '';
let currentTier = '';

// 測驗相關
let quizList = [];
let quizIndex = 0;
let quizCurrentWord = null;

// 動詞三態相關
let verb3CurrentLevel = 'JH';
let verb3List = [];
let verb3Index = 0;
let verb3CurrentVerb = null;

// 自訂義訓練
let customWordList = [];

// ===== Section 2: Data Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');
  initData();
  updateWordCounts();
  initNavigation();
  initTwoTierMenu();
  showScreen('home-screen');
});

function initData() {
  // 檢查 wordsData.js 是否已載入
  if (typeof fullWordList === 'undefined' || !Array.isArray(fullWordList) || fullWordList.length === 0) {
    console.error('ERROR: wordsData.js not loaded! fullWordList is undefined or empty.');
    alert('資料載入失敗！請確認 wordsData.js 檔案存在且正確載入。');
    return;
  }

  console.log(`✓ Loaded ${fullWordList.length} words from wordsData.js`);

  // 載入使用者自訂單字
  const savedUserWords = localStorage.getItem('userWords');
  if (savedUserWords) {
    try {
      userWords = JSON.parse(savedUserWords);
    } catch (e) {
      userWords = [];
    }
  }

  // 載入被封鎖的單字
  const savedBlockedWords = localStorage.getItem('blockedWords');
  if (savedBlockedWords) {
    try {
      blockedWords = JSON.parse(savedBlockedWords);
    } catch (e) {
      blockedWords = [];
    }
  }

  console.log(`Loaded ${userWords.length} user words`);
  console.log(`Loaded ${blockedWords.length} blocked words`);
}

function saveUserWords() {
  localStorage.setItem('userWords', JSON.stringify(userWords));
}

function saveBlockedWords() {
  localStorage.setItem('blockedWords', JSON.stringify(blockedWords));
}

// ===== Section 3: Screen Navigation =====
function showScreen(screenId) {
  console.log(`Navigating to screen: ${screenId}`);

  // 隱藏所有畫面
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  // 顯示指定畫面
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
    currentMode = screenId;
    console.log(`✓ Screen ${screenId} is now active`);
  } else {
    console.error(`Screen ${screenId} not found!`);
  }
}

function showLevelSelection(mode) {
  console.log(`showLevelSelection called with mode: ${mode}`);
  pendingMode = mode;
  showScreen('level-select-screen');
  backToTier1();
}

function showTier2(tier) {
  console.log(`showTier2 called with tier: ${tier}`);
  currentTier = tier;

  // 隱藏第一層
  document.getElementById('tier1-selection').classList.add('hidden');

  const tier2JhEl = document.getElementById('tier2-jh');
  const tier2ShEl = document.getElementById('tier2-sh');

  if (!tier2JhEl || !tier2ShEl) {
    console.warn('Tier 2 elements not found');
    return;
  }

  if (tier === 'JH') {
    tier2JhEl.classList.remove('hidden');
    tier2ShEl.classList.add('hidden');
    updateLevelSelectTitle('請選擇國中年級');
  } else if (tier === 'SH') {
    tier2ShEl.classList.remove('hidden');
    tier2JhEl.classList.add('hidden');
    updateLevelSelectTitle('請選擇高中年級');
  }

  const tierBackBtn = document.getElementById('tier-back-btn');
  if (tierBackBtn) {
    tierBackBtn.classList.remove('hidden');
  }
}

function backToTier1() {
  currentTier = '';

  const tier1El = document.getElementById('tier1-selection');
  const tier2JhEl = document.getElementById('tier2-jh');
  const tier2ShEl = document.getElementById('tier2-sh');

  if (tier1El) tier1El.classList.remove('hidden');
  if (tier2JhEl) tier2JhEl.classList.add('hidden');
  if (tier2ShEl) tier2ShEl.classList.add('hidden');

  const tierBackBtn = document.getElementById('tier-back-btn');
  if (tierBackBtn) {
    tierBackBtn.classList.add('hidden');
  }

  updateLevelSelectTitle();
}

function updateLevelSelectTitle(subTitle = '') {
  const baseLabel = pendingMode === 'quiz' ? '發音測驗' : '單字練習';
  const suffix = subTitle || '請選擇學制';
  const titleEl = document.getElementById('level-select-title');
  if (titleEl) {
    titleEl.textContent = `${baseLabel} - ${suffix}`;
  }
}

function selectLevel(levels) {
  console.log(`selectLevel called with levels: ${levels}`);
  selectedLevels = levels;
  updateActiveWordList(levels);

  // 根據 pendingMode 進入對應模式
  if (pendingMode === 'practice') {
    enterPracticeMode();
  } else if (pendingMode === 'quiz') {
    enterQuizMode();
  }
}

function updateActiveWordList(levels) {
  // 合併內建單字和使用者單字
  const allWords = [...fullWordList, ...userWords];

  // 過濾掉被封鎖的單字
  const filteredWords = allWords.filter(word =>
    !blockedWords.includes(word.english)
  );

  // 根據等級篩選
  activeWordList = filteredWords.filter(word =>
    levels.includes(word.level)
  );

  console.log(`Filtered ${activeWordList.length} words for levels: ${levels.join(', ')}`);
}

function updateWordCounts() {
  // 檢查 fullWordList 是否存在
  if (typeof fullWordList === 'undefined' || !Array.isArray(fullWordList)) {
    console.warn('fullWordList not available, skipping word count update');
    return;
  }

  // 計算各等級的單字數量
  const allWords = [...fullWordList, ...userWords];
  const counts = {
    J1: 0, J2: 0, J3: 0,
    H1: 0, H2: 0, H3: 0,
    ADV: 0
  };

  allWords.forEach(word => {
    if (counts.hasOwnProperty(word.level)) {
      counts[word.level]++;
    }
  });

  // 更新 UI
  const updateCount = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `共 ${count} 字`;
  };

  updateCount('j1-count', counts.J1);
  updateCount('j2-count', counts.J2);
  updateCount('j3-count', counts.J3);
  updateCount('h1-count', counts.H1);
  updateCount('h2-count', counts.H2);
  updateCount('h3-count', counts.H3);
  updateCount('adv-count', counts.ADV);

  const jhTotal = counts.J1 + counts.J2 + counts.J3;
  const shTotal = counts.H1 + counts.H2 + counts.H3;
  const allTotal = jhTotal + shTotal + counts.ADV;

  updateCount('jh-count', jhTotal);
  updateCount('sh-count', shTotal);
  updateCount('all-count', allTotal);
}

// ===== Section 4: Word Practice Mode =====
function enterPracticeMode() {
  if (activeWordList.length === 0) {
    alert('此等級沒有單字！');
    showScreen('home-screen');
    return;
  }

  currentIndex = 0;
  showScreen('practice-screen');
  renderCard();
}

function renderCard() {
  if (activeWordList.length === 0) return;

  currentCard = activeWordList[currentIndex];
  const cardEl = document.getElementById('flashcard');

  // 移除翻面狀態
  cardEl.classList.remove('is-flipped');

  setTimeout(() => {
    // 更新卡片內容
    document.getElementById('card-chinese').textContent = currentCard.translation || '(未命名)';
    document.getElementById('card-english').textContent = currentCard.english;
    document.getElementById('card-pos').textContent = currentCard.pos || '';
    document.getElementById('card-phonetic').textContent = '';

    // 解釋
    const meaningEl = document.getElementById('card-meaning');
    meaningEl.textContent = currentCard.translation || '';

    // 搭配詞
    const colList = document.getElementById('back-collocations');
    colList.innerHTML = '';

    // 例句
    const sentBoxEl = document.getElementById('card-sentence-box');
    const sentEnEl = document.getElementById('card-example-en');
    const sentCnEl = document.getElementById('card-example-zh');

    if (currentCard.example_en) {
      sentEnEl.innerHTML = createInteractiveSentence(currentCard.example_en);
      sentCnEl.textContent = currentCard.example_zh || '';
      sentBoxEl.style.display = 'block';
    } else {
      sentBoxEl.style.display = 'none';
    }

    // 更新頁碼
    document.getElementById('page-indicator').textContent =
      `${currentIndex + 1} / ${activeWordList.length}`;

    // 更新按鈕狀態
    document.getElementById('prevBtn').disabled = currentIndex === 0;
    document.getElementById('nextBtn').disabled = currentIndex === activeWordList.length - 1;
  }, 150);
}

function flipCard() {
  document.getElementById('flashcard').classList.toggle('is-flipped');
}

function prevCard() {
  if (currentIndex > 0) {
    cancelSpeech();
    currentIndex--;
    renderCard();
  }
}

function nextCard() {
  if (currentIndex < activeWordList.length - 1) {
    cancelSpeech();
    currentIndex++;
    renderCard();
  }
}

// ===== Section 5: Interactive Sentence (Tooltip) =====
let _translationTooltipEl = null;
let _hideTimer = null;

function createInteractiveSentence(sentence) {
  if (!sentence) return '';

  const words = sentence.split(/(\s+|[.,!?;:])/);

  return words.map(word => {
    if (/^[a-zA-Z]+$/.test(word)) {
      return `<span class="word-token" onmouseenter="showWordTooltip(event, '${word}')" onmouseleave="scheduleHideTooltip()">${word}</span>`;
    }
    return word;
  }).join('');
}

function showWordTooltip(event, word) {
  clearTimeout(_hideTimer);

  if (!_translationTooltipEl) {
    _translationTooltipEl = document.getElementById('translation-tooltip');
  }

  const translation = `${word} (點擊查看翻譯)`;

  _translationTooltipEl.innerHTML = `<strong>${word}</strong><br>${translation}`;
  _translationTooltipEl.classList.remove('hidden');
  _translationTooltipEl.classList.add('visible');

  const rect = event.target.getBoundingClientRect();
  _translationTooltipEl.style.position = 'fixed';
  _translationTooltipEl.style.top = `${rect.bottom + 5}px`;
  _translationTooltipEl.style.left = `${rect.left}px`;
}

function scheduleHideTooltip() {
  _hideTimer = setTimeout(() => {
    hideTooltip();
  }, 300);
}

function hideTooltip() {
  if (_translationTooltipEl) {
    _translationTooltipEl.classList.remove('visible');
    _translationTooltipEl.classList.add('hidden');
  }
}

// ===== Section 6: Speech Synthesis =====
function speakText(text, rateMultiplier = 1.0) {
  if (!window.speechSynthesis || !text) return;
  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = currentSpeed * rateMultiplier;

  const voices = window.speechSynthesis.getVoices();
  const bestVoice = voices.find(v => v.name.includes('Google US English')) ||
    voices.find(v => v.lang === 'en-US');
  if (bestVoice) utterance.voice = bestVoice;

  window.speechSynthesis.speak(utterance);
}

function cancelSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function updateSpeed(val) {
  currentSpeed = parseFloat(val) || 1.0;
}

async function autoPlayCurrent() {
  const cardEl = document.getElementById('flashcard');
  if (!cardEl.classList.contains('is-flipped')) {
    cardEl.classList.add('is-flipped');
    await wait(600);
  }

  speakText(currentCard.english, 1.0);
  await wait(1500);

  if (currentCard.example_en) {
    speakText(currentCard.example_en, 0.9);
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Section 7: Quiz Mode =====
function enterQuizMode() {
  if (activeWordList.length === 0) {
    alert('此等級沒有單字！');
    showScreen('home-screen');
    return;
  }

  quizList = [...activeWordList].sort(() => Math.random() - 0.5);
  quizIndex = 0;

  showScreen('quiz-screen');
  loadQuizQuestion();
}

function loadQuizQuestion() {
  if (quizIndex >= quizList.length) {
    alert('測驗完成！');
    showScreen('home-screen');
    return;
  }

  quizCurrentWord = quizList[quizIndex];

  document.getElementById('quiz-current').textContent = quizIndex + 1;
  document.getElementById('quiz-total').textContent = quizList.length;

  document.getElementById('quiz-input').value = '';
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-next-btn').disabled = true;

  setTimeout(() => {
    playQuizAudio();
  }, 500);
}

function playQuizAudio() {
  if (quizCurrentWord) {
    speakText(quizCurrentWord.english, 1.0);
  }
}

function submitQuizAnswer() {
  const userAnswer = document.getElementById('quiz-input').value.trim().toLowerCase();
  const correctAnswer = quizCurrentWord.english.toLowerCase();

  const resultEl = document.getElementById('quiz-result');
  const statusEl = document.getElementById('quiz-result-status');
  const answerEl = document.getElementById('quiz-correct-answer');

  if (userAnswer === correctAnswer) {
    statusEl.textContent = '✅ 正確！';
    statusEl.style.color = '#10B981';
  } else {
    statusEl.textContent = '❌ 錯誤';
    statusEl.style.color = '#EF4444';
  }

  answerEl.textContent = `${quizCurrentWord.english} (${quizCurrentWord.translation})`;
  resultEl.classList.remove('hidden');

  document.getElementById('quiz-next-btn').disabled = false;
}

function nextQuizQuestion() {
  quizIndex++;
  loadQuizQuestion();
}

// ===== Section 8: Advanced Training - Verb3 =====
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.add('hidden');
    pane.classList.remove('active');
  });

  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) {
    targetPane.classList.remove('hidden');
    targetPane.classList.add('active');
  }

  if (tabName === 'verb3') {
    loadVerb3Data();
  }
}

function selectVerbLevel(level) {
  verb3CurrentLevel = level;

  document.querySelectorAll('.verb-level-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  loadVerb3Data();
}

function loadVerb3Data() {
  if (typeof verb3List === 'undefined' || !Array.isArray(window.verb3List)) {
    console.warn('verb3Data.js not loaded');
    return;
  }

  const allVerbs = window.verb3List;

  if (verb3CurrentLevel === 'JH') {
    verb3List = allVerbs.filter(v => ['J1', 'J2', 'J3'].includes(v.level));
  } else {
    verb3List = allVerbs.filter(v => ['H1', 'H2', 'H3'].includes(v.level));
  }

  verb3List = verb3List.sort(() => Math.random() - 0.5);
  verb3Index = 0;

  loadVerb3Question();
}

function loadVerb3Question() {
  if (verb3Index >= verb3List.length) {
    verb3Index = 0;
  }

  verb3CurrentVerb = verb3List[verb3Index];

  document.getElementById('verb3-base').textContent = verb3CurrentVerb.base;
  document.getElementById('verb3-translation').textContent = `(${verb3CurrentVerb.translation})`;

  document.getElementById('verb3-past-input').value = '';
  document.getElementById('verb3-pp-input').value = '';

  document.getElementById('verb3-result').classList.add('hidden');
  document.getElementById('verb3-next').disabled = true;
}

function submitVerb3Answer() {
  const userPast = document.getElementById('verb3-past-input').value.trim().toLowerCase();
  const userPP = document.getElementById('verb3-pp-input').value.trim().toLowerCase();

  const correctPast = verb3CurrentVerb.past.toLowerCase();
  const correctPP = verb3CurrentVerb.ppart.toLowerCase();

  const resultEl = document.getElementById('verb3-result');

  let message = '';

  if (userPast === correctPast && userPP === correctPP) {
    message = '✅ 完全正確！';
    resultEl.style.color = '#10B981';
  } else {
    message = `❌ 答案：<br>過去式：${verb3CurrentVerb.past}<br>過去分詞：${verb3CurrentVerb.ppart}`;
    resultEl.style.color = '#EF4444';
  }

  resultEl.innerHTML = message;
  resultEl.classList.remove('hidden');
  document.getElementById('verb3-next').disabled = false;
}

function nextVerb3Question() {
  verb3Index++;
  loadVerb3Question();
}

// ===== Section 9: Custom Training =====
function searchCustomWords() {
  const input = document.getElementById('custom-words-input').value;

  const words = input
    .split(/[\n,\s]+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0);

  if (words.length === 0) {
    alert('請輸入單字！');
    return;
  }

  if (words.length > 100) {
    alert('最多只能輸入 100 個單字！');
    return;
  }

  const allWords = [...fullWordList, ...userWords];
  const validWords = [];
  const invalidWords = [];

  words.forEach(word => {
    const found = allWords.find(w => w.english.toLowerCase() === word);
    if (found) {
      validWords.push(found);
    } else {
      invalidWords.push(word);
    }
  });

  document.getElementById('custom-valid-count').textContent = validWords.length;
  document.getElementById('custom-invalid-list').textContent =
    invalidWords.length > 0 ? invalidWords.join(', ') : '無';

  document.getElementById('custom-results').classList.remove('hidden');

  customWordList = validWords;
}

function startCustomPractice() {
  if (customWordList.length === 0) {
    alert('沒有有效的單字！');
    return;
  }

  activeWordList = customWordList;
  currentIndex = 0;
  showScreen('practice-screen');
  renderCard();
}

function startCustomQuiz() {
  if (customWordList.length === 0) {
    alert('沒有有效的單字！');
    return;
  }

  quizList = [...customWordList].sort(() => Math.random() - 0.5);
  quizIndex = 0;
  showScreen('quiz-screen');
  loadQuizQuestion();
}

// ===== Section 10: Add/Delete Words =====
function saveNewWord() {
  const english = document.getElementById('add-english').value.trim();
  const pos = document.getElementById('add-pos').value.trim();
  const translation = document.getElementById('add-translation').value.trim();
  const level = document.getElementById('add-level').value;
  const exampleEn = document.getElementById('add-example-en').value.trim();
  const exampleZh = document.getElementById('add-example-zh').value.trim();

  if (!english || !translation) {
    alert('請至少填寫英文單字和中文翻譯！');
    return;
  }

  const newWord = {
    english,
    pos,
    translation,
    level,
    family_id: `USER_${Date.now()}`,
    example_en: exampleEn,
    example_zh: exampleZh
  };

  userWords.push(newWord);
  saveUserWords();
  updateWordCounts();

  document.getElementById('add-english').value = '';
  document.getElementById('add-pos').value = '';
  document.getElementById('add-translation').value = '';
  document.getElementById('add-example-en').value = '';
  document.getElementById('add-example-zh').value = '';

  const messageEl = document.getElementById('add-message');
  messageEl.textContent = `✅ 成功新增單字「${english}」！`;
  messageEl.classList.remove('hidden');
  messageEl.style.color = '#10B981';

  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 3000);
}

function filterDeleteList() {
  const searchTerm = document.getElementById('delete-search').value.toLowerCase();
  renderDeleteList(searchTerm);
}

function renderDeleteList(searchTerm = '') {
  const listEl = document.getElementById('delete-list');

  let wordsToShow = userWords;

  if (searchTerm) {
    wordsToShow = wordsToShow.filter(w =>
      w.english.toLowerCase().includes(searchTerm) ||
      w.translation.includes(searchTerm)
    );
  }

  if (wordsToShow.length === 0) {
    listEl.innerHTML = '<li style="text-align: center; color: #9CA3AF; padding: 20px;">沒有找到單字</li>';
    return;
  }

  listEl.innerHTML = wordsToShow.map((word, index) => `
    <li class="word-list-item">
      <div class="word-info">
        <strong>${word.english}</strong> (${word.pos || 'n/a'})
        <br>
        <span style="color: #6B7280;">${word.translation}</span>
      </div>
      <button class="delete-btn" onclick="deleteUserWord('${word.english}')">刪除</button>
    </li>
  `).join('');
}

function deleteUserWord(english) {
  if (!confirm(`確定要刪除單字「${english}」嗎？`)) {
    return;
  }

  userWords = userWords.filter(w => w.english !== english);
  saveUserWords();
  updateWordCounts();
  renderDeleteList();

  showToast(`✅ 已刪除「${english}」`);
}

// ===== Section 11: Utility Functions =====
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2000);
  }
}

// ===== Section 12: Navigation Initialization =====
function initNavigation() {
  // 首頁選單按鈕事件綁定
  const buttons = document.querySelectorAll('.menu-btn');
  buttons.forEach(btn => {
    const target = btn.dataset.target;
    const mode = btn.dataset.mode;

    btn.addEventListener('click', () => {
      if (target === 'level-select-screen') {
        pendingMode = mode || 'practice';  // practice / quiz
        showScreen('level-select-screen');
        backToTier1();
      } else {
        showScreen(target);
      }
    });
  });

  console.log('✓ Navigation initialized');
}

function initTwoTierMenu() {
  // 第一層：學制選擇
  const tier1Buttons = document.querySelectorAll('#tier1-selection .level-btn');
  tier1Buttons.forEach(btn => {
    const tier1 = btn.dataset.tier1;
    btn.addEventListener('click', () => {
      if (tier1 === 'JH') {
        showTier2('JH');
      } else if (tier1 === 'SH') {
        showTier2('SH');
      } else if (tier1 === 'ADV') {
        selectLevel(['ADV']);
      } else if (tier1 === 'ALL') {
        selectLevel(['J1', 'J2', 'J3', 'H1', 'H2', 'H3', 'ADV']);
      }
    });
  });

  // 第二層：國中年級
  const tier2JHButtons = document.querySelectorAll('#tier2-jh .level-btn');
  tier2JHButtons.forEach(btn => {
    const level = btn.dataset.level;
    btn.addEventListener('click', () => {
      if (level === 'JH_ALL') {
        selectLevel(['J1', 'J2', 'J3']);
      } else {
        selectLevel([level]);
      }
    });
  });

  // 第二層：高中年級
  const tier2SHButtons = document.querySelectorAll('#tier2-sh .level-btn');
  tier2SHButtons.forEach(btn => {
    const level = btn.dataset.level;
    btn.addEventListener('click', () => {
      if (level === 'SH_ALL') {
        selectLevel(['H1', 'H2', 'H3']);
      } else {
        selectLevel([level]);
      }
    });
  });

  console.log('✓ Two-tier menu initialized');
}

// ===== Section 13: Speech Synthesis Initialization =====
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ===== Section 14: Export functions to window =====
// 明確將函式暴露到全域範圍，以便 inline event handlers 可以使用
window.initNavigation = initNavigation;
window.initTwoTierMenu = initTwoTierMenu;
window.showScreen = showScreen;
window.showLevelSelection = showLevelSelection;
window.showTier2 = showTier2;
window.backToTier1 = backToTier1;
window.selectLevel = selectLevel;
window.flipCard = flipCard;
window.prevCard = prevCard;
window.nextCard = nextCard;
window.speakText = speakText;
window.updateSpeed = updateSpeed;
window.autoPlayCurrent = autoPlayCurrent;
window.playQuizAudio = playQuizAudio;
window.submitQuizAnswer = submitQuizAnswer;
window.nextQuizQuestion = nextQuizQuestion;
window.switchTab = switchTab;
window.selectVerbLevel = selectVerbLevel;
window.submitVerb3Answer = submitVerb3Answer;
window.nextVerb3Question = nextVerb3Question;
window.searchCustomWords = searchCustomWords;
window.startCustomPractice = startCustomPractice;
window.startCustomQuiz = startCustomQuiz;
window.saveNewWord = saveNewWord;
window.filterDeleteList = filterDeleteList;
window.deleteUserWord = deleteUserWord;
window.showWordTooltip = showWordTooltip;
window.scheduleHideTooltip = scheduleHideTooltip;

console.log('Main.js loaded successfully');
