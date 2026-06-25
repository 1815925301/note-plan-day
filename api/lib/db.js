import { getSupabase } from './supabase.js';

export async function getEntryByDate(date) {
  const { data, error } = await getSupabase()
    .from('work_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getEntriesByRange(start, end) {
  const { data, error } = await getSupabase()
    .from('work_entries')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertEntry(date, content) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from('work_entries')
    .upsert({ date, content, updated_at: now }, { onConflict: 'date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(date) {
  const { error } = await getSupabase().from('work_entries').delete().eq('date', date);
  if (error) throw error;
}
