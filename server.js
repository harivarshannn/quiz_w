import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import 'dotenv/config';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Initialize Groq Client (Optional depending on API Key availability)
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
} else {
  console.warn('⚠️ GROQ_API_KEY not found in .env. AI Mode will be disabled.');
}

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read Database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { questions: [], leaderboard: [] };
  }
}

// Helper: Write Database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database file:', error);
    return false;
  }
}

// Helper: Generate Questions via Groq AI
async function generateAIQuestions(difficulty, category) {
  if (!groq) {
    console.error('Groq client not initialized. Check your GROQ_API_KEY.');
    return null;
  }

  const topic = category && category !== 'All' ? category : 'General Tech & Coding';

  const systemPrompt = `You are a world-class senior software architect and examiner.
Generate 6 highly technical, unique multiple-choice questions EXCLUSIVELY about the language: '${topic}'.
CRITICAL MANDATES:
1. ONLY '${topic}' questions. If topic is Python, questions must be about Python syntax, standard library, or idioms. NO JAVASCRIPT.
2. HIGH VARIETY: Cover advanced areas like memory management, concurrency, design patterns, and recent version updates.
3. NO REPETITION: Use random seed ${Math.floor(Math.random() * 1000000)} to force a fresh set every time.
4. Professional tone. Technical depth.
Return ONLY valid JSON array.

Each object must follow this EXACT schema:
{
  "category": "${topic}",
  "difficulty": "${difficulty}",
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string (must exactly match one of the options)"
}`;

  try {
    const seed = Math.floor(Math.random() * 1000000);
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate 6 ${difficulty} ${topic} questions. Use randomization seed: ${seed}. Ensure they are technical and specific to ${topic}.` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 1.0,
      stream: false,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    
    const db = await readDB();
    let nextId = db.questions.length > 0 ? Math.max(...db.questions.map(q => q.id)) + 1 : 1;
    
    const questionsWithIds = questions.map(q => ({
      id: nextId++,
      ...q
    }));

    return questionsWithIds;
  } catch (error) {
    console.error('Groq AI Generation Error:', error);
    return null;
  }
}

// Helper: Generate Explanation via Groq AI
async function generateAIExplanation(question, wrongAnswer, correctAnswer, topic) {
  if (!groq) {
    return "AI explanation is unavailable because the Groq API key is missing.";
  }

  const systemPrompt = `You are a helpful software engineering tutor.
The user is taking a quiz about '${topic}'.
They just answered a question incorrectly.
Question: "${question}"
Their Answer: "${wrongAnswer}"
Correct Answer: "${correctAnswer}"

Explain why the correct answer is correct and why the user's answer might be a common misconception.
Be extremely concise. Use exactly 2 clear sentences.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Explain this to me concisely." }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || "Could not generate an explanation at this time.";
  } catch (error) {
    console.error('Groq AI Explanation Error:', error);
    return "An error occurred while generating the AI explanation.";
  }
}

// Route: Get filtered questions
app.get('/api/questions', async (req, res) => {
  try {
    const { category, difficulty, ai } = req.query;
    const db = await readDB();
    
    // AI Mode Integration
    if (ai === 'true') {
      console.log(`[Server] Received request for AI-generated questions (Difficulty: ${difficulty}).`);
      
      if (process.env.GROQ_API_KEY) {
        console.log(`[Server] GROQ_API_KEY is present. Calling Groq API...`);
        const aiQuestions = await generateAIQuestions(difficulty || 'Medium', category);
        
        if (aiQuestions && aiQuestions.length > 0) {
          console.log(`[Server] Successfully generated ${aiQuestions.length} questions from Groq.`);
          // Save new questions to DB for future use
          db.questions.push(...aiQuestions);
          await writeDB(db);
          return res.json(aiQuestions);
        } else {
          console.log(`[Server] Failed to generate AI questions. Falling back to static questions.`);
        }
      } else {
        console.log(`[Server] ⚠️ GROQ_API_KEY is missing. Cannot use AI mode. Falling back to static database.`);
      }
    }

    let filteredQuestions = db.questions;

    if (category && category !== 'All') {
      filteredQuestions = filteredQuestions.filter(
        q => q.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (difficulty && difficulty !== 'All') {
      filteredQuestions = filteredQuestions.filter(
        q => q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Shuffle array and select up to 6 questions for a dynamic, fun test length
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const limit = Math.min(shuffled.length, 6);
    const selected = shuffled.slice(0, limit);

    res.json(selected);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve questions.' });
  }
});

// Route: Get top 10 leaderboard entries
app.get('/api/leaderboard', async (req, res) => {
  try {
    const db = await readDB();
    // Sort descending by score, then by date
    const sortedLeaderboard = db.leaderboard
      .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    res.json(sortedLeaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leaderboard.' });
  }
});

// Route: Submit new score
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { username, score, category, difficulty, accuracy } = req.body;

    if (!username || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid payload: username and score are required.' });
    }

    const db = await readDB();

    const newEntry = {
      username: username.substring(0, 20), // Truncate long usernames for neat layout
      score,
      category: category || 'All',
      difficulty: difficulty || 'Medium',
      accuracy: typeof accuracy === 'number' ? accuracy : 0,
      date: new Date().toISOString()
    };

    db.leaderboard.push(newEntry);
    const success = await writeDB(db);

    if (!success) {
      return res.status(500).json({ error: 'Failed to save score.' });
    }

    // Return the updated, sorted top 10 leaderboard
    const updatedSorted = db.leaderboard
      .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.status(201).json(updatedSorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit score.' });
  }
});

// Route: Get AI Explanation for wrong answer
app.post('/api/explain', async (req, res) => {
  try {
    const { question, wrongAnswer, correctAnswer, topic } = req.body;
    
    if (!question || !correctAnswer) {
      return res.status(400).json({ error: 'Missing required explanation context.' });
    }

    const explanation = await generateAIExplanation(question, wrongAnswer, correctAnswer, topic);
    res.json({ explanation });
  } catch (error) {
    console.error('[Server] Explanation Route Error:', error);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

// Serve frontend fallback for SPA router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 TechQuiz server running at http://localhost:${PORT}`);
});
