import { requireAuth } from '../lib/auth.js';
import { getEntryByDate, upsertEntry, deleteEntry } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    if (!(await requireAuth(req, res))) return;

    const { date } = req.query;

    if (req.method === 'GET') {
      const entry = await getEntryByDate(date);
      return res.status(200).json(entry || { date, content: '' });
    }

    if (req.method === 'PUT') {
      const { content } = req.body || {};
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'content is required' });
      }
      const entry = await upsertEntry(date, content);
      return res.status(200).json(entry);
    }

    if (req.method === 'DELETE') {
      await deleteEntry(date);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
