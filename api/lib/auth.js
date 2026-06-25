import { SignJWT, jwtVerify } from 'jose';

const APP_PASSWORD = process.env.APP_PASSWORD || '';

function getSecret() {
  const secret = APP_PASSWORD || process.env.JWT_SECRET || 'dev-no-auth';
  return new TextEncoder().encode(secret);
}

export function isAuthRequired() {
  return APP_PASSWORD.length > 0;
}

export function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

export async function createToken() {
  return new SignJWT({ role: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function validateToken(token) {
  if (!isAuthRequired()) return true;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function login(password) {
  if (!isAuthRequired()) return { token: 'dev' };
  if (password !== APP_PASSWORD) return null;
  return { token: await createToken() };
}

export async function requireAuth(req, res) {
  if (!isAuthRequired()) return true;
  const ok = await validateToken(extractToken(req));
  if (!ok) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
