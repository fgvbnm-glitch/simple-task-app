* {
  box-sizing: border-box;
}

:root {
  --bg: #0d1117;
  --panel: #161b22;
  --panel-alt: #1f2937;
  --primary: #7c3aed;
  --primary-light: #a78bfa;
  --text: #f3f4f6;
  --muted: #cbd5e1;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(135deg, #111827 0%, #0f172a 50%, #1e293b 100%);
  color: var(--text);
  display: grid;
  place-items: center;
}

.app-shell {
  width: min(100%, 760px);
  padding: 24px;
}

.card {
  background: rgba(17, 24, 39, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
}

.badge {
  margin: 0 0 12px;
  display: inline-block;
  background: rgba(124, 58, 237, 0.12);
  color: var(--primary-light);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.subtitle {
  color: var(--muted);
  line-height: 1.6;
  margin: 12px 0 22px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.mic-button,
.clear-button {
  appearance: none;
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.mic-button {
  background: linear-gradient(135deg, var(--primary), #4f46e5);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.4);
}

.clear-button {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.mic-button:hover,
.clear-button:hover {
  transform: translateY(-1px);
}

.status {
  font-weight: 700;
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.status.idle {
  color: var(--muted);
}

.status.listening {
  color: #bbf7d0;
  background: rgba(34, 197, 94, 0.12);
}

.status.speaking {
  color: #fef3c7;
  background: rgba(245, 158, 11, 0.12);
}

.panel {
  background: rgba(31, 41, 55, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 20px;
  margin-top: 8px;
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 1.05rem;
}

.transcript,
.response,
.memory-box {
  min-height: 88px;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
}

.response {
  color: var(--muted);
}

.memory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.memory-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
  color: var(--muted);
}

.memory-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 10px 12px;
  line-height: 1.5;
}

.memory-item.user {
  border-left: 3px solid var(--primary-light);
}

.memory-item.assistant {
  border-left: 3px solid var(--success);
}

@media (max-width: 600px) {
  .card {
    padding: 20px;
  }

  .status-row,
  .memory-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
