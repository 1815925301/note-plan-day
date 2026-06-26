-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS work_entries (
  date TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_entries_date ON work_entries(date);

ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;

-- 不创建公开策略：前端只通过 Netlify Functions 访问，API 使用 service_role 密钥
