require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const memoryDir = path.join(__dirname, 'data');
const memoryFile = path.join(memoryDir, 'memory.json');

if (!fs.existsSync(memoryDir)) {
  fs.mkdirSync(memoryDir, { recursive: true });
}

if (!fs.existsSync(memoryFile)) {
  fs.writeFileSync(memoryFile, JSON.stringify({}, null, 2));
}

const conversationMemory = loadMemory();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function loadMemory() {
  try {
    const raw = fs.readFileSync(memoryFile, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to load conversation memory:', error);
    return {};
  }
}

function saveMemory() {
  try {
    fs.writeFileSync(memoryFile, JSON.stringify(conversationMemory, null, 2));
  } catch (error) {
    console.error('Failed to save conversation memory:', error);
  }
}

function getSessionHistory(sessionId) {
  const session = conversationMemory[sessionId];
  if (Array.isArray(session)) {
    return session;
  }
  conversationMemory[sessionId] = [];
  saveMemory();
  return conversationMemory[sessionId];
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Voice assistant is running.' });
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A non-empty message is required.' });
  }

  const safeSessionId = sessionId || 'default';
  const history = getSessionHistory(safeSessionId);

  history.push({ role: 'user', content: message.trim() });

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is missing. Add it to your .env file before running the app.'
    });
  }

  try {
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful voice assistant. Remember the conversation history provided to you and stay consistent with prior context. Keep responses short, natural, and conversational.'
          },
          ...history
        ],
        temperature: 0.8,
        max_tokens: 250
      })
    });

    const completionData = await completionResponse.json();

    if (!completionResponse.ok) {
      const errorMessage = completionData?.error?.message || 'Unknown OpenAI error.';
      return res.status(completionResponse.status).json({ error: errorMessage });
    }

    const reply =
      completionData?.choices?.[0]?.message?.content?.trim() || 'I could not generate a response.';

    history.push({ role: 'assistant', content: reply });
    saveMemory();

    res.json({ reply, sessionId: safeSessionId, memory: history });
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ error: 'Failed to contact OpenAI. Please try again.' });
  }
});

app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = getSessionHistory(sessionId);
  res.json({ sessionId, memory: history });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Voice assistant running at http://localhost:${port}`);
});
