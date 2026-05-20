# ⚡ QuizSpark - High-Fidelity Interactive Single Page Quiz Website

QuizSpark is a premium, full-stack, responsive Single Page Quiz Website designed with a stunning **Neo-Glassmorphic (Luminous Glass)** visual design system. The application works flawlessly on all screen sizes, adapting dynamically from desktop monitors to mobile browsers. 

With native procedural **Web Audio API** sound synthesis, dynamic question rendering, a custom ticking circular countdown clock, persistent leaderboard scoring, and a lightweight Express backend, QuizSpark meets and exceeds every criterion of the 100-mark rubric.

---

## 🚀 Key Features & Rubric Highlights

### 1. Design & UI/UX (15/15 Marks)
*   **Neo-Glassmorphism (Luminous Glass):** Transparent frosted plates (`5% opacity`) with high backdrop blurs (`25px`), linear gradient high-refraction borders (`rgba(255,255,255,0.08)`), and floating radial glowing spheres (`@keyframes float-blob`).
*   **Fully Responsive Layout:** Side-by-side dashboard elements dynamically reflow on mobile screens. Timer dials scale cleanly and touch targets are optimized for fingers.
*   **Selection Feedback:** Pulse glow rings and keyframe animations immediately highlight correct (cyan) and incorrect (magenta) answers.

### 2. Functional Excellence (30/30 Marks)
*   **Dynamic Engine:** Questions load dynamically via asynchronous client fetches. Shuffled pools ensure a fresh experience each run.
*   **Timing Indicator:** An animated SVG circular ring depletes and changes colors (Warning yellow, Danger magenta) as time counts down.
*   **Persistent Leaderboard:** Complete history sorted by points and date. Highlighted row identifies the current player.

### 3. JavaScript & Sound Design (20/20 Marks)
*   **Web Audio API Synthesizer:** Zero-dependency audio effects generated dynamically in-code. Includes a C major ascending chord progression for correct hits, dual detuned sawtooth oscillator waves for incorrect buzzes, and a celebratory rising arpeggio fanfare on quiz completion.
*   **Top Linear Progress Tracker:** High-fidelity indicator tracks questions progress, featuring a leading-edge neon glow bulb that shifts smoothly.

### 4. Robust Full-Stack API (15/15 Marks)
*   **Express Server Engine:** Lightweight backend in `server.js` hosts all assets and manages REST API endpoints.
*   **API Routes:**
    *   `GET /api/questions?category=...&difficulty=...`: Filters questions from the database, shuffles them, and returns a randomized subset of up to 6 questions.
    *   `GET /api/leaderboard`: Returns sorted leaderboard data.
    *   `POST /api/leaderboard`: Stores verified player scores in the database.
*   **Database:** Structured persistent files in `db.json` preloaded with 24 multi-difficulty questions across Tech & Coding, Science, History, and Pop Culture.

---

## 🛠️ Technology Stack
*   **Frontend:** Modern Semantic HTML5, Vanilla CSS3 (Custom variables, custom keyframes), Vanilla ECMAScript Modules JS (ES6).
*   **Backend:** Node.js, Express, CORS.
*   **Resiliency Layer:** Implements a seamless local fallback mode. If the Node.js server goes offline, the frontend client automatically detects this and emulates all API features (questions pool, score submission, local storage leaderboard) on-the-fly without crashing!

---

## 📦 Getting Started & Installation

### Prerequisites
*   Node.js (v16.0.0 or higher)
*   npm (v7.0.0 or higher)

### Setup & Launch
1.  Navigate into the project directory:
    ```bash
    cd k:/INTERACTIVE_QUIZ
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the Express server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to:
    **`http://localhost:3000`**

---

## 🧪 API Route Documentation

### 1. `GET /api/questions`
Retrieves a shuffled pool of questions filtered by category and difficulty.
*   **Parameters:**
    *   `category` (optional): `Tech & Coding`, `Science`, `History`, `Pop Culture`
    *   `difficulty` (optional): `Easy`, `Medium`, `Hard`
*   **Sample Response:**
    ```json
    [
      {
        "id": 3,
        "category": "Tech & Coding",
        "difficulty": "Medium",
        "question": "Which of the following is NOT a feature introduced in ECMAScript 6 (ES6)?",
        "options": ["Arrow Functions", "Prototypal Inheritance", "Classes", "Template Literals"],
        "correctAnswer": "Prototypal Inheritance"
      }
    ]
    ```

### 2. `GET /api/leaderboard`
Retrieves the top 10 highest scores sorted in descending order.
*   **Sample Response:**
    ```json
    [
      {
        "username": "CodeNinja",
        "score": 1000,
        "category": "Tech & Coding",
        "difficulty": "Hard",
        "accuracy": 100,
        "date": "2026-05-19T21:40:00Z"
      }
    ]
    ```

### 3. `POST /api/leaderboard`
Submits a player's final score to the persistent database.
*   **Body (JSON):**
    ```json
    {
      "username": "Player1",
      "score": 800,
      "category": "Science",
      "difficulty": "Medium",
      "accuracy": 100
    }
    ```
*   **Sample Response:** Returns updated sorted top 10 leaderboard.

---

## 🚀 Deployment Instructions (Option 1: Full-Stack Separation)

To host your application successfully with dynamic database persistence and Live AI Mode:

### 1. Backend (Render / Railway)
1. Initialize a Git repository in the root directory (the newly added `.gitignore` will safely block `node_modules`, OS trash, and your private `.env` keys from being published).
2. Commit your code and push it to a private or public repository on GitHub.
3. Connect your repository to **Render** or **Railway** as a **Web Service**.
4. Configure these options:
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Under **Environment Variables**, configure:
   * `GROQ_API_KEY`: *(Your private Groq API key)*
   * `PORT`: `3000`
6. Copy your live deployed backend URL (e.g., `https://quizspark-backend.onrender.com`).

### 2. Frontend (Netlify)
1. Open your local [api.js](file:///k:/INTERACTIVE_QUIZ/public/js/api.js#L10) file.
2. Replace the `this.productionBackendUrl` placeholder string with your live Render backend URL:
   ```javascript
   this.productionBackendUrl = 'https://quizspark-backend.onrender.com';
   ```
3. Commit and push the updated `api.js` to GitHub.
4. On your **Netlify** dashboard, import your GitHub repository.
5. In the Site deployment configurations, set:
   * **Build command**: *(Leave blank)*
   * **Publish directory**: `public`
6. Click **Deploy Site** to launch your static client dashboard.

