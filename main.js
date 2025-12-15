/**
 * English Practice App - Main Controller (Router)
 * Modular Architecture with Dependency Injection:
 * - ServiceContainer manages all dependencies
 * - Specific logic delegated to modules/ (Flashcard, Quiz, Verb3, Custom)
 * - Main.js handles Routing, Navigation, Global State, and Level Selection
 */
import { AppState } from './core/state.js';
import { ServiceContainer } from './core/ServiceContainer.js';
import { WordService } from './services/wordService.js?v=20251216_FINAL';
import { StorageService } from './services/storage.js?v=20251216_FINAL';
import { AudioService } from './services/audio.js?v=20251216_FINAL';
import { AIService } from './services/AIService.js?v=20251216_LOCAL';

// Feature Modules (Controller Layer) with Cache Busting
import { FlashcardController } from './modules/FlashcardController.js?v=20251216_FINAL';
import { QuizController } from './modules/QuizController.js?v=20251216_FINAL';
import { Verb3Controller } from './modules/Verb3Controller.js?v=20251216_FINAL';
import { CustomController } from './modules/CustomController.js?v=20251216_FINAL';

// Refactored UI System
import { EventCoordinator } from './web/ui/EventCoordinator.js';
import { TooltipManager } from './web/ui/TooltipManager.js';

const App = {
  container: null,
  currentModule: null,
  eventCoordinator: null,
  tooltipManager: null,

  async init() {
    console.log('🚀 App Initializing with ServiceContainer...');

    // 1. Create Dependency Injection Container
    this.container = new ServiceContainer();

    // 2. Register Services (順序無關)
    this.container.register('wordService', () => WordService);
    this.container.register('storageService', () => StorageService);
    this.container.register('audioService', () => AudioService);
    this.container.register('aiService', () => AIService);

    // 3. Register UI Components
    // EventCoordinator removed - using data-action pattern instead

    this.container.register('tooltipManager', (c) => new TooltipManager({
      wordService: c.get('wordService'),
      audioService: c.get('audioService'),
      aiService: c.get('aiService')
    }));

    console.log('[App] ✓ Services registered:', this.container.list().join(', '));

    // 4. Initialize Data Layer
    const storage = this.container.get('storageService');
    const wordService = this.container.get('wordService');

    // Parallel Init
    const [storageSuccess, wordSuccess] = await Promise.all([
      Promise.resolve(storage.init()), // storage.init is likely sync but safe to wrap
      wordService.init()
    ]);

    if (!wordSuccess) {
      console.error('[App] WordService init failed');
      // Handle error, maybe show UI toast
    }

    if (!storageSuccess) {
      console.error('[App] StorageService init failed');
      return;
    }

    // 5. Initialize UI Components
    this.tooltipManager = this.container.get('tooltipManager');
    try {
      this.tooltipManager.init();
    } catch (error) {
      console.error('[App] TooltipManager init failed:', error);
    }

    // 7. Setup event handling (data-action pattern)
    this._registerEvents();

    // 8. Setup navigation and level selection
    this.updateStats();
    this.setupNavigation();
    this.setupLevelSelect();

    // 6. Initialize feature modules (With Dependency Injection)

    // Flashcard: Needs wordService, audioService
    FlashcardController.init({
      wordService: this.container.get('wordService'),
      audioService: this.container.get('audioService')
    });

    // Quiz: Needs audioService
    QuizController.init({
      audioService: this.container.get('audioService')
    });

    // Verb3: Needs wordService, audioService
    Verb3Controller.init({
      wordService: this.container.get('wordService'),
      audioService: this.container.get('audioService')
    });

    // Custom: Needs wordService, storageService
    CustomController.init({
      wordService: this.container.get('wordService'),
      storageService: this.container.get('storageService')
    });

    // 7. Show initial screen
    this.navigate('home-screen');

    console.log('✅ App Initialized Successfully');
  },

  /**
   * Setup unified event handling
   * Uses single click listener with data-action pattern
   * @private
   */
  _registerEvents() {
    document.addEventListener('click', this._handleGlobalClick.bind(this), true);
    console.log('[App] ✓ Global click handler registered');
  },

  /**
   * Global click handler - handles all click events with priority order
   * @private
   */
  _handleGlobalClick(e) {
    // Priority 1: Navigation (data-screen)
    const nav = e.target.closest('[data-screen]');
    if (nav) {
      const screen = nav.dataset.screen;
      const mode = nav.dataset.mode;
      this.navigate(screen, mode ? { mode } : undefined);
      return;
    }

    // Priority 2: Interactive Word (Tooltip)
    const token = e.target.closest('.interactive-word');
    if (token) {
      e.stopPropagation();
      const word = token.dataset.word || token.textContent.trim();
      const tm = this.container.get('tooltipManager');
      tm.show(word, { x: e.clientX, y: e.clientY });
      return;
    }

    // Priority 3: Action buttons
    const btn = e.target.closest('[data-action]');
    if (btn) {
      this._dispatchAction(btn.dataset.action, btn, e);
      return;
    }

    // Priority 4: Card flip (lowest priority)
    const card = e.target.closest('#flashcard');
    if (card && !e.target.closest('button, input, .interactive-word, [data-action]')) {
      card.classList.toggle('flipped');
    }
  },

  /**
   * Dispatch action based on data-action attribute
   * @private
   */
  _dispatchAction(action, el, e) {
    const actions = {
      // Level selection
      'confirm-level': () => this.confirmLevelSelection(),
      'select-tier1': () => {
        // Remove active from all
        document.querySelectorAll('#tier1-chips .chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');

        // Determine tier
        let val = 'JH';
        const txt = el.textContent;
        if (txt.includes('高中')) val = 'SH';
        else if (txt.includes('進階')) val = 'ADV';

        AppState.currentTier = val;
        this.renderTier2(val);
        console.log('[App] Tier 1 selected:', val);
      },
      'select-tier2': () => {
        // Remove active from all
        document.querySelectorAll('#tier2-chips .chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');

        // Get level from data attribute
        const opt = el.dataset.level;

        // Set temp levels
        if (opt.startsWith('ALL')) {
          AppState.tempLevels = (opt === 'ALL_JH' ? ['J1', 'J2', 'J3'] : ['H1', 'H2', 'H3']);
        } else {
          AppState.tempLevels = [opt === 'ADV' ? 'H3' : opt];
        }

        console.log('[App] Tier 2 selected:', opt, '→', AppState.tempLevels);
      },

      // Practice screen
      'speak-word': () => this.speakCurrentWord(),
      'speak-example': () => this.speakExample(),
      'prev-card': () => this.prevCard(),
      'next-card': () => this.nextCard(),
      'toggle-autoplay': () => this.toggleAutoPlay(),

      // Quiz screen
      'speak-quiz': () => this.speakQuizWord(),
      'skip-quiz': () => this.checkQuiz(true),
      'submit-quiz': () => this.checkQuiz(),
      'prev-quiz': () => this.prevQuizQuestion(),
      'next-quiz': () => this.nextQuizQuestion(),

      // Verb3 screen
      'switch-verb3-level': () => this.switchVerb3Level(el.dataset.level),
      'check-verb3': () => this.checkVerb3(),
      'prev-verb3': () => this.prevVerb3Question(),
      'next-verb3': () => this.nextVerb3Question(),

      // Custom screen
      'process-custom': () => this.processCustomWords(),
      'play-custom-set': () => {
        const setId = el.dataset.setId;
        if (setId) {
          console.log('[App] Play custom set:', setId);
          const CustomController = this.currentModule;
          if (CustomController && CustomController.playSet) {
            CustomController.playSet(setId);
          } else {
            window.app.playCustomSet(setId);
          }
        }
      },
      'delete-custom-set': () => {
        const setId = el.dataset.setId;
        if (setId) {
          console.log('[App] Delete custom set:', setId);
          const CustomController = this.currentModule;
          if (CustomController && CustomController.deleteSet) {
            CustomController.deleteSet(setId);
          } else {
            window.app.deleteCustomSet(setId);
          }
        }
      },

      // Global
      'go-back': () => this.goBack()
    };

    const handler = actions[action];
    if (handler) {
      console.log('[App] Action:', action);
      handler();
    } else {
      console.warn('[App] Unknown action:', action, el);
    }
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

    // Note: Flashcard flip is now handled by EventCoordinator in _registerEvents()
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
    // Note: Tier 1/2 chips are now handled by EventCoordinator in _registerEvents()
    // But we need to create tier 2 dynamically in renderTier2()
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
      btn.dataset.level = opt;
      btn.dataset.action = 'select-tier2'; // Add data-action for global handler
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
