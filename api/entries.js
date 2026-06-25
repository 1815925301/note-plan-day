import { requireAuth } from './lib/auth.js';
import { getEntriesByRange } from './lib/db.js';
import { getWeekRange, getMonthRange } from './lib/dates.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!(await requireAuth(req, res))) return;

    const { start, end, week, month, year } = req.query;

    if (week) {
      const range = getWeekRange(week);
      const entries = await getEntriesByRange(range.start, range.end);
      return res.status(200).json({ range, entries });
    }

    if (month && year) {
      const range = getMonthRange(Number(year), Number(month));
      const entries = await getEntriesByRange(range.start, range.end);
      return res.status(200).json({ range, entries });
    }

    if (start && end) {
      const entries = await getEntriesByRange(start, end);
      return res.status(200).json({ range: { start, end }, entries });
    }

    res.status(400).json({ error: 'Provide week, month+year, or start+end query params' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
