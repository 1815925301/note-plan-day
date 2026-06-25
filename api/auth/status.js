import { isAuthRequired, extractToken, validateToken } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const required = isAuthRequired();
  let authenticated = !required;
  if (required) {
    authenticated = await validateToken(extractToken(req));
  }

  res.status(200).json({ required, authenticated });
}
