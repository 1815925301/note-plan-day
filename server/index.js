import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEntryByDate, getEntriesByRange, upsertEntry, deleteEntry } from './db.js';
import { isAuthRequired, login, revokeToken, authMiddleware, validateToken } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getWeekRange(dateStr) {
  const date = parseDate(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDate(monday), end: formatDate(sunday) };
}

function getMonthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/auth/status', (req, res) => {
  const required = isAuthRequired();
  let authenticated = !required;
  if (required) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    authenticated = validateToken(token);
  }
  res.json({ required, authenticated });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'password is required' });
  }
  const result = login(password);
  if (!result) return res.status(401).json({ error: '密码错误' });
  res.json(result);
});

app.post('/api/auth/logout', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  revokeToken(token);
  res.json({ ok: true });
});

app.use('/api', authMiddleware);

app.get('/api/entries/:date', (req, res) => {
  const entry = getEntryByDate(req.params.date);
  res.json(entry || { date: req.params.date, content: '' });
});

app.get('/api/entries', (req, res) => {
  const { start, end, week, month, year } = req.query;

  if (week) {
    const range = getWeekRange(week);
    const entries = getEntriesByRange(range.start, range.end);
    return res.json({ range, entries });
  }

  if (month && year) {
    const range = getMonthRange(Number(year), Number(month));
    const entries = getEntriesByRange(range.start, range.end);
    return res.json({ range, entries });
  }

  if (start && end) {
    const entries = getEntriesByRange(start, end);
    return res.json({ range: { start, end }, entries });
  }

  res.status(400).json({ error: 'Provide week, month+year, or start+end query params' });
});

app.put('/api/entries/:date', (req, res) => {
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }
  const entry = upsertEntry(req.params.date, content);
  res.json(entry);
});

app.delete('/api/entries/:date', (req, res) => {
  deleteEntry(req.params.date);
  res.json({ ok: true });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (isAuthRequired()) {
    console.log('Auth enabled (APP_PASSWORD is set)');
  } else {
    console.log('Auth disabled (set APP_PASSWORD to enable)');
  }
});
