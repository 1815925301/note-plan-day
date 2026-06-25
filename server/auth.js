import crypto from 'crypto';

const APP_PASSWORD = process.env.APP_PASSWORD || '';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const tokens = new Map();

export function isAuthRequired() {
  return APP_PASSWORD.length > 0;
}

function createToken() {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

export function validateToken(token) {
  if (!token) return false;
  const expires = tokens.get(token);
  if (!expires) return false;
  if (Date.now() > expires) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function revokeToken(token) {
  tokens.delete(token);
}

export function login(password) {
  if (!isAuthRequired()) return { token: 'dev' };
  if (password !== APP_PASSWORD) return null;
  return { token: createToken() };
}

export function authMiddleware(req, res, next) {
  if (!isAuthRequired()) return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (validateToken(token)) return next();

  res.status(401).json({ error: 'Unauthorized' });
}
