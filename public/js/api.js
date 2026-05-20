/**
 * QuizSpark API Client
 * Coordinates network requests with the Express backend,
 * providing graceful local-fallback simulation if the server is offline or unreachable.
 */

class ApiClient {
  constructor() {
    // Set to your deployed backend service URL (e.g., https://quizspark-backend.onrender.com)
    this.productionBackendUrl = 'https://YOUR_BACKEND_URL.onrender.com';
    
    // Auto-detect environment: use local server on localhost, otherwise production URL
    this.apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? window.location.origin
      : this.productionBackendUrl;
      
    this.isLocalOfflineMode = false;
    
    // Comprehensive preloaded questions bank (identical to db.json)
    this.localQuestionsFallback = [
      { "id": 1, "category": "Tech & Coding", "difficulty": "Easy", "question": "Which programming language is known as the language of the web?", "options": ["Python", "C++", "JavaScript", "Java"], "correctAnswer": "JavaScript" },
      { "id": 2, "category": "Tech & Coding", "difficulty": "Easy", "question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language", "Hyperlinks and Text Markup Language"], "correctAnswer": "Hyper Text Markup Language" },
      { "id": 3, "category": "Tech & Coding", "difficulty": "Medium", "question": "Which of the following is NOT a feature introduced in ECMAScript 6 (ES6)?", "options": ["Arrow Functions", "Prototypal Inheritance", "Classes", "Template Literals"], "correctAnswer": "Prototypal Inheritance" },
      { "id": 4, "category": "Tech & Coding", "difficulty": "Medium", "question": "In JavaScript, what is the purpose of the 'Array.prototype.map()' method?", "options": ["To filter out specific elements from an array", "To create a new array with the results of calling a function on every element", "To sort the elements of an array in place", "To check if at least one element passes a test"], "correctAnswer": "To create a new array with the results of calling a function on every element" },
      { "id": 5, "category": "Tech & Coding", "difficulty": "Hard", "question": "What is the time complexity of searching in a perfectly balanced Binary Search Tree (BST)?", "options": ["O(1)", "O(n)", "O(n log n)", "O(log n)"], "correctAnswer": "O(log n)" },
      { "id": 6, "category": "Tech & Coding", "difficulty": "Hard", "question": "Which of the JavaScript statements creates a deep copy of a nested object?", "options": ["Object.assign({}, original)", "JSON.parse(JSON.stringify(original))", "{ ...original }", "original.clone()"], "correctAnswer": "JSON.parse(JSON.stringify(original))" }
    ];

    this.localLeaderboardFallback = [];
  }

  // Fetch dynamic questions
  async getQuestions(category, difficulty, aiMode = false) {
    if (this.isLocalOfflineMode) {
      return this.getFilteredFallbackQuestions(difficulty);
    }

    try {
      const url = `${this.apiBase}/api/questions?category=Tech%20%26%20Coding&difficulty=${encodeURIComponent(difficulty)}&ai=${aiMode}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API server returned error status');
      return await response.json();
    } catch (error) {
      console.warn('Backend API server offline or AI error. Switching dynamically to high-fidelity Local Sandbox Mode.');
      // Only set offline mode if it's a connection error, not just an AI fail
      if (!aiMode) this.isLocalOfflineMode = true;
      return this.getFilteredFallbackQuestions(difficulty);
    }
  }

  // Fetch top scorers list
  async getLeaderboard() {
    if (this.isLocalOfflineMode) {
      return this.localLeaderboardFallback.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    try {
      const response = await fetch(`${this.apiBase}/api/leaderboard`);
      if (!response.ok) throw new Error('API server returned error status');
      return await response.json();
    } catch (error) {
      this.isLocalOfflineMode = true;
      return this.localLeaderboardFallback.sort((a, b) => b.score - a.score).slice(0, 10);
    }
  }

  // Submit player score
  async submitScore(username, score, category, difficulty, accuracy) {
    const payload = { username, score, category: 'Tech & Coding', difficulty, accuracy };
    
    if (this.isLocalOfflineMode) {
      const localEntry = { ...payload, date: new Date().toISOString() };
      this.localLeaderboardFallback.push(localEntry);
      return this.localLeaderboardFallback.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    try {
      const response = await fetch(`${this.apiBase}/api/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API server failed score submission');
      return await response.json();
    } catch (error) {
      console.warn('Failed to submit score to remote backend. Preserving score locally.');
      const localEntry = { ...payload, date: new Date().toISOString() };
      this.localLeaderboardFallback.push(localEntry);
      return this.localLeaderboardFallback.sort((a, b) => b.score - a.score).slice(0, 10);
    }
  }

  // Helper: Filter fallback questions pools
  getFilteredFallbackQuestions(difficulty) {
    let pool = this.localQuestionsFallback;
    
    if (difficulty && difficulty !== 'All') {
      pool = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    
    // In case no items match, return entire pool
    if (pool.length === 0) pool = this.localQuestionsFallback;

    return pool.sort(() => 0.5 - Math.random()).slice(0, 6);
  }
}

// Global API Instance
const API = new ApiClient();
window.API = API; // Expose globally
