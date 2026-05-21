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
async function generateAIQuestions(difficulty) {
  if (!groq) {
    console.error('Groq client not initialized. Check your GROQ_API_KEY.');
    return null;
  }

  const systemPrompt = `You are a professional coding quiz generator. 
Generate exactly 6 unique multiple-choice questions about 'Tech & Coding' with difficulty level '${difficulty}'.
Return ONLY a valid JSON array of objects. Do not include any markdown formatting, backticks, or extra text.

Each object must follow this EXACT schema:
{
  "category": "Tech & Coding",
  "difficulty": "${difficulty}",
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string (must exactly match one of the options)"
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate 6 ${difficulty} coding questions.` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      stream: false,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    
    // Groq sometimes wraps the array in an object like { "questions": [...] }
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    
    // Assign new IDs based on current DB count
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
        const aiQuestions = await generateAIQuestions(difficulty || 'Medium');
        
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

// Serve frontend fallback for SPA router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 TechQuiz server running at http://localhost:${PORT}`);
});
