import { login } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'password is required' });
  }

  const result = await login(password);
  if (!result) {
    return res.status(401).json({ error: '密码错误' });
  }

  res.status(200).json(result);
}
