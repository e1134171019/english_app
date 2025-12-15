/**
 * English Practice App - Main Controller (Router)
 * Modular Architecture:
 * - Specific logic is delegated to modules/ (Flashcard, Quiz, Verb3, Custom).
 * - Main.js handles Routing, Navigation, Global State, and Level Selection (Entry Point).
 */
import { AppState } from './core/state.js';
import { WordService } from './services/wordService.js';
import { StorageService } from './services/storage.js';
import { AudioService } from './services/audio.js';

// Feature Modules
import { FlashcardController } from './modules/FlashcardController.js';
import { QuizController } from './modules/QuizController.js';
import { Verb3Controller } from './modules/Verb3Controller.js';
import { CustomController } from './modules/CustomController.js';

const App = {
  currentModule: null,

  async init() {
    console.log('App Initializing (Modular)...');

    // 1. Initialize Services
    const success = StorageService.init();
    if (!success) return;

    // 2. Initial Setup
    this.updateStats();
    this.setupNavigation();
    this.setupLevelSelect();

    // Modules Init
    FlashcardController.init();
    QuizController.init();
    Verb3Controller.init();
    CustomController.init();

    // 3. Initial Screen
    this.navigate('home-screen');
  },

  updateStats() {
    // Keep lightweight stats logic here or move to a DashboardModule.
    // For now, logging counts is fine.
    // const counts = WordService.getWordCounts();
  },

  /* --- Router Logic --- */

  navigate(screenId, params = {}) {
    console.log(`Router: Navigating to ${screenId}`, params);

    // 1. Module Transition (Exit Old)
    if (this.currentModule && typeof this.currentModule.onExit === 'function') {
      this.currentModule.onExit();
    }
    this.currentModule = null;

    // 2. Hide All Screens (Nuclear Option)
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
      el.style.display = 'none'; // Force hide inline styles
    });

    // 3. Resolve Target Module & Mode
    let newModule = null;
    if (screenId === 'practice-screen') {
      // Check Mode to decide between Custom or Flashcard? 
      // FlashcardController handles both if we just passed list.
      // AppState.activeWordList is source of truth.
      newModule = FlashcardController;
      AppState.currentMode = 'practice';
    }
    else if (screenId === 'quiz-screen') {
      newModule = QuizController;
      AppState.currentMode = 'quiz';
    }
    else if (screenId === 'verb3-screen') {
      newModule = Verb3Controller;
      AppState.currentMode = 'verb3';
    }
    else if (screenId === 'custom-training-screen') {
      newModule = CustomController;
      // Mode?
    }
    else if (screenId === 'level-select-screen') {
      if (params.mode) AppState.currentMode = params.mode;
    }

    // 4. Show Target Screen
    const target = document.getElementById(screenId);
    if (target) {
      target.style.display = '';
      target.classList.add('active');
    } else {
      console.error(`Screen not found: ${screenId}`);
      return;
    }

    // 5. Module Transition (Enter New)
    if (newModule) {
      this.currentModule = newModule;
      if (typeof newModule.onEnter === 'function') {
        newModule.onEnter(params);
      }
    }

    // 6. UI Header & Nav
    this.updateHeader(screenId);
    this.updateBottomNav(screenId);

    // Reset Floating Back Button
    const fab = document.getElementById('floating-back-btn');
    if (fab) fab.classList.add('hidden');
  },

  goBack() {
    AudioService.cancelSpeech();

    // If in a Module, maybe let module handle back? 
    // Or standard hierarchy.
    const currentScreen = document.querySelector('.screen.active')?.id;

    if (currentScreen === 'practice-screen' || currentScreen === 'quiz-screen') {
      this.navigate('level-select-screen');
    } else {
      // Level Select, Verb3, Custom -> Home
      this.navigate('home-screen');
    }
  },

  /* --- Shared UI Logic (Lobby) --- */

  setupNavigation() {
    const backBtn = document.getElementById('nav-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => this.goBack());
    window.app = this;

    // Delegate Flip Card Click (Global Listener)
    const card = document.getElementById('flashcard');
    if (card) {
      card.addEventListener('click', (e) => {
        if (this.currentModule === FlashcardController) {
          if (e.target.closest('button') || e.target.closest('.token')) return;
          this.flipCard();
        }
      });
    }
  },

  updateHeader(screenId) {
    const titleEl = document.getElementById('app-title');
    const backBtn = document.getElementById('nav-back-btn');
    if (!titleEl) return;

    if (screenId === 'home-screen') {
      titleEl.textContent = '英文練習';
      backBtn?.classList.add('hidden');
    } else {
      backBtn?.classList.remove('hidden');
      const map = {
        'level-select-screen': AppState.currentMode === 'quiz' ? '聽力練習 - 選單' : '單字練習 - 選單',
        'practice-screen': '單字練習', // Can be dynamic
        'quiz-screen': '聽力練習',
        'verb3-screen': '動詞三態',
        'custom-training-screen': '我的專屬',
        'add-screen': '新增單字',
        'delete-screen': '管理單字'
      };
      titleEl.textContent = map[screenId] || '英文練習';
    }
  },

  updateBottomNav(screenId) {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
      btn.classList.remove('active');
      const label = btn.querySelector('.nav-label')?.textContent;
      // Simple mapping
      if (screenId === 'home-screen' && label === '首頁') btn.classList.add('active');
      if ((screenId.includes('practice') || (screenId === 'level-select-screen' && AppState.currentMode === 'practice')) && label === '單字') btn.classList.add('active');
      if ((screenId.includes('quiz') || (screenId === 'level-select-screen' && AppState.currentMode === 'quiz')) && label === '聽力練習') btn.classList.add('active');
      if (screenId.includes('verb3') && label === '三態') btn.classList.add('active');
      if (screenId.includes('custom') && label === '我的專屬') btn.classList.add('active');
    });

    // Floating Button Logic
    const fab = document.getElementById('floating-back-btn');
    if (fab) {
      if (screenId === 'home-screen') fab.classList.add('hidden');
      else fab.classList.remove('hidden');
    }
  },

  /* --- Level Selection (Lobby) --- */

  setupLevelSelect() {
    // Tier 1 Chips
    document.querySelectorAll('#tier1-chips .chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('#tier1-chips .chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');

        let val = 'JH';
        const txt = e.currentTarget.textContent;
        if (txt.includes('高中')) val = 'SH';
        else if (txt.includes('進階')) val = 'ADV';

        AppState.currentTier = val;
        this.renderTier2(val);
      });
    });
  },

  renderTier2(tier1) {
    const container = document.getElementById('tier2-chips');
    if (!container) return;
    container.innerHTML = '';

    let options = (tier1 === 'JH') ? ['J1', 'J2', 'J3', 'ALL_JH'] : (tier1 === 'SH') ? ['H1', 'H2', 'H3', 'ALL_SH'] : ['ADV'];
    const map = { 'J1': '國一', 'J2': '國二', 'J3': '國三', 'ALL_JH': '全部國中', 'H1': '高一', 'H2': '高二', 'H3': '高三', 'ALL_SH': '全部高中', 'ADV': '進階' };

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = map[opt] || opt;
      btn.onclick = () => {
        document.querySelectorAll('#tier2-chips .chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        // Set Temp
        if (opt.startsWith('ALL')) AppState.tempLevels = (opt === 'ALL_JH' ? ['J1', 'J2', 'J3'] : ['H1', 'H2', 'H3']);
        else AppState.tempLevels = [opt === 'ADV' ? 'H3' : opt];
      };
      container.appendChild(btn);
    });
  },

  confirmLevelSelection() {
    if (!AppState.tempLevels || AppState.tempLevels.length === 0) {
      alert('請先選擇等級！');
      return;
    }
    WordService.updateActiveWordList(AppState.tempLevels);

    // Route based on Mode
    if (AppState.currentMode === 'quiz') this.navigate('quiz-screen');
    else if (AppState.currentMode === 'verb3') this.navigate('verb3-screen');
    else this.navigate('practice-screen'); // Default
  },

  /* --- Adapter / Delegate Methods (Called by HTML) --- */

  // Flashcard Delegates
  flipCard() { this.currentModule?.flipCard?.(); },
  nextCard() { this.currentModule?.nextCard?.(); },
  prevCard() { this.currentModule?.prevCard?.(); },
  toggleAutoPlay() { this.currentModule?.toggleAutoPlay?.(); },
  speakCurrentWord() { this.currentModule?.speakCurrentWord?.(); },
  speakExample() { this.currentModule?.speakExample?.(); },

  // Quiz Delegates
  startQuizMode() { /* Legacy call, handled by navigate */ },
  checkQuiz(skip) { this.currentModule?.checkAnswer?.(skip); },
  speakQuizWord() { this.currentModule?.speakWord?.(); },
  nextQuizQuestion() { this.currentModule?.nextQuestion?.(); },
  prevQuizQuestion() { this.currentModule?.prevQuestion?.(); },

  // Verb3 Delegates
  switchVerb3Level(lvl) { this.currentModule?.switchLevel?.(lvl); },
  checkVerb3() { this.currentModule?.checkAnswer?.(); },
  prevVerb3Question() { this.currentModule?.prevQuestion?.(); },
  nextVerb3Question() { this.currentModule?.nextQuestion?.(); },
  loadVerb3Question() { this.currentModule?.loadQuestion?.(); },

  // Custom Delegates
  processCustomWords() { this.currentModule?.processInput?.(); },
  playCustomSet(id) { this.currentModule?.playSet?.(id); },
  deleteCustomSet(id) { this.currentModule?.deleteSet?.(id); },
  renderCustomSets() { /* Called by onEnter */ }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
