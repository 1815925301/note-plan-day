import { getToken, clearToken } from './auth.js';

const API = '/api';

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function fetchEntry(date) {
  const res = await fetch(`${API}/entries/${date}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function saveEntry(date, content) {
  const res = await fetch(`${API}/entries/${date}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function fetchWeek(date) {
  const res = await fetch(`${API}/entries?week=${date}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchMonth(year, month) {
  const res = await fetch(`${API}/entries?year=${year}&month=${month}`, { headers: authHeaders() });
  return handleResponse(res);
}
