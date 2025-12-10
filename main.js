/**
 * 個人英文練習網站 - 主程式入口 (重構版)
 * 模組化架構 - 整合所有模組
 */

console.log('=== main.js (refactored) is loading ===');

// ===== 應用程式初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');

  // 1. 初始化資料層
  const dataLoaded = StorageService.init();
  if (!dataLoaded) {
    console.error('Failed to initialize data');
    return;
  }

  // 2. 初始化 UI 層
  DOMManager.init();
  TooltipManager.init();

  // 3. 更新單字數量顯示
  const counts = WordService.getWordCounts();
  DOMManager.updateWordCounts(counts);

  // 4. 初始化事件監聽器
  EventManager.init();

  // 5. 顯示首頁
  ScreenManager.showScreen('home-screen');

  console.log('✓ App initialized successfully');
});

// ===== 全域函式 (供 HTML onclick 使用) =====

// 畫面導航
function showScreen(screenId) {
  ScreenManager.showScreen(screenId);
}

function showLevelSelection(mode) {
  ScreenManager.showLevelSelection(mode);
}

function backToTier1() {
  ScreenManager.backToTier1();
}

// 卡片操作
function flipCard() {
  document.getElementById('flashcard').classList.toggle('is-flipped');
}

function prevCard() {
  if (AppState.currentIndex > 0) {
    AudioService.cancelSpeech();
    AppState.setCurrentIndex(AppState.currentIndex - 1);
    ScreenManager.renderCard();
  }
}

function nextCard() {
  const activeWordList = AppState.getActiveWordList();
  if (AppState.currentIndex < activeWordList.length - 1) {
    AudioService.cancelSpeech();
    AppState.setCurrentIndex(AppState.currentIndex + 1);
    ScreenManager.renderCard();
  }
}

// 音訊控制
function speakText(text, rateMultiplier = 1.0) {
  AudioService.speakText(text, rateMultiplier);
}

function updateSpeed(val) {
  AudioService.setSpeed(val);
}

function autoPlayCurrent() {
  const currentCard = AppState.getCurrentCard();
  AudioService.autoPlayCard(currentCard);
}

// 測驗相關
function playQuizAudio() {
  ScreenManager.playQuizAudio();
}

function submitQuizAnswer() {
  const userAnswer = document.getElementById('quiz-input').value.trim().toLowerCase();
  const correctAnswer = AppState.quizCurrentWord.english.toLowerCase();

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

  answerEl.textContent = `${AppState.quizCurrentWord.english} (${AppState.quizCurrentWord.translation})`;
  resultEl.classList.remove('hidden');

  document.getElementById('quiz-next-btn').disabled = false;
}

function nextQuizQuestion() {
  AppState.quizIndex++;
  ScreenManager.loadQuizQuestion();
}

// 動詞三態
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
  AppState.verb3CurrentLevel = level;

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

  if (AppState.verb3CurrentLevel === 'JH') {
    AppState.verb3List = allVerbs.filter(v => ['J1', 'J2', 'J3'].includes(v.level));
  } else {
    AppState.verb3List = allVerbs.filter(v => ['H1', 'H2', 'H3'].includes(v.level));
  }

  AppState.verb3List = AppState.verb3List.sort(() => Math.random() - 0.5);
  AppState.verb3Index = 0;

  loadVerb3Question();
}

function loadVerb3Question() {
  if (AppState.verb3Index >= AppState.verb3List.length) {
    AppState.verb3Index = 0;
  }

  AppState.verb3CurrentVerb = AppState.verb3List[AppState.verb3Index];

  document.getElementById('verb3-base').textContent = AppState.verb3CurrentVerb.base;
  document.getElementById('verb3-translation').textContent = `(${AppState.verb3CurrentVerb.translation})`;

  document.getElementById('verb3-past-input').value = '';
  document.getElementById('verb3-pp-input').value = '';

  document.getElementById('verb3-result').classList.add('hidden');
  document.getElementById('verb3-next').disabled = true;
}

function submitVerb3Answer() {
  const userPast = document.getElementById('verb3-past-input').value.trim().toLowerCase();
  const userPP = document.getElementById('verb3-pp-input').value.trim().toLowerCase();

  const correctPast = AppState.verb3CurrentVerb.past.toLowerCase();
  const correctPP = AppState.verb3CurrentVerb.ppart.toLowerCase();

  const resultEl = document.getElementById('verb3-result');

  let message = '';

  if (userPast === correctPast && userPP === correctPP) {
    message = '✅ 完全正確！';
    resultEl.style.color = '#10B981';
  } else {
    message = `❌ 答案：<br>過去式：${AppState.verb3CurrentVerb.past}<br>過去分詞：${AppState.verb3CurrentVerb.ppart}`;
    resultEl.style.color = '#EF4444';
  }

  resultEl.innerHTML = message;
  resultEl.classList.remove('hidden');
  document.getElementById('verb3-next').disabled = false;
}

function nextVerb3Question() {
  AppState.verb3Index++;
  loadVerb3Question();
}

// 自訂訓練
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

  if (words.length > AppConfig.MAX_CUSTOM_WORDS) {
    alert(`最多只能輸入 ${AppConfig.MAX_CUSTOM_WORDS} 個單字！`);
    return;
  }

  const { validWords, invalidWords } = WordService.searchWords(words);

  document.getElementById('custom-valid-count').textContent = validWords.length;
  document.getElementById('custom-invalid-list').textContent =
    invalidWords.length > 0 ? invalidWords.join(', ') : '無';

  document.getElementById('custom-results').classList.remove('hidden');

  AppState.customWordList = validWords;
}

function startCustomPractice() {
  if (AppState.customWordList.length === 0) {
    alert('沒有有效的單字！');
    return;
  }

  AppState.setActiveWordList(AppState.customWordList);
  AppState.setCurrentIndex(0);
  ScreenManager.showScreen('practice-screen');
  ScreenManager.renderCard();
}

function startCustomQuiz() {
  if (AppState.customWordList.length === 0) {
    alert('沒有有效的單字！');
    return;
  }

  AppState.quizList = [...AppState.customWordList].sort(() => Math.random() - 0.5);
  AppState.quizIndex = 0;
  ScreenManager.showScreen('quiz-screen');
  ScreenManager.loadQuizQuestion();
}

// 新增/刪除單字
function saveNewWord() {
  const english = document.getElementById('add-english').value.trim();
  const pos = document.getElementById('add-pos').value.trim();
  const translation = document.getElementById('add-translation').value.trim();
  const level = document.getElementById('add-level').value;
  const exampleEn = document.getElementById('add-example-en').value.trim();
  const exampleZh = document.getElementById('add-example-zh').value.trim();

  try {
    const newWord = WordService.addUserWord({
      english, pos, translation, level, exampleEn, exampleZh
    });

    // 更新單字數量
    const counts = WordService.getWordCounts();
    DOMManager.updateWordCounts(counts);

    // 清空表單
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
  } catch (error) {
    alert(error.message);
  }
}

function filterDeleteList() {
  EventManager.filterDeleteList();
}

function deleteUserWord(english) {
  if (!confirm(`確定要刪除單字「${english}」嗎？`)) {
    return;
  }

  WordService.deleteUserWord(english);

  // 更新單字數量
  const counts = WordService.getWordCounts();
  DOMManager.updateWordCounts(counts);

  // 重新渲染列表
  EventManager.renderDeleteList();

  DOMManager.showToast(`✅ 已刪除「${english}」`);
}

// ===== Speech Synthesis 初始化 =====
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

console.log('✓ Main.js (refactored) loaded successfully');
