/**
 * TechQuiz Core Application Coordinator
 * Manages game state, circular conic countdown timers, dynamic rendering,
 * real-time search filtering, mobile drawer transitions, and seamless SPA tab swappers.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // PREMIUM DIAGNOSTIC LAYER
  // ==========================================
  const requiredSelectors = {
    'app-sidebar': 'Sidebar navigation element',
    'mobile-menu-btn': 'Mobile menu toggle button',
    'mobile-scrim': 'Mobile menu transparent overlay',
    'mute-toggle': 'Mute control toggle element',
    'header-stats': 'Active quiz statistics pill',
    'header-score': 'Active score indicator in navigation bar',
    'global-search-bar': 'Global real-time search input',
    'sidebar-profile-name': 'Sidebar profile username display',
    'hero-welcome-name': 'Home welcome banner guest username',
    'setup-form': 'Quiz configuration category form selector',
    'username': 'Player username textfield input element',
    'difficulty-indicator': 'Horizontal sliding pill indicator highlight',
    'quiz-stat-category': 'Active quiz playing category label text',
    'quiz-stat-difficulty': 'Active quiz playing difficulty label text',
    'quiz-stat-progress': 'Active quiz questions progress numerator label',
    'timer-sec-count': 'Interactive count seconds label ticker',
    'conic-timer-ring': 'Circular depleting conic timer gradient backdrop',
    'progress-fill': 'Active linear questions completion bar overlay',
    'progress-glow': 'Linear progress slider reflection shadow box element',
    'question-text': 'Active question context header text panel',
    'options-grid': 'Bento question multiple options choices grid container',
    'skip-btn': 'Skip active question button trigger link element',
    'next-btn': 'Forward next slide progression button link element',
    'results-player-name': 'Concluded player username showcase text element',
    'accuracy-ring': 'Concluded accuracy circle svg dynamic path pointer',
    'results-accuracy-val': 'Concluded accuracy score percent indicator label',
    'results-score': 'Concluded total score xp accumulation text label',
    'results-ratio': 'Concluded correct answers fraction showcase label text',
    'results-time': 'Concluded total spent seconds duration label',
    'restart-btn': 'Dashboard return btn',
    'next-level-btn': 'Next level trigger',
    'explain-btn': 'Show AI explanation trigger button',
    'explain-modal': 'Explanation popup container',
    'explain-content': 'AI explanation text target',
    'share-btn': 'Share clipboard copy triggers click button link',
    'leaderboard-rows': 'Full-sized leaderboard scores table body grid container',
    'library-category-filter': 'Questions library dropdown category sorting select',
    'library-difficulty-filter': 'Questions library dropdown difficulty sorting select',
    'library-grid': 'Questions library dynamic card flex tiles list container',
    'library-empty': 'Questions library blank status information plate warning',
    'results-leaderboard-list': 'Results sidebar leaderboard scores container',
    'login-screen': 'Glassmorphic authentication gateway view',
    'login-form': 'User login dynamic submission form control',
    'login-username': 'User login handle input textbox',
    'logout-btn': 'Exit current session trigger power button'
  };

  console.log('⚡ [TechQuiz Diagnostics] Running full DOM element verification audit...');
  let hasDiagnosticWarnings = false;
  Object.keys(requiredSelectors).forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`[TechQuiz Diagnostics] Warning: Required DOM element with ID "${id}" ("${requiredSelectors[id]}") was not found!`);
      hasDiagnosticWarnings = true;
    }
  });
  if (!hasDiagnosticWarnings) {
    console.log('💚 [TechQuiz Diagnostics] All required UI elements are present and fully mapped!');
  }

  // ==========================================
  // GAME STATE
  // ==========================================
  const gameState = {
    username: '',
    selectedCategory: 'Tech & Coding',
    selectedDifficulty: 'Medium',
    aiModeEnabled: false,
    questionsList: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswersCount: 0,
    timerSeconds: 15,
    timerInterval: null,
    timerMax: 15,
    selectedOptionText: '',
    hasAnsweredActiveQuestion: false,
    quizStartTime: null,
    totalTimeSpentSec: 0
  };

  // ==========================================
  // DOM ELEMENT SELECTORS
  // ==========================================
  
  // Navigation & Sidebar
  const appSidebar = document.getElementById('app-sidebar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileScrim = document.getElementById('mobile-scrim');
  const muteToggle = document.getElementById('mute-toggle');
  const soundIconPlay = muteToggle ? muteToggle.querySelector('.sound-icon.play') : null;
  const soundIconMute = muteToggle ? muteToggle.querySelector('.sound-icon.mute') : null;
  const headerStats = document.getElementById('header-stats');
  const headerScoreVal = document.getElementById('header-score');
  const globalSearchBar = document.getElementById('global-search-bar');
  
  // Sidebar Profile Cards
  const sidebarProfileName = document.getElementById('sidebar-profile-name');
  const heroWelcomeName = document.getElementById('hero-welcome-name');
  
  // Screen Stages (All Sections)
  const screens = {
    login: document.getElementById('login-screen'),
    home: document.getElementById('home-tab'),
    categories: document.getElementById('setup-screen'),
    library: document.getElementById('library-tab'),
    leaderboard: document.getElementById('leaderboard-tab'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen')
  };

  // Login Gate Controls
  const loginForm = document.getElementById('login-form');
  const loginUsernameInput = document.getElementById('login-username');
  const logoutBtn = document.getElementById('logout-btn');

  // Stage 1: Setup Form Controls
  const setupForm = document.getElementById('setup-form');
  const usernameInput = document.getElementById('username');
  const setupCategoryCards = document.querySelectorAll('.setup-category-card');
  const difficultyInputs = document.getElementsByName('difficulty');
  const difficultyIndicator = document.getElementById('difficulty-indicator');
  const aiModeToggle = document.getElementById('ai-mode-toggle');

  // Stage 2: Quiz Controls
  const quizCategoryStat = document.getElementById('quiz-stat-category');
  const quizDifficultyStat = document.getElementById('quiz-stat-difficulty');
  const quizProgressStat = document.getElementById('quiz-stat-progress');
  const timerSecCount = document.getElementById('timer-sec-count');
  const conicTimerRing = document.getElementById('conic-timer-ring');
  const progressBarFill = document.getElementById('progress-fill');
  const progressBarGlow = document.getElementById('progress-glow');
  const questionText = document.getElementById('question-text');
  const optionsGrid = document.getElementById('options-grid');
  const skipBtn = document.getElementById('skip-btn');
  const nextBtn = document.getElementById('next-btn');

  // Stage 3: Results Elements
  const resultsPlayerName = document.getElementById('results-player-name');
  const accuracyRing = document.getElementById('accuracy-ring');
  const resultsAccuracyVal = document.getElementById('results-accuracy-val');
  const resultsScore = document.getElementById('results-score');
  const resultsRatio = document.getElementById('results-ratio');
  const resultsTime = document.getElementById('results-time');
  const restartBtn = document.getElementById('restart-btn');
  const shareBtn = document.getElementById('share-btn');
  const leaderboardRows = document.getElementById('leaderboard-rows');
  const resultsLeaderboardList = document.getElementById('results-leaderboard-list');

  // Library Page Filters
  const libraryCategoryFilter = document.getElementById('library-category-filter');
  const libraryDifficultyFilter = document.getElementById('library-difficulty-filter');
  const libraryGrid = document.getElementById('library-grid');
  const libraryEmpty = document.getElementById('library-empty');

  // ==========================================
  // INITIAL SETUP & PRELOADERS
  // ==========================================
  
  // Set random player name placeholder to inspire interaction
  const namesPool = ['PixelExplorer', 'WebPioneer', 'Sparky', 'CodeCraft', 'BrainyAida', 'QuizWizard'];
  const randomName = namesPool[Math.floor(Math.random() * namesPool.length)] + Math.floor(Math.random() * 90 + 10);
  if (usernameInput) {
    usernameInput.setAttribute('placeholder', `e.g. ${randomName}`);
  }
  if (loginUsernameInput) {
    loginUsernameInput.setAttribute('placeholder', `e.g. ${randomName}`);
  }

  // Load Mute State from LocalStorage
  const savedMuted = localStorage.getItem('sound_muted');
  if (savedMuted === 'true') {
    Sound.muted = true;
    updateSoundIcon(true);
  }

  // Coordinate Initial Session Checks on Startup
  const savedUser = localStorage.getItem('username');
  if (savedUser) {
    document.body.classList.remove('logged-out');
    syncUsername(savedUser);
    syncStreakDisplay();
    selectSetupCategory("Tech & Coding");
    updateDifficultyIndicator();
    loadHomeDashboard();
    switchScreen('home');
  } else {
    document.body.classList.add('logged-out');
    syncUsername('');
    syncStreakDisplay();
    selectSetupCategory("Tech & Coding");
    updateDifficultyIndicator();
    switchScreen('login');
  }

  // ==========================================
  // STAGE TRANSITIONS & SPA ROUTER
  // ==========================================
  
  function switchScreen(tabName) {
    // Clear active classes and hide all screens
    Object.keys(screens).forEach(key => {
      const screen = screens[key];
      if (screen) {
        screen.classList.remove('active');
      }
    });

    const activeScreen = screens[tabName];
    if (activeScreen) {
      activeScreen.classList.add('active');
    }

    // Update navigation sidebar active button indicator
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      const tabAttr = btn.getAttribute('data-tab');
      if (tabAttr === tabName) {
        btn.classList.add('text-primary', 'bg-[#1A1A1D]', 'border-r-4', 'border-primary', 'font-bold');
        btn.classList.remove('text-on-surface-variant', 'font-medium');
      } else {
        btn.classList.remove('text-primary', 'bg-[#1A1A1D]', 'border-r-4', 'border-primary', 'font-bold');
        btn.classList.add('text-on-surface-variant', 'font-medium');
      }
    });

    // Handle tab-specific data rendering
    if (tabName === 'library') {
      renderLibrary(globalSearchBar.value.trim().toLowerCase());
    } else if (tabName === 'leaderboard') {
      loadLeaderboard();
    } else if (tabName === 'home') {
      loadHomeDashboard();
    }

    // Hide active stats header unless playing a quiz
    if (tabName !== 'quiz') {
      headerStats.style.display = 'none';
    } else {
      headerStats.style.display = 'flex';
    }
  }

  // Bind Sidebar Tab Navigation Buttons
  const navButtons = document.querySelectorAll('.nav-tab-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      // Warn player if navigating away from active quiz
      if (screens.quiz.classList.contains('active') && !gameState.hasAnsweredActiveQuestion) {
        if (!confirm("Are you sure you want to abandon the active quiz? Your points will not be saved.")) {
          return;
        }
      }
      
      // Clear timers
      clearInterval(gameState.timerInterval);
      
            switchScreen(tabName);
      Sound.initContext();
    });
  });

  // ==========================================
  // MOBILE SLIDE DRAWER MENU
  // ==========================================
  if (mobileMenuBtn && mobileScrim && appSidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      appSidebar.classList.add('mobile-open');
      mobileScrim.classList.remove('hidden');
      mobileScrim.classList.add('block');
    });

    mobileScrim.addEventListener('click', () => {
      closeMobileSidebar();
    });

    const sidebarLinks = appSidebar.querySelectorAll('.nav-tab-btn');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileSidebar();
      });
    });
  }

  function closeMobileSidebar() {
    if (appSidebar && mobileScrim) {
      appSidebar.classList.remove('mobile-open');
      mobileScrim.classList.add('hidden');
      mobileScrim.classList.remove('block');
    }
  }

  // ==========================================
  // VOL/SOUND TOGGLE STATE CONTROL
  // ==========================================
  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      const isMuted = Sound.toggleMute();
      localStorage.setItem('sound_muted', isMuted);
      updateSoundIcon(isMuted);
      
      if (!isMuted) {
        Sound.initContext();
      }
    });
  }

  function updateSoundIcon(isMuted) {
    if (isMuted) {
      if (soundIconPlay) soundIconPlay.classList.add('hidden');
      if (soundIconMute) soundIconMute.classList.remove('hidden');
    } else {
      if (soundIconPlay) soundIconPlay.classList.remove('hidden');
      if (soundIconMute) soundIconMute.classList.add('hidden');
    }
  }

  // ==========================================
  // PROFILE SYNCHRONIZATION
  // ==========================================
  
  // ==========================================
  // STREAK LOGIC
  // ==========================================
  function updateStreak() {
    const today = new Date().toDateString();
    const username = gameState.username || "Guest Player";
    let streakData = JSON.parse(localStorage.getItem('streakData') || '{}');
    
    if (!streakData[username]) {
      streakData[username] = { streak: 1, lastDate: today };
    } else {
      const lastDate = new Date(streakData[username].lastDate);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakData[username].streak += 1;
        streakData[username].lastDate = today;
      } else if (diffDays > 1) {
        streakData[username].streak = 1;
        streakData[username].lastDate = today;
      } else if (diffDays === 0) {
        // already played today
      }
    }
    
    localStorage.setItem('streakData', JSON.stringify(streakData));
    syncStreakDisplay();
  }

    function syncStreakDisplay() {
    const username = gameState.username || "Guest Player";
    let streakData = JSON.parse(localStorage.getItem('streakData') || '{}');
    const streakSpan = document.getElementById('streak-display');
    const streakWidgetDisplay = document.getElementById('streak-widget-display');
    const streakDaysContainer = document.getElementById('streak-days-container');
    
    let currentStreak = 0;
    if (streakData[username]) {
      const lastDate = new Date(streakData[username].lastDate);
      const todayDate = new Date(new Date().toDateString());
      const diffTime = todayDate - lastDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        streakData[username].streak = 0;
        localStorage.setItem('streakData', JSON.stringify(streakData));
      }
      currentStreak = streakData[username].streak;
    }
    
    if (streakSpan) streakSpan.textContent = currentStreak + " Day Streak";
    if (streakWidgetDisplay) streakWidgetDisplay.textContent = currentStreak + " Days";

    if (streakDaysContainer) {
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      let html = '';
      for (let i = 0; i < 7; i++) {
        if (i < currentStreak % 7) {
          // Completed day
          html += `<div class="flex-grow aspect-square neo-glass rounded-lg flex flex-col items-center justify-center p-1 border-primary/30 text-[10px] font-bold">
            <span class="text-on-surface-variant text-[8px] mb-0.5">${days[i]}</span>
            <span class="material-symbols-outlined text-primary text-xs" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          </div>`;
        } else if (i === currentStreak % 7) {
          // Current day (not yet completed, or just indicating it's the next step)
          // For simplicity, we just mark it active/pending
          html += `<div class="flex-grow aspect-square bg-secondary/20 rounded-lg flex flex-col items-center justify-center p-1 border border-secondary text-[10px] font-bold">
            <span class="text-secondary text-[8px] mb-0.5">${days[i]}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          </div>`;
        } else {
          // Future day
          html += `<div class="flex-grow aspect-square neo-glass rounded-lg flex flex-col items-center justify-center p-1 opacity-40 text-[10px] font-bold">
            <span class="text-on-surface-variant text-[8px]">${days[i]}</span>
          </div>`;
        }
      }
      streakDaysContainer.innerHTML = html;
    }
  }

function syncUsername(name) {
    gameState.username = name || "";
    const displayName = gameState.username || "Guest Player";
    
    if (sidebarProfileName) sidebarProfileName.textContent = displayName;
    if (heroWelcomeName) heroWelcomeName.textContent = displayName + "?";
    if (resultsPlayerName) resultsPlayerName.textContent = displayName;
    if (usernameInput) usernameInput.value = gameState.username;
    if (loginUsernameInput) loginUsernameInput.value = gameState.username;
  
    syncStreakDisplay();
}

  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      syncUsername(usernameInput.value.trim());
    });
  }

  // ==========================================
  // LOGIN / LOGOUT COORDINATORS
  // ==========================================
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const enteredName = loginUsernameInput ? loginUsernameInput.value.trim() : '';
      if (!enteredName) return;
      
      localStorage.setItem('username', enteredName);
      syncUsername(enteredName);
      
      // Play C-Major ascending arpeggio startup sound
      Sound.initContext();
      Sound.playCorrect();
      
      document.body.classList.remove('logged-out');
      loadHomeDashboard();
      switchScreen('home');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!confirm("Are you sure you want to exit and clear your session?")) {
        return;
      }
      
      // Stop active timer if any
      clearInterval(gameState.timerInterval);
      
      localStorage.removeItem('username');
      syncUsername('');
      
      // Play a detuned buzzer exit chord
            Sound.playWrong();

      
      document.body.classList.add('logged-out');
      
      // Reset form controls
      if (setupForm) setupForm.reset();
      if (loginForm) loginForm.reset();
      
      switchScreen('login');
    });
  }

  // ==========================================
  // CATEGORIES / SETUP & DIFFICULTY CONTROL
  // ==========================================
  
  // Programmatic Category Selection on Setup page
  function selectSetupCategory(categoryName) {
    gameState.selectedCategory = categoryName;
    setupCategoryCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const badge = card.querySelector('.select-icon-badge');
      if (cat === categoryName) {
        card.classList.add('active', 'border-primary', 'bg-[#2A2A2D]');
        card.classList.remove('border-[#333336]');
        if (badge) {
          badge.classList.remove('bg-[#1A1A1D]', 'text-on-surface-variant');
          badge.classList.add('bg-primary/20', 'text-primary');
        }
      } else {
        card.classList.remove('active', 'border-primary', 'bg-[#2A2A2D]');
        card.classList.add('border-[#333336]');
        if (badge) {
          badge.classList.remove('bg-primary/20', 'text-primary');
          badge.classList.add('bg-[#1A1A1D]', 'text-on-surface-variant');
        }
      }
    });
  }

  // Setup click binding for Category Selectors on Categories view
  setupCategoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.getAttribute('data-category');
      selectSetupCategory(category);
      Sound.initContext();
    });
  });

  // Difficulty indicator segmented control slider coordinator
  function updateDifficultyIndicator() {
    const checkedInput = document.querySelector('input[name="difficulty"]:checked');
    if (checkedInput && difficultyIndicator) {
      if (checkedInput.value === 'Easy') {
        difficultyIndicator.style.left = '6px';
        difficultyIndicator.style.width = 'calc(33.333% - 8px)';
      } else if (checkedInput.value === 'Medium') {
        difficultyIndicator.style.left = 'calc(33.333% + 2px)';
        difficultyIndicator.style.width = 'calc(33.333% - 8px)';
      } else if (checkedInput.value === 'Hard') {
        difficultyIndicator.style.left = 'calc(66.666% - 2px)';
        difficultyIndicator.style.width = 'calc(33.333% - 8px)';
      }
      gameState.selectedDifficulty = checkedInput.value;
    }
  }

  const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
  difficultyRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateDifficultyIndicator();
      Sound.initContext();
    });
  });

  // Bind Dashboard Links & Quick Triggers
  const dashboardViewLeaderboard = document.getElementById('dashboard-view-leaderboard');
  if (dashboardViewLeaderboard) {
    dashboardViewLeaderboard.addEventListener('click', (e) => {
      e.preventDefault();
      switchScreen('leaderboard');
    });
  }

  const heroContinueBtn = document.getElementById('hero-continue-btn');
  if (heroContinueBtn) {
    heroContinueBtn.addEventListener('click', () => {
      launchQuiz();
      Sound.initContext();
    });
  }

  
  // AI Generator Button
  const aiGenerateBtn = document.getElementById('ai-generate-btn');
  if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener('click', () => {
      const topicInput = document.getElementById('ai-topic-input');
      const diffSelect = document.getElementById('ai-difficulty-select');
      
      const topic = topicInput ? (topicInput.value.trim() || 'JavaScript') : 'JavaScript';
      const diff = diffSelect ? (diffSelect.value || 'Medium') : 'Medium';

      gameState.selectedCategory = topic;
      gameState.selectedDifficulty = diff;
      gameState.aiModeEnabled = true;

      launchQuiz();
      Sound.initContext();
    });
  }

  // Dashboard category clicks launch active quiz instantly
  const dashCategoryTriggers = document.querySelectorAll('.dash-category-trigger');
  dashCategoryTriggers.forEach(card => { card.addEventListener('click', () => { gameState.aiModeEnabled = false; 
      launchQuiz();
      Sound.initContext();
    });
  });

  // Dashboard quick-start clicks launch active quiz instantly
  const dashQuickStarts = document.querySelectorAll('.dash-quick-start');
  dashQuickStarts.forEach(card => { card.addEventListener('click', () => { gameState.aiModeEnabled = false; 
      const diff = card.getAttribute('data-difficulty') || 'Medium';
      
      gameState.selectedCategory = 'Tech & Coding';
      gameState.selectedDifficulty = diff;

      // Sync radio
      const radio = document.querySelector(`input[name="difficulty"][value="${diff}"]`);
      if (radio) {
        radio.checked = true;
        updateDifficultyIndicator();
      }

      launchQuiz();
      Sound.initContext();
    });
  });

  // ==========================================
  // SETUP SCREEN SUBMIT ENGINE
  // ==========================================
  if (setupForm) {
    setupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Set Player Name
      let enteredName = usernameInput ? usernameInput.value.trim() : '';
      if (!enteredName && usernameInput) {
        enteredName = usernameInput.getAttribute('placeholder').replace('e.g. ', '');
      }
      syncUsername(enteredName);
  
      // Fetch difficulty selection
      if (difficultyInputs) {
        for (const input of difficultyInputs) {
          if (input.checked) {
            gameState.selectedDifficulty = input.value;
            break;
          }
        }
      }

      // Capture AI Mode toggle
      if (aiModeToggle) {
        gameState.aiModeEnabled = aiModeToggle.checked;
      }
  
      launchQuiz();
      Sound.initContext();
    });
  }

  // ==========================================
  // REAL-TIME QUESTIONS LIBRARY
  // ==========================================
  
  // Library filter updates
  if (libraryCategoryFilter) {
    libraryCategoryFilter.addEventListener('change', () => {
      renderLibrary(globalSearchBar.value.trim().toLowerCase());
    });
  }
  if (libraryDifficultyFilter) {
    libraryDifficultyFilter.addEventListener('change', () => {
      renderLibrary(globalSearchBar.value.trim().toLowerCase());
    });
  }

  // Global search input redirects to library and filters on typing
  if (globalSearchBar) {
    globalSearchBar.addEventListener('input', () => {
      const query = globalSearchBar.value.trim().toLowerCase();
      
      // Auto flip to library screen if not active
      const activeSection = document.querySelector('.tab-section.active');
      if (activeSection && activeSection.id !== 'library-tab') {
        switchScreen('library');
      }
      
      renderLibrary(query);
    });
  }

  function renderLibrary(searchQuery = '') {
    if (!libraryGrid) return;
    
    libraryGrid.innerHTML = '';
    
    const difficultyVal = libraryDifficultyFilter ? libraryDifficultyFilter.value : 'All';
    
    let filteredQuestions = JSON.parse(localStorage.getItem('completedLibrary') || '[]');

    // Difficulty filter
    if (difficultyVal !== 'All') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty.toLowerCase() === difficultyVal.toLowerCase());
    }

    // Text search query filter
    if (searchQuery) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.question.toLowerCase().includes(searchQuery) ||
        q.difficulty.toLowerCase().includes(searchQuery) ||
        q.options.some(opt => opt.toLowerCase().includes(searchQuery))
      );
    }

    // Show empty screen message if no matches
    if (filteredQuestions.length === 0) {
      if (libraryEmpty) libraryEmpty.classList.remove('hidden');
      libraryGrid.classList.add('hidden');
      return;
    } else {
      if (libraryEmpty) libraryEmpty.classList.add('hidden');
      libraryGrid.classList.remove('hidden');
    }

    filteredQuestions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'glass-card p-5 rounded-3xl flex flex-col gap-3 relative overflow-hidden border border-[#333336]';
      
      // Select badge styling classes based on difficulty
      let diffBadgeClass = 'bg-primary/15 text-primary border border-primary/20';
      if (q.difficulty === 'Easy') diffBadgeClass = 'bg-secondary/15 text-secondary border border-secondary/20';
      if (q.difficulty === 'Hard') diffBadgeClass = 'bg-red-500/15 text-red-400 border border-red-500/20';

      let optionsListHtml = '';
      const optionLabels = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, oIdx) => {
        const isCorrect = (opt === q.correctAnswer);
        const optStyles = isCorrect
          ? 'border-secondary/40 bg-secondary/20 text-secondary'
          : 'border-[#333336] bg-[#1A1A1D] text-on-surface-variant';
        
        optionsListHtml += `
          <div class="flex items-center gap-2 text-xs border rounded-xl p-2 font-medium ${optStyles}">
            <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold bg-black/30 flex-shrink-0">${optionLabels[oIdx]}</span>
            <span class="flex-grow">${escapeHtml(opt)}</span>
            ${isCorrect ? '<span class="material-symbols-outlined text-sm font-bold flex-shrink-0">check_circle</span>' : ''}
          </div>
        `;
      });

      card.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="text-[9px] bg-[#1A1A1D] px-2 py-0.5 rounded-full text-on-surface-variant uppercase tracking-wider font-bold border border-[#333336]">${escapeHtml(q.category)}</span>
          <span class="text-[9px] ${diffBadgeClass} px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">${escapeHtml(q.difficulty)}</span>
        </div>
        <h4 class="text-sm font-headline font-bold text-on-surface leading-snug mt-1">${escapeHtml(q.question)}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          ${optionsListHtml}
        </div>
      `;
      libraryGrid.appendChild(card);
    });
  }

  // ==========================================
  // QUIZ ENGINE OPERATIONS
  // ==========================================
  
  async function launchQuiz() {
    const startBtn = document.getElementById('start-btn');
    const originalBtnContent = startBtn ? startBtn.innerHTML : '';
    
    // Show stats pill in header
    headerStats.style.display = 'flex';
    headerScoreVal.textContent = '0';

    try {
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = `
          <div class="flex items-center gap-3">
            <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>${gameState.aiModeEnabled ? 'Loading...' : 'Initializing...'}</span>
          </div>
        `;
      }
      nextBtn.disabled = true;

      // Query server questions
      const questions = await API.getQuestions(gameState.selectedCategory, gameState.selectedDifficulty, gameState.aiModeEnabled);
      
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = originalBtnContent;
      }

      if (!questions || questions.length === 0) {
        alert('Could not retrieve questions. Please ensure the backend is connected or your Groq API key is valid.');
        return;
      }

      // Populate quiz state
      gameState.questionsList = questions;
      gameState.currentQuestionIndex = 0;
      gameState.score = 0;
      gameState.correctAnswersCount = 0;
      gameState.quizStartTime = new Date();
      gameState.totalTimeSpentSec = 0;

      // Switch view and render first slide question
      switchScreen('quiz');
      renderActiveQuestion();

    } catch (error) {
      console.error('Launch failed:', error);
      alert('Error connecting to backend database.');
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = originalBtnContent;
      }
    }
  }

  function renderActiveQuestion() {
    const eb = document.getElementById('explain-btn');
    if (eb) { eb.classList.add('hidden'); eb.style.display = 'none'; }

    // Reset question interactions
    gameState.hasAnsweredActiveQuestion = false;
    gameState.selectedOptionText = '';
    
    // Toggle action control buttons
    skipBtn.classList.remove('hidden'); skipBtn.style.display = 'block';
    nextBtn.classList.add('hidden'); nextBtn.setAttribute('style', 'display: none !important'); nextBtn.classList.add('hidden');
    
    const currentQ = gameState.questionsList[gameState.currentQuestionIndex];
    
    // Update labels and indicators
    quizCategoryStat.textContent = `${currentQ.category} — ${currentQ.difficulty}`;
    quizDifficultyStat.textContent = currentQ.difficulty;
    quizProgressStat.textContent = `Question ${gameState.currentQuestionIndex + 1}/${gameState.questionsList.length}`;
    questionText.textContent = currentQ.question;
    
    // Sync linear progress bar fill & glow
    const progressPercent = (gameState.currentQuestionIndex / gameState.questionsList.length) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    progressBarGlow.style.left = `calc(${progressPercent}% - 10px)`;

    // Select badge styling classes based on difficulty
    let diffBadgeClass = 'bg-primary/15 text-primary border border-primary/20';
    if (currentQ.difficulty === 'Easy') diffBadgeClass = 'bg-secondary/15 text-secondary border border-secondary/20';
    if (currentQ.difficulty === 'Hard') diffBadgeClass = 'bg-red-500/15 text-red-400 border border-red-500/20';
    
    quizDifficultyStat.className = `text-[9px] ${diffBadgeClass} px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider`;

    // Populate option button cards grid
    optionsGrid.innerHTML = '';
    const optionLabels = ['A', 'B', 'C', 'D'];
    
    currentQ.options.forEach((optText, index) => {
      const label = optionLabels[index] || 'A';
      
      const optBtn = document.createElement('button');
      optBtn.className = 'glass-card p-6 flex flex-col items-start gap-3 hover:bg-[#2A2A2D] active:scale-[0.98] transition-all text-left relative overflow-hidden w-full';
      optBtn.style.animationDelay = `${index * 0.08}s`;
      optBtn.innerHTML = `
        <div class="w-8 h-8 rounded-full border border-[#333336] flex items-center justify-center text-xs font-extrabold text-on-surface-variant font-headline label-marker flex-shrink-0">${label}</div>
        <span class="text-sm font-semibold text-on-surface select-opt-text"></span>
        <div class="check-icon absolute top-4 right-4 text-secondary hidden">
          <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>
        <div class="wrong-icon absolute top-4 right-4 text-accent-magenta hidden">
          <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">cancel</span>
        </div>
        <div class="active-bottom-bar absolute bottom-0 left-0 h-1 bg-secondary w-full shadow-md hidden"></div>
      `;
      
      optBtn.querySelector('.select-opt-text').textContent = optText;
      
      optBtn.addEventListener('click', () => {
        handleOptionSelection(optBtn, optText);
      });

      optionsGrid.appendChild(optBtn);
    });

    // Fire countdown timer
    startTimer();
  }

  function handleOptionSelection(selectedBtn, optionText) {
    if (gameState.hasAnsweredActiveQuestion) return;
    
    gameState.hasAnsweredActiveQuestion = true;
    gameState.selectedOptionText = optionText;
    
    clearInterval(gameState.timerInterval);

    const currentQ = gameState.questionsList[gameState.currentQuestionIndex];
    const isCorrect = (optionText === currentQ.correctAnswer);
    const allOptionBtns = optionsGrid.querySelectorAll('button');
    
        if (isCorrect) {
      selectedBtn.classList.remove('hover:bg-[#2A2A2D]');
      selectedBtn.classList.add('correct-glow');
      
      const checkIcon = selectedBtn.querySelector('.check-icon');
      if (checkIcon) checkIcon.classList.remove('hidden');
      
      const bottomBar = selectedBtn.querySelector('.active-bottom-bar');
      if (bottomBar) {
        bottomBar.classList.remove('hidden');
        bottomBar.classList.add('bg-secondary');
      }
      
      const labelMarker = selectedBtn.querySelector('.label-marker');
      if (labelMarker) {
        labelMarker.classList.remove('border-[#333336]', 'text-on-surface-variant');
        labelMarker.classList.add('border-secondary', 'bg-secondary/20', 'text-secondary');
      }
      
      gameState.score += 100 + (gameState.timerSeconds * 2);
      gameState.correctAnswersCount++;
      headerScoreVal.textContent = gameState.score;
      Sound.playCorrect();
    } else {
      selectedBtn.classList.remove('hover:bg-[#2A2A2D]');
      selectedBtn.classList.add('wrong-glow');
      
      const wrongIcon = selectedBtn.querySelector('.wrong-icon');
      if (wrongIcon) wrongIcon.classList.remove('hidden');
      
      const bottomBar = selectedBtn.querySelector('.active-bottom-bar');
      if (bottomBar) {
        bottomBar.classList.remove('hidden');
        bottomBar.classList.add('bg-accent-magenta');
      }
      
      const labelMarker = selectedBtn.querySelector('.label-marker');
      if (labelMarker) {
        labelMarker.classList.remove('border-[#333336]', 'text-on-surface-variant');
        labelMarker.classList.add('border-accent-magenta', 'bg-accent-magenta/20', 'text-accent-magenta');
      }

            allOptionBtns.forEach(btn => {
        const textSpan = btn.querySelector('.select-opt-text');
        if (textSpan && textSpan.textContent === currentQ.correctAnswer) {
          btn.classList.add('correct-outline');
          const checkIcon = btn.querySelector('.check-icon');
          if (checkIcon) checkIcon.classList.remove('hidden');
        }
      });
      Sound.playWrong();
      
      const eb = document.getElementById('explain-btn');
      if (eb) {
        eb.classList.remove('hidden');
        eb.style.display = 'flex';
      }
    }

    if (skipBtn) skipBtn.classList.add('hidden'); skipBtn.style.display = 'none';
        if (nextBtn) {
      nextBtn.classList.remove('hidden'); nextBtn.setAttribute('style', 'display: flex !important'); nextBtn.classList.remove('hidden');
      nextBtn.disabled = false;
    }
  }

  // Next Question trigger
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      gameState.currentQuestionIndex++;
      
      if (gameState.currentQuestionIndex < gameState.questionsList.length) {
        renderActiveQuestion();
      } else {
        concludeQuiz();
      }
    });
  }

  // ==========================================
  // COUNTDOWN TIMER ENGINE
  // ==========================================
  
  function startTimer() {
    clearInterval(gameState.timerInterval);
    
    gameState.timerSeconds = gameState.timerMax;
    timerSecCount.textContent = gameState.timerSeconds;
    
    if (conicTimerRing) {
      conicTimerRing.classList.remove('warning', 'danger');
      conicTimerRing.style.background = `conic-gradient(var(--primary-violet) 360deg, rgba(255, 255, 255, 0.06) 0deg)`;
    }

    gameState.timerInterval = setInterval(() => {
      gameState.timerSeconds--;
      timerSecCount.textContent = gameState.timerSeconds;

      // Depleting progress ring visual updates
      const percentLeft = (gameState.timerSeconds / gameState.timerMax);
      const degrees = percentLeft * 360;

      // HSL theme transitions and classes additions
      if (conicTimerRing) {
        let colorVar = 'var(--primary-violet)';
        if (gameState.timerSeconds <= 5) {
          conicTimerRing.classList.add('danger');
          conicTimerRing.classList.remove('warning');
          colorVar = 'var(--accent-magenta)';
        } else if (gameState.timerSeconds <= 10) {
          conicTimerRing.classList.add('warning');
          conicTimerRing.classList.remove('danger');
          colorVar = 'var(--accent-yellow)';
        } else {
          conicTimerRing.classList.remove('warning', 'danger');
        }
        conicTimerRing.style.background = `conic-gradient(${colorVar} ${degrees}deg, rgba(255, 255, 255, 0.06) 0deg)`;
      }

      // Expired timer skip buzzer auto triggers
      if (gameState.timerSeconds <= 0) {
        clearInterval(gameState.timerInterval);
        handleTimerExpiry();
      }
    }, 1000);
  }

  function handleTimerExpiry() {
    gameState.hasAnsweredActiveQuestion = true;
    Sound.playWrong();

    const currentQ = gameState.questionsList[gameState.currentQuestionIndex];
    const allOptionBtns = optionsGrid.querySelectorAll('button');
    
    allOptionBtns.forEach(btn => {
      const textSpan = btn.querySelector('.select-opt-text');
      if (textSpan.textContent === currentQ.correctAnswer) {
        btn.classList.remove('hover:bg-[#2A2A2D]');
        btn.classList.add('correct-glow');
        
        const correctCheck = btn.querySelector('.check-icon');
        if (correctCheck) correctCheck.classList.remove('hidden');
        
        const correctBar = btn.querySelector('.active-bottom-bar');
        if (correctBar) {
          correctBar.classList.remove('hidden');
          correctBar.classList.add('bg-secondary');
        }
        
        const correctLabel = btn.querySelector('.label-marker');
        if (correctLabel) {
          correctLabel.classList.remove('border-[#333336]', 'text-on-surface-variant');
          correctLabel.classList.add('border-secondary', 'bg-secondary/20', 'text-secondary');
        }
      }
    });

    skipBtn.classList.add('hidden'); skipBtn.style.display = 'none';
    nextBtn.style.display = 'block';
    nextBtn.disabled = false;
  }

  // ==========================================
  // RESULTS & LEADERBOARDS
  // ==========================================
  
  async function concludeQuiz() {
    clearInterval(gameState.timerInterval);
    
    // Hide active stats header
    headerStats.style.display = 'none';

    // Compute total spent time
    const endTime = new Date();
    const durationMs = endTime - gameState.quizStartTime;
    gameState.totalTimeSpentSec = Math.round(durationMs / 1000);

    // Compute accuracy ratio percentage
    const accuracy = gameState.questionsList.length > 0 
      ? Math.round((gameState.correctAnswersCount / gameState.questionsList.length) * 100)
      : 0;

    Sound.playCompletion();

    // Populate Results Card
    resultsPlayerName.textContent = gameState.username;
    resultsScore.textContent = gameState.score;
    resultsRatio.textContent = `${gameState.correctAnswersCount} / ${gameState.questionsList.length}`;
    
    const mins = Math.floor(gameState.totalTimeSpentSec / 60);
    const secs = gameState.totalTimeSpentSec % 60;
    resultsTime.textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    
    resultsAccuracyVal.textContent = `${accuracy}%`;

    // Dynamic Accuracy summary ring dashoffset triggers (r=70 => circumference = 439.82)
    const ringCircumference = 439.82;
    const ringOffset = ringCircumference - (accuracy / 100) * ringCircumference;
    
    updateStreak();
    
    // Save completed questions to library
    let completedLib = JSON.parse(localStorage.getItem('completedLibrary') || '[]');
    gameState.questionsList.forEach(q => {
      if (!completedLib.find(existing => existing.id === q.id || existing.question === q.question)) {
        completedLib.push(q);
      }
    });
    localStorage.setItem('completedLibrary', JSON.stringify(completedLib));

    switchScreen('results');
    
    setTimeout(() => {
      if (accuracyRing) accuracyRing.style.strokeDashoffset = ringOffset;
    }, 150);

    // Submit new high score and pull updated hall roster
    try {
      const leaderboard = await API.submitScore(
        gameState.username,
        gameState.score,
        gameState.selectedCategory,
        gameState.selectedDifficulty,
        accuracy
      );
      
      renderLeaderboard(leaderboard);
      renderMiniLeaderboard(leaderboard);
      renderResultsLeaderboard(leaderboard);

    } catch (error) {
      console.error('Failed to coordinate score submission:', error);
      // Fallback
      const backupLeaderboard = await API.getLeaderboard();
      renderLeaderboard(backupLeaderboard);
      renderMiniLeaderboard(backupLeaderboard);
      renderResultsLeaderboard(backupLeaderboard);
    }
  }

  function renderLeaderboard(leaderboardData) {
    if (!leaderboardRows) return;
    leaderboardRows.innerHTML = '';
    
    if (!leaderboardData || leaderboardData.length === 0) {
      leaderboardRows.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-on-surface-variant font-medium">No high scores registered yet!</td></tr>`;
      return;
    }

    leaderboardData.forEach((entry, idx) => {
      const rank = idx + 1;
      
      // Determine rank badge class
      let rankPill = `<span class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1A1A1D] text-on-surface-variant border border-[#333336]">${rank}</span>`;
      if (rank === 1) rankPill = `<span class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">🥇 1</span>`;
      if (rank === 2) rankPill = `<span class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/30">🥈 2</span>`;
      if (rank === 3) rankPill = `<span class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/30">🥉 3</span>`;

      // Highlight active user row on leaderboard
      const isCurrentUser = (entry.username === gameState.username && entry.score === gameState.score);
      const rowClass = isCurrentUser ? 'class="user-row"' : '';

      const tr = document.createElement('tr');
      if (isCurrentUser) tr.className = 'user-row border-l-4 border-l-primary';
      
      tr.innerHTML = `
        <td class="py-4 px-5">${rankPill}</td>
        <td class="py-4 px-5 font-semibold text-white"><strong></strong></td>
        <td class="py-4 px-5 text-on-surface-variant">${escapeHtml(entry.category)}</td>
        <td class="py-4 px-5 text-on-surface-variant"><span class="${getDifficultyBadgeClass(entry.difficulty)} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">${entry.difficulty}</span></td>
        <td class="py-4 px-5 text-on-surface-variant">${entry.accuracy}%</td>
        <td class="py-4 px-5 text-right font-headline font-bold text-secondary ">${entry.score} XP</td>
      `;

      tr.querySelector('strong').textContent = entry.username;
      
      leaderboardRows.appendChild(tr);
    });
  }

  function getDifficultyBadgeClass(diff) {
    if (diff === 'Easy') return 'bg-secondary/15 text-secondary border border-secondary/20';
    if (diff === 'Hard') return 'bg-red-500/15 text-red-400 border border-red-500/20';
    return 'bg-primary/15 text-primary border border-primary/20'; // Medium
  }

  function renderMiniLeaderboard(leaderboardData) {
    const miniList = document.getElementById('mini-leaderboard-list');
    if (!miniList) return;

    miniList.innerHTML = '';
    
    // Get top 3
    const top3 = leaderboardData.slice(0, 3);
    
    if (top3.length === 0) {
      miniList.innerHTML = `<p class="text-xs text-on-surface-variant text-center py-4">No scores yet!</p>`;
      return;
    }

    const avatars = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHlpdu5_wiCXjGTiIklI35KJWCo_iEy3YHHaV9x4-ntvmVu-1y1a5HsyVQYU3wwtlrBaEsYL6ioouduCNU7CXHFeuSQJp6Jmrhx3Csf2H3gLiIAAmOyI4Qfm7T0TRHMsBp5KUwjruywP8XpZ41jZEKA6WTO3Q_dz_36bu20D2OEfnacKDQxU7KRJDNUJOiTJYTJ3tcmZ04uD8hCTPW7ckXMujfzFUdrLEcltekENM7cl-wXmJHXHuIAeskWwy-QEw4MDmxMPc9-34",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfbJ0hLpMR9Ktxvlxzj20j-1csYXvO5aud9AfHTT4wxyZK-5a4XXuNPYfPXcFvH-l2E9M7-35TpEDMk0kSD1ADG8pPnLBhGQD9aN8oh4r6v9lNwDxPLYHPqf1OxnPMx744qZBU0y2kxY3ZrWHSDRq4IumIbDK7s8IAa1c2L1WFTLhEtABp92lSwJeUTzPgWfjx8a7uuOcE2iWo-f_ShznJF-Fuc43FKnOUTY8XKlSD6aCi2Wkmv7NGALA7mZwKDBcPKOgOj4pKDxs",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVM6iBEm9ygCySVt116Le8v9e_MVn7_EnnQpcYkcpPT4gVPavwQy15t-EuUhIOEiklJlqjKrpjVU7ddntyl7j2onkDtbNde432JdGPIHy9vcGEQjc56Msurin_RUt_m70Po2-CYXfsGj8DvmQufkcWMWrrGI1Nx5u8-ryQGd9PZwNhKLVRm0RVeg9PG_Jni_uNQtlRJTihFP6H1PHMMvrmp5uQo13V2Uu1v_dD8OPU110zVgNg47vO3Gf7SvO3ypkAZSMQCMjUcxM"
    ];

    top3.forEach((entry, idx) => {
      const rank = idx + 1;
      let rankColor = 'text-primary bg-primary/20';
      if (rank === 1) rankColor = 'text-amber-400 bg-amber-500/20';
      if (rank === 2) rankColor = 'text-slate-300 bg-slate-300/20';
      if (rank === 3) rankColor = 'text-amber-600 bg-amber-700/20';
      
      const avatarUrl = avatars[idx % avatars.length];

      const item = document.createElement('div');
      item.className = 'flex items-center gap-3 py-1';
      item.innerHTML = `
        <div class="w-7 h-7 rounded-full ${rankColor} flex items-center justify-center font-bold text-xs flex-shrink-0">${rank}</div>
        <div class="w-8 h-8 rounded-full overflow-hidden bg-[#1A1A1D] border border-[#333336] flex-shrink-0">
          <img class="w-full h-full object-cover bg-surface-container" src="${avatarUrl}" alt="User Avatar">
        </div>
        <div class="flex-grow min-w-0">
          <p class="text-xs font-semibold text-on-surface truncate">${escapeHtml(entry.username)}</p>
          <p class="text-[9px] text-on-surface-variant">${escapeHtml(entry.category)} • ${entry.difficulty}</p>
        </div>
        <div class="text-right text-xs font-bold text-secondary font-headline flex-shrink-0">${entry.score} XP</div>
      `;
      miniList.appendChild(item);
    });
  }

  function renderResultsLeaderboard(leaderboardData) {
    if (!resultsLeaderboardList) return;

    resultsLeaderboardList.innerHTML = '';
    
    // Get top 3
    const top3 = leaderboardData.slice(0, 3);
    
    if (top3.length === 0) {
      resultsLeaderboardList.innerHTML = `<p class="text-xs text-on-surface-variant text-center py-4">No scores yet!</p>`;
      return;
    }

    const avatars = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHlpdu5_wiCXjGTiIklI35KJWCo_iEy3YHHaV9x4-ntvmVu-1y1a5HsyVQYU3wwtlrBaEsYL6ioouduCNU7CXHFeuSQJp6Jmrhx3Csf2H3gLiIAAmOyI4Qfm7T0TRHMsBp5KUwjruywP8XpZ41jZEKA6WTO3Q_dz_36bu20D2OEfnacKDQxU7KRJDNUJOiTJYTJ3tcmZ04uD8hCTPW7ckXMujfzFUdrLEcltekENM7cl-wXmJHXHuIAeskWwy-QEw4MDmxMPc9-34",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfbJ0hLpMR9Ktxvlxzj20j-1csYXvO5aud9AfHTT4wxyZK-5a4XXuNPYfPXcFvH-l2E9M7-35TpEDMk0kSD1ADG8pPnLBhGQD9aN8oh4r6v9lNwDxPLYHPqf1OxnPMx744qZBU0y2kxY3ZrWHSDRq4IumIbDK7s8IAa1c2L1WFTLhEtABp92lSwJeUTzPgWfjx8a7uuOcE2iWo-f_ShznJF-Fuc43FKnOUTY8XKlSD6aCi2Wkmv7NGALA7mZwKDBcPKOgOj4pKDxs",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVM6iBEm9ygCySVt116Le8v9e_MVn7_EnnQpcYkcpPT4gVPavwQy15t-EuUhIOEiklJlqjKrpjVU7ddntyl7j2onkDtbNde432JdGPIHy9vcGEQjc56Msurin_RUt_m70Po2-CYXfsGj8DvmQufkcWMWrrGI1Nx5u8-ryQGd9PZwNhKLVRm0RVeg9PG_Jni_uNQtlRJTihFP6H1PHMMvrmp5uQo13V2Uu1v_dD8OPU110zVgNg47vO3Gf7SvO3ypkAZSMQCMjUcxM"
    ];

    top3.forEach((entry, idx) => {
      const rank = idx + 1;
      let rankColor = 'text-primary bg-primary/20';
      if (rank === 1) rankColor = 'text-amber-400 bg-amber-500/20';
      if (rank === 2) rankColor = 'text-slate-300 bg-slate-300/20';
      if (rank === 3) rankColor = 'text-amber-600 bg-amber-700/20';
      
      const avatarUrl = avatars[idx % avatars.length];

      const item = document.createElement('div');
      item.className = 'flex items-center gap-3 py-1';
      item.innerHTML = `
        <div class="w-7 h-7 rounded-full ${rankColor} flex items-center justify-center font-bold text-xs flex-shrink-0">${rank}</div>
        <div class="w-8 h-8 rounded-full overflow-hidden bg-[#1A1A1D] border border-[#333336] flex-shrink-0">
          <img class="w-full h-full object-cover bg-surface-container" src="${avatarUrl}" alt="User Avatar">
        </div>
        <div class="flex-grow min-w-0">
          <p class="text-xs font-semibold text-on-surface truncate">${escapeHtml(entry.username)}</p>
          <p class="text-[9px] text-on-surface-variant">${escapeHtml(entry.category)} • ${entry.difficulty}</p>
        </div>
        <div class="text-right text-xs font-bold text-secondary font-headline flex-shrink-0">${entry.score} XP</div>
      `;
      resultsLeaderboardList.appendChild(item);
    });
  }

  async function loadHomeDashboard() {
    try {
      const data = await API.getLeaderboard();
      renderMiniLeaderboard(data);
    } catch (e) {
      console.error('Failed to load dashboard scorers:', e);
      const backupData = await API.getLeaderboard();
      renderMiniLeaderboard(backupData);
    }
  }

  async function loadLeaderboard() {
    try {
      const data = await API.getLeaderboard();
      renderLeaderboard(data);
    } catch (e) {
      console.error('Failed to load leaderboard data:', e);
      const backupData = await API.getLeaderboard();
      renderLeaderboard(backupData);
    }
  }

  
  const explainBtn = document.getElementById('explain-btn');
  const explainModal = document.getElementById('explain-modal');
  const explainContent = document.getElementById('explain-content');
  const closeExplainBtn = document.getElementById('close-explain-btn');
  const explainOverlay = document.getElementById('explain-modal-overlay');

  if (explainBtn) {
    explainBtn.addEventListener('click', async () => {
      if (explainModal) explainModal.classList.remove('hidden');
      if (explainContent) explainContent.innerHTML = '<div class="flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating explanation...</div>';
      
      const currentQ = gameState.questionsList[gameState.currentQuestionIndex];
      const explanation = await API.getExplanation({
        question: currentQ.question,
        wrongAnswer: gameState.selectedOptionText,
        correctAnswer: currentQ.correctAnswer,
        topic: gameState.selectedCategory
      });
      
      if (explainContent) explainContent.textContent = explanation;
    });
  }

  const closeEX = () => { if (explainModal) explainModal.classList.add('hidden'); };
  if (closeExplainBtn) closeExplainBtn.addEventListener('click', closeEX);
  if (explainOverlay) explainOverlay.addEventListener('click', closeEX);

  // Restart trigger returns player to Home Dashboard
  
  const nextLevelBtn = document.getElementById('next-level-btn');
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener('click', () => {
      Sound.initContext();
      // Bump difficulty
      if (gameState.selectedDifficulty === 'Easy') gameState.selectedDifficulty = 'Medium';
      else if (gameState.selectedDifficulty === 'Medium') gameState.selectedDifficulty = 'Hard';
      else gameState.selectedDifficulty = 'Hard'; // Cap at hard
      
      launchQuiz();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      Sound.initContext();
      switchScreen('home');
    });
  }

  // Share score modal trigger
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      Sound.initContext();
      
      const accuracyText = resultsAccuracyVal ? resultsAccuracyVal.textContent : '0%';
      const shareText = `⚡ I just completed the TechQuiz challenge! Score: ${gameState.score} XP with ${accuracyText} Accuracy on ${gameState.selectedCategory} (${gameState.selectedDifficulty}). Can you beat me? 🚀`;
      
      if (navigator.share) {
        navigator.share({
          title: 'TechQuiz Score',
          text: shareText,
          url: window.location.href
        }).catch(err => console.log('Share canceled'));
      } else {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            alert('⚡ Score details copied successfully to your clipboard! Share it with your friends!');
          })
          .catch(err => {
            alert('Could not copy to clipboard. Highlight text to copy: ' + shareText);
          });
      }
    });
  }

  // Utility to escape HTML strings safely
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

});
