import { isAuthRequired, validateToken, login } from '../../api/lib/auth.js';
import { getEntryByDate, getEntriesByRange, upsertEntry, deleteEntry } from '../../api/lib/db.js';
import { getWeekRange, getMonthRange } from '../../api/lib/dates.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getPathname(request) {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/.netlify/functions/api')) {
    const rest = pathname.slice('/.netlify/functions/api'.length);
    return rest ? `/api${rest}` : '/api';
  }
  return pathname;
}

function getToken(request) {
  const header = request.headers.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

async function ensureAuth(request) {
  if (!isAuthRequired()) return null;
  const ok = await validateToken(getToken(request));
  if (!ok) return json({ error: 'Unauthorized' }, 401);
  return null;
}

export default async function handler(request) {
  const pathname = getPathname(request);
  const method = request.method;
  const url = new URL(request.url);

  try {
    if (pathname === '/api/health' && method === 'GET') {
      return json({ status: 'ok' });
    }

    if (pathname === '/api/auth/status' && method === 'GET') {
      const required = isAuthRequired();
      let authenticated = !required;
      if (required) {
        authenticated = await validateToken(getToken(request));
      }
      return json({ required, authenticated });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { password } = body;
      if (typeof password !== 'string') {
        return json({ error: 'password is required' }, 400);
      }
      const result = await login(password);
      if (!result) {
        return json({ error: '密码错误' }, 401);
      }
      return json(result);
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      return json({ ok: true });
    }

    if (pathname === '/api/entries' && method === 'GET') {
      const denied = await ensureAuth(request);
      if (denied) return denied;

      const { start, end, week, month, year } = Object.fromEntries(url.searchParams);

      if (week) {
        const range = getWeekRange(week);
        const entries = await getEntriesByRange(range.start, range.end);
        return json({ range, entries });
      }

      if (month && year) {
        const range = getMonthRange(Number(year), Number(month));
        const entries = await getEntriesByRange(range.start, range.end);
        return json({ range, entries });
      }

      if (start && end) {
        const entries = await getEntriesByRange(start, end);
        return json({ range: { start, end }, entries });
      }

      return json({ error: 'Provide week, month+year, or start+end query params' }, 400);
    }

    const dateMatch = pathname.match(/^\/api\/entries\/(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      const denied = await ensureAuth(request);
      if (denied) return denied;

      const date = dateMatch[1];

      if (method === 'GET') {
        const entry = await getEntryByDate(date);
        return json(entry || { date, content: '' });
      }

      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const { content } = body;
        if (typeof content !== 'string') {
          return json({ error: 'content is required' }, 400);
        }
        const entry = await upsertEntry(date, content);
        return json(entry);
      }

      if (method === 'DELETE') {
        await deleteEntry(date);
        return json({ ok: true });
      }

      return json({ error: 'Method not allowed' }, 405);
    }

    if (pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: 'Internal server error' }, 500);
  }
}
