# 工作日志 · Note Plan Day

记录每天的工作内容，支持按日 / 周 / 月查看。使用 **Netlify + Supabase** 部署，数据持久保存，免费可用。

## 功能

- **日视图**：编辑当天工作记录，自动保存
- **周视图**：以周为单位浏览，点击某天进入编辑，支持导出 Markdown
- **月视图**：月历概览，有记录的日期会显示标记，支持导出 Markdown
- **访问密码**：设置 `APP_PASSWORD` 后需登录才能访问
- **数据持久化**：Supabase PostgreSQL，重启不丢数据

## 技术栈

- 前端：React + Vite（Netlify 托管）
- API：Netlify Functions
- 数据库：Supabase PostgreSQL

---

## 第一步：创建 Supabase 数据库

1. 打开 [https://supabase.com](https://supabase.com)，注册并登录
2. **New Project** → 填写项目名、数据库密码、选区域（建议 Singapore 或 Tokyo）
3. 进入项目 → **SQL Editor** → **New query**
4. 粘贴 [supabase/schema.sql](supabase/schema.sql) 的内容，点击 **Run**
5. 进入 **Project Settings → API**，复制：
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key（Secret）→ `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ `service_role` 密钥只能在服务端使用，不要暴露到前端或 GitHub。

---

## 第二步：本地开发

```bash
# 安装依赖
npm run install:all

# 复制环境变量（Netlify CLI 会自动读取 .env）
cp .env.example .env
# 编辑 .env，填入 Supabase 密钥和 APP_PASSWORD

# 启动（前端 + API 一起）
npm run dev
```

浏览器打开 http://localhost:8888

---

## 第三步：部署到 Netlify

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Migrate to Netlify + Supabase"
git push origin main
```

### 2. 连接 Netlify

1. 打开 [https://app.netlify.com](https://app.netlify.com)，用 GitHub 登录
2. **Add new site → Import an existing project**
3. 选择 GitHub 仓库
4. 构建设置会自动从 [netlify.toml](netlify.toml) 读取，无需手动配置
5. 进入 **Site configuration → Environment variables**，添加：

| 变量 | 值 |
|------|-----|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 密钥 |
| `APP_PASSWORD` | 你的访问密码 |

6. 点击 **Deploy site**

部署完成后获得 `https://xxx.netlify.app` 网址。

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥（仅 API 使用） |
| `APP_PASSWORD` | 访问密码；本地留空则跳过登录 |

---

## 导出

在周视图或月视图点击 **导出**，下载 `.md` 文件备份。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/auth/status` | 认证状态 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 退出 |
| GET | `/api/entries/:date` | 获取某天记录 |
| PUT | `/api/entries/:date` | 保存某天记录 |
| GET | `/api/entries?week=YYYY-MM-DD` | 获取某周记录 |
| GET | `/api/entries?year=2025&month=6` | 获取某月记录 |
| DELETE | `/api/entries/:date` | 删除某天记录 |
