require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Voice assistant is running.' });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A non-empty message is required.' });
  }

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
              'You are a helpful voice assistant. Keep responses short, natural, and conversational.'
          },
          { role: 'user', content: message }
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

    res.json({ reply });
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ error: 'Failed to contact OpenAI. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Voice assistant running at http://localhost:${port}`);
});
