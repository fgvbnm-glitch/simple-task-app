const micButton = document.getElementById('micButton');
const transcriptBox = document.getElementById('transcript');
const responseBox = document.getElementById('response');
const statusIndicator = document.getElementById('statusIndicator');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let listening = false;
let wakeDetected = false;
let pendingPrompt = '';

function setStatus(mode) {
  statusIndicator.className = 'status';
  statusIndicator.classList.add(mode);
  if (mode === 'idle') {
    statusIndicator.textContent = 'Idle';
  } else if (mode === 'listening') {
    statusIndicator.textContent = 'Listening';
  } else if (mode === 'speaking') {
    statusIndicator.textContent = 'Speaking';
  }
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  setStatus('speaking');
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);

  utterance.onend = () => {
    setStatus(listening ? 'listening' : 'idle');
  };
}

function normalizePrompt(prompt) {
  return prompt
    .replace(/\b(?:hey|hi)\s+chatgpt\b/gi, '')
    .replace(/\b(?:send|send it|submit|done)\b/gi, '')
    .replace(/\b(?:period|dot)\b/gi, '')
    .replace(/[.?!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sendToChatGPT(prompt) {
  if (!prompt) {
    return;
  }

  transcriptBox.textContent = `Sending: ${prompt}`;
  responseBox.textContent = 'Thinking...';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }

    responseBox.textContent = data.reply;
    speak(data.reply);
  } catch (error) {
    console.error(error);
    responseBox.textContent = `Error: ${error.message}`;
    speak('I could not process that request.');
  }
}

function startListening() {
  if (!SpeechRecognition) {
    responseBox.textContent = 'This browser does not support speech recognition. Please use Chrome or Edge.';
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      listening = true;
      setStatus('listening');
      transcriptBox.textContent = 'Listening for “Hey ChatGPT”…';
    };

    recognition.onresult = (event) => {
      const fullTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ');

      transcriptBox.textContent = fullTranscript;

      const lowerTranscript = fullTranscript.toLowerCase();
      const hasWakeWord = /hey\s+chatgpt/i.test(lowerTranscript);

      if (hasWakeWord) {
        wakeDetected = true;
      }

      if (!wakeDetected) {
        return;
      }

      const cleaned = fullTranscript.replace(/.*?hey\s+chatgpt/i, '').trim();
      pendingPrompt = cleaned;

      const shouldSubmit =
        /\b(?:send|send it|submit|done)\b/i.test(fullTranscript) ||
        /\b(?:period|dot)\b/i.test(fullTranscript) ||
        /\.$/.test(fullTranscript);

      if (shouldSubmit) {
        const finalPrompt = normalizePrompt(pendingPrompt);
        if (finalPrompt) {
          sendToChatGPT(finalPrompt);
        }

        wakeDetected = false;
        pendingPrompt = '';
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      responseBox.textContent = `Speech recognition error: ${event.error}`;
    };

    recognition.onend = () => {
      if (listening) {
        recognition.start();
      }
    };
  }

  recognition.start();
  listening = true;
  setStatus('listening');
  transcriptBox.textContent = 'Listening for “Hey ChatGPT”…';
}

function stopListening() {
  listening = false;
  wakeDetected = false;
  pendingPrompt = '';

  if (recognition) {
    recognition.stop();
  }

  setStatus('idle');
  transcriptBox.textContent = 'Mic stopped. Press start to resume.';
}

micButton.addEventListener('click', () => {
  if (listening) {
    stopListening();
    micButton.textContent = 'Start listening';
  } else {
    startListening();
    micButton.textContent = 'Stop listening';
  }
});

setStatus('idle');
